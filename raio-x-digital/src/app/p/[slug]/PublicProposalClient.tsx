"use client"

import { Proposal } from "@/features/proposals/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Download, Brain, Search, BarChart3, Clock, Rocket, Shield, Activity, FileText } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { updateProposalViewTime, markProposalPdfDownloaded } from "@/features/proposals/actions/get_public_proposal";

interface Props {
    proposal: Proposal;
    content: any;
    viewId: string | null;
}

export default function PublicProposalClient({ proposal, content, viewId }: Props) {
    const header = content.header || {};
    const sections = content.sections || [];

    const timeSpentRef = useRef(0);

    useEffect(() => {
        if (!viewId) return;

        const interval = setInterval(() => {
            timeSpentRef.current += 10;
            updateProposalViewTime(viewId, timeSpentRef.current).catch(console.error);
        }, 10000); // ping every 10 seconds

        return () => clearInterval(interval);
    }, [viewId]);

    const handleDownloadPdf = async () => {
        if (viewId) {
            await markProposalPdfDownloaded(viewId).catch(console.error);
        }

        // Dynamic title for PDF filename
        const companyName = header.client_company || header.client_name || "Cliente";
        const originalTitle = document.title;
        document.title = `${companyName} - Proposta Comercial - Grooway`;

        setTimeout(() => {
            window.print();
            document.title = originalTitle;
        }, 100);
    };

    const getIcon = (iconName: string, className: string = "w-5 h-5") => {
        switch (iconName) {
            case 'search': return <Search className={className} />;
            case 'brain': return <Brain className={className} />;
            case 'chart': return <BarChart3 className={className} />;
            case 'check': return <Check className={className} />;
            case 'clock': return <Clock className={className} />;
            case 'shield': return <Shield className={className} />;
            case 'activity': return <Activity className={className} />;
            default: return <Check className={className} />;
        }
    };

    return (
        <main className="min-h-screen bg-[#020617] text-slate-50 font-sans relative overflow-hidden pb-32 print:bg-white print:text-black">
            {/* Background Assets */}
            <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020617] to-[#020617] pointer-events-none print:hidden" />
            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-white/[0.02] opacity-30 pointer-events-none mix-blend-overlay print:hidden" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

            {/* Public Header Branding */}
            <nav className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 flex justify-between items-center print:static print:bg-white print:border-neutral-200">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8">
                        <img src="/brand/logo-3d.png" alt="Grooway" className="object-contain" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-bold text-white print:text-black tracking-tight">GROOWAY</span>
                        <span className="text-[8px] text-neutral-500 uppercase tracking-widest">Performance Digital</span>
                    </div>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors text-sm font-semibold print:hidden"
                    onClick={handleDownloadPdf}
                >
                    <Download className="w-4 h-4" /> Salvar em PDF
                </button>
            </nav>

            <div className="max-w-4xl mx-auto px-6 pt-32 relative z-10 w-full">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
                        Projeto Estratégico Exclusivo
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                        {header.scope_headline || "Estratégia Definitiva de Escala"}
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-8">
                        Desenvolvido para <strong className="text-white">{header.client_company || header.client_name}</strong>
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-slate-500 font-mono mt-8">
                        <span>Preparado por: {header.proponent}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span>Data: {new Date(proposal.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                </motion.header>

                <div className="space-y-32">
                    {sections.map((section: any, idx: number) => {
                        return (
                            <motion.section
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.7 }}
                                className="relative"
                            >
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 flex items-center gap-4">
                                    {section.title}
                                </h2>

                                {/* Tipo: Concept */}
                                {section.type === 'concept' && (
                                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 sm:p-10 backdrop-blur-sm text-lg text-slate-300 leading-relaxed space-y-4">
                                        {section.content.split('\n').map((p: string, i: number) => <p key={i}>{p}</p>)}
                                    </div>
                                )}

                                {/* Tipo: Strategy Pillars */}
                                {section.type === 'strategy_pillars' && (
                                    <div>
                                        {section.intro && <p className="text-slate-400 mb-8 text-lg">{section.intro}</p>}
                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                                            {section.pillars?.map((pillar: any, i: number) => (
                                                <div key={i} className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors">
                                                    <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-5">
                                                        {getIcon(pillar.icon)}
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
                                                    <p className="text-slate-400 text-sm leading-relaxed">{pillar.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tipo: Modules */}
                                {section.type === 'modules' && (
                                    <div className="space-y-6">
                                        {section.modules?.map((mod: any, i: number) => (
                                            <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-6 sm:p-8">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-indigo-300">{mod.name}</h3>
                                                        {mod.description && <p className="text-slate-400 text-sm mt-2">{mod.description}</p>}
                                                    </div>
                                                </div>
                                                <ul className="grid sm:grid-cols-2 gap-4">
                                                    {mod.items?.map((item: any, j: number) => (
                                                        <li key={j} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                            <div className="mt-0.5 text-emerald-400">{getIcon(item.icon, "w-4 h-4")}</div>
                                                            <div>
                                                                <h4 className="font-bold text-white text-sm">{item.label}</h4>
                                                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.detail}</p>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Tipo: Investment */}
                                {section.type === 'investment' && (
                                    <div className="grid md:grid-cols-2 gap-6 w-full">
                                        {section.cards?.map((card: any, i: number) => (
                                            <div key={i} className={`rounded-3xl p-8 relative overflow-hidden group border ${card.recurrence === 'monthly' ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-white/5 border-white/10'}`}>
                                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <Brain className="w-32 h-32" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                                    {card.label}
                                                </p>
                                                <h3 className="text-2xl font-bold text-white mb-6 pr-8">{card.title}</h3>

                                                <div className="mb-8">
                                                    {card.price != null ? (
                                                        <div className="flex items-end gap-1">
                                                            <span className="text-lg text-slate-400 font-medium">R$</span>
                                                            <span className="text-4xl font-black text-white">{card.price.toLocaleString('pt-BR')}</span>
                                                            {card.recurrence === 'monthly' && <span className="text-sm text-slate-400 mb-1">/mês</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-2xl font-black text-white">Sob Consulta</span>
                                                    )}
                                                </div>

                                                <ul className="space-y-3">
                                                    {card.items?.map((item: string, j: number) => (
                                                        <li key={j} className="flex items-start gap-3 text-sm text-slate-300">
                                                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Tipo: Timeline */}
                                {section.type === 'timeline' && (
                                    <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 py-4">
                                        {section.stages?.map((stage: any, i: number) => (
                                            <div key={i} className="relative pl-8">
                                                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-[#020617]" />
                                                <h3 className="font-bold text-white text-lg flex items-center justify-between">
                                                    {stage.name}
                                                    <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-400">{stage.deadline}</span>
                                                </h3>
                                                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{stage.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Tipo: Validity + CTA */}
                                {section.type === 'validity' && (
                                    <div className="bg-gradient-to-br from-indigo-900/40 to-black/40 border border-indigo-500/20 rounded-3xl p-8 sm:p-12 text-center lg:text-left">
                                        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                                            <div className="flex-1">
                                                <h3 className="text-2xl sm:text-3xl font-light text-white mb-6 leading-tight">Próximos passos para <strong className="font-bold">dominarmos o seu mercado.</strong></h3>
                                                <ul className="space-y-4 inline-block text-left">
                                                    {section.steps?.map((step: any, i: number) => (
                                                        <li key={i} className="flex items-center gap-4 text-slate-300">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                                <span className="text-xs font-bold">{i + 1}</span>
                                                            </div>
                                                            <div>
                                                                <strong className="text-white block">{step.label}</strong>
                                                                <span className="text-sm text-slate-400">{step.detail}</span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="w-full lg:w-auto flex flex-col items-center">
                                                <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold text-lg rounded-full flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                                                    {section.cta || "Avançar para Implementação"} <ArrowRight className="w-5 h-5" />
                                                </a>
                                                <p className="mt-6 text-xs text-slate-500 flex items-center gap-2">
                                                    <Clock className="w-3 h-3" />
                                                    Proposta válida até {new Date(proposal.expires_at!).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.section>
                        )
                    })}
                </div>

                {/* Footer */}
                <footer className="mt-32 pt-12 pb-24 border-t border-white/5 text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} GROOWAY. Todos os direitos reservados.</p>
                    <p className="mt-2 text-xs opacity-60">Os valores e condições apresentados são exclusivos e confidenciais.</p>
                </footer>
            </div>
        </main>
    );
}
