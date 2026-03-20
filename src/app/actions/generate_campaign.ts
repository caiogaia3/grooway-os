"use server";

interface ClientICP {
    nome_fantasia: string;
    segmento: string;
    cidade?: string;
    site_url?: string;
    publico_alvo?: string;
    principal_diferencial?: string;
    produto_servico_principal?: string;
    objetivo_principal?: string;
    budget_mensal_google?: number;
    budget_mensal_meta?: number;
}

interface GenerateCampaignInput {
    client_id: string;
    client_icp: ClientICP;
}

export async function generateCampaign(input: GenerateCampaignInput) {
    const apiUrl = process.env.INTELLIGENCE_API_URL || "http://localhost:8000";
    const apiKey = process.env.INTELLIGENCE_API_KEY || "";

    try {
        const response = await fetch(`${apiUrl}/generate-campaign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(apiKey && { "X-Api-Key": apiKey }),
            },
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.detail || `Erro ${response.status}`,
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("[generate_campaign] Error:", error);
        return {
            success: false,
            error: "Intelligence API indisponível. Verifique se o serviço Python está rodando.",
        };
    }
}
