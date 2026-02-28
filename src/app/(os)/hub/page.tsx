"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Target,
    Zap,
    TrendingUp,
    Database,
    Brain,
    ShieldCheck,
    ArrowUpRight,
    CircleDashed,
    Sparkles
} from 'lucide-react';

const STATUS_TOOLS = [
    { id: 'decoder', name: 'DECODER', utilization: 84, status: 'ATIVA', color: 'text-[#A855F7]', icon: Target },
    { id: 'compiler', name: 'COMPILER', utilization: 62, status: 'ATIVA', color: 'text-cyan', icon: Sparkles },
    { id: 'crawler', name: 'CRAWLER', utilization: 95, status: 'ATIVA', color: 'text-brand-purple', icon: Activity },
];

const METRICS = [
    { label: 'Taxa de Conversão Hub', value: '24.8%', change: '+3.2% ESTE MÊS', color: 'text-cyan' },
    { label: 'Volume de Dados Processados', value: '1.2M', change: 'RECORD BREAKING', color: 'text-[#A855F7]' },
    { label: 'ROI Estratégico Médio', value: '18X', change: 'AUDITORIA OK', color: 'text-white' },
];

const GAPS = [
    { label: 'Presença Digital', progress: 75, color: 'bg-[#A855F7]' },
    { label: 'Qualidade Leads', progress: 85, color: 'bg-cyan' },
    { label: 'Market Share', progress: 45, color: 'bg-white' },
];

export default function VisaoGeralPage() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
                        Visão Geral <span className="text-[#A855F7]">Executiva</span>
                    </h1>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mt-2">
                        HUB DE FERRAMENTAS ESTRATÉGICAS V2.0
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sistemas Estáveis</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Tools Monitor */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Monitoramento de Ferramentas</h2>

                    {STATUS_TOOLS.map((tool, i) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="liquid-card border-white/5 p-6 relative group hover:border-[#A855F7]/30 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                    <tool.icon className={`w-6 h-6 ${tool.color}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-white">{tool.name}</h3>
                                    <p className="text-[9px] font-bold text-slate-500">UTILIZAÇÃO: {tool.utilization}%</p>
                                </div>
                                <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400">ATIVA</span>
                            </div>
                        </motion.div>
                    ))}

                    <div className="liquid-card border-white/5 p-6 bg-white/[0.01]">
                        <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed text-center">
                            "A eficiência operacional subiu <span className="text-emerald-400 font-black">12%</span> nas últimas 24 horas devido à automação otimizada do Crawler."
                        </p>
                    </div>
                </div>

                {/* Right: Global Performance */}
                <div className="lg:col-span-8 liquid-card border-white/5 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 blur-[100px]" />

                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-2xl font-black text-white tracking-tight italic">RESUMO DE PERFORMANCE GLOBAL</h2>
                        <span className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-black text-slate-400 tracking-widest">LIVE DATA</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                        {METRICS.map((m, i) => (
                            <div key={i} className="space-y-2">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.label}</p>
                                <h3 className={`text-5xl font-black tracking-tighter ${m.color}`}>{m.value}</h3>
                                <p className="text-[9px] font-black text-emerald-400 flex items-center gap-1">
                                    {m.change.includes('RECORD') ? <Zap className="w-3 h-3 fill-emerald-400" /> : <TrendingUp className="w-3 h-3" />}
                                    {m.change}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                        {/* Gaps Identified */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                                GAPS IDENTIFICADOS
                            </h4>
                            <div className="space-y-4">
                                {GAPS.map((g, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            <span>{g.label}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${g.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${g.progress}%` }}
                                                transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Insight */}
                        <div className="liquid-card bg-white/[0.02] border-[#A855F7]/10 p-6">
                            <h4 className="text-[10px] font-black text-[#A855F7] uppercase tracking-[0.2em] mb-4">INSIGHT DE IA</h4>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Otimize o <span className="text-white font-bold">Compiler</span> para audiências B2B Tech. A tendência atual indica um aumento de 15% na taxa de resposta para propostas com foco em eficiência energética.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Brand */}
            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#A855F7] fill-[#A855F7]" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HUB CENTRALIZADO</span>
                </div>
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    VERSÃO DA ENGINE: <span className="text-slate-400">4.9.0-GOLD</span>
                </div>
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                    COPYRIGHT © 2024 PREMIUM AGENCY OS
                </div>
            </div>
        </div>
    );
}
