"use client";
import React from 'react';
import { SubSidebar } from '@/core/components/SubSidebar';
import {
    Users,
    Kanban,
    ClipboardList,
    Receipt
} from 'lucide-react';

const CRM_ITEMS = [
    { id: 'contatos', label: 'Contatos', href: '/crm', icon: Users },
    { id: 'pipeline', label: 'Pipeline', href: '/crm/pipeline', icon: Kanban },
    { id: 'tarefas', label: 'Tarefas', href: '#', icon: ClipboardList },
    { id: 'faturamento', label: 'Faturamento', href: '#', icon: Receipt },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <SubSidebar title="CRM Workspace" items={CRM_ITEMS} />
            <main className="flex-1 min-h-[calc(100vh-64px)] p-8">
                {children}
            </main>
        </div>
    );
}
