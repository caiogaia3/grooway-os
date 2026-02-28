"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Plus,
    MoreVertical,
    Users,
    Activity,
    CheckCircle2,
    Clock,
    Eye,
    TrendingUp,
    Zap,
    Bell
} from 'lucide-react';

const STAGES = [
    { name: 'Qualificação', count: 4 },
    { name: 'Negociação', count: 2 },
    { name: 'Proposta Enviada', count: 3 },
];

const OPPORTUNITIES = [
    {
        client: 'Nexus Tech Solutions',
        desc: 'Redesign de Identidade Visual & Branding',
        stage: 'Qualificação',
        value: 'R$ 15.400',
        tag: 'INBOUND LEAD',
        tagColor: 'bg-purple-500/10 text-[#A855F7] border-purple-500/20',
        meta: 'TICKET MÉDIO'
    },
    {
        client: 'EcoWorld Global',
        desc: 'Gestão de Performance Social Ads',
        stage: 'Qualificação',
        value: 'R$ 8.900',
        tag: 'INDICAÇÃO',
        tagColor: 'bg-cyan/10 text-cyan border-cyan/20',
        meta: 'MENSAL'
    },
    {
        client: 'Vanguarda Co.',
        desc: 'Landing Page High-Performance Q4',
        stage: 'Negociação',
        value: 'R$ 22.000',
        tag: 'HOT LEAD',
        tagColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        meta: 'BUDGET APROXIMADO',
        priority: true
    },
];

export default function PipelinePage() {
    return (
        <div className="space-y-10 animate-in fade-in duration-700 h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter leading-none italic uppercase underline decoration-[#A855F7]/30 decoration-8 underline-offset-8">
                        Pipeline <span className="text-[#A855F7] not-italic">Comercial</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-6">
                        Q3 PERFORMANCE AGENCY
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input placeholder="Buscar oportunidades..." className="bg-white/[0.02] border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-sm text-slate-400 w-80 focus:outline-none focus:border-[#A855F7]/30" />
                    </div>
                    <button className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#020204]" />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#A855F7] to-cyan text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-transform">
                        <Plus className="w-4 h-4" /> Novo Negócio
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex flex-1 gap-8 overflow-x-auto no-scrollbar pb-6">
                {STAGES.map((stage, i) => (
                    <div key={i} className="flex flex-col gap-6 min-w-[380px] flex-1">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <h3 className="text-base font-black text-white italic">{stage.name}</h3>
                                <span className="text-[10px] font-black bg-white/5 text-slate-400 px-2 py-0.5 rounded-md border border-white/10">{stage.count.toString().padStart(2, '0')}</span>
                            </div>
                            <MoreVertical className="w-4 h-4 text-slate-700 cursor-pointer hover:text-white transition-colors" />
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-2">
                            {OPPORTUNITIES.filter(opt => opt.stage === stage.name).map((opt, j) => (
                                <motion.div
                                    key={j}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: j * 0.1 }}
                                    className="liquid-card border-white/5 p-6 space-y-6 group hover:border-[#A855F7]/30 transition-all cursor-grab active:cursor-grabbing"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${opt.tagColor}`}>
                                            {opt.tag}
                                        </div>
                                        {opt.priority && (
                                            <div className="px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                PRIORIDADE
                                            </div>
                                        )}
                                        <Eye className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
                                    </div>

                                    <div>
                                        <h4 className="text-base font-black text-white tracking-tight mb-1">{opt.client}</h4>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{opt.desc}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full border-2 border-[#0A0A0F] bg-slate-800 flex items-center justify-center text-[10px] text-white">👤</div>
                                            <div className="w-8 h-8 rounded-full border-2 border-[#0A0A0F] bg-white/5 flex items-center justify-center text-[8px] text-slate-500">+1</div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-cyan tracking-tighter">{opt.value}</p>
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{opt.meta}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Kanban Footer Stats */}
            <div className="flex items-center justify-between pt-6 border-t border-white/5 px-4 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">STATUS: SISTEMA OPERACIONAL</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-[#A855F7] fill-[#A855F7]" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">PIPELINE SINCRONIZADO: V4.2.0</span>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">TAXA DE CONVERSÃO:</span>
                        <span className="text-[11px] font-black text-white tracking-widest underline decoration-[#A855F7] decoration-2 underline-offset-4">24.5%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">VALOR EM PIPELINE:</span>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-slate-600 mr-2 uppercase">R$</span>
                            <span className="text-xl font-black text-cyan tracking-tighter italic shadow-cyan/20 drop-shadow-lg">1.248.000,00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
