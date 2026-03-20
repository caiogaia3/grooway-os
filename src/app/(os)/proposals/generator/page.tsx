import { ProposalGenerator } from "@/features/proposals/components/ai-generator/ProposalGenerator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProposalGeneratorPage() {
    return (
        <div className="flex flex-col h-screen">
            <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-[#0A0A0A] shrink-0">
                <Link
                    href="/proposals"
                    className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </Link>
                <div className="h-4 w-px bg-white/10" />
                <div>
                    <h1 className="text-sm font-semibold text-white">Gerador de Propostas IA</h1>
                    <p className="text-xs text-neutral-500">Metodologia Growth Partner · High Ticket</p>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <ProposalGenerator />
            </div>
        </div>
    );
}
