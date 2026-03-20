"use client";
import React from 'react';
import { Target, Play, Loader2, ArrowRight } from 'lucide-react';

interface CommercialPlanPanelProps {
    commercialPlan: any;
    isGeneratingProposal: boolean;
    handleGenerateProposal: () => void;
}

export const CommercialPlanPanel = ({
    commercialPlan,
    isGeneratingProposal,
    handleGenerateProposal
}: CommercialPlanPanelProps) => {
    return (
        <div className="bg-gradient-to-br from-indigo-950/40 via-purple-900/10 to-transparent p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-3xl border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.08)] relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-fuchsia-500/10 blur-[80px] rounded-full"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-indigo-300 to-white flex items-center gap-3">
                        <span className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                            <Target className="w-6 h-6 text-fuchsia-400" />
                        </span>
                        Plano Comercial High-Ticket
                    </h3>
                    <p className="text-base font-medium text-slate-400 mt-2 px-1">
                        Pacotes de venda da Agência estrategicamente alinhados às dores detectadas.
                    </p>
                </div>

                {!commercialPlan && (
                    <button
                        onClick={handleGenerateProposal}
                        disabled={isGeneratingProposal}
                        className={`whitespace-nowrap flex items-center gap-3 px-6 py-3.5 rounded-full font-bold shadow-lg transition-all ${isGeneratingProposal ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:scale-105 text-white'}`}
                    >
                        {isGeneratingProposal ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                        ) : (
                            <><Play className="w-5 h-5 fill-white" /> Gerar Plano de Vendas</>
                        )}
                    </button>
                )}
            </div>

            {commercialPlan && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 relative z-10 font-medium">
                    <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border-l-4 border-fuchsia-500 text-slate-200 shadow-inner italic leading-relaxed">
                        &quot;{commercialPlan.mensagem_abertura}&quot;
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {commercialPlan.servicos_recomendados.map((srv: any, idx: number) => (
                            <div key={idx} className="bg-black/30 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-5 flex flex-col hover:bg-black/50 transition-all shadow-lg group">
                                <h4 className="text-lg font-black text-indigo-300 mb-4 pb-3 border-b border-white/5 flex items-center justify-between">
                                    {srv.nome_servico}
                                    <span className="text-[10px] w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">0{idx + 1}</span>
                                </h4>
                                <div className="space-y-4">
                                    <p className=\"text-base text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl\">{srv.por_que_vender}</p>
                                    <p className=\"text-base text-emerald-100/80 font-bold flex items-center gap-1\"><ArrowRight className="w-3" /> {srv.impacto_esperado}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
