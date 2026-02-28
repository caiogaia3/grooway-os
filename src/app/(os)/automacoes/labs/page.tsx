"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Bot,
    Webhook,
    CheckCircle2,
    Database,
    Search,
    ZoomIn,
    ZoomOut,
    History,
    Play,
    Brain,
    Languages,
    Mail,
    Clock
} from 'lucide-react';

const NODES = [
    { id: 'ai', label: 'AI AGENT', sub: 'Análise de Intenção', x: 340, y: 80, icon: Bot, color: '#A855F7', quote: '"Identificar se o cliente busca branding ou performance no briefing..."' },
    { id: 'webhook', label: 'WEBHOOK', sub: 'Trigger: Proposta Criada', x: 120, y: 280, icon: Webhook, color: '#22C55E', status: 'ATIVO' },
    { id: 'sucesso', label: 'SUCESSO', sub: 'Fluxo Finalizado', x: 420, y: 280, icon: CheckCircle2, color: '#06B6D4' },
    { id: 'crm', label: 'CRM ACTION', sub: 'Atualizar Lead', x: 320, y: 400, icon: Database, color: '#A855F7', pipe: 'Vendas 2024' },
];

const TOOLS = [
    {
        cat: 'Trigger & Entrada', items: [
            { name: 'WEBHOOK', desc: 'Gatilho via URL externa', icon: Webhook, color: 'text-emerald-400' },
            { name: 'AGENDAMENTO', desc: 'Execução recorrente', icon: Clock, color: 'text-cyan' },
        ]
    },
    {
        cat: 'Processamento IA', items: [
            { name: 'ANÁLISE GPT-4', desc: 'Lógica de conversação', icon: Brain, color: 'text-[#A855F7]' },
            { name: 'TRADUTOR IA', desc: 'Múltiplos idiomas', icon: Languages, color: 'text-[#A855F7]' },
        ]
    },
    {
        cat: 'Ações do Sistema', items: [
            { name: 'EMAIL / SMTP', desc: 'Disparo de mensagens', icon: Mail, color: 'text-cyan' },
        ]
    },
];

export default function LabsPage() {
    return (
        <div className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col h-[calc(100vh-64px)] -m-8">
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-black text-white tracking-tighter">LABS</h1>
                    <span className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                        V1.0 Alpha
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Sincronizado</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Canvas Area */}
                <div className="flex-1 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] overflow-auto">

                    {/* SVG Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        {/* AI Agent → Webhook */}
                        <motion.line x1="340" y1="160" x2="200" y2="280" stroke="#A855F7" strokeWidth="2" strokeOpacity="0.3"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
                        />
                        {/* AI Agent → Sucesso */}
                        <motion.line x1="440" y1="160" x2="480" y2="280" stroke="#06B6D4" strokeWidth="2" strokeOpacity="0.3"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.3 }}
                        />
                        {/* Webhook → CRM */}
                        <motion.line x1="200" y1="340" x2="380" y2="400" stroke="#22C55E" strokeWidth="2" strokeOpacity="0.3"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.6 }}
                        />
                        {/* Connection dots */}
                        {[[340, 160], [200, 280], [440, 160], [480, 280], [200, 340], [380, 400]].map(([cx, cy], i) => (
                            <circle key={i} cx={cx} cy={cy} r="4" fill="#22C55E" opacity="0.6" />
                        ))}
                    </svg>

                    {/* Node Cards */}
                    {NODES.map((node, i) => (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className="absolute z-10 w-56"
                            style={{ left: node.x, top: node.y }}
                        >
                            <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${node.color}20` }}>
                                        <node.icon className="w-4 h-4" style={{ color: node.color }} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{node.label}</p>
                                        <p className="text-[9px] text-slate-500">{node.sub}</p>
                                    </div>
                                </div>
                                {node.quote && (
                                    <p className="text-[10px] text-slate-400 italic mt-3 p-3 bg-white/[0.02] rounded-xl border border-white/5 leading-relaxed">
                                        {node.quote}
                                    </p>
                                )}
                                {node.status && (
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status</span>
                                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{node.status}</span>
                                    </div>
                                )}
                                {node.pipe && (
                                    <div className="mt-3 p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                                        <span className="text-[9px] text-slate-500">PIPE: </span>
                                        <span className="text-[9px] font-bold text-white">{node.pipe}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Bottom Toolbar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                        <div className="flex items-center gap-2 px-4 py-3 bg-[#0A0A0F] border border-white/10 rounded-2xl">
                            <button className="p-2 text-slate-500 hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                            <button className="p-2 text-slate-500 hover:text-white transition-colors"><ZoomOut className="w-4 h-4" /></button>
                            <span className="text-xs font-black text-slate-400 px-2">85%</span>
                            <button className="p-2 text-slate-500 hover:text-white transition-colors"><ZoomIn className="w-4 h-4" /></button>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-3 bg-[#0A0A0F] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors">
                            <History className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Histórico</span>
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-[#A855F7] rounded-2xl text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 transition-transform">
                            <Play className="w-4 h-4 fill-white" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Executar Workflow</span>
                        </button>
                    </div>
                </div>

                {/* Right Panel: Tools Library */}
                <div className="w-72 border-l border-white/5 bg-white/[0.01] backdrop-blur-xl overflow-y-auto p-6 shrink-0">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Biblioteca de Ferramentas</h3>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            placeholder="Procurar nodes..."
                            className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-[#A855F7]/30 transition-colors"
                        />
                    </div>

                    {TOOLS.map((group, gi) => (
                        <div key={gi} className="mb-6">
                            <p className="text-[9px] font-black text-[#A855F7] uppercase tracking-[0.2em] mb-3">{group.cat}</p>
                            <div className="space-y-2">
                                {group.items.map((tool, ti) => (
                                    <div key={ti} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-[#A855F7]/20 transition-all cursor-grab active:cursor-grabbing group">
                                        <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center">
                                            <tool.icon className={`w-4 h-4 ${tool.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">{tool.name}</p>
                                            <p className="text-[9px] text-slate-500">{tool.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Tip Card */}
                    <div className="mt-6 p-4 rounded-2xl bg-[#A855F7]/5 border border-[#A855F7]/10">
                        <p className="text-[9px] font-black text-[#A855F7] uppercase tracking-widest mb-2">💡 Dica do Labs</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Conecte nodes de IA para criar fluxos de decisão automatizados e ultra-precisos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
