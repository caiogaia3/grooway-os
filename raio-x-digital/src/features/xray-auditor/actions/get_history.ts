"use server";

import { supabase } from "@/core/services/supabase";

export interface AuditHistoryItem {
    id: string;
    target_url: string;
    company_name: string;
    score: number;
    saved_at: number;
}

export async function getAuditHistory(): Promise<AuditHistoryItem[]> {
    try {
        const { data, error } = await supabase
            .from("reports")
            .select("id, data")
            .order("created_at", { ascending: false })
            .limit(10);

        if (error) {
            console.error("Erro ao buscar histórico:", error);
            return [];
        }

        if (!data) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((row: any) => {
            const rData = row.data?.report_data;
            const score = rData?.agente_08?.diagnostico_final?.score_geral ||
                rData?.agente_01?.score || 0;
            return {
                id: row.id,
                target_url: rData?.target_url || "URL desconhecida",
                company_name: row.data?.company_name || rData?.target_url?.replace(/^https?:\/\//, '').split('/')[0] || "Empresa",
                score: score,
                saved_at: row.data?.saved_at || 0,
            };
        });

    } catch (e) {
        console.error("Exceção ao buscar histórico:", e);
        return [];
    }
}
