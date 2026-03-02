"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, AlertCircle, TrendingUp, Target, Database, Smartphone, Instagram, Building2, KeyRound } from 'lucide-react';

interface ScoreRateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ScoreRateModal = ({ isOpen, onClose }: ScoreRateModalProps) => {
    const rationale = [
        {
            icon: Database,
            title: "Rastreamento & Ads (30%)",
            desc: "Peso máximo na detecção de infraestrutura de aquisição. Sem pixels ou GTM, a empresa está 'cega', o que derruba o score drasticamente.",
            color: "text-blue-400"
        },
        {
            icon: Smartphone,
            title: "UX & Performance (25%)",
            desc: "Velocidade de carregamento e adaptabilidade mobile. Uma página lenta mata o tráfego pago antes mesmo do clique ser monetizado.",
            color: "text-cyan-400"
        },
        {
            icon: Target,
            title: "Estratégia de Mercado (20%)",
            desc: "Alinhamento psicológico entre o que a empresa vende e o que o ICP busca. Analisamos a ressonância da tese C-Level.",
            color: "text-purple-400"
        },
        {
            icon: KeyRound,
            title: "Inteligência Digital (25%)",
            desc: "Presença em busca (SEO/Keywords), relevância social e autoridade local (GMB). É o fator de trust e descoberta passiva.",
            color: "text-orange-400"
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tighter uppercase">Score Rate Rationale</h3>
                                    <p className="text-sm text-slate-500 font-medium tracking-tight text-xs uppercase">Entenda como nossa IA calcula o nível de maturidade digital</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {rationale.map((item, i) => (
                                    <div key={i} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-4 h-4 ${item.color}`} />
                                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h4>
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl flex items-start gap-4">
                                <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-tighter mb-1">Impacto nos Resultados</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Um score acima de 80 indica que a empresa está pronta para escalar tráfego agressivo.
                                        Abaixo de 50, qualquer real investido em anúncios terá um desperdício médio de 60% a 80%.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                            GroowayOS Proprietary Intelligence Engine v3.0
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
