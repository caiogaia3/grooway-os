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
    Sparkles,
    MousePointer2
} from 'lucide-react';

const HUB_TOOLS = [
    {
        id: 'decoder',
        name: 'DECODER',
        desc: 'Diagnóstico Estratégico completo da empresa no ambiente digital com análise de gaps.',
        metric: 'PERFORMANCE',
        color: 'border-[#A855F7]/30 text-[#A855F7] shadow-[#A855F7]/10',
        icon: Target,
        href: '/auditor'
    },
    {
        id: 'compiler',
        name: 'COMPILER',
        desc: 'Gerador de Propostas de valor irresistíveis baseadas em análise comportamental de mercado.',
        metric: 'CONVERSÃO',
        color: 'border-cyan/30 text-cyan shadow-cyan/10',
        icon: Sparkles,
        href: '/proposals/new'
    },
    {
        id: 'crawler',
        name: 'CRAWLER',
        desc: 'Automação inteligente para scrape de leads B2B com enriquecimento de dados em tempo real.',
        metric: 'VOLUME',
        color: 'border-brand-purple/30 text-brand-purple shadow-brand-purple/10',
        icon: Activity,
        href: '/scraper'
    },
];

export default function HubFerramentasPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
                        HUB de <span className="text-[#A855F7]">Ferramentas</span>
                    </h1>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mt-2">
                        AGENCY MANAGEMENT OS V2.0
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">NODOS ATIVOS: 03</span>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                {HUB_TOOLS.map((tool, i) => (
                    <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className={`liquid-card ${tool.color.split(' ')[0]} border p-10 flex flex-col justify-between group relative overflow-hidden`}
                    >
                        {/* Glow Background */}
                        <div className={`absolute -top-20 -right-20 w-48 h-48 bg-white/5 opacity-0 group-hover:opacity-100 blur-[80px] transition-opacity duration-500`} />

                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-16 h-16 rounded-[24px] bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-2xl`}>
                                    <tool.icon className={`w-8 h-8 ${tool.color.split(' ')[1]}`} />
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">ATIVA</span>
                                </div>
                            </div>

                            <h3 className="text-[2.2rem] font-black text-white tracking-widest mb-6 italic">{tool.name}</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed italic mb-8">
                                {tool.desc}
                            </p>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{tool.metric}</p>
                                    <div className="flex gap-0.5 items-end h-6">
                                        {[4, 7, 5, 9, 6, 8].map((h, j) => (
                                            <div key={j} className={`w-1 rounded-t-sm ${tool.color.split(' ')[1].replace('text-', 'bg-')}`} style={{ height: `${h * 10}%`, opacity: 0.3 + (j * 0.1) }} />
                                        ))}
                                    </div>
                                </div>
                                <a
                                    href={tool.href}
                                    className="px-8 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/[0.08] hover:border-white/10 transition-all active:scale-95"
                                >
                                    Acessar
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer Brand */}
            <div className="flex items-center justify-between pt-12 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-600">
                    <Zap className="w-4 h-4 fill-slate-800" />
                    <span className="text-[10px] font-black uppercase tracking-widest">HUB CENTRALIZADO</span>
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
