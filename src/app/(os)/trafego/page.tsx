"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Crosshair,
    Search,
    Plus,
    TrendingUp,
    TrendingDown,
    DollarSign,
    MousePointerClick,
    Eye,
    ArrowRight,
} from 'lucide-react';

// Mock data — will be replaced by Supabase query
const MOCK_CLIENTS = [
    {
        id: '1',
        nome_fantasia: 'Clinica Sorriso',
        segmento: 'odontologia',
        status: 'active' as const,
        campanhas_ativas: 2,
        budget_mensal: 3000,
        impressoes: 45200,
        cliques: 1890,
        ctr: 4.18,
        leads: 34,
        cpl: 88.24,
        trend: 'up' as const,
    },
    {
        id: '2',
        nome_fantasia: 'Imob Prime',
        segmento: 'imobiliaria',
        status: 'active' as const,
        campanhas_ativas: 1,
        budget_mensal: 5000,
        impressoes: 78400,
        cliques: 2340,
        ctr: 2.98,
        leads: 18,
        cpl: 277.78,
        trend: 'down' as const,
    },
    {
        id: '3',
        nome_fantasia: 'Studio Fit',
        segmento: 'academia',
        status: 'draft' as const,
        campanhas_ativas: 0,
        budget_mensal: 1500,
        impressoes: 0,
        cliques: 0,
        ctr: 0,
        leads: 0,
        cpl: 0,
        trend: 'neutral' as const,
    },
];

type FilterTab = 'all' | 'active' | 'draft' | 'paused';

export default function TrafegoPage() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const tabs: { key: FilterTab; label: string }[] = [
        { key: 'all', label: 'Todos' },
        { key: 'active', label: 'Ativos' },
        { key: 'draft', label: 'Rascunho' },
        { key: 'paused', label: 'Pausados' },
    ];

    const filtered = MOCK_CLIENTS.filter((c) => {
        if (activeTab !== 'all' && c.status !== activeTab) return false;
        if (search && !c.nome_fantasia.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                        <Crosshair className="w-8 h-8 text-purple-400" />
                        Gestor de Trafego
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        Campanhas Google Ads dos seus clientes — modo copiloto.
                    </p>
                </div>
                <Link
                    href="/trafego/novo"
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                >
                    <Plus className="w-4 h-4" />
                    Nova Campanha
                </Link>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                                activeTab === tab.key
                                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Client Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((client, idx) => (
                    <motion.div
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                    >
                        <Link
                            href={`/trafego/${client.id}`}
                            className="block group cursor-pointer"
                        >
                            <div className="relative p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-300 space-y-5">
                                {/* Glow on hover */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                {/* Header */}
                                <div className="flex items-start justify-between relative">
                                    <div>
                                        <h3 className="text-lg font-black text-white tracking-tight group-hover:text-purple-100 transition-colors">
                                            {client.nome_fantasia}
                                        </h3>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {client.segmento}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            client.status === 'active'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                        }`}>
                                            {client.status === 'active' ? 'Ativo' : 'Rascunho'}
                                        </span>
                                    </div>
                                </div>

                                {/* KPI Grid */}
                                <div className="grid grid-cols-3 gap-3 relative">
                                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Eye className="w-3 h-3 text-slate-500" />
                                            <span className="text-[9px] font-bold text-slate-500 uppercase">Impr.</span>
                                        </div>
                                        <p className="text-sm font-black text-white">
                                            {client.impressoes > 0 ? `${(client.impressoes / 1000).toFixed(1)}k` : '-'}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <MousePointerClick className="w-3 h-3 text-slate-500" />
                                            <span className="text-[9px] font-bold text-slate-500 uppercase">CTR</span>
                                        </div>
                                        <p className="text-sm font-black text-white">
                                            {client.ctr > 0 ? `${client.ctr}%` : '-'}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <DollarSign className="w-3 h-3 text-slate-500" />
                                            <span className="text-[9px] font-bold text-slate-500 uppercase">CPL</span>
                                        </div>
                                        <p className="text-sm font-black text-white">
                                            {client.cpl > 0 ? `R$${client.cpl.toFixed(0)}` : '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between relative pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        {client.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                                        {client.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                                        <span className="text-xs font-bold text-slate-400">
                                            {client.campanhas_ativas} campanha{client.campanhas_ativas !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-purple-300 transition-colors">
                                        <span className="font-bold">R${client.budget_mensal.toLocaleString()}/m</span>
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="text-center py-20">
                    <Crosshair className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-lg">Nenhum cliente encontrado</p>
                    <p className="text-slate-500 text-sm mt-1">Ajuste os filtros ou adicione um novo cliente.</p>
                </div>
            )}
        </div>
    );
}
