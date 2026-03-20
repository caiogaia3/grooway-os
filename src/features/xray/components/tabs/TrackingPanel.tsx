"use client";
import React from 'react';
import { Database, Target, Zap, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2, Flame, EyeOff, Rocket, Fingerprint, Bug, Activity, Terminal, ExternalLink } from 'lucide-react';

interface TrackingPanelProps {
    trackingSkill: {
        score: number;
        critical_pains?: string[];
        findings: {
            has_ga4_base: boolean;
            has_gtm: boolean;
            has_meta_pixel: boolean;
            has_google_ads_signals?: boolean;
            has_whatsapp_button?: boolean;
            whatsapp_number?: string;
            has_utm_links?: boolean;
            has_datalayer?: boolean;
            gtm_details?: string[];
            ga4_details?: string[];
            meta_pixel_details?: string[];
            google_ads_details?: string[];
            evidences?: string[];

            maturity_level?: string;
            risk_score_percentage?: number;
            executive_verdict?: string;
            blind_spots?: Array<{ issue: string; business_impact: string }>;
            action_plan?: Array<{ priority: string; action: string }>;
            critical_alerts?: string[];
        };
    };
    getScoreBadge: (score: number) => React.ReactNode;
}

const Package = (props: any) => <Database {...props} />;

const CompactCard = ({
    label,
    isActive,
    valueText,
    subtext,
    details,
    icon: Icon
}: {
    label: string;
    isActive: boolean;
    valueText: string;
    subtext?: string;
    details?: string[];
    icon: any;
}) => {
    const activeColor = isActive ? 'text-emerald-400' : 'text-rose-500';
    const activeBg = isActive
        ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
        : 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]';

    return (
        <div className={`p-4 rounded-xl border flex flex-col h-full transition-all duration-300 ${activeBg}`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" /> {label}
                </span>
                {isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                )}
            </div>
            <div className="mt-auto">
                <p className={`text-base font-black tracking-tight ${activeColor}`}>
                    {isActive ? valueText : 'DESATIVADO'}
                </p>
                {subtext && <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">{subtext}</p>}

                {details && details.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                        {details.map((d, i) => (
                            <p key={i} className="text-[9px] text-slate-400 font-mono tracking-tighter truncate opacity-70">
                                {d}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const TrackingPanel = ({ trackingSkill, getScoreBadge }: TrackingPanelProps) => {
    if (!trackingSkill || !trackingSkill.findings) return null;
    const { findings } = trackingSkill;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Main Infrastructure Grid */}
            <div className="bg-[#0A0A0F]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-5 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Database className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white uppercase tracking-tighter">
                                Auditoria de Rastreamento & ROI
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Diagnostic Engine • Agente 05</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {findings.maturity_level && (
                            <div className="text-right mr-4 hidden md:block">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Maturidade</p>
                                <p className="text-sm font-black text-indigo-400 uppercase italic">{findings.maturity_level}</p>
                            </div>
                        )}
                        {getScoreBadge(trackingSkill.score)}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <CompactCard
                        label="GA4 (Analytics)"
                        isActive={findings.has_ga4_base}
                        valueText="ATIVO"
                        details={findings.ga4_details}
                        icon={Activity}
                    />
                    <CompactCard
                        label="GTM (Control)"
                        isActive={findings.has_gtm}
                        valueText="ATIVO"
                        details={findings.gtm_details}
                        icon={Package}
                    />
                    <CompactCard
                        label="Meta Pixel"
                        isActive={findings.has_meta_pixel}
                        valueText="ATIVO"
                        details={findings.meta_pixel_details}
                        icon={Target}
                    />
                    <CompactCard
                        label="Google Ads"
                        isActive={findings.has_google_ads_signals ?? false}
                        valueText="ATIVO"
                        details={findings.google_ads_details}
                        icon={Flame}
                    />
                    <CompactCard
                        label="UTMs"
                        isActive={findings.has_utm_links ?? false}
                        valueText="ATIVO"
                        subtext="Tráfego Pago"
                        icon={ExternalLink}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className={`p-4 rounded-xl border flex justify-between items-center transition-all ${findings.has_whatsapp_button ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${findings.has_whatsapp_button ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                <Zap className={`w-4 h-4 ${findings.has_whatsapp_button ? 'text-emerald-400' : 'text-rose-400'}`} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Canal de Vendas (WhatsApp)</span>
                                <p className={`text-sm font-black tracking-tight ${findings.has_whatsapp_button ? 'text-emerald-400' : 'text-rose-500'}`}>
                                    {findings.has_whatsapp_button ? 'CONECTADO' : 'DESATIVADO'}
                                </p>
                            </div>
                        </div>
                        {findings.whatsapp_number && (
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                {findings.whatsapp_number}
                            </span>
                        )}
                    </div>

                    <div className={`p-4 rounded-xl border flex justify-between items-center transition-all ${findings.has_datalayer ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-white/5'}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-800">
                                <Terminal className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">DataLayer (Ecommerce)</span>
                                <p className={`text-sm font-black tracking-tight ${findings.has_datalayer ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {findings.has_datalayer ? 'ESTRUTURADO' : 'DESATIVADO'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Intelligence Output Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Expert Verdict Card */}
                <div className="lg:col-span-1 bg-gradient-to-br from-indigo-900/40 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-center">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Veredito do Especialista</h4>
                    <p className="text-base text-white font-bold leading-relaxed italic">
                        {findings.executive_verdict ? `"${findings.executive_verdict}"` : 'Realize um novo escaneamento para gerar a análise inteligente de impacto.'}
                    </p>
                    <div className="mt-6 pt-6 border-t border-indigo-500/20">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Risco de Perda de Dados</span>
                            <span className={`text-2xl font-black ${(findings.risk_score_percentage || 0) > 50 ? 'text-rose-500' : 'text-emerald-400'}`}>
                                {findings.risk_score_percentage !== undefined ? `${findings.risk_score_percentage}%` : '--%'}
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${(findings.risk_score_percentage || 0) > 50 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500'}`}
                                style={{ width: `${findings.risk_score_percentage || 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Critical Alerts & Action Plan Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Critical Alerts (Impact Focus) */}
                    <div className="bg-slate-900/50 border border-rose-500/20 rounded-2xl p-5">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4">
                            <Bug className="w-4 h-4 text-rose-500" /> Alertas Críticos
                        </h4>
                        <div className="space-y-3">
                            {findings.critical_alerts && findings.critical_alerts.length > 0 ? (
                                findings.critical_alerts.map((alert, idx) => (
                                    <div key={idx} className="flex gap-3 items-start bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                                        <p className="text-[11px] text-rose-100 font-medium leading-relaxed">{alert}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-[11px] text-slate-500 italic p-3 border border-white/5 rounded-xl">
                                    Nenhum alerta crítico gerado. Tente um novo scan para forçar a análise forense.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Plan */}
                    <div className="bg-slate-900/50 border border-emerald-500/20 rounded-2xl p-5">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">
                            <Rocket className="w-4 h-4 text-emerald-400" /> Plano de Otimização Executivo
                        </h4>
                        <div className="space-y-3">
                            {findings.action_plan && findings.action_plan.length > 0 ? (
                                findings.action_plan.map((action, idx) => (
                                    <div key={idx} className="flex gap-3 items-start bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 group hover:border-emerald-500/30 transition-all">
                                        <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${action.priority.toUpperCase() === 'URGENTE' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                        <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">{action.priority}</span>
                                            {action.action}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-[11px] text-slate-500 italic p-3 border border-white/5 rounded-xl">
                                    Dados de otimização ausentes neste registro.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
