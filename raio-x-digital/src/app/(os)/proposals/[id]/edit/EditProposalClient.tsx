"use client"

import { useState, useEffect } from "react";
import { Proposal, ProposalVersion } from "@/features/proposals/lib/types";
import { updateProposalContent, saveProposalAsTemplate } from "@/features/proposals/actions/update_proposal";
import { useRouter } from "next/navigation";
import { Loader2, Save, Send, CheckCircle, Eye, Code, LayoutTemplate, BookmarkPlus } from "lucide-react";
import VisualEditor from "./VisualEditor";

interface Props {
    proposal: Proposal;
    initialVersion: ProposalVersion;
}

export default function EditProposalClient({ proposal, initialVersion }: Props) {
    const [parsedContent, setParsedContent] = useState<any>(initialVersion.content);
    const [contentStr, setContentStr] = useState(JSON.stringify(initialVersion.content, null, 2));
    const [isVisualMode, setIsVisualMode] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [templateNameInput, setTemplateNameInput] = useState('');
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSave = async (publish: boolean = false) => {
        setError('');

        let finalContent = parsedContent;
        if (!isVisualMode) {
            try {
                finalContent = JSON.parse(contentStr);
                setParsedContent(finalContent);
            } catch (e) {
                setError('JSON Inválido. Corrija o formato antes de salvar.');
                return;
            }
        }

        if (publish) setIsPublishing(true);
        else setIsSaving(true);

        const newStatus = publish ? 'sent' : proposal.status;

        try {
            const success = await updateProposalContent(proposal.id, proposal.current_version, finalContent, newStatus);
            if (success) {
                if (publish) {
                    router.push(`/proposals/${proposal.id}/share`);
                } else {
                    // Recarregar a página para pegar a nova versão
                    window.location.reload();
                }
            } else {
                setError('Erro interno ao salvar proposta.');
            }
        } catch (e) {
            setError('Erro ao salvar.');
        } finally {
            setIsSaving(false);
            setIsPublishing(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!templateNameInput.trim()) {
            setError('Digite um nome para o modelo.');
            return;
        }

        let finalContent = parsedContent;
        if (!isVisualMode) {
            try {
                finalContent = JSON.parse(contentStr);
                setParsedContent(finalContent);
            } catch (e) {
                setError('JSON Inválido. Corrija o formato antes de salvar.');
                return;
            }
        }

        setIsSavingTemplate(true);
        setError('');
        try {
            const success = await saveProposalAsTemplate(proposal.id, templateNameInput, finalContent);
            if (success) {
                setShowTemplateModal(false);
                setTemplateNameInput('');
                alert('Modelo salvo com sucesso no Banco de Referências!');
            } else {
                setError('Erro ao salvar modelo.');
            }
        } catch (e) {
            setError('Erro ao salvar modelo.');
        } finally {
            setIsSavingTemplate(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 sm:p-8 max-w-5xl mx-auto w-full min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">Editor de Proposta</h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-white/5 border-white/10 text-slate-300">
                            Versão {proposal.current_version}
                        </span>
                    </div>
                    <p className="text-neutral-400 text-sm mt-1">
                        Cliente: <span className="text-white font-medium">{proposal.client_company || proposal.client_name}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => window.open(`/p/${proposal.slug}?t=${proposal.share_token}`, '_blank')}
                        className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </button>
                    {!proposal.is_template && (
                        <button
                            onClick={() => setShowTemplateModal(true)}
                            className="flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                            title="Salva o layout e conteúdo atual como um modelo reutilizável no Banco de Referências."
                        >
                            <BookmarkPlus className="w-4 h-4" />
                            Salvar como Modelo
                        </button>
                    )}
                    <button
                        onClick={() => handleSave(false)}
                        disabled={isSaving || isPublishing}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                        title="Salva as alterações atuais no banco de dados sem enviá-las para o cliente."
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Rascunho
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={isSaving || isPublishing}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                    >
                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Publicar
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className={`flex-1 w-full ${!isVisualMode ? 'bg-[#0B0F19] border border-white/10 rounded-xl overflow-hidden' : ''} flex flex-col`}>
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => {
                            if (!isVisualMode) {
                                try {
                                    setParsedContent(JSON.parse(contentStr));
                                    setError('');
                                    setIsVisualMode(true);
                                } catch (e) {
                                    setError('JSON Inválido. Não é possível mudar para o modo visual.');
                                }
                            } else {
                                setIsVisualMode(true);
                            }
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isVisualMode ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-neutral-400 hover:bg-white/5'}`}
                    >
                        <LayoutTemplate className="w-4 h-4" /> Visual
                    </button>
                    <button
                        onClick={() => {
                            if (isVisualMode) {
                                setContentStr(JSON.stringify(parsedContent, null, 2));
                            }
                            setIsVisualMode(false);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!isVisualMode ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-neutral-400 hover:bg-white/5'}`}
                    >
                        <Code className="w-4 h-4" /> Avançado (JSON)
                    </button>
                </div>

                {isVisualMode ? (
                    <VisualEditor content={parsedContent} setContent={setParsedContent} />
                ) : (
                    <>
                        <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between mt-0">
                            <span className="text-xs font-mono text-slate-400">content.json (JSON Estruturado)</span>
                            <span className="text-xs text-yellow-500">Cuidado ao editar as chaves do JSON</span>
                        </div>
                        <textarea
                            value={contentStr}
                            onChange={(e) => setContentStr(e.target.value)}
                            className="w-full flex-1 min-h-[60vh] bg-transparent p-4 font-mono text-sm text-slate-300 resize-none focus:outline-none focus:ring-inset focus:ring-1 focus:ring-brand-purple/50 custom-scrollbar"
                            spellCheck="false"
                        />
                    </>
                )}
            </div>

            {/* Modal de Salvar Modelo */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md p-6 overflow-hidden">
                        <h3 className="text-xl font-bold text-white mb-2">Salvar como Modelo</h3>
                        <p className="text-sm text-neutral-400 mb-6">
                            Esta proposta será salva no Banco de Referências para ser usada rapidamente em futuros projetos.
                        </p>

                        <div className="mb-6">
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Nome do Modelo</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="E.g. Proposta Padrão Tráfego Local"
                                value={templateNameInput}
                                onChange={(e) => setTemplateNameInput(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                disabled={isSavingTemplate}
                                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveTemplate}
                                disabled={isSavingTemplate || !templateNameInput.trim()}
                                className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                            >
                                {isSavingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
                                Salvar Modelo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
