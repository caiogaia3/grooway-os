"use client";
import React from 'react';
import { Database, Target, Zap, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2, Flame, EyeOff, Rocket } from 'lucide-react';
import { MetricCard } from '../MetricCard';

interface TrackingPanelProps {
    trackingSkill: {
        score: number;
        findings: {
            has_ga4_base: boolean;
            has_gtm: boolean;
            has_meta_pixel: boolean;
            has_google_ads_signals?: boolean;
            has_whatsapp_button?: boolean;
            whatsapp_number?: string;
            has_utm_links?: boolean;
            has_datalayer?: boolean;
            // Old generic ones
            ui_strengths?: string[];
            ui_weaknesses?: string[];
            ui_improvements?: string[];
            // New CFO Executive Ones
            maturity_level?: string;
            risk_score_percentage?: number;
            executive_verdict?: string;
            blind_spots?: Array<{ issue: string; business_impact: string }>;
            action_plan?: Array<{ priority: string; action: string }>;
            infrastructure_status?: string;
        };
    };
    getScoreBadge: (score: number) => React.ReactNode;
}

export const TrackingPanel = ({ trackingSkill, getScoreBadge }: TrackingPanelProps) => {
    if (!trackingSkill || !trackingSkill.findings) return null;

    const { findings } = trackingSkill;

    return (
        <div className="space-y-6">
            <div className="liquid-glass p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#0A0A0F]/80 border border-white/10 backdrop-blur-xl rounded-[24px]">
                <h3 className="text-lg font-bold mb-5 flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="flex items-center gap-2 text-slate-100">
                        <Database className="w-5 h-5 text-indigo-400" /> Infraestrutura Base
                    </span>
                    {getScoreBadge(trackingSkill.score)}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <MetricCard
                        label="GA4 Base"
                        value={findings.has_ga4_base ? 'ATIVO' : 'NÃO DETECTADO'}
                        status={findings.has_ga4_base}
                        tooltip="Google Analytics 4: O padrão ouro para rastreamento de comportamento do usuário."
                    />
                    <MetricCard
                        label="GTM Control"
                        value={findings.has_gtm ? 'ATIVO' : 'LIVRE'}
                        status={findings.has_gtm}
                        tooltip="Google Tag Manager: Gerenciador central de scripts."
                    />
                    <MetricCard
                        label="Meta Pixel"
                        value={findings.has_meta_pixel ? 'ATIVO' : 'NÃO DETECTADO'}
                        status={findings.has_meta_pixel}
                        tooltip="Pixel do Facebook: Essencial para remarketing e mensuração no Instagram/Facebook."
                    />
                    <MetricCard
                        label="DataLayer Ecommerce"
                        value={findings.has_datalayer ? 'ATIVO' : 'INATIVO'}
                        status={findings.has_datalayer ?? false}
                        tooltip="Camada de dados estruturada para envio preciso de conversões de ecommerce."
                    />
                </div>
            </div>

            <div className="liquid-glass p-6 animate-in fade-in slide-in-from-bottom-6 duration-700 bg-black/40 border border-white/5 backdrop-blur-xl rounded-[24px]">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2 pb-3 border-b border-white/5 line-clamp-1">
                    <Target className="w-4 h-4 text-emerald-400" /> Motor de Canais & Vendas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Google Ads */}
                    <div className={`p-5 rounded-2xl border ${findings.has_google_ads_signals ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Google Ads Tracker</span>
                            {findings.has_google_ads_signals ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
                        </div>
                        <p className={`text-xl font-black ${findings.has_google_ads_signals ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {findings.has_google_ads_signals ? 'DETECTADO' : 'AUSENTE'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">Marcador AW de campanhas e conversões do Google.</p>
                    </div>

                    {/* UTMs */}
                    <div className={`p-5 rounded-2xl border ${findings.has_utm_links ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blindagem UTM</span>
                            {findings.has_utm_links ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        </div>
                        <p className={`text-xl font-black ${findings.has_utm_links ? 'text-emerald-400' : 'text-amber-500'}`}>
                            {findings.has_utm_links ? 'PROTEGIDO' : 'TRÁFEGO CEGO'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">Uso de parâmetros para rastreio de origem de cliques.</p>
                    </div>

                    {/* WhatsApp */}
                    <div className={`p-5 rounded-2xl border ${findings.has_whatsapp_button ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/20 border-white/5'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sniper WhatsApp</span>
                            {findings.has_whatsapp_button ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : null}
                        </div>
                        <p className={`text-lg font-black ${findings.has_whatsapp_button ? 'text-emerald-400 font-mono tracking-tight' : 'text-slate-500'}`}>
                            {findings.has_whatsapp_button ? (findings.whatsapp_number || 'Link Encontrado') : 'NÃO DETECTADO'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">Botão ou link de WhatsApp rastreável.</p>
                    </div>
                </div>
            </div>

            {/* AI Diagnostics Panel (CFO-Level) */}
            {(findings.executive_verdict || (findings.blind_spots && findings.blind_spots.length > 0) || (findings.action_plan && findings.action_plan.length > 0)) && (
                <div className="p-[2px] bg-gradient-to-br from-rose-500/30 via-slate-900 to-red-500/30 rounded-[24px] shadow-2xl relative overflow-hidden mt-8 group animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[100px] pointer-events-none group-hover:bg-red-500/20 transition-all duration-700" />

                    <div className="bg-[#050508] p-8 rounded-[22px] relative z-10">
                        {/* HEADER & EXECUTIVE VERDICT */}
                        <div className="mb-10 pb-8 border-b border-white/5">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                    <Flame className="w-6 h-6 text-rose-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tighter">Veredito Executivo</h2>
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-rose-400">Diagnosis Engine • Agente 05</p>
                                </div>
                            </div>

                            {findings.executive_verdict && (
                                <p className="text-lg text-slate-300 font-medium leading-relaxed bg-rose-500/5 p-6 rounded-2xl border border-rose-500/10 italic">
                                    "{findings.executive_verdict}"
                                </p>
                            )}

                            {/* RISK THERMOMETER */}
                            {findings.risk_score_percentage !== undefined && (
                                <div className="mt-8 bg-black/40 border border-white/5 rounded-xl p-6">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Risco de Perda de Verba</p>
                                            <p className="text-sm font-medium text-slate-500">Medidor de ineficiência de captação e tracking</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-rose-500">{findings.risk_score_percentage}%</span>
                                            <span className="text-xs text-rose-500/70 block uppercase tracking-widest font-bold">
                                                {findings.risk_score_percentage > 70 ? 'CRÍTICO' : findings.risk_score_percentage > 40 ? 'ALERTA' : 'CONTROLADO'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full relative transition-all duration-1000 ${findings.risk_score_percentage > 70 ? 'bg-gradient-to-r from-amber-500 to-rose-600' :
                                                    findings.risk_score_percentage > 40 ? 'bg-gradient-to-r from-emerald-500 to-amber-500' :
                                                        'bg-gradient-to-r from-emerald-600 to-emerald-400'
                                                }`}
                                            style={{ width: `${findings.risk_score_percentage}%` }}
                                        >
                                            <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('/noise.png')] opacity-20"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BLIND SPOTS MATRIX */}
                        {findings.blind_spots && findings.blind_spots.length > 0 && (
                            <div className="mb-10">
                                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-200 mb-6">
                                    <EyeOff className="w-5 h-5 text-rose-400" /> Matriz de Pontos Cegos
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {findings.blind_spots.map((spot, idx) => (
                                        <div key={idx} className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5 hover:bg-rose-500/10 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center mb-4">
                                                <span className="text-rose-400 font-bold">{idx + 1}</span>
                                            </div>
                                            <h5 className="font-bold text-rose-100 mb-2 leading-tight">{spot.issue}</h5>
                                            <p className="text-xs text-slate-400 leading-relaxed">{spot.business_impact}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PRIORITY ACTION PLAN */}
                        {findings.action_plan && findings.action_plan.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-200 mb-6">
                                    <Rocket className="w-5 h-5 text-indigo-400" /> Roadmap de Resgate
                                </h4>
                                <div className="space-y-3">
                                    {findings.action_plan.map((action, idx) => (
                                        <div key={idx} className={`p-4 rounded-xl border flex items-start gap-4 ${action.priority.toUpperCase() === 'URGENTE' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-indigo-500/5 border-indigo-500/20'}`}>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest whitespace-nowrap ${action.priority.toUpperCase() === 'URGENTE' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                                {action.priority.toUpperCase()}
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium pt-0.5">{action.action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Old Fallback Support (Can be removed later if backend stable) */}
            {((findings.ui_strengths && findings.ui_strengths.length > 0) ||
                (findings.ui_weaknesses && findings.ui_weaknesses.length > 0)) && !findings.executive_verdict && (
                    <div className="p-6 bg-slate-900 border border-white/5 rounded-[24px]">
                        <p className="text-xs text-slate-500">Transição de modelo (Versão Técnica Antiga)</p>
                    </div>
                )}
            {/* AI Diagnostics Panel */}
            {((findings.ui_strengths && findings.ui_strengths.length > 0) ||
                (findings.ui_weaknesses && findings.ui_weaknesses.length > 0) ||
                (findings.ui_improvements && findings.ui_improvements.length > 0)) && (
                    <div className="p-[2px] bg-gradient-to-br from-indigo-500/30 via-slate-900 to-purple-500/30 rounded-[24px] shadow-2xl relative overflow-hidden mt-8 group animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700" />

                        <div className="bg-[#050508] p-8 rounded-[22px] relative z-10">
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-indigo-500/20">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white italic tracking-tighter">Inteligência Operacional</h2>
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400">Diagnosis Engine • Agente 05</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Strengths */}
                                {(findings.ui_strengths && findings.ui_strengths.length > 0) && (
                                    <div>
                                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400 mb-4">
                                            <ShieldCheck className="w-4 h-4" /> Pontos Fortes
                                        </h4>
                                        <ul className="space-y-3">
                                            {(findings.ui_strengths || []).map((item, idx) => (
                                                <li key={idx} className="text-xs text-slate-300 font-medium pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-emerald-500 before:rounded-full">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Weaknesses */}
                                {(findings.ui_weaknesses && findings.ui_weaknesses.length > 0) && (
                                    <div>
                                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-500 mb-4">
                                            <AlertTriangle className="w-4 h-4" /> Furos no Balde
                                        </h4>
                                        <ul className="space-y-3">
                                            {(findings.ui_weaknesses || []).map((item, idx) => (
                                                <li key={idx} className="text-xs text-slate-300 font-medium pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-rose-500 before:rounded-full">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Improvements */}
                                {(findings.ui_improvements && findings.ui_improvements.length > 0) && (
                                    <div className="bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/20 md:col-span-1 h-full">
                                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">
                                            <TrendingUp className="w-4 h-4" /> Oportunidades
                                        </h4>
                                        <ul className="space-y-3">
                                            {(findings.ui_improvements || []).map((item, idx) => (
                                                <li key={idx} className="text-xs text-indigo-100 font-medium pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-indigo-400 before:rounded-full">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};
