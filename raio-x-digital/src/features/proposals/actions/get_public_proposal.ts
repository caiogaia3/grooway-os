"use server"

import { createClient } from "@/lib/supabase/server";
import { Proposal, ProposalVersion } from "@/features/proposals/lib/types";
import { createNotification } from "@/features/proposals/actions/notification_actions";

export async function getProposalBySlugAndToken(slug: string, token: string | undefined): Promise<{ proposal: Proposal; version: ProposalVersion } | null> {
    const supabase = await createClient();

    let query = supabase.from('proposals').select('*').eq('slug', slug);

    // Validate token if needed. In PRD we said access is only via share_token
    if (!token) return null;
    query = query.eq('share_token', token);

    const { data: proposal, error: pError } = await query.single();

    if (pError || !proposal) return null;

    // Se a proposta já expirou
    if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
        // Here we could return a specific status to show "Expired" UI
        // For now, let's pass it anyway and let the UI handle expiration
    }

    const { data: version, error: vError } = await supabase
        .from('proposal_versions')
        .select('*')
        .eq('proposal_id', proposal.id)
        .order('version', { ascending: false })
        .limit(1)
        .single();

    if (vError || !version) return null;

    return { proposal: proposal as Proposal, version: version as ProposalVersion };
}

export async function trackProposalView(proposalId: string, ipHash: string, userAgent: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('proposal_views')
        .insert({
            proposal_id: proposalId,
            viewer_hash: ipHash,
            user_agent: userAgent,
            time_on_page_seconds: 0,
            downloaded_pdf: false
        })
        .select('id')
        .single();

    if (error) {
        console.error("Error tracking view:", error);
        return null;
    }

    // Trigger Notification (Background)
    // We already have the proposal_id. Let's get the client name if possible or just generic.
    // To be efficient, we'll just say "A proposta foi visualizada"
    createNotification(
        "Proposta Visualizada! 👀",
        `Um lead acabou de abrir a sua proposta (ID: ${proposalId.slice(0, 8)}...).`,
        "view",
        `/proposals/${proposalId}/analytics`
    ).catch(() => { });

    return data.id;
}

export async function updateProposalViewTime(viewId: string, seconds: number) {
    if (!viewId) return;
    const supabase = await createClient();

    await supabase
        .from('proposal_views')
        .update({ time_on_page_seconds: seconds })
        .eq('id', viewId);
}

export async function markProposalPdfDownloaded(viewId: string) {
    if (!viewId) return;
    const supabase = await createClient();

    await supabase
        .from('proposal_views')
        .update({ downloaded_pdf: true })
        .eq('id', viewId);
}
