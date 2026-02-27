"use client";

import { useState } from "react";
import { Proposal } from "@/features/proposals/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar, Eye, ExternalLink, MoreVertical,
    CheckCircle, XCircle, RotateCcw, FileEdit,
    PlaySquare, Trash2, Loader2, RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { updateProposalStatus, deleteProposal } from "@/features/proposals/actions/update_proposal";
import { renewProposal } from "@/features/proposals/actions/renew_proposal";

function StatusBadge({ status }: { status: string }) {
    const statusStyles: Record<string, string> = {
        draft: "bg-neutral-800 text-neutral-300 border-neutral-700",
        sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        approved: "bg-green-500/10 text-green-400 border-green-500/20",
        rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const style = statusStyles[status] || statusStyles.draft;
    const labels: Record<string, string> = {
        draft: "Rascunho",
        sent: "Enviada",
        approved: "Aprovada",
        rejected: "Rejeitada",
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
            {labels[status] || status}
        </span>
    );
}

type Props = {
    proposal: Proposal;
};

export default function ProposalCard({ proposal }: Props) {
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleStatusUpdate = async (newStatus: string) => {
        setLoading(true);
        setShowMenu(false);
        const success = await updateProposalStatus(proposal.id, newStatus);
        if (!success) {
            alert("Erro ao atualizar status.");
        }
        setLoading(false);
    };

    const handleRenew = async () => {
        setLoading(true);
        const success = await renewProposal(proposal.id);
        if (!success) {
            alert("Erro ao renovar proposta.");
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (window.confirm("Tem certeza que deseja excluir esta proposta permanentemente?")) {
            setIsDeleting(true);
            const success = await deleteProposal(proposal.id);
            if (!success) {
                alert("Erro ao excluir proposta.");
                setIsDeleting(false);
            }
        }
    };

    const isExpired = proposal.expires_at && new Date(proposal.expires_at) < new Date();

    return (
        <div className="flex flex-col p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-purple-500/50 hover:bg-white/[0.08] transition-all group relative">
            {(loading || isDeleting) && (
                <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <StatusBadge status={proposal.status} />

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true, locale: ptBR })}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-neutral-500 hover:text-white transition-colors"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 top-6 w-40 bg-neutral-900 border border-white/10 rounded-xl shadow-xl z-30 py-1 overflow-hidden">
                                    {isExpired && (
                                        <button
                                            onClick={handleRenew}
                                            className="w-full text-left px-4 py-2 text-xs text-amber-400 hover:bg-white/5 flex items-center gap-2 border-b border-white/5"
                                        >
                                            <RefreshCcw className="w-4 h-4" /> Reativar (7 dias)
                                        </button>
                                    )}
                                    {proposal.status !== 'approved' && (
                                        <button
                                            onClick={() => handleStatusUpdate('approved')}
                                            className="w-full text-left px-4 py-2 text-xs text-green-400 hover:bg-white/5 flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Marcar Aprovada
                                        </button>
                                    )}
                                    {proposal.status !== 'rejected' && (
                                        <button
                                            onClick={() => handleStatusUpdate('rejected')}
                                            className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5 flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" /> Marcar Rejeitada
                                        </button>
                                    )}
                                    {(proposal.status === 'approved' || proposal.status === 'rejected') && (
                                        <button
                                            onClick={() => handleStatusUpdate('sent')}
                                            className="w-full text-left px-4 py-2 text-xs text-blue-400 hover:bg-white/5 flex items-center gap-2"
                                        >
                                            <RotateCcw className="w-4 h-4" /> Voltar para Enviada
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-lg font-medium text-white line-clamp-1 mb-1 group-hover:text-purple-400 transition-colors">
                    {proposal.client_company || proposal.client_name}
                </h3>
                <p className="text-sm text-neutral-400 mb-4 line-clamp-1">
                    Responsável: {proposal.client_name}
                </p>
                <div className="text-xs text-neutral-500 flex justify-between items-center">
                    <span>Origem: {proposal.source === 'diagnostic' ? 'Diagnóstico' : 'Manual'}</span>
                    {isExpired && <span className="text-red-400 font-bold uppercase tracking-tighter">Expirada</span>}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors" title="Visualizações">
                        <Eye className="w-4 h-4" />
                        <span>0 views</span>
                    </button>
                    <a
                        href={`/p/${proposal.slug}/present?t=${proposal.share_token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-colors border border-amber-500/20"
                        title="Modo Apresentação (Slides)"
                    >
                        <PlaySquare className="w-4 h-4" />
                    </a>
                </div>

                <div className="flex gap-2">
                    <Link
                        href={`/p/${proposal.slug}?t=${proposal.share_token}`}
                        target="_blank"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs font-semibold border border-blue-500/20"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver Site
                    </Link>

                    <Link
                        href={`/proposals/${proposal.id}/edit`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-neutral-300 hover:text-white hover:bg-purple-600 transition-colors text-xs font-semibold border border-white/10"
                    >
                        <FileEdit className="w-3.5 h-3.5" />
                        Editar
                    </Link>

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center justify-center p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 disabled:opacity-50"
                        title="Excluir Proposta"
                    >
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
