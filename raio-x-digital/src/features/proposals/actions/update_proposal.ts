"use server"

import { createClient } from "@/lib/supabase/server";

export async function updateProposalContent(proposalId: string, currentVersionNumber: number, newContent: any, status: string): Promise<boolean> {
    const supabase = await createClient();

    // Insert new version
    const newVersionNum = currentVersionNumber + 1;
    const { error: vError } = await supabase
        .from('proposal_versions')
        .insert({
            proposal_id: proposalId,
            version: newVersionNum,
            content: newContent,
            change_note: 'Atualização manual via editor'
        });

    if (vError) {
        console.error("Error creating new version:", vError);
        return false;
    }

    // Update proposal current_version and status
    const { error: pError } = await supabase
        .from('proposals')
        .update({
            current_version: newVersionNum,
            status: status,
            updated_at: new Date().toISOString() // Let DB handle if default now(), but explicit is good
        })
        .eq('id', proposalId);

    if (pError) {
        console.error("Error updating proposal:", pError);
        return false;
    }

    return true;
}

import { revalidatePath } from "next/cache";

export async function updateProposalStatus(proposalId: string, newStatus: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('proposals')
        .update({
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);

    if (error) {
        console.error("Error updating proposal status:", error);
        return false;
    }

    revalidatePath('/proposals');
    return true;
}

import { randomBytes } from "crypto";

function generateSlug(companyName: string) {
    const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const randomSuffix = randomBytes(3).toString('hex');
    return `${baseSlug}-${randomSuffix}`;
}

export async function saveProposalAsTemplate(proposalId: string, templateName: string, content: any): Promise<boolean> {
    const supabase = await createClient();

    // 1. Fetch original proposal
    const { data: original, error: fetchErr } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

    if (fetchErr || !original) {
        console.error("Error fetching original proposal:", fetchErr);
        return false;
    }

    // 2. Create new template proposal
    const slug = generateSlug('template');
    const shareToken = randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365); // Templates last long

    const { data: newTemplate, error: insertErr } = await supabase
        .from('proposals')
        .insert({
            slug,
            client_name: 'Template',
            client_company: 'Template',
            source: original.source,
            report_id: null,
            status: 'draft',
            is_template: true,
            template_name: templateName,
            current_version: 1,
            validity_days: 365,
            expires_at: expiresAt.toISOString(),
            share_token: shareToken
        })
        .select()
        .single();

    if (insertErr || !newTemplate) {
        console.error("Error creating template proposal:", insertErr);
        return false;
    }

    // 3. Insert version 1 for template
    const { error: versionErr } = await supabase
        .from('proposal_versions')
        .insert({
            proposal_id: newTemplate.id,
            version: 1,
            content: content,
            change_note: 'Modelo criado a partir de proposta existente.'
        });

    if (versionErr) {
        console.error("Error creating template version:", versionErr);
        return false;
    }

    revalidatePath('/proposals');
    revalidatePath('/proposals/reference-bank');
    return true;
}

export async function instantiateTemplate(templateId: string, clientName: string, clientCompany: string): Promise<string | null> {
    const supabase = await createClient();

    // 1. Fetch template
    const { data: template, error: fetchErr } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', templateId)
        .single();

    if (fetchErr || !template) {
        console.error("Error fetching template proposal:", fetchErr);
        return null;
    }

    // 2. Fetch template content
    const { data: templateVersion, error: vErr } = await supabase
        .from('proposal_versions')
        .select('content')
        .eq('proposal_id', template.id)
        .order('version', { ascending: false })
        .limit(1)
        .single();

    if (vErr || !templateVersion) {
        console.error("Error fetching template content:", vErr);
        return null;
    }

    // 3. Create new proposal from template
    const slug = generateSlug(clientCompany);
    const shareToken = randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Update the content header with new client data
    const newContent = { ...templateVersion.content };
    if (newContent.header) {
        newContent.header.client_name = clientName;
        newContent.header.client_company = clientCompany;
    }

    const { data: newProposal, error: insertErr } = await supabase
        .from('proposals')
        .insert({
            slug,
            client_name: clientName,
            client_company: clientCompany,
            source: 'manual',
            report_id: null,
            status: 'draft',
            is_template: false,
            template_name: null,
            current_version: 1,
            validity_days: 7,
            expires_at: expiresAt.toISOString(),
            share_token: shareToken
        })
        .select()
        .single();

    if (insertErr || !newProposal) {
        console.error("Error instantiating proposal:", insertErr);
        return null;
    }

    // 4. Insert version 1
    const { error: versionErr } = await supabase
        .from('proposal_versions')
        .insert({
            proposal_id: newProposal.id,
            version: 1,
            content: newContent,
            change_note: `Criado a partir do modelo ${template.template_name || 'Desconhecido'}`
        });

    if (versionErr) {
        console.error("Error creating instantiated version:", versionErr);
        return null;
    }

    revalidatePath('/proposals');
    return newProposal.id;
}

export async function deleteProposal(proposalId: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposalId);

    if (error) {
        console.error("Error deleting proposal:", error);
        return false;
    }

    revalidatePath('/proposals');
    revalidatePath('/proposals/reference-bank');
    return true;
}
