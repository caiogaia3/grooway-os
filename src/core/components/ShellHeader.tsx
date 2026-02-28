'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Bell, User, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ShellHeader() {
    const pathname = usePathname();

    // Mapear o título baseado na rota
    const getPageTitle = () => {
        if (pathname?.includes('/hub')) return 'CENTRAL DE INTELIGÊNCIA';
        if (pathname?.includes('/leads')) return 'CRAWLER DE MERCADO';
        if (pathname?.includes('/auditor')) return 'DECODER ESTRATÉGICO';
        return 'SISTEMA OPERACIONAL';
    };

    return (
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-[#020204]/40 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                >
                    <div className="w-2 h-2 rounded-full bg-[#A855F7] shadow-[0_0_10px_#A855F7]" />
                    <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                        NODO ATIVO: <span className="text-white">{getPageTitle()}</span>
                    </span>
                </motion.div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="badge-node flex items-center gap-2">
                        <Zap className="w-3 h-3 text-[#A855F7]" />
                        <span className="text-white">v2.1 PRO</span>
                    </div>
                </div>

                <div className="h-8 w-px bg-white/10" />

                <div className="flex items-center gap-4">
                    <button className="p-2.5 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                        <Bell className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-black text-white leading-none uppercase">Admin User</p>
                            <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase">Agência Grooway</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#06B6D4] p-[1px] shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
                            <div className="w-full h-full rounded-[15px] bg-[#020204] flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
