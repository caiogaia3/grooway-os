import React from 'react';
import {
    Briefcase, Database, Smartphone, Target,
    Instagram, Building2, KeyRound, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
    icon: React.ElementType;
}

interface ResultsTabsProps {
    activeTab: string;
    onTabChange: (id: string) => void;
    scores?: Record<string, number>;
}

export const TABS: Tab[] = [
    { id: 'cmo', label: 'Veredito', icon: Briefcase },
    { id: 'tracking', label: 'Dados/Ads', icon: Database },
    { id: 'performance', label: 'UX/Performance', icon: Smartphone },
    { id: 'market', label: 'Estratégia/ICP', icon: Target },
    { id: 'social', label: 'Social Media', icon: Instagram },
    { id: 'gmb', label: 'Google Maps', icon: Building2 },
    { id: 'keywords', label: 'Keywords', icon: KeyRound },
    { id: 'commercial', label: 'Plano Comercial', icon: Activity },
];

export function ResultsTabs({ activeTab, onTabChange, scores = {} }: ResultsTabsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-10">
            {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const score = scores[tab.id] ?? 0;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-500 border ${isActive
                                ? 'bg-primary/10 border-primary/40 shadow-[0_0_25px_rgba(168,85,247,0.15)] ring-1 ring-primary/20'
                                : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                            }`}
                    >
                        <div className={`p-2 rounded-xl mb-2 transition-all duration-300 ${isActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-500 group-hover:text-slate-300'
                            }`}>
                            <tab.icon className="w-4 h-4" />
                        </div>

                        <span className={`text-[9px] font-black uppercase tracking-tighter mb-1 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'
                            }`}>
                            {tab.label}
                        </span>

                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black ${score >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
                                score >= 40 ? 'bg-orange-500/10 text-orange-400' :
                                    'bg-rose-500/10 text-rose-400'
                            }`}>
                            {score} pts
                        </div>

                        {isActive && (
                            <motion.div
                                layoutId="activeGlow"
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-primary rounded-full blur-[1px]"
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
