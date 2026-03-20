"use client";
import React from 'react';
import { SubSidebar } from '@/core/components/SubSidebar';
import {
    Crosshair,
    BarChart3,
    History,
    Settings2,
} from 'lucide-react';

const TRAFEGO_ITEMS = [
    { id: 'campanhas', label: 'Campanhas', href: '/trafego', icon: Crosshair },
    { id: 'performance', label: 'Performance', href: '/trafego/performance', icon: BarChart3 },
    { id: 'historico', label: 'Historico', href: '/trafego/historico', icon: History },
    { id: 'config', label: 'Config', href: '#', icon: Settings2 },
];

export default function TrafegoLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <SubSidebar title="Trafego" items={TRAFEGO_ITEMS} />
            <main className="flex-1 min-h-[calc(100vh-64px)] p-8">
                {children}
            </main>
        </div>
    );
}
