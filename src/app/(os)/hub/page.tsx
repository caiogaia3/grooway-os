"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScanSearch, FilePlus, Database, ArrowRight, Zap } from 'lucide-react';

const hubFeatures = [
    {
        id: 'auditor',
        title: 'Auditor de Presença',
        description: 'Análise completa de presença digital, SEO, GMB e redes sociais com IA.',
        icon: ScanSearch,
        href: '/auditor',
        color: 'from-purple-500 to-indigo-600',
        active: true
    },
    {
        id: 'proposals',
        title: 'Gerador de Propostas',
        description: 'Crie propostas comerciais industriais de alto impacto em segundos.',
        icon: FilePlus,
        href: '/proposals/new',
        color: 'from-blue-500 to-cyan-600',
        active: true
    },
    {
        id: 'scraper',
        title: 'Scraper B2B Leads',
        description: 'Extração inteligente de leads B2B baseada em perfis ideais de clientes.',
        icon: Database,
        href: '/scraper',
        color: 'from-slate-700 to-slate-800',
        active: true,
        comingSoon: false
    }
];

export default function HubPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-12 py-10">
            {/* Header */}
            <header className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-4"
                >
                    <Zap className="w-3 h-3 transition-transform group-hover:scale-110" />
                    Grooway Ecosystem
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-6xl font-black text-white tracking-tighter"
                >
                    HUB DE <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">INTELIGÊNCIA</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-400 font-medium max-w-2xl mx-auto text-lg"
                >
                    Acesse todas as ferramentas de elite para escalar sua operação comercial e domínio de mercado.
                </motion.p>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {hubFeatures.map((feature, idx) => (
                    <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * idx }}
                        className="relative group h-full"
                    >
                        <Link
                            href={feature.href}
                            className={`block h-full liquid-glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 group relative overflow-hidden flex flex-col ${!feature.active ? 'pointer-events-none grayscale opacity-60' : ''}`}
                        >
                            {/* Gradient Glow */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />

                            {/* Icon Box */}
                            <div className={`w-16 h-16 rounded-[24px] bg-gradient-to-br ${feature.color} flex items-center justify-center mb-8 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                                <feature.icon className="w-8 h-8 text-white" />
                            </div>

                            {/* Badge */}
                            {feature.comingSoon && (
                                <div className="absolute top-8 right-8 px-3 py-1 rounded-full bg-white/10 text-[10px] font-black text-white tracking-widest uppercase border border-white/10">
                                    Em Breve
                                </div>
                            )}

                            {/* Content */}
                            <div className="space-y-3 flex-1">
                                <h3 className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400 font-medium leading-relaxed italic">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Action */}
                            {feature.active && (
                                <div className="mt-8 flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all pb-2">
                                    Acessar Agora
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            )}
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Background Glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
        </div>
    );
}
