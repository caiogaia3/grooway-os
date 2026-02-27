import { notFound } from "next/navigation";
import PublicDossierClient from "./PublicDossierClient";
import { Metadata } from "next";

// This is a placeholder for the actual data fetching.
// In a real app, you would fetch from Supabase 'diagnostics' table.
async function getDiagnosticData(id: string) {
    // For now, returning a mock structure that matches PublicDossierClient requirements
    // In production, this would use a secure public link or ID
    return {
        client: {
            name: "Caio Gaia",
            company: "Empresa Exemplo",
        },
        findings: {
            boss: "O seu ecossistema digital apresenta falhas críticas de rastreamento. Sem dados, você está voando às cegas. A oportunidade de mercado é alta, mas a execução técnica atual está drenando o seu ROI.",
            market: { score: 88 },
            performance: { score: 45 },
            social: { score: 65 },
        },
        critical_issues: [
            "GTM Inexistente: Perda total de inteligência de conversão.",
            "Site Lento: Taxa de rejeição acima de 70% no mobile.",
            "Social Media sem CTA: Tráfego de vaidade sem conversão em vendas."
        ],
        leverage_points: [
            "Alta autoridade de nicho detectada.",
            "Mercado com baixa concorrência técnica na região.",
            "Base de clientes atual com alto potencial de upsell."
        ]
    };
}

export const metadata: Metadata = {
    title: "Dossiê Estratégico - Grooway",
    description: "Análise comercial profunda e vdeliverables estratégicos.",
};

export default async function PublicDossierPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const data = await getDiagnosticData(id);

    if (!data) return notFound();

    return <PublicDossierClient diagnosticData={data} clientData={data.client} />;
}
