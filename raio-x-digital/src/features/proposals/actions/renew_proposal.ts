"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function renewProposal(proposalId: string, days: number = 7) {
    const supabase = await createClient();

    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + days);

    const { error } = await supabase
        .from('proposals')
        .update({
            expires_at: newExpiry.toISOString(),
            status: 'active', // Volta a ficar ativo se estava expirado
            current_version: 1 // Opcional: manter versão atual
        })
        .eq('id', proposalId);

    if (error) {
        console.error("Error renewing proposal:", error);
        return false;
    }

    revalidatePath('/proposals');
    return true;
}
