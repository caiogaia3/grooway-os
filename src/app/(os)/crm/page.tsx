"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Plus,
    Filter,
    Grid,
    List,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    UserPlus
} from 'lucide-react';

const CLIENTS = [
    { name: 'Vortex Ventures', segment: 'TECH', size: '50-100 FUNC.', health: 3, kpi: 92, deadline: true, status: 'ATIVO', color: 'text-emerald-400' },
    { name: 'Nova Retail', segment: 'VAREJO', size: '500+ FUNC.', health: 2, kpi: 73, deadline: 'warning', status: 'ATIVO', color: 'text-amber-400' },
    { name: 'Eco Lume', segment: 'ENERGIA', size: '10-50 FUNC.', health: 1, kpi: 45, deadline: 'error', status: 'ATENÇÃO', color: 'text-rose-400' },
    { name: 'Sky Analytics', segment: 'SAAS', size: '100-200 FUNC.', health: 3, kpi: 98, deadline: true, status: 'ATIVO', color: 'text-emerald-400' },
    { name: 'Prime Food', segment: 'GASTRO', size: '20-50 FUNC.', health: 1, kpi: 0, deadline: 'pending', status: 'PENDENTE', color: 'text-slate-500' },
];

export default function GestaoClientesPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter leading-none grayscale-[0.5]">
                        Gestão de <span className="text-white">Clientes</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 italic">
                        DASHBOARD / <span className="text-[#A855F7]">CLIENTES</span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input
                            placeholder="Buscar cliente..."
                            className="bg-white/[0.02] border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-sm text-slate-400 w-80 focus:outline-none focus:border-[#A855F7]/30 transition-all font-medium"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#A855F7] text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform">
                        <UserPlus className="w-4 h-4" /> Novo Cliente
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3 bg-white/[0.02] p-1.5 rounded-2xl w-fit border border-white/5">
                <button className="px-6 py-2 rounded-xl bg-white/5 text-[9px] font-black text-white uppercase tracking-widest">Grid</button>
                <button className="px-6 py-2 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Ativos (38)</button>
                <button className="px-6 py-2 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Pausados (4)</button>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {CLIENTS.map((client, i) => (
                    <a href={`/crm/clientes/vortex`} key={i}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="liquid-card border-white/5 p-8 flex flex-col justify-between group hover:border-[#A855F7]/30 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest text-[#A855F7] bg-[#A855F7]/10 px-2 py-1 rounded border border-[#A855F7]/20">
                                {client.status}
                            </div>

                            <div>
                                <div className="w-16 h-16 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6">
                                    <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">🏢</span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">{client.name}</h3>
                                <div className="flex gap-2">
                                    <span className="text-[8px] font-black text-slate-500 border border-white/10 px-2 py-1 rounded uppercase tracking-widest">SEGMENTO: {client.segment}</span>
                                    <span className="text-[8px] font-black text-slate-500 border border-white/10 px-2 py-1 rounded uppercase tracking-widest">{client.size}</span>
                                </div>
                            </div>

                            <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
                                <div className="space-y-1 text-center">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Saúde</p>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3].map(dot => (
                                            <div key={dot} className={`w-1.5 h-1.5 rounded-full ${dot <= client.health ? (client.health === 3 ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'bg-amber-400') : 'bg-white/5'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">KPI</p>
                                    <p className={`text-sm font-black ${client.color}`}>{client.kpi}%</p>
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Prazos</p>
                                    {client.deadline === true ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> :
                                        client.deadline === 'warning' ? <Clock className="w-4 h-4 text-amber-400 mx-auto" /> :
                                            client.deadline === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400 mx-auto" /> :
                                                <div className="w-4 h-4 text-slate-700 mx-auto">?</div>}
                                </div>
                            </div>
                        </motion.div>
                    </a>
                ))}

                {/* Add Client Card */}
                <div className="liquid-card border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#A855F7]/30 hover:bg-[#A855F7]/[0.02] transition-all group min-h-[300px]">
                    <div className="w-14 h-14 rounded-[20px] bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6 group-hover:border-[#A855F7]/20 transition-colors">
                        <Plus className="w-6 h-6 text-slate-600 group-hover:text-[#A855F7] transition-colors" />
                    </div>
                    <p className="text-base font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Adicionar Cliente</p>
                </div>
            </div>
        </div>
    );
}
