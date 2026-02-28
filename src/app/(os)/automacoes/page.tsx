"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Send,
    Eye,
    CheckCircle2,
    Clock,
    MoreVertical,
    Plus,
    Settings2,
    Users,
    MessageSquare,
    DollarSign
} from 'lucide-react';

const PROPOSALS = [
    { client: 'Nexus Tech', project: 'Branding & Web', time: 'Há 2 horas', status: 'VISUALIZADA', color: 'bg-cyan/10 text-cyan border-cyan/20' },
    { client: 'Zeta E-com', project: 'Mídia Paga', time: 'Há 5 horas', status: 'ACEITA', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { client: 'VanguardImob', project: 'Inbound Marketing', time: 'Há 1 dia', status: 'PENDENTE', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
];

const AUTOMATIONS = [
    {
        name: 'Onboarding de Cliente',
        desc: 'Sequência automática de boas-vindas via WhatsApp e e-mail após assinatura.',
        executions: 324,
        active: true,
        icon: Users,
        color: 'text-[#A855F7]'
    },
    {
        name: 'Follow-up de Vendas',
        desc: 'Lembretes automáticos para leads que visualizaram a proposta mas não aceitaram.',
        executions: 1102,
        active: true,
        icon: MessageSquare,
        color: 'text-cyan'
    },
    {
        name: 'Cobrança Recorrente',
        desc: 'Disparo de boletos e notas fiscais 5 dias antes do vencimento do serviço.',
        executions: 0,
        active: false,
        icon: DollarSign,
        color: 'text-slate-500'
    },
];

export default function AutomacoesPage() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
                    Central de <span className="text-[#A855F7]">Automações</span>
                </h1>
                <p className="text-slate-400 text-sm font-medium mt-2">
                    Gerencie e monitore seus workflows inteligentes em tempo real.
                </p>
            </div>

            {/* Top Grid: Disparos + Propostas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Disparos Ativos */}
                <div className="liquid-card border-white/5 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Send className="w-5 h-5 text-[#A855F7]" />
                            <h3 className="text-lg font-black text-white">Disparos Ativos</h3>
                        </div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mês Corrente</span>
                    </div>

                    <div className="flex items-center justify-around gap-8">
                        {/* WhatsApp Ring */}
                        <div className="text-center">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                                    <motion.circle
                                        cx="60" cy="60" r="50" fill="none"
                                        stroke="#22C55E" strokeWidth="10" strokeLinecap="round"
                                        strokeDasharray={314}
                                        initial={{ strokeDashoffset: 314 }}
                                        animate={{ strokeDashoffset: 314 * 0.28 }}
                                        transition={{ duration: 2 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-white">72%</span>
                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">WhatsApp</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold mt-3">8.420 / 12.000 MSG</p>
                        </div>

                        {/* Email Ring */}
                        <div className="text-center">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                                    <motion.circle
                                        cx="60" cy="60" r="50" fill="none"
                                        stroke="#06B6D4" strokeWidth="10" strokeLinecap="round"
                                        strokeDasharray={314}
                                        initial={{ strokeDashoffset: 314 }}
                                        animate={{ strokeDashoffset: 314 * 0.55 }}
                                        transition={{ duration: 2, delay: 0.3 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-white">45%</span>
                                    <span className="text-[8px] font-black text-cyan uppercase tracking-widest">E-mail</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold mt-3">22.500 / 50.000 MSG</p>
                        </div>
                    </div>
                </div>

                {/* Gerenciador de Propostas */}
                <div className="liquid-card border-white/5 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Eye className="w-5 h-5 text-cyan" />
                            <h3 className="text-lg font-black text-white">Gerenciador de Propostas</h3>
                        </div>
                        <button className="px-4 py-1.5 rounded-full border border-[#A855F7]/30 text-[9px] font-black text-[#A855F7] uppercase tracking-widest hover:bg-[#A855F7]/10 transition-colors">
                            Ver Todas
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="pb-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Cliente / Projeto</th>
                                    <th className="pb-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Enviado</th>
                                    <th className="pb-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="pb-3 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {PROPOSALS.map((p, i) => (
                                    <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="py-4">
                                            <p className="text-sm font-bold text-white">{p.client}</p>
                                            <p className="text-[10px] text-slate-500">{p.project}</p>
                                        </td>
                                        <td className="py-4 text-xs text-slate-400 font-medium">{p.time}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${p.color}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <button className="text-slate-600 hover:text-white transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Automation Library */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-white">Biblioteca de Automações</h3>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A855F7] text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-transform">
                        <Plus className="w-4 h-4" /> Nova Automação
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {AUTOMATIONS.map((auto, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="liquid-card border-white/5 p-6 flex flex-col justify-between group hover:border-[#A855F7]/20 transition-colors"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center ${auto.color}`}>
                                        <auto.icon className="w-5 h-5" />
                                    </div>
                                    <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${auto.active ? 'bg-emerald-500/20 justify-end' : 'bg-white/5 justify-start'}`}>
                                        <div className={`w-4 h-4 rounded-full ${auto.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                    </div>
                                </div>
                                <p className="text-[8px] font-black uppercase tracking-widest mb-1 ${auto.active ? 'text-emerald-400' : 'text-slate-600'}">
                                    {auto.active ? 'ATIVA' : 'INATIVA'}
                                </p>
                                <h4 className="text-base font-black text-white mb-2">{auto.name}</h4>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">{auto.desc}</p>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    {auto.executions.toLocaleString('pt-BR')} Execuções
                                </span>
                                <button className="text-slate-600 hover:text-[#A855F7] transition-colors">
                                    <Settings2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Create New Card */}
                    <div className="liquid-card border-dashed border-white/10 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#A855F7]/30 hover:bg-[#A855F7]/[0.02] transition-all group min-h-[240px]">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4 group-hover:border-[#A855F7]/20 transition-colors">
                            <Plus className="w-6 h-6 text-slate-600 group-hover:text-[#A855F7] transition-colors" />
                        </div>
                        <p className="text-sm font-black text-slate-500 uppercase tracking-wider group-hover:text-white transition-colors">Criar</p>
                        <p className="text-sm font-black text-slate-500 uppercase tracking-wider group-hover:text-white transition-colors">Workflow</p>
                    </div>
                </div>
            </div>

            {/* Status Footer */}
            <div className="liquid-card border-white/5 p-5 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Status da IA</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Sistemas operando em 100% de eficiência.</p>
            </div>
        </div>
    );
}
