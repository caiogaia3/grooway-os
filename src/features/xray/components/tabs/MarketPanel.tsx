"use client";
import React from 'react';
import { Search, Shield, Users, ArrowRight, Target, Building2, AlertTriangle, Lightbulb, Compass, UserCircle, Briefcase, Zap, Heart, SearchCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface MarketPanelProps {
    marketSkill: {
        score: number;
        findings: {
            executive_summary_clevel?: string;
            niche: string;
            target_icp: string;
            market_verdict?: string;

            // New structure
            company_profile?: {
                dreams: string[];
                acquisition_pains: string[];
                sales_objections: string[];
            };
            icp_psychography?: {
                dreams: string[];
                deep_pains: string[];
                buying_objections: string[];
            };

            // Legacy/Flattened fallback (kept for compatibility during transition)
            sonhos_icp?: string[];
            dores_icp?: string[];
            objecoes_icp?: string[];
            sonhos_empresa?: string[];
            dores_empresa_marketing?: string[];
        };
    };
}

export const MarketPanel = ({ marketSkill }: MarketPanelProps) => {
    if (!marketSkill) return null;

    const { findings } = marketSkill;

    const PainsMirror = ({ title, icon: Icon, dreams, pains, objections, variant = 'blue' }: {
        title: string,
        icon: any,
        dreams: string[],
        pains: string[],
        objections: string[],
        variant?: 'blue' | 'purple'
    }) => (
        <div className="space-y-6">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 flex items-center gap-2 ${variant === 'blue' ? 'text-blue-400' : 'text-purple-400'}`}>
                <Icon className="w-3.5 h-3.5" /> {title}
            </h4>

            <div className="grid grid-cols-1 gap-4">
                {/* Dreams */}
                <div className={`glass-panel p-5 rounded-3xl border-${variant}-500/10`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Heart className={`w-3.5 h-3.5 text-${variant}-400`} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sonhos & Metas</span>
                    </div>
                    <ul className="space-y-2.5">
                        {dreams.map((item, i) => (
                            <li key={i} className="flex gap-3 text-xs text-slate-300 font-medium items-start">
                                <div className={`w-1.5 h-1.5 rounded-full bg-${variant}-500 mt-1.5 shrink-0`} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pains */}
                <div className="glass-panel p-5 rounded-3xl border-rose-500/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dores Viscerais</span>
                    </div>
                    <ul className="space-y-2.5">
                        {pains.map((item, i) => (
                            <li key={i} className="flex gap-3 text-xs text-slate-300 font-medium items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Objections */}
                <div className="glass-panel p-5 rounded-3xl border-orange-500/10">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Objeções de Ferro</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {objections.map((item, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-xl bg-orange-500/5 border border-orange-500/10 text-[10px] text-slate-300 font-bold uppercase tracking-tight">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter">
                        <Compass className="w-6 h-6 text-blue-400" />
                        Radar de Inteligência Psicográfica
                    </h3>
                    <p className="text-base font-medium text-slate-400 mt-1">
                        Espelhamento de mercado: Análise interna da empresa vs. Perfil do cliente ideal.
                    </p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                    Mirror Intelligence Active
                </div>
            </div>

            {/* Strategic Summary */}
            <div className="liquid-card border-[#A855F7]/10 p-8 relative overflow-hidden group bg-[#A855F7]/[0.02]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-4">
                        <h4 className="text-[10px] font-black text-[#A855F7] uppercase tracking-[0.2em] flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Tese Estratégica (C-Level)
                        </h4>
                        <p className="text-xl text-white font-bold leading-relaxed italic tracking-tight">
                            &ldquo;{findings.executive_summary_clevel || "Análise de mercado indisponível."}&rdquo;
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 w-full md:w-72">
                        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nicho Alvo</span>
                            <p className="text-sm text-white font-bold">{findings.niche}</p>
                        </div>
                        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Perfil Psicológico</span>
                            <p className="text-sm text-white font-bold">{findings.target_icp}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Mirror Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Side A: The Company */}
                <PainsMirror
                    title="LADO A: A Empresa Pesquisada"
                    icon={Briefcase}
                    dreams={findings.company_profile?.dreams || findings.sonhos_empresa || []}
                    pains={findings.company_profile?.acquisition_pains || findings.dores_empresa_marketing || []}
                    objections={findings.company_profile?.sales_objections || []}
                    variant="purple"
                />

                {/* Side B: The ICP */}
                <PainsMirror
                    title="LADO B: O Cliente Final (ICP)"
                    icon={UserCircle}
                    dreams={findings.icp_psychography?.dreams || findings.sonhos_icp || []}
                    pains={findings.icp_psychography?.deep_pains || findings.dores_icp || []}
                    objections={findings.icp_psychography?.buying_objections || findings.objecoes_icp || []}
                    variant="blue"
                />
            </div>

            {/* Tactical Closing */}
            {findings.market_verdict && (
                <div className="glass-panel p-6 rounded-[2rem] border-emerald-500/10 bg-emerald-500/[0.01]">
                    <h4 className="text-[10px] font-black text-emerald-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                        <SearchCheck className="w-4 h-4" /> Veredito do Espião
                    </h4>
                    <p className="text-base text-slate-300 leading-relaxed font-bold italic">
                        {findings.market_verdict}
                    </p>
                </div>
            )}
        </div>
    );
};
