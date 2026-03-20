-- =====================================================================================
-- Migration 003: Clients Table + Client ICP (Ideal Customer Profile)
-- Description: Creates the clients table (paid clients, separate from leads/prospects)
--              and the client_icp table with full marketing profile.
--              Supports two origins: manual cadastro OR converted from Decoder diagnostic.
-- Created: 2026-03-20
-- =====================================================================================


-- =====================================================================================
-- 1. CLIENTS TABLE
-- Paid/active clients (distinct from leads, which are prospects)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Basic info
    company_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    website TEXT,
    logo_url TEXT,

    -- Segmento (lista fechada — padroniza filtros e relatórios)
    segmento TEXT CHECK (segmento IN (
        'clinica_medica',
        'ecommerce',
        'advocacia',
        'academia',
        'imobiliaria',
        'restaurante',
        'odontologia',
        'tecnologia',
        'educacao',
        'outro'
    )),

    -- Status do cliente
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'churned')),

    -- Contrato / financeiro
    monthly_value NUMERIC(10,2),           -- Valor mensal do contrato (R$)
    contract_start_date DATE,
    health_score INTEGER CHECK (health_score BETWEEN 0 AND 100),

    -- Ads accounts
    google_ads_customer_id TEXT,           -- Ex: '123-456-7890'
    meta_ads_account_id TEXT,              -- Ex: 'act_123456'

    -- Origem do cadastro
    origem TEXT DEFAULT 'manual' CHECK (origem IN ('manual', 'decoder')),
    lead_id UUID REFERENCES public.leads(id),             -- Lead de origem (se veio do CRM)
    decoder_diagnostic_id UUID REFERENCES public.diagnostics(id), -- Diagnóstico snapshot

    -- Ownership
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_clients_owner_id ON public.clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_clients_segmento ON public.clients(segmento);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own clients"
ON public.clients
FOR ALL
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);


-- =====================================================================================
-- 2. CLIENT ICP TABLE
-- Ideal Customer Profile + Marketing Intelligence (1:1 with clients)
-- Populated manually OR imported via snapshot from Decoder diagnostic
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.client_icp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,

    -- Produto / oferta
    produto_principal TEXT,                -- Ex: 'Implante dentário', 'Consultoria jurídica'
    ticket_medio NUMERIC(10,2),            -- Ticket médio do produto/serviço (R$)

    -- Público-alvo
    publico_alvo TEXT,                     -- Descrição do cliente ideal (ICP)
    area_geografica TEXT,                  -- Ex: 'São Paulo - SP', 'Nacional', 'Zona Sul - SP'
    faixa_etaria TEXT,                     -- Ex: '30-50 anos'
    genero TEXT CHECK (genero IN ('masculino', 'feminino', 'ambos')),

    -- Objetivo de campanha
    objetivo_campanha TEXT CHECK (objetivo_campanha IN (
        'leads', 'vendas', 'branding', 'app_installs', 'reconhecimento'
    )),

    -- Orçamento
    orcamento_mensal_ads NUMERIC(10,2),    -- Budget mensal para tráfego pago (R$)

    -- Tom de voz / posicionamento
    tom_de_voz TEXT CHECK (tom_de_voz IN (
        'profissional', 'descontraido', 'tecnico', 'emocional', 'urgente'
    )),

    -- Concorrentes e keywords (arrays)
    concorrentes TEXT[],                   -- Ex: ARRAY['concorrente1.com.br', 'concorrente2.com.br']
    palavras_chave_semente TEXT[],         -- Seeds para o agente de tráfego gerar keywords

    -- Campos preenchidos automaticamente via Decoder (snapshot)
    segmento_detalhado TEXT,               -- agent_04 (mercado): análise aprofundada do segmento
    pontos_fortes TEXT[],                  -- agent_08 (tribunal_boss): diferenciais positivos
    pontos_fracos TEXT[],                  -- agent_08: gaps e fraquezas identificadas
    diferenciais TEXT[],                   -- agent_07 (alquimista): proposta de valor
    insights_mercado TEXT,                 -- agent_04: contexto do mercado/segmento

    -- Metadados
    preenchido_via TEXT DEFAULT 'manual' CHECK (preenchido_via IN ('manual', 'decoder')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_client_icp_client_id ON public.client_icp(client_id);

-- RLS (acessa via client owner)
ALTER TABLE public.client_icp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage ICP of their clients"
ON public.client_icp
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = client_icp.client_id
        AND clients.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = client_icp.client_id
        AND clients.owner_id = auth.uid()
    )
);


-- =====================================================================================
-- 3. CAMPAIGNS TABLE
-- Campanhas de tráfego geradas pelo agente e subidas via Google Ads API
-- =====================================================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

    -- Identificação
    name TEXT NOT NULL,                    -- Ex: '[GROOWAY] Clínica X | Search | Implante | 2026-03'
    platform TEXT DEFAULT 'google_ads' CHECK (platform IN ('google_ads', 'meta_ads')),
    google_ads_campaign_id TEXT,           -- ID retornado pela API após subir

    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft',        -- gerado pelo agente, ainda não revisado
        'pending_review', -- aguardando aprovação do usuário
        'approved',     -- aprovado, aguardando subir
        'active',       -- rodando no Google Ads
        'paused',       -- pausado
        'ended'         -- encerrado
    )),

    -- Estrutura gerada pelo agente (JSON completo)
    campaign_structure JSONB NOT NULL,     -- { campaigns: [...] } gerado pelo traffic_manager

    -- Orçamento
    budget_daily NUMERIC(10,2),
    budget_monthly NUMERIC(10,2),

    -- Métricas (preenchidas pelo sync com Google Ads)
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    cost NUMERIC(10,2) DEFAULT 0,
    ctr NUMERIC(5,2) DEFAULT 0,            -- Click-through rate (%)
    cpa NUMERIC(10,2) DEFAULT 0,           -- Cost per acquisition

    -- Metadados
    generated_by TEXT DEFAULT 'traffic_manager_agent',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON public.campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage campaigns of their clients"
ON public.campaigns
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = campaigns.client_id
        AND clients.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = campaigns.client_id
        AND clients.owner_id = auth.uid()
    )
);


-- =====================================================================================
-- 4. HELPER FUNCTION: Convert Lead to Client
-- Copia snapshot do diagnóstico para o perfil do cliente
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.convert_lead_to_client(
    p_lead_id UUID,
    p_diagnostic_id UUID,
    p_owner_id UUID,
    p_monthly_value NUMERIC DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_client_id UUID;
    v_lead RECORD;
    v_diagnostic RECORD;
BEGIN
    -- Busca dados do lead
    SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead % not found', p_lead_id;
    END IF;

    -- Busca diagnóstico (snapshot)
    SELECT * INTO v_diagnostic FROM public.diagnostics WHERE id = p_diagnostic_id;

    -- Cria o cliente
    INSERT INTO public.clients (
        company_name,
        website,
        origem,
        lead_id,
        decoder_diagnostic_id,
        owner_id,
        monthly_value,
        status
    ) VALUES (
        v_lead.company_name,
        v_lead.target_url,
        'decoder',
        p_lead_id,
        p_diagnostic_id,
        p_owner_id,
        p_monthly_value,
        'active'
    )
    RETURNING id INTO v_client_id;

    -- Cria ICP pré-preenchido com dados do diagnóstico
    INSERT INTO public.client_icp (
        client_id,
        palavras_chave_semente,
        pontos_fortes,
        pontos_fracos,
        diferenciais,
        insights_mercado,
        preenchido_via
    ) VALUES (
        v_client_id,
        -- Extrai keywords do agent_06 (maestro_ads)
        ARRAY(
            SELECT jsonb_array_elements_text(
                v_diagnostic.report_data->'agent_06_maestro_ads'->'keywords'
            )
        ),
        -- Extrai pontos fortes do agent_08 (tribunal_boss)
        ARRAY(
            SELECT jsonb_array_elements_text(
                v_diagnostic.report_data->'agent_08_tribunal_boss'->'pontos_positivos'
            )
        ),
        -- Extrai pontos fracos
        ARRAY(
            SELECT jsonb_array_elements_text(
                v_diagnostic.report_data->'agent_08_tribunal_boss'->'pontos_negativos'
            )
        ),
        -- Extrai diferenciais do agent_07 (alquimista)
        ARRAY(
            SELECT jsonb_array_elements_text(
                v_diagnostic.report_data->'agent_07_alquimista_ofertas'->'brechas_diferenciacao'
            )
        ),
        -- Insights de mercado do agent_04
        v_diagnostic.report_data->'agent_04_espiao_mercado'->>'recomendacoes',
        'decoder'
    );

    -- Marca o lead como convertido
    UPDATE public.leads SET status = 'converted' WHERE id = p_lead_id;

    RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================================
-- 5. UPDATE: client_api_tokens — add FK to clients table
-- =====================================================================================

-- Adiciona constraint FK se ainda não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_client_api_tokens_client'
    ) THEN
        ALTER TABLE public.client_api_tokens
        ADD CONSTRAINT fk_client_api_tokens_client
        FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
    END IF;
END $$;


-- =====================================================================================
-- INSTRUÇÃO DE DEPLOY:
-- 1. Abrir Supabase Dashboard → SQL Editor → New Query
-- 2. Colar este script completo e clicar RUN
-- 3. Verificar que as 3 tabelas foram criadas: clients, client_icp, campaigns
-- 4. Testar a função: SELECT convert_lead_to_client('<lead_id>', '<diagnostic_id>', '<user_id>')
-- =====================================================================================
