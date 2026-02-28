"use client";
import React from 'react';
import { SubSidebar } from '@/core/components/SubSidebar';
import {
    LayoutDashboard,
    Grid,
    MessageSquare,
    FileText
} from 'lucide-react';

const HUB_ITEMS = [
    { id: 'visao', label: 'Visão Geral', href: '/hub', icon: LayoutDashboard },
    { id: 'ferramentas', label: 'Ferramentas', href: '/hub/ferramentas', icon: Grid },
    { id: 'comunicacao', label: 'Comunicação', href: '#', icon: MessageSquare },
    { id: 'arquivos', label: 'Arquivos', href: '#', icon: FileText },
];

export default function HubLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <SubSidebar title="HUB de Controle" items={HUB_ITEMS} />
            <main className="flex-1 min-h-[calc(100vh-64px)] p-8">
                {children}
            </main>
        </div>
    );
}
