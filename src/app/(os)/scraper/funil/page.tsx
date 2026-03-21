"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Star, Globe, Instagram, Linkedin, Mail, Phone,
    Users, GripVertical, MessageCircle, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/core/lib/supabase/client';
import { moverParaFunil } from '@/app/actions/leads_pipeline';

interface Contato {
    id: string;
    nome: string;
    cargo: string;
    linkedin_url: string;
    email_corporativo: string | null;
    email_confidence: number | null;
}

interface Empresa {
    id: string;
    nome: string;
    categoria: string;
    cidade: string;
    estado: string;
    telefone: string;
    nota: number | null;
    website_url: string;
    instagram_url: string;
    linkedin_url: string;
    whatsapp_url: string;
    emails: string[];
    ai_score: number;
    ai_resumo: string;
    status_funil: string;
    contatos_leads?: Contato[];
}

const FUNIL_STAGES = [
    { key: 'lead_novo', label: 'Lead Novo', color: 'purple' },
    { key: 'em_contato', label: 'Em Contato', color: 'blue' },
    { key: 'reuniao', label: 'Reunião', color: 'cyan' },
    { key: 'negociacao', label: 'Negociação', color: 'amber' },
    { key: 'ganho', label: 'Ganho', color: 'emerald' },
    { key: 'perdido', label: 'Perdido', color: 'red' },
] as const;

const stageColors: Record<string, { bg: string; border: string; dot: string; text: string; header: string }> = {
    purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', dot: 'bg-purple-500', text: 'text-purple-400', header: 'bg-purple-500/10' },
    blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', dot: 'bg-blue-500', text: 'text-blue-400', header: 'bg-blue-500/10' },
    cyan: { bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', dot: 'bg-cyan-500', text: 'text-cyan-400', header: 'bg-cyan-500/10' },
    amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', dot: 'bg-amber-500', text: 'text-amber-400', header: 'bg-amber-500/10' },
    emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', dot: 'bg-emerald-500', text: 'text-emerald-400', header: 'bg-emerald-500/10' },
    red: { bg: 'bg-red-500/5', border: 'border-red-500/20', dot: 'bg-red-500', text: 'text-red-400', header: 'bg-red-500/10' },
};

function ScoreBadge({ score }: { score: number }) {
    let color = 'from-slate-600 to-slate-800';
    let label = 'Baixo';
    if (score >= 70) { color = 'from-amber-500 to-yellow-600'; label = 'Ouro'; }
    else if (score >= 40) { color = 'from-slate-300 to-slate-500'; label = 'Prata'; }
    else if (score >= 20) { color = 'from-orange-700 to-orange-900'; label = 'Bronze'; }

    return (
        <div className="flex items-center gap-1.5">
            <span className={`text-sm font-black bg-gradient-to-br ${color} bg-clip-text text-transparent`}>{score}</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">{label}</span>
        </div>
    );
}

function EmpresaCard({ empresa, onMove }: { empresa: Empresa; onMove: (id: string, stage: string) => void }) {
    const [expanded, setExpanded] = useState(false);

    const nextStage = FUNIL_STAGES.find((_, i) => {
        const current = FUNIL_STAGES.findIndex(s => s.key === empresa.status_funil);
        return i === current + 1;
    });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group cursor-pointer"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-sm truncate">{empresa.nome}</div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">{empresa.categoria}</div>
                </div>
                <ScoreBadge score={empresa.ai_score || 0} />
            </div>

            <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500">
                {empresa.cidade && <span>{empresa.cidade}</span>}
                {empresa.nota && (
                    <span className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                        {empresa.nota}
                    </span>
                )}
                {empresa.contatos_leads && empresa.contatos_leads.length > 0 && (
                    <span className="flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" />
                        {empresa.contatos_leads.length}
                    </span>
                )}
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-3">
                {empresa.website_url && (
                    <a href={empresa.website_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <Globe className="w-3 h-3 text-slate-500" />
                    </a>
                )}
                {empresa.instagram_url && (
                    <a href={empresa.instagram_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <Instagram className="w-3 h-3 text-slate-500" />
                    </a>
                )}
                {empresa.linkedin_url && (
                    <a href={empresa.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <Linkedin className="w-3 h-3 text-slate-500" />
                    </a>
                )}
                {empresa.whatsapp_url && (
                    <a href={empresa.whatsapp_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <MessageCircle className="w-3 h-3 text-slate-500" />
                    </a>
                )}
            </div>

            {/* Expanded details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 mt-3 border-t border-white/5 space-y-3">
                            {empresa.telefone && (
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Phone className="w-3 h-3 text-slate-600" />
                                    {empresa.telefone}
                                </div>
                            )}
                            {empresa.emails?.length > 0 && empresa.emails.map((email, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                    <Mail className="w-3 h-3 text-slate-600" />
                                    {email}
                                </div>
                            ))}
                            {empresa.ai_resumo && (
                                <p className="text-xs text-slate-500 leading-relaxed">{empresa.ai_resumo}</p>
                            )}

                            {/* Contacts */}
                            {empresa.contatos_leads && empresa.contatos_leads.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Contatos</div>
                                    {empresa.contatos_leads.map(c => (
                                        <div key={c.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-0.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-white">{c.nome}</span>
                                                {c.linkedin_url && (
                                                    <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                                                        <ExternalLink className="w-2.5 h-2.5 text-blue-400" />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="text-slate-600">{c.cargo}</div>
                                            {c.email_corporativo && (
                                                <div className="text-emerald-400 flex items-center gap-1">
                                                    <Mail className="w-2.5 h-2.5" />
                                                    {c.email_corporativo}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Move to next stage */}
                            {nextStage && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onMove(empresa.id, nextStage.key); }}
                                    className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                                        bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white`}
                                >
                                    Mover para {nextStage.label} →
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FunilPage() {
    const [empresasByStage, setEmpresasByStage] = useState<Record<string, Empresa[]>>({});
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    const fetchEmpresas = useCallback(async () => {
        if (!userId) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('empresas_leads')
            .select('*, contatos_leads(*)')
            .eq('user_id', userId)
            .not('status_funil', 'is', null)
            .order('ai_score', { ascending: false });

        if (!error && data) {
            const grouped: Record<string, Empresa[]> = {};
            for (const stage of FUNIL_STAGES) {
                grouped[stage.key] = (data as Empresa[]).filter(e => e.status_funil === stage.key);
            }
            setEmpresasByStage(grouped);
        }
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        fetchEmpresas();
    }, [fetchEmpresas]);

    const handleMove = async (empresaId: string, newStage: string) => {
        if (!userId) return;

        // Optimistic update
        setEmpresasByStage(prev => {
            const updated = { ...prev };
            let movedEmpresa: Empresa | undefined;

            for (const key of Object.keys(updated)) {
                const idx = updated[key].findIndex(e => e.id === empresaId);
                if (idx !== -1) {
                    movedEmpresa = { ...updated[key][idx], status_funil: newStage };
                    updated[key] = updated[key].filter((_, i) => i !== idx);
                    break;
                }
            }

            if (movedEmpresa) {
                updated[newStage] = [...(updated[newStage] || []), movedEmpresa];
            }
            return updated;
        });

        await moverParaFunil({
            empresa_ids: [empresaId],
            user_id: userId,
            status_funil: newStage,
        });
    };

    const totalLeads = Object.values(empresasByStage).reduce((acc, arr) => acc + arr.length, 0);

    return (
        <div className="max-w-full mx-auto space-y-6 py-6 px-2">
            {/* Header */}
            <header className="flex items-center gap-6 px-4">
                <Link
                    href="/scraper"
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-400" />
                </Link>
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-2"
                    >
                        <GripVertical className="w-3 h-3" />
                        Pipeline
                    </motion.div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                        FUNIL DE <span className="text-purple-400">LEADS</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">{totalLeads} lead{totalLeads !== 1 ? 's' : ''} no funil</p>
                </div>
            </header>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4 px-4 no-scrollbar">
                {FUNIL_STAGES.map((stage) => {
                    const colors = stageColors[stage.color];
                    const items = empresasByStage[stage.key] || [];

                    return (
                        <motion.div
                            key={stage.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-shrink-0 w-[300px] flex flex-col"
                        >
                            {/* Column Header */}
                            <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl ${colors.header} border border-b-0 ${colors.border}`}>
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-2 h-2 rounded-full ${colors.dot} shadow-sm`} />
                                    <span className="text-xs font-black uppercase tracking-widest text-white">{stage.label}</span>
                                </div>
                                <span className={`text-xs font-black ${colors.text}`}>{items.length}</span>
                            </div>

                            {/* Column Body */}
                            <div className={`flex-1 min-h-[300px] p-3 space-y-3 rounded-b-2xl ${colors.bg} border border-t-0 ${colors.border}`}>
                                <AnimatePresence mode="popLayout">
                                    {items.map(empresa => (
                                        <EmpresaCard
                                            key={empresa.id}
                                            empresa={empresa}
                                            onMove={handleMove}
                                        />
                                    ))}
                                </AnimatePresence>

                                {items.length === 0 && !loading && (
                                    <div className="flex items-center justify-center h-24 text-slate-700 text-xs font-medium italic">
                                        Nenhum lead
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
        </div>
    );
}
