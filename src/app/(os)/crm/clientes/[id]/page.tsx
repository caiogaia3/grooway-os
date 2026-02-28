"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Edit3,
    Plus,
    Mail,
    Phone,
    Globe,
    FileText,
    Download,
    History,
    Calendar,
    MessageSquare,
    CheckCircle2,
    ExternalLink
} from 'lucide-react';

const TASKS = [
    { title: 'Apresentação de Resultados Q4', desc: 'Reunião estratégica via Google Meet', time: 'Amanhã, 14:00', priority: 'ALTA', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { title: 'Renovação de Licenças Cloud', desc: 'Validar termos do novo contrato', time: '18 Jan, 09:00', priority: 'NORMAL', color: 'bg-white/5 text-slate-400 border-white/10' },
];

const ACTIVITY = [
    { type: 'CALL', title: 'Chamada de Follow-up Realizada', desc: 'Discussão sobre o novo módulo de analytics. Cliente demonstrou alto interesse na integração.', user: 'Hussien Silva', time: 'HOJE, 10:30', icon: Phone, color: 'text-[#A855F7] bg-[#A855F7]/10' },
    { type: 'EMAIL', title: 'E-mail de Proposta Enviado', desc: 'Envio dos termos atualizados para expansão de assentos na plataforma Nexus. [Anexo: Proposta_v3_Expansão.pdf]', user: 'Sistema', time: 'ONTEM, 16:45', icon: Mail, color: 'text-cyan bg-cyan/10' },
];

export default function ClientDetailPage() {
    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <a href="/crm" className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter leading-none italic uppercase decoration-[#A855F7]/30 underline decoration-4 underline-offset-4 mb-2">Visão Detalhada <span className="text-white not-italic lowercase decoration-0">do</span> Cliente</h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.05] transition-all">
                        <Edit3 className="w-4 h-4" /> Editar Perfil
                    </button>
                    <button className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#A855F7] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#A855F7]/20 hover:scale-105 active:scale-95 transition-transform font-['Plus_Jakarta_Sans']">
                        <Plus className="w-4 h-4" /> Nova Ação
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Info Card */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Hero Card */}
                    <div className="liquid-card border-white/5 p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan/5 blur-[100px] pointer-events-none" />
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex gap-8">
                                <div className="w-32 h-32 rounded-[40px] border-2 border-[#A855F7]/30 p-1.5 shadow-2xl shadow-black/40 rotate-3 group-hover:rotate-0 transition-all duration-500">
                                    <div className="w-full h-full rounded-[30px] bg-slate-800 flex items-center justify-center text-5xl">🏢</div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-5xl font-black text-white tracking-tighter italic">Nexus Tech <span className="text-cyan">Solutions</span></h2>
                                        <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400">ATIVO</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 italic">Empresa de Tecnologia • São Paulo, SP</p>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">VALOR DO CONTRATO</p>
                                            <p className="text-xl font-black text-cyan tracking-tighter italic">R$ 15.400 <span className="text-xs text-slate-500 font-bold not-italic">/mês</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">DESDE</p>
                                            <p className="text-xl font-black text-white tracking-tighter italic">Out 2023</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 leading-none">SCORE DE SAÚDE</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="w-[85%] h-full bg-[#A855F7]" />
                                    </div>
                                    <span className="text-2xl font-black text-white italic tracking-tighter">85%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section: Info + Activity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <div className="liquid-card border-white/5 p-8 space-y-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                                INFORMAÇÕES DO CONTATO
                            </h3>

                            <div className="flex items-center gap-4 group cursor-pointer p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-cyan/10 flex items-center justify-center text-xl">👤</div>
                                <div>
                                    <p className="text-base font-black text-white leading-none mb-1">Lucas Oliveira</p>
                                    <p className="text-[9px] font-black text-cyan uppercase tracking-widest">Diretor de Operações</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { icon: Mail, value: 'lucas@nexustech.com' },
                                    { icon: Phone, value: '+55 (11) 98877-6655' },
                                    { icon: Globe, value: 'www.nexustech.com' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-[#A855F7]/30 transition-all">
                                        <item.icon className="w-4 h-4 text-slate-500 group-hover:text-[#A855F7] transition-colors" />
                                        <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="liquid-card border-white/5 p-8 flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <History className="w-4 h-4 text-[#A855F7]" />
                                    HISTÓRICO DE ATIVIDADES
                                </h3>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 rounded bg-white/5 text-[8px] font-black text-white hover:bg-white/10 transition-colors uppercase tracking-widest">Todos</button>
                                </div>
                            </div>

                            <div className="space-y-8 flex-1">
                                {ACTIVITY.map((act, i) => (
                                    <div key={i} className="relative pl-8 group">
                                        {i !== ACTIVITY.length - 1 && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-white/5" />}
                                        <div className={`absolute left-0 top-0 w-8 h-8 rounded-xl ${act.color} flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform`}>
                                            <act.icon className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-black text-white tracking-tight italic">{act.title}</p>
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{act.time}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">{act.desc}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px]">👤</div>
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest uppercase italic">{act.user}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Area: Tasks + Documents */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Tasks */}
                    <div className="liquid-card border-white/5 p-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 italic underline decoration-[#A855F7] decoration-2 underline-offset-4">
                                PRÓXIMAS TAREFAS
                            </h3>
                            <span className="text-[9px] font-black text-[#A855F7] bg-[#A855F7]/10 px-2 py-1 rounded">03 Agendadas</span>
                        </div>

                        <div className="space-y-4">
                            {TASKS.map((task, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:bg-white/[0.04] transition-all group">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${task.color}`}>{task.priority}</span>
                                        <span className="text-[9px] font-black text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.time}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-white mb-1 group-hover:text-[#A855F7] transition-colors uppercase tracking-tight italic underline decoration-transparent group-hover:decoration-[#A855F7]/30 decoration-2 underline-offset-4 transition-all">{task.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-medium italic">{task.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="liquid-card border-white/5 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                DOCUMENTOS
                            </h3>
                            <button className="text-slate-600 hover:text-white transition-colors transition-transform active:rotate-180 duration-500"><Plus className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 group cursor-pointer hover:border-cyan/30 transition-all shadow-inner">
                                <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center italic font-black text-cyan text-xs">PDF</div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[11px] font-black text-white truncate italic tracking-tighter">Contrato_Social_Nexus_2024.pdf</p>
                                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">2.1 MB • 12/01/2024</p>
                                </div>
                                <Download className="w-4 h-4 text-slate-700 group-hover:text-cyan transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
