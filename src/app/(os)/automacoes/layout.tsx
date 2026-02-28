"use client";
import React from 'react';
import { SubSidebar } from '@/core/components/SubSidebar';
import {
    LayoutDashboard,
    FlaskConical,
    Workflow
} from 'lucide-react';

const AUTOMACOES_ITEMS = [
    { id: 'painel', label: 'Painel', href: '/automacoes', icon: LayoutDashboard },
    { id: 'labs', label: 'LABS', href: '/automacoes/labs', icon: FlaskConical },
    { id: 'automacoes', label: 'Automações', href: '/automacoes', icon: Workflow },
];

export default function AutomacoesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <SubSidebar title="Navegação Interna" items={AUTOMACOES_ITEMS} />
            <main className="flex-1 min-h-[calc(100vh-64px)] p-8">
                {children}
            </main>
        </div>
    );
}
