"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe, MapPin, Mail, Phone, Zap, Brain, TrendingUp, Target, Briefcase, ExternalLink, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LeadDetailsPage({ params }: { params: { id: string } }) {
    const [loading, setLoading] = useState(true);

    // Mock data for demonstration - in a real app, fetch from Supabase
    const lead = {
        id: params.id,
        company_name: "Acme Corporation",
        target_url: "acme.corp",
        industry: "Software & Technology",
        location: "São Paulo, SP - Brasil",
        email: "contato@acmecorp.com",
        phone: "+55 (11) 9999-9999",
        status: "analyzed",
        score: 88,
        ai_insights: [
            "A empresa possui um gap na comunicação de valor na página principal, oportunidade clara para nossa solução de copywriting.",
            "O funil de vendas não está otimizado para conversão mobile, o que representa perda de 40% do tráfego.",
            "O posicionamento no Google Maps está fraco (nota 4/10) com respostas lentas a reviews."
        ],
        opportunities: [
            "Upsell de Auditoria SEO Técnica",
            "Refatoração de UX Mobile",
            "Implementação de Chatbot de Atendimento"
        ]
    };

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [params.id]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-6">
            <header className="space-y-6">
                <Link href="/leads" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Voltar para Leads
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-purple-500/30">
                            <Building2 className="w-10 h-10 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
                                {lead.company_name}
                            </h1>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-purple-400 font-mono text-sm flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {lead.target_url}
                                </span>
                                <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    {lead.industry}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                            {lead.score}
                        </span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Grooway Score
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-1 liquid-glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02]"
                >
                    <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                        Informações
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                                <MapPin className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Localização</div>
                                <div className="text-sm text-slate-300 font-medium">{lead.location}</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                                <Mail className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">E-mail</div>
                                <div className="text-sm text-slate-300 font-medium">{lead.email}</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                                <Phone className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Telefone</div>
                                <div className="text-sm text-slate-300 font-medium">{lead.phone}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                        <button className="w-full py-3 rounded-xl bg-purple-600/20 text-purple-400 font-black uppercase tracking-widest text-xs hover:bg-purple-600/30 transition-colors border border-purple-500/20 flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4" />
                            Gerar Diagnóstico
                        </button>
                        <button className="w-full py-3 rounded-xl bg-white/5 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors border border-white/10">
                            Criar Proposta
                        </button>
                    </div>
                </motion.div>

                {/* AI Insights & Opportunities */}
                <div className="md:col-span-2 space-y-6">
                    {/* AI Insights */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="liquid-glass p-8 rounded-[32px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />

                        <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                            <Brain className="w-5 h-5 text-cyan-400" />
                            AI Insights & Inteligência
                        </h3>

                        <div className="space-y-4">
                            {lead.ai_insights.map((insight, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                    </div>
                                    <p className="text-slate-300 font-medium leading-relaxed text-sm">
                                        {insight}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Opportunities */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="liquid-glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02]"
                    >
                        <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                            <Target className="w-5 h-5 text-orange-400" />
                            Oportunidades Comerciais
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {lead.opportunities.map((opp, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-colors group">
                                    <TrendingUp className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
                                    <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{opp}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Background Glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
        </div>
    );
}
