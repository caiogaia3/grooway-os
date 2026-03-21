-- =====================================================================================
-- Migration 004: Leads Scraper (ABM Pipeline)
-- Description: Creates tables for the B2B lead prospection crawler.
--              empresas_leads = companies found via Google Maps + enriched with AI
--              contatos_leads = decision makers found via LinkedIn X-Ray + Hunter.io
-- Created: 2026-03-20
-- =====================================================================================


-- =====================================================================================
-- 0. ENABLE pgvector (required for semantic search embeddings)
-- =====================================================================================

CREATE EXTENSION IF NOT EXISTS vector;


-- =====================================================================================
-- 1. EMPRESAS_LEADS TABLE
-- Companies discovered by the ABM pipeline (Google Maps + Web/Social + AI enrichment)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.empresas_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Google Maps data
    place_id TEXT,
    nome TEXT NOT NULL,
    categoria TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    telefone TEXT,
    nota NUMERIC(2,1),
    total_reviews INTEGER,
    google_maps_url TEXT,

    -- Online presence
    website_url TEXT,
    dominio TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    linkedin_url TEXT,
    whatsapp_url TEXT,

    -- Contact data (arrays)
    emails TEXT[] DEFAULT '{}',
    todos_telefones TEXT[] DEFAULT '{}',

    -- AI enrichment
    ai_resumo TEXT,
    ai_diferenciais TEXT[] DEFAULT '{}',
    ai_score INTEGER DEFAULT 0 CHECK (ai_score BETWEEN 0 AND 100),

    -- Pipeline status
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'enriquecido', 'qualificado', 'descartado')),
    status_funil TEXT CHECK (status_funil IN ('lead_novo', 'em_contato', 'reuniao', 'negociacao', 'ganho', 'perdido')),
    fonte TEXT DEFAULT 'google_maps',

    -- Semantic search
    embedding vector(768),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Deduplication
    UNIQUE(user_id, place_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_empresas_leads_user_id ON public.empresas_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_empresas_leads_ai_score ON public.empresas_leads(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_empresas_leads_status_funil ON public.empresas_leads(status_funil);
CREATE INDEX IF NOT EXISTS idx_empresas_leads_cidade ON public.empresas_leads(cidade);
CREATE INDEX IF NOT EXISTS idx_empresas_leads_status ON public.empresas_leads(status);

-- RLS
ALTER TABLE public.empresas_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own empresas_leads"
ON public.empresas_leads
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role bypass for Python backend
CREATE POLICY "Service role full access on empresas_leads"
ON public.empresas_leads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =====================================================================================
-- 2. CONTATOS_LEADS TABLE
-- Decision makers discovered via LinkedIn X-Ray + enriched with Hunter.io
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.contatos_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas_leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Contact info
    nome TEXT,
    cargo TEXT,
    linkedin_url TEXT,
    email_corporativo TEXT,
    email_confidence INTEGER CHECK (email_confidence BETWEEN 0 AND 100),
    email_domain TEXT,

    -- Metadata
    fonte TEXT DEFAULT 'google_xray',
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'enriquecido', 'contatado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contatos_leads_empresa_id ON public.contatos_leads(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contatos_leads_user_id ON public.contatos_leads(user_id);

-- RLS
ALTER TABLE public.contatos_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own contatos_leads"
ON public.contatos_leads
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on contatos_leads"
ON public.contatos_leads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =====================================================================================
-- 3. AUTO-SCORE TRIGGER
-- Calculates ai_score based on data completeness when a row is inserted/updated
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.calculate_empresa_score()
RETURNS TRIGGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Base points for having data
    IF NEW.website_url IS NOT NULL AND NEW.website_url != '' THEN score := score + 15; END IF;
    IF NEW.instagram_url IS NOT NULL AND NEW.instagram_url != '' THEN score := score + 10; END IF;
    IF NEW.facebook_url IS NOT NULL AND NEW.facebook_url != '' THEN score := score + 5; END IF;
    IF NEW.linkedin_url IS NOT NULL AND NEW.linkedin_url != '' THEN score := score + 10; END IF;
    IF NEW.whatsapp_url IS NOT NULL AND NEW.whatsapp_url != '' THEN score := score + 5; END IF;
    IF NEW.telefone IS NOT NULL AND NEW.telefone != '' THEN score := score + 5; END IF;
    IF array_length(NEW.emails, 1) > 0 THEN score := score + 10; END IF;
    IF NEW.ai_resumo IS NOT NULL AND NEW.ai_resumo != '' THEN score := score + 15; END IF;
    IF array_length(NEW.ai_diferenciais, 1) > 0 THEN score := score + 10; END IF;
    IF NEW.nota IS NOT NULL AND NEW.nota >= 4.0 THEN score := score + 10; END IF;
    IF NEW.nota IS NOT NULL AND NEW.nota >= 4.5 THEN score := score + 5; END IF;

    -- Only auto-set if no manual score was provided
    IF NEW.ai_score = 0 OR NEW.ai_score IS NULL THEN
        NEW.ai_score := score;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_empresa_score
    BEFORE INSERT OR UPDATE ON public.empresas_leads
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_empresa_score();


-- =====================================================================================
-- 4. SEMANTIC SEARCH RPC FUNCTION (pgvector)
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.search_empresas_similares(
    query_embedding vector(768),
    match_count INTEGER DEFAULT 10,
    similarity_threshold FLOAT DEFAULT 0.7,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    nome TEXT,
    categoria TEXT,
    cidade TEXT,
    ai_resumo TEXT,
    ai_score INTEGER,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.nome,
        e.categoria,
        e.cidade,
        e.ai_resumo,
        e.ai_score,
        1 - (e.embedding <=> query_embedding) AS similarity
    FROM public.empresas_leads e
    WHERE
        e.embedding IS NOT NULL
        AND (p_user_id IS NULL OR e.user_id = p_user_id)
        AND 1 - (e.embedding <=> query_embedding) > similarity_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;


-- =====================================================================================
-- 5. PIPELINE_JOBS TABLE
-- Tracks async pipeline job state (used by api.py for polling)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.pipeline_jobs (
    id UUID PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    progress TEXT[] DEFAULT '{}',
    result JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_pipeline_jobs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pipeline_jobs_updated_at
    BEFORE UPDATE ON public.pipeline_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_pipeline_jobs_timestamp();

-- Only service_role accesses this table (internal Python worker)
ALTER TABLE public.pipeline_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on pipeline_jobs"
ON public.pipeline_jobs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =====================================================================================
-- DEPLOY INSTRUCTIONS:
-- 1. Open Supabase Dashboard > SQL Editor > New Query
-- 2. Paste this entire script and click RUN
-- 3. Verify tables: empresas_leads, contatos_leads
-- 4. Verify trigger: trigger_calculate_empresa_score
-- 5. Verify function: search_empresas_similares
-- =====================================================================================
