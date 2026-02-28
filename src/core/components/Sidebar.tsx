"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Zap, Briefcase, Contact, DollarSign, TerminalSquare, Settings, LogOut } from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/hub", label: "HUB", icon: Zap },
    { href: "#crm", label: "CRM", icon: Briefcase },
    { href: "#clientes", label: "Clientes", icon: Contact },
    { href: "#financeiro", label: "Financeiro", icon: DollarSign },
    { href: "#prompts", label: "Prompts", icon: TerminalSquare },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed top-0 left-0 h-screen w-20 md:w-64 bg-[rgba(10,10,20,0.65)] backdrop-blur-[30px] backdrop-saturate-[200%] border-r border-white/[0.08] flex flex-col z-50 transition-all duration-300">
            {/* Brand */}
            <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-white/[0.06]">
                <span className="hidden md:block text-white font-extrabold tracking-tighter text-xl">GROOWAY<span className="text-purple-400">OS</span></span>
                <span className="md:hidden text-white font-extrabold text-xl">G</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {navItems.map((item) => {
                    const isFuture = item.href.startsWith('#');
                    const isActive = !isFuture && pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? "bg-purple-600/20 text-purple-400 shadow-[0_0_20px_rgba(109,40,217,0.15)]"
                                : isFuture
                                    ? "text-slate-600 hover:text-slate-400"
                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-purple-400" : isFuture ? "text-slate-600" : "text-slate-500 group-hover:text-white"}`} />
                            <span className="hidden md:inline text-sm font-semibold">{item.label}</span>
                            {isFuture && <span className="hidden md:inline ml-auto text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-slate-500">Breve</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-white/[0.06] space-y-1">
                <Link href="#configuracoes" className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all w-full">
                    <Settings className="w-5 h-5 shrink-0" />
                    <span className="hidden md:inline text-sm font-semibold">Configurações</span>
                </Link>
                <button className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className="hidden md:inline text-sm font-semibold">Sair</span>
                </button>
            </div>
        </aside>
    );
}
