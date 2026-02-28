"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, ExternalLink, Eye, Clock,
    ChevronRight, CreditCard, ShieldCheck, TrendingUp, Zap, Filter
} from 'lucide-react';
import { supabase } from '@/core/lib/supabase';

export default function LeadsDashboard() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchLeads() {
            try {
                const { data, error } = await supabase
                    .from('leads')
                    .select(`
                        id, 
                        company_name, 
                        target_url, 
                        status, 
                        created_at,
                        diagnostics (id, final_score, view_count, last_opened_at),
                        proposals (id, status, view_count, last_opened_at)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setLeads(data);
            } catch (err) {
                console.error('[Leads] Error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchLeads();
    }, []);

    const filteredLeads = leads.filter(lead =>
        lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.target_url?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Total de Leads', value: leads.length, icon: Users, color: 'from-blue-500 to-indigo-600' },
        { label: 'Analisados', value: leads.filter(l => l.status === 'analyzed').length, icon: ShieldCheck, color: 'from-emerald-500 to-teal-600' },
        { label: 'Propostas Ativas', value: leads.reduce((acc, l) => acc + (l.proposals?.length || 0), 0), icon: CreditCard, color: 'from-purple-500 to-pink-600' },
        { label: 'Engajamento', value: '72%', icon: TrendingUp, color: 'from-orange-500 to-red-600' },
    ];

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-6">
            {/* Header section with Stats */}
            <div className="space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-4"
                        >
                            <Zap className="w-3 h-3" />
                            Intelligence Pipeline
                        </motion.div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                            PIPELINE DE <span className="text-purple-400">INTELIGÊNCIA</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Controle central de leads, diagnósticos e engajamento comercial.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar empresa ou URL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:border-purple-500/50 transition-all w-64 md:w-96 backdrop-blur-xl"
                            />
                        </div>
                    </div>
                </header>

                {/* Grid Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="liquid-glass p-6 rounded-[28px] border border-white/5 bg-white/[0.02] relative overflow-hidden group"
                        >
                            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-black/20`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                            </div>
                            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Table section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="liquid-glass rounded-[32px] border border-white/5 bg-white/[0.01] overflow-hidden backdrop-blur-3xl shadow-2xl"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Lead / Empresa</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Score</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Métricas</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Operações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredLeads.map((lead, idx) => {
                                    const diag = lead.diagnostics?.[0];
                                    const proposal = lead.proposals?.[0];

                                    return (
                                        <motion.tr
                                            key={lead.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-white/[0.02] transition-colors relative"
                                        >
                                            <td className="px-8 py-6">
                                                <Link href={`/leads/${lead.id}`} className="block">
                                                    <div className="font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight text-lg">{lead.company_name || 'Empresa S/N'}</div>
                                                    <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                                                        <Zap className="w-3 h-3 text-purple-500/50" />
                                                        {lead.target_url}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${lead.status === 'analyzed'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                    <div className={`w-1 h-1 rounded-full ${lead.status === 'analyzed' ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`} />
                                                    {lead.status === 'analyzed' ? 'CONCLUÍDO' : 'PENDENTE'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {diag ? (
                                                    <div className={`text-xl font-black ${diag.final_score >= 70 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                                        {diag.final_score}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-700 font-black">---</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                            <Eye className="w-3.5 h-3.5" /> {diag?.view_count || 0}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400">
                                                            <CreditCard className="w-3.5 h-3.5" /> {proposal?.view_count || 0}
                                                        </div>
                                                    </div>
                                                    {diag?.last_opened_at && (
                                                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-600">
                                                            <Clock className="w-2.5 h-2.5" /> LIDO: {new Date(diag.last_opened_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    {diag && (
                                                        <a
                                                            href={`/report/${diag.id}`}
                                                            target="_blank"
                                                            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all group/btn shadow-inner"
                                                            title="Ver Relatório"
                                                        >
                                                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover/btn:text-white transition-colors" />
                                                        </a>
                                                    )}
                                                    {proposal && (
                                                        <a
                                                            href={`/proposal/${proposal.id}`}
                                                            target="_blank"
                                                            className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all group/btn shadow-inner"
                                                            title="Ver Proposta"
                                                        >
                                                            <ChevronRight className="w-4 h-4 text-purple-400 group-hover/btn:text-white transition-colors" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                {filteredLeads.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <Users className="w-12 h-12 text-slate-800 mx-auto" />
                        <h3 className="text-slate-600 font-bold uppercase tracking-widest text-sm">Nenhum lead encontrado</h3>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
