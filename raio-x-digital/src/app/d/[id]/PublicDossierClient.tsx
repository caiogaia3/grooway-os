"use client"

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Target, AlertTriangle, CheckCircle2, TrendingUp, Zap, Briefcase, User } from "lucide-react";
import PublicHeader from "@/components/Branding/PublicHeader";

interface Props {
    diagnosticData: any;
    clientData: {
        name: string;
        company: string;
    };
}

export default function PublicDossierClient({ diagnosticData, clientData }: Props) {
    const findings = diagnosticData.findings || {};
    const bossVerdict = findings.boss || "Análise em processamento...";

    // Simplified metrics for the client
    const topMetrics = [
        { label: "Oportunidade de Mercado", value: findings.market?.score || 85, icon: TrendingUp, color: "text-blue-400" },
        { label: "Performance Digital", value: findings.performance?.score || 70, icon: Zap, color: "text-amber-400" },
        { label: "Prontidão de Vendas", value: findings.social?.score || 60, icon: Target, color: "text-emerald-400" },
    ];

    return (
        <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-purple-500/30">
            <PublicHeader />

            <div className="max-w-4xl mx-auto px-6 py-20 pb-40">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
                        Dossiê de Diagnóstico Estrutural
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                        O Veredito para a <span className="text-white">{clientData.company}</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Análise de raio-x profunda sobre o ecossistema digital e comercial da sua operação.
                    </p>
                </motion.div>

                {/* Score Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-24">
                    {topMetrics.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center"
                        >
                            <m.icon className={`w-8 h-8 ${m.color} mb-4`} />
                            <span className="text-3xl font-black text-white mb-1">{m.value}%</span>
                            <span className="text-slate-500 text-xs uppercase font-bold tracking-tighter">{m.label}</span>
                        </motion.div>
                    ))}
                </div>

                {/* The Boss Verdict - PREMIUM SECTION */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="relative p-10 rounded-3xl bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border border-purple-500/20 mb-24 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Shield className="w-48 h-48" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">O Veredito do Especialista</h2>
                        </div>

                        <div className="prose prose-invert max-w-none text-slate-300 text-lg leading-relaxed mb-10">
                            {bossVerdict.split('\n').map((p: string, i: number) => (
                                <p key={i} className="mb-4">{p}</p>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                            <div>
                                <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-4">
                                    <AlertTriangle className="w-4 h-4" /> Problemas Críticos
                                </h3>
                                <ul className="space-y-3">
                                    {diagnosticData.critical_issues?.map((issue: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-sm text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-emerald-400 font-bold flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-4 h-4" /> Pontos de Alavancagem
                                </h3>
                                <ul className="space-y-3">
                                    {diagnosticData.leverage_points?.map((pt: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-sm text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Next Steps CTA */}
                <section className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-8">Pronto para dar o próximo passo?</h2>
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4">
                        <a
                            href={`https://wa.me/5511999999999?text=Vi o meu Dossiê da ${clientData.company} e quero falar sobre os próximos passos.`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-shine px-8 py-4 text-white text-lg flex items-center gap-3 shadow-[0_0_50px_rgba(124,58,237,0.3)] hover:scale-105 transition-all"
                        >
                            Falar com um Consultor <Briefcase className="w-5 h-5" />
                        </a>
                    </div>
                </section>
            </div>

            <footer className="py-12 border-t border-white/5 text-center text-slate-600 text-sm">
                <p>© {new Date().getFullYear()} GROOWAY. Todos os direitos reservados.</p>
            </footer>
        </main>
    );
}
