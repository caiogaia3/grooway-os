"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Target,
    Briefcase,
    Database,
    Wallet,
    BookOpen,
    Settings,
    LogOut
} from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Hub de Ferramentas", icon: Target, path: "/tools" },
    { name: "Pipeline", icon: Briefcase, path: "/pipeline" },
    { name: "Inteligência de Mercado", icon: Database, path: "/scraper" },
    { name: "Tesouraria", icon: Wallet, path: "/finance" },
    { name: "Wiki SOPs", icon: BookOpen, path: "/wiki" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-20 md:w-64 h-screen fixed left-0 top-0 sidebar-glass flex flex-col pt-8 pb-6 px-4 z-50 transition-all duration-300">
            {/* Logo Area */}
            <div className="mb-12 flex justify-center md:justify-start items-center gap-3 md:px-2">
                <img src="/logo-gw.png" alt="Grooway" className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-brand-purple/20 flex-shrink-0" />
                <div className="hidden md:block overflow-hidden">
                    <h1 className="text-white font-bold tracking-wide truncate">GroowayOS</h1>
                    <p className="text-slate-400 text-xs truncate">Agency Control</p>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    return (
                        <Link key={item.path} href={item.path} className="block relative" title={item.name}>
                            {isActive && (
                                <motion.div
                                    layoutId="active-tab"
                                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={`relative flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                }`}>
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-brand-cyan" : ""}`} />
                                <span className="font-medium text-sm hidden md:block truncate">{item.name}</span>
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto space-y-2 pt-6 border-t border-white/5">
                <button title="Configuração" className="w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm hidden md:block truncate">Configuração</span>
                </button>
                <button title="Sair" className="w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm hidden md:block truncate">Sair</span>
                </button>
            </div>
        </aside>
    );
}
