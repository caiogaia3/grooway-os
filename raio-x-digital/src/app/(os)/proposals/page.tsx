import { getProposals } from "@/features/proposals/actions/get_proposals";
import ProposalCard from "./ProposalCard";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import NotificationsBell from "./NotificationsBell";

export default async function ProposalsDashboard() {
    const proposals = await getProposals();

    return (
        <div className="flex flex-col gap-6 p-6 sm:p-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                        Grooway Proposals
                    </h1>
                    <p className="text-neutral-400 text-sm mt-1">
                        Gestão inteligente de propostas comerciais premium
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <NotificationsBell />
                    <Link
                        href="/proposals/reference-bank"
                        className="flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto text-sm"
                    >
                        Banco de Referências
                    </Link>
                    <Link
                        href="/proposals/catalog"
                        className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto text-sm border border-white/10"
                    >
                        Catálogo de Serviços
                    </Link>
                    <Link
                        href="/proposals/new"
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Proposta
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proposals.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-neutral-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Nenhuma proposta encontrada</h3>
                        <p className="text-neutral-400 text-sm max-w-sm">
                            Você ainda não criou nenhuma proposta comercial. Inicie pelo Auditor ou crie uma do zero.
                        </p>
                    </div>
                ) : (
                    proposals.map((proposal) => (
                        <ProposalCard key={proposal.id} proposal={proposal} />
                    ))
                )}
            </div>
        </div>
    );
}
