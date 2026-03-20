"use client";
import React from 'react';
import { Target, Star, MessageSquare, AlertTriangle, ArrowRight, Camera, MapPin } from 'lucide-react';
import { GMBData } from '@/core/types/diagnostic';
import { MetricCard } from '../MetricCard';
import { motion } from 'framer-motion';

interface GMBPanelProps {
    gmbSkill: {
        score: number;
        findings: GMBData & {
            estimated_rating: string | number;
            reviews_volume: string | number;
            profile_effectiveness_pct: number;
            missing_for_100_pct: { item: string; description: string }[];
            reviews_list_raw: { stars: number; text: string }[];
            optimization_tips: string[];
        };
    };
    getScoreBadge: (score: number) => React.ReactNode;
}

export const GMBPanel = ({ gmbSkill, getScoreBadge }: GMBPanelProps) => {
    if (!gmbSkill || !gmbSkill.findings) return null;

    const { findings } = gmbSkill;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter">
                        <MapPin className="w-6 h-6 text-emerald-400" />
                        Auditoria de Presença Local (GMB)
                    </h3>
                    <p className="text-base font-medium text-slate-400 mt-1">
                        Diagnóstico de autoridade no Google Maps e eficácia da ficha comercial.
                    </p>
                </div>
                {getScoreBadge(gmbSkill.score)}
            </div>

            {/* Core Local Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Autoridade"
                    value={findings.estimated_rating}
                    icon={Star}
                    variant="success"
                    tooltip="Média de avaliação por estrelas detectada."
                />
                <MetricCard
                    label="Avaliações"
                    value={findings.reviews_volume}
                    icon={MessageSquare}
                    tooltip="Volume total de feedback de clientes."
                />
                <MetricCard
                    label="Acervo Fotos"
                    value={findings.photos_count || 0}
                    icon={Camera}
                    variant={(findings.photos_count || 0) >= 20 ? "success" : "warning"}
                    tooltip="Quantidade de ativos visuais na ficha."
                />
                <MetricCard
                    label="Eficácia Ficha"
                    value={`${findings.profile_effectiveness_pct || 0}%`}
                    status={(findings.profile_effectiveness_pct || 0) >= 80}
                    tooltip="Nível de completude e otimização da ficha."
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Missing Items - Glowing Amber Alert */}
                {findings.missing_for_100_pct && findings.missing_for_100_pct.length > 0 && (
                    <div className="liquid-card border-orange-500/10 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/40 group-hover:bg-orange-500 transition-colors" />
                        <h4 className="text-[10px] font-black text-orange-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Pendências Críticas (Eficácia)
                        </h4>
                        <div className="space-y-3">
                            {findings.missing_for_100_pct.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ x: 4 }}
                                    className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex flex-col gap-1"
                                >
                                    <span className="text-sm font-bold text-slate-100">{item.item}</span>
                                    <span className="text-sm text-orange-300/60 font-medium">{item.description}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Patient Reviews - Glass Scroll */}
                {findings.reviews_list_raw && findings.reviews_list_raw.length > 0 && (
                    <div className="liquid-card border-white/5 p-8 flex flex-col h-full">
                        <h4 className="text-[10px] font-black text-blue-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-white/5 pb-4">
                            <MessageSquare className="w-4 h-4" /> Amostra de Experiência
                        </h4>
                        <div className="space-y-4 max-h-[320px] overflow-y-auto no-scrollbar pr-2">
                            {findings.reviews_list_raw.map((review, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="flex gap-0.5 mb-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className={`w-3 h-3 ${star <= review.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed italic">&rdquo;{review.text || "Avaliação sem comentário"}&rdquo;</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Optimization Path */}
            {findings.optimization_tips && (
                <div className="space-y-6">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest px-2 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" /> Plano de Otimização Local
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {findings.optimization_tips.map((tip, idx) => (
                            <div key={idx} className="glass-panel p-5 rounded-3xl border-emerald-500/10 hover:border-emerald-500/20 flex gap-5 items-start transition-all">
                                <span className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-sm shrink-0 border border-emerald-500/20">
                                    {idx + 1}
                                </span>
                                <p className="text-base text-slate-300 font-medium leading-relaxed pt-1">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
