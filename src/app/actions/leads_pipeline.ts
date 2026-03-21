"use server";

interface StartPipelineInput {
    segmento: string;
    cidade: string;
    max_empresas: number;
    user_id: string;
}

interface PipelineStatusResponse {
    job_id: string;
    status: "running" | "completed" | "failed";
    progress: string[];
    result: {
        total_encontradas: number;
        sites_analisados: number;
        empresas_salvas: number;
        contatos_salvos: number;
        emails_encontrados: number;
    } | null;
    error: string | null;
}

interface MoverFunilInput {
    empresa_ids: string[];
    user_id: string;
    status_funil: string;
}

interface SemanticSearchInput {
    query: string;
    user_id: string;
    match_count?: number;
    threshold?: number;
}

const getApiConfig = () => ({
    url: process.env.INTELLIGENCE_API_URL || "http://localhost:8000",
    key: process.env.INTELLIGENCE_API_KEY || "",
});

async function apiFetch<T>(path: string, body: unknown): Promise<{ success: true; data: T } | { success: false; error: string }> {
    const { url, key } = getApiConfig();

    try {
        const response = await fetch(`${url}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(key && { "X-Api-Key": key }),
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || `Erro ${response.status}` };
        }

        const data = await response.json();
        return { success: true, data };
    } catch {
        return { success: false, error: "Intelligence API indisponível. Verifique se o serviço Python está rodando." };
    }
}

async function apiGet<T>(path: string): Promise<{ success: true; data: T } | { success: false; error: string }> {
    const { url, key } = getApiConfig();

    try {
        const response = await fetch(`${url}${path}`, {
            method: "GET",
            headers: {
                ...(key && { "X-Api-Key": key }),
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || `Erro ${response.status}` };
        }

        const data = await response.json();
        return { success: true, data };
    } catch {
        return { success: false, error: "Intelligence API indisponível." };
    }
}

export async function startLeadsPipeline(input: StartPipelineInput) {
    return apiFetch<{ job_id: string; status: string }>("/leads-pipeline/start", input);
}

export async function getLeadsPipelineStatus(jobId: string) {
    return apiGet<PipelineStatusResponse>(`/leads-pipeline/status/${jobId}`);
}

export async function moverParaFunil(input: MoverFunilInput) {
    return apiFetch<{ status: string; moved: number; to: string }>("/leads/mover-funil", input);
}

export async function searchLeadsSemantic(input: SemanticSearchInput) {
    return apiFetch<{ status: string; results: unknown[] }>("/leads/search", input);
}
