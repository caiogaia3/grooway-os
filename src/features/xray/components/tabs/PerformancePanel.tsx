"use client";
import React, { useState } from 'react';
import { Smartphone, Activity, FileText, AlertTriangle, Search, MousePointer2, Gauge, ChevronDown, ChevronUp, Info, Target, Zap } from 'lucide-react';
import { SEOData } from '@/core/types/diagnostic';
import { MetricCard } from '../MetricCard';
import { motion, AnimatePresence } from 'framer-motion';

interface ClinicalPoint {
    strength: string;
    weakness: string;
    improvement: {
        why: string;
        for_what: string;
        how: string;
    };
}

interface PerformancePanelProps {
    performanceSkill: {
        score: number;
        load_time_seconds?: number;
        findings: SEOData & {
            is_mobile_responsive_ui: boolean;
            has_h1: boolean;
            has_meta_desc: boolean;
            images_without_alt: number;
            has_contact_form: boolean;
            has_blog: boolean;
            cta_buttons_count: number;
            cta_examples?: string[];
            ui_clinical_analysis?: string;
            blog_exploration_sample?: string;
            clinical_audit?: {
                responsiveness: ClinicalPoint;
                performance: ClinicalPoint;
                seo_authority: ClinicalPoint;
                conversion_funnel: ClinicalPoint;
            };
        };
        critical_pains?: string[];
    };
    getScoreBadge: (score: number) => React.ReactNode;
}

export const PerformancePanel = ({ performanceSkill, getScoreBadge }: PerformancePanelProps) => {
    const [expandedPoint, setExpandedPoint] = useState<string | null>(null);

    if (!performanceSkill || !performanceSkill.findings || Object.keys(performanceSkill.findings).length === 0) {
        return (
            <div className="liquid-card p-12 text-center">
                <Smartphone className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-lg font-bold">Dados de Performance Ausentes</p>
                <p className="text-slate-500 text-sm mt-2 font-medium">O agente de UX/SEO não conseguiu processar esta página.</p>
            </div>
        );
    }

    const { findings } = performanceSkill;
    const audit = findings.clinical_audit;

    const AuditCard = ({ id, title, icon: Icon, data, shortValue, status }: { id: string, title: string, icon: any, data?: ClinicalPoint, shortValue: string, status?: boolean }) => {
        const isExpanded = expandedPoint === id;

        return (
            <div className={`liquid-card border-white/5 transition-all duration-300 ${isExpanded ? 'ring-1 ring-primary/30' : ''}`}>
                <div
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedPoint(isExpanded ? null : id)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${status === false ? 'bg-rose-500/10 text-rose-400' : 'bg-primary/10 text-primary'}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{shortValue}</span>
                                {status !== undefined && (
                                    <div className={`w-1.5 h-1.5 rounded-full ${status ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                )}
                            </div>
                        </div>
                    </div>
                    {data && (
                        <div className="text-slate-500 hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {isExpanded && data && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-white/5 bg-white/[0.02]"
                        >
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                                            <Zap className="w-2.5 h-2.5" /> Ponto Forte
                                        </span>
                                        <p className="text-[11px] text-slate-300 leading-tight font-medium">{data.strength}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter flex items-center gap-1">
                                            <AlertTriangle className="w-2.5 h-2.5" /> Ponto Fraco
                                        </span>
                                        <p className="text-[11px] text-slate-300 leading-tight font-medium">{data.weakness}</p>
                                    </div>
                                </div>

                                <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 space-y-3">
                                    <div className="flex items-start gap-2">
                                        <Info className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-primary uppercase">Por que mudar?</span>
                                            <p className="text-[10px] text-slate-300">{data.improvement.why}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Target className="w-3 h-3 text-cyan mt-0.5 shrink-0" />
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-cyan uppercase">Para quê serve?</span>
                                            <p className="text-[10px] text-slate-300">{data.improvement.for_what}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Activity className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-emerald-400 uppercase">Como fazer?</span>
                                            <p className="text-[10px] text-slate-300 italic">{data.improvement.how}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter">
                        <Gauge className="w-6 h-6 text-cyan" />
                        Auditoria Clínica de UX & Performance
                    </h3>
                    <p className="text-sm font-medium text-slate-400 mt-1">
                        Análise profunda de cada aspecto técnico com racional de melhoria.
                    </p>
                </div>
                {getScoreBadge(performanceSkill.score ?? 0)}
            </div>

            {/* Audit Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AuditCard
                    id="resp"
                    title="Responsividade"
                    icon={Smartphone}
                    data={audit?.responsiveness}
                    shortValue={findings.is_mobile_responsive_ui ? 'OTIMIZADO' : 'CRÍTICO'}
                    status={findings.is_mobile_responsive_ui}
                />
                <AuditCard
                    id="perf"
                    title="Velocidade"
                    icon={Zap}
                    data={audit?.performance}
                    shortValue={`${performanceSkill.load_time_seconds ?? 'N/A'}s`}
                    status={(performanceSkill.load_time_seconds ?? 5) < 3}
                />
                <AuditCard
                    id="seo"
                    title="Autoridade SEO"
                    icon={Search}
                    data={audit?.seo_authority}
                    shortValue={findings.has_meta_desc ? 'APROVADO' : 'NÃO OTIMIZADO'}
                    status={findings.has_meta_desc && findings.has_h1}
                />
                <AuditCard
                    id="conv"
                    title="Conversão"
                    icon={MousePointer2}
                    data={audit?.conversion_funnel}
                    shortValue={findings.has_contact_form ? 'ATIVO' : 'DESATIVADO'}
                    status={findings.has_contact_form}
                />
            </div>

            {/* Verdict & Extra Insights */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 liquid-card border-white/5 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10" />
                    <h4 className="text-xs font-black text-primary mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Veredito da Clínica
                    </h4>
                    <p className="text-lg text-white font-bold leading-relaxed italic tracking-tight">
                        &rdquo;{findings.ui_clinical_analysis}&rdquo;
                    </p>

                    {findings.cta_examples && findings.cta_examples.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Copy de Conversão Mapeada</span>
                            <div className="flex flex-wrap gap-2">
                                {findings.cta_examples.map((cta, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                        {cta}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {findings.blog_exploration_sample && (
                        <div className="glass-panel p-5 rounded-3xl border-blue-500/10">
                            <h4 className="text-[10px] font-black text-blue-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> Content Engine
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                {findings.blog_exploration_sample}
                            </p>
                        </div>
                    )}

                    {(performanceSkill.critical_pains?.length ?? 0) > 0 && (
                        <div className="glass-panel p-5 rounded-3xl border-rose-500/10">
                            <h4 className="text-[10px] font-black text-rose-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5" /> Alertas Críticos
                            </h4>
                            <ul className="space-y-2">
                                {performanceSkill.critical_pains?.map((pain: string, idx: number) => (
                                    <li key={idx} className="flex gap-2 text-[10px] text-slate-400 items-start">
                                        <div className="w-1 h-1 rounded-full bg-rose-500/40 mt-1.5 shrink-0" />
                                        <span>{pain}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
