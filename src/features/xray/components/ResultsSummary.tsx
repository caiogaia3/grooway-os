import React from 'react';
import { Share2, FileDown, Rocket, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResultsSummaryProps {
    score: number;
    companyName: string;
    onShareReport: () => void;
    onGenerateProposal: () => void;
    onOpenPDF: () => void;
    onOpenScoreRate: () => void;
    isSaving: boolean;
    shareLink: string | null;
}

export function getScoreBadge(score: number) {
    return (
        <div className={`px-3 py-1 rounded-full text-[10px] font-black bg-white/5 border ${score >= 70 ? 'text-emerald-400 border-emerald-500/30' :
            score >= 40 ? 'text-orange-400 border-orange-500/30' :
                'text-red-400 border-red-500/30'
            }`}>
            SCORE: {score}/100
        </div>
    );
}

export function ResultsSummary({
    score,
    companyName,
    onShareReport,
    onGenerateProposal,
    onOpenPDF,
    onOpenScoreRate,
    isSaving,
    shareLink
}: ResultsSummaryProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-white">{companyName}</h2>
                    {getScoreBadge(score)}
                </div>
                <p className="text-sm text-slate-400">Análise concluída com sucesso. Verifique os KPIs abaixo.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={onOpenPDF}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10"
                >
                    <FileDown className="w-4 h-4" /> PDF
                </button>

                <button
                    onClick={onGenerateProposal}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[#A855F7]/20 hover:bg-[#A855F7]/30 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-[#A855F7]/30"
                >
                    <Rocket className="w-4 h-4 text-[#A855F7]" /> {isSaving ? 'Gerando...' : 'Gerar Proposta'}
                </button>

                <button
                    onClick={onOpenScoreRate}
                    className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border border-cyan-500/20 tracking-tighter"
                >
                    <Info className="w-4 h-4" /> Score Rate
                </button>

                <button
                    onClick={onShareReport}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${shareLink
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                        }`}
                >
                    <Share2 className="w-4 h-4" /> {shareLink ? 'Link Copiado' : 'Compartilhar'}
                </button>
            </div>
        </div>
    );
}
