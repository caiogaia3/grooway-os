"use client";
import React from 'react';
import { Instagram, Activity, Shield, Target, Link2, Heart, MessageCircle, Hash } from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { motion } from 'framer-motion';

interface SocialPanelProps {
    socialSkill: {
        score: number;
        findings: {
            followers?: string | number;
            posts_count?: string | number;
            bio_has_link: boolean;
            engagement_estimate?: string | number;
            sales_alignment?: string;
            authority_triggers?: string;
            content_ideas?: string[];
        };
    };
    getScoreBadge: (score: number) => React.ReactNode;
}

export const SocialPanel = ({ socialSkill, getScoreBadge }: SocialPanelProps) => {
    if (!socialSkill) return null;

    const { findings } = socialSkill;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter">
                        <Instagram className="w-6 h-6 text-[#E1306C]" />
                        Inteligência de Posicionamento Social
                    </h3>
                    <p className="text-base font-medium text-slate-400 mt-1">
                        Análise de presença digital, autoridade e motor de conversão social.
                    </p>
                </div>
                {getScoreBadge(socialSkill.score)}
            </div>

            {/* Core Social Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Seguidores"
                    value={findings.followers ?? '???'}
                    icon={Heart}
                    tooltip="Base de seguidores total detectada no perfil."
                />
                <MetricCard
                    label="Publicações"
                    value={findings.posts_count ?? '???'}
                    icon={Hash}
                    tooltip="Volume de posts históricos no acervo."
                />
                <MetricCard
                    label="Motor Inbound"
                    value={findings.bio_has_link ? 'BIO COM LINK' : 'SEM LINK'}
                    status={findings.bio_has_link}
                    icon={Link2}
                    tooltip="Presença de link estratégico na Bio."
                />
                <MetricCard
                    label="Engajamento IA"
                    value={findings.engagement_estimate || "-"}
                    variant="purple"
                    icon={MessageCircle}
                    tooltip="Nível de interação estimado por post."
                />
            </div>

            {/* Narrative Analysis Panels */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="liquid-card border-white/5 p-8 relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#A855F7]/40 to-transparent" />
                    <h4 className="text-[10px] font-black text-[#A855F7] mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Alinhamento Comercial
                    </h4>
                    <p className="text-base text-white font-bold leading-relaxed tracking-tight group-hover:text-purple-100 transition-colors">
                        &ldquo;{findings.sales_alignment || "Análise de conversão das legendas indisponível."}&rdquo;
                    </p>
                </div>

                <div className="liquid-card border-white/5 p-8 relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06B6D4]/40 to-transparent" />
                    <h4 className="text-[10px] font-black text-[#06B6D4] mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Gatilhos de Autoridade
                    </h4>
                    <p className="text-base text-white font-bold leading-relaxed tracking-tight group-hover:text-cyan-100 transition-colors">
                        &ldquo;{findings.authority_triggers || "Análise de autoridade visual indisponível."}&rdquo;
                    </p>
                </div>
            </div>

            {/* Content Strategy - Batch 2 Grid Pattern */}
            {(findings.content_ideas?.length ?? 0) > 0 && (
                <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-cyan" /> Plano Tático de Conteúdo
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {findings.content_ideas?.map((idea: string, idx: number) => (
                            <motion.div
                                key={idx}
                                whileHover={{ x: 8 }}
                                className="glass-panel p-5 rounded-3xl border-white/5 hover:border-cyan/20 flex gap-5 items-start transition-all"
                            >
                                <span className="w-8 h-8 rounded-xl bg-cyan/10 flex items-center justify-center text-cyan font-black text-sm shrink-0 border border-cyan/20">
                                    {idx + 1}
                                </span>
                                <p className="text-base text-slate-300 font-medium leading-relaxed pt-1">{idea}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
