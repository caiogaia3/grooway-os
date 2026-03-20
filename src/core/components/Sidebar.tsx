"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Zap, Briefcase, Contact, DollarSign, BarChart3, Workflow, Settings, LogOut, Crosshair } from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/hub", label: "HUB", icon: Zap },
    { href: "/crm", label: "CRM", icon: Briefcase },
    { href: "/financeiro", label: "Financeiro", icon: DollarSign },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/trafego", label: "Tráfego", icon: Crosshair },
    { href: "/automacoes", label: "Automações", icon: Workflow },
];

export function Sidebar() {
    const pathname = usePathname();

    // Automatically collapse sidebar if we are inside a workspace with its own secondary menu (like /crm or /hub)
    const isCollapsed = pathname.startsWith("/crm") || pathname.startsWith("/hub") || pathname.startsWith("/trafego");

    // "md:w-64" becomes "md:w-20" if collapsed
    const widthClass = isCollapsed ? "md:w-20" : "md:w-64";

    return (
        <aside className={`fixed top-0 left-0 h-screen w-20 ${widthClass} glass-panel border-r border-white/5 flex flex-col z-50 transition-all duration-500`}>
            {/* Brand - Logo Container */}
            <div className="h-20 flex items-center justify-center md:items-center md:justify-center border-b border-white/5">
                <Link href="/" className={`w-10 h-10 bg-[#A855F7] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] group cursor-pointer hover:scale-105 transition-transform ${!isCollapsed && 'md:mr-4'}`}>
                    <Zap className="w-6 h-6 text-white fill-white" />
                </Link>
                {!isCollapsed && (
                    <div className="hidden md:flex flex-col overflow-hidden">
                        <span className="text-white font-black tracking-tighter text-lg leading-none uppercase truncate">Grooway</span>
                        <span className="text-[10px] text-[#A855F7] font-bold uppercase tracking-[0.2em] mt-1 truncate">Operating System</span>
                    </div>
                )}
            </div>

            {/* Navigation - Nodes */}
            <nav className="flex-1 py-8 space-y-4 px-4 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const isFuture = item.href.startsWith('#');
                    // Avoid matching /crm/clientes as active for /crm
                    const isActive = !isFuture && pathname.startsWith(item.href) &&
                        !(item.href === "/crm" && pathname.includes("/clientes") && item.label !== "CRM");

                    return (
                        <Link
                            key={item.href + item.label}
                            href={item.href}
                            title={isCollapsed ? item.label : undefined}
                            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center md:justify-start'} gap-4 p-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                                ? "sidebar-link-active"
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 transition-all ${isActive ? "text-white glow-purple-neon" : "group-hover:scale-110"}`} />
                            {!isCollapsed && (
                                <span className={`hidden md:inline min-w-0 truncate text-[11px] font-black uppercase tracking-widest ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                                    {item.label}
                                </span>
                            )}

                            {isActive && (
                                <div className="absolute right-0 w-1 h-8 bg-purple-500 rounded-l-full shadow-[0_0_10px_#A855F7]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/5 space-y-3">
                <button title={isCollapsed ? "Configurações" : undefined} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center md:justify-start'} gap-4 p-3.5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all group`}>
                    <Settings className="w-5 h-5 shrink-0 group-hover:rotate-45 transition-transform" />
                    {!isCollapsed && <span className="hidden md:inline text-[11px] font-black uppercase tracking-widest truncate">Config</span>}
                </button>
                <button title={isCollapsed ? "Sair" : undefined} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center md:justify-start'} gap-4 p-3.5 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all`}>
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="hidden md:inline text-[11px] font-black uppercase tracking-widest truncate">Sair</span>}
                </button>
            </div>

            {/* AI Status Small Widget */}
            {!isCollapsed && (
                <div className="hidden md:block p-6 mt-auto">
                    <div className="p-4 rounded-[20px] bg-white/[0.02] border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">IA STATUS</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)] animate-pulse" />
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
