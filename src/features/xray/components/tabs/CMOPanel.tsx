"use client";
import React from 'react';
import { Briefcase, XCircle, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface CMOPanelProps {
    cmoSkill: {
        score: number;
        findings: {
            pontos_negativos_consolidados?: string[];
            pontos_positivos_consolidados?: string[];
            cmo_verdict?: string;
        };
    };
    getScoreBadge: (score: number) => React.ReactNode;
}

export const CMOPanel = ({ cmoSkill, getScoreBadge }: CMOPanelProps) => {
    if (!cmoSkill || !cmoSkill.findings) return null;

    const score = cmoSkill.score || 0;
    const strokeDasharray = 440; // 2 * PI * r (r=70)
    const strokeDashoffset = strokeDasharray - (strokeDasharray * score) / 100;

    return (
        <div className="liquid-card overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-12">
                {/* Score Section - Circular Chart */}
                <div className="flex flex-col items-center lg:items-start lg:w-1/3">
                    <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                className="text-white/5"
                                cx="96"
                                cy="96"
                                fill="transparent"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="12"
                            />
                            <motion.circle
                                initial={{ strokeDashoffset: strokeDasharray }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-primary drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                cx="96"
                                cy="96"
                                fill="transparent"
                                r="70"
                                stroke="currentColor"
                                strokeDasharray={strokeDasharray}
                                strokeLinecap="round"
                                strokeWidth="12"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black text-white neon-text-purple tracking-tighter">
                                {score}%
                            </span>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                Score Global
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 w-full">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Briefcase className="w-5 h-5 text-primary" />
                            Veredito Executivo
                        </h3>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">
                            Análise consolidada baseada no cruzamento de dados técnicos e inteligência artificial.
                        </p>
                        <div className="pt-4 border-t border-white/5">
                            {getScoreBadge(score)}
                        </div>
                    </div>
                </div>

                {/* Findings Content */}
                <div className="flex-1 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Negatives */}
                        <div className="glass-panel p-6 rounded-3xl border-rose-500/10 hover:border-rose-500/20 transition-colors">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-rose-400 mb-6 uppercase tracking-[0.2em] border-b border-rose-500/10 pb-3">
                                <XCircle className="w-4 h-4" /> Pontos Críticos
                            </h4>
                            <ul className="space-y-4">
                                {cmoSkill.findings.pontos_negativos_consolidados?.map((item: string, idx: number) => (
                                    <li key={idx} className="flex gap-4 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500/40 mt-2 shrink-0 group-hover:bg-rose-500 group-hover:shadow-[0_0_8px_#f43f5e] transition-all" />
                                        <span className="text-sm text-slate-300 font-medium leading-relaxed">
                                            {item.replace(/❌|✅/g, '').trim()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Positives */}
                        <div className="glass-panel p-6 rounded-3xl border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-400 mb-6 uppercase tracking-[0.2em] border-b border-emerald-500/10 pb-3">
                                <CheckCircle2 className="w-4 h-4" /> Vantagens e Brechas
                            </h4>
                            <ul className="space-y-4">
                                {cmoSkill.findings.pontos_positivos_consolidados?.map((item: string, idx: number) => (
                                    <li key={idx} className="flex gap-4 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-2 shrink-0 group-hover:bg-emerald-500 group-hover:shadow-[0_0_8px_#10b981] transition-all" />
                                        <span className="text-sm text-slate-100 font-bold leading-relaxed">
                                            {item.replace(/❌|✅/g, '').trim()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Final Verdict / Pitch */}
                    {cmoSkill.findings.cmo_verdict && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/5 p-8 rounded-[2rem] relative group cursor-default"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-cyan/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Growth Pitch</span>
                                </div>
                                <blockquote className="text-white text-xl font-bold italic tracking-tight leading-relaxed">
                                    &ldquo;{cmoSkill.findings.cmo_verdict}&rdquo;
                                </blockquote>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};
