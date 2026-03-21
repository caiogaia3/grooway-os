"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Search, ArrowRight, Zap, MapPin, Globe, Mail, Phone,
    ChevronDown, ChevronUp, Users, Star, Linkedin, Instagram, ExternalLink,
    CheckSquare, Square, ArrowRightCircle, Loader2, MessageCircle, GripVertical
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/core/lib/supabase/client';
import { startLeadsPipeline, getLeadsPipelineStatus, moverParaFunil } from '@/app/actions/leads_pipeline';

interface Contato {
    id: string;
    nome: string;
    cargo: string;
    linkedin_url: string;
    email_corporativo: string | null;
    email_confidence: number | null;
    status: string;
}

interface Empresa {
    id: string;
    nome: string;
    categoria: string;
    cidade: string;
    estado: string;
    telefone: string;
    nota: number | null;
    total_reviews: number | null;
    website_url: string;
    instagram_url: string;
    facebook_url: string;
    linkedin_url: string;
    whatsapp_url: string;
    emails: string[];
    ai_resumo: string;
    ai_diferenciais: string[];
    ai_score: number;
    status: string;
    status_funil: string | null;
    created_at: string;
    contatos_leads?: Contato[];
}

function ScoreBadge({ score }: { score: number }) {
    let color = 'from-slate-600 to-slate-800';
    let label = 'Baixo';
    if (score >= 70) {
        color = 'from-amber-500 to-yellow-600';
        label = 'Ouro';
    } else if (score >= 40) {
        color = 'from-slate-300 to-slate-500';
        label = 'Prata';
    } else if (score >= 20) {
        color = 'from-orange-700 to-orange-900';
        label = 'Bronze';
    }

    return (
        <div className="flex flex-col items-center">
            <div className={`text-xl font-black bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
                {score}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        </div>
    );
}

export default function ScraperPage() {
    const [segmento, setSegmento] = useState('');
    const [cidade, setCidade] = useState('');
    const [maxEmpresas, setMaxEmpresas] = useState(10);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState<string[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [userId, setUserId] = useState<string | null>(null);
    const [searchFilter, setSearchFilter] = useState('');
    const [movingToFunil, setMovingToFunil] = useState(false);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    const fetchEmpresas = useCallback(async () => {
        if (!userId) return;
        const { data, error } = await supabase
            .from('empresas_leads')
            .select('*, contatos_leads(*)')
            .eq('user_id', userId)
            .is('status_funil', null)
            .order('ai_score', { ascending: false });

        if (!error && data) {
            setEmpresas(data as Empresa[]);
        }
    }, [userId]);

    useEffect(() => {
        fetchEmpresas();
    }, [fetchEmpresas]);

    const handleStart = async () => {
        if (!segmento || !cidade || !userId) return;
        setIsRunning(true);
        setProgress([]);

        const result = await startLeadsPipeline({
            segmento,
            cidade,
            max_empresas: maxEmpresas,
            user_id: userId,
        });

        if (result.success) {
            startPolling(result.data.job_id);
        } else {
            setProgress([`Erro: ${result.error}`]);
            setIsRunning(false);
        }
    };

    const startPolling = (id: string) => {
        if (pollingRef.current) clearInterval(pollingRef.current);

        pollingRef.current = setInterval(async () => {
            const result = await getLeadsPipelineStatus(id);
            if (result.success) {
                setProgress(result.data.progress);
                if (result.data.status === 'completed' || result.data.status === 'failed') {
                    if (pollingRef.current) clearInterval(pollingRef.current);
                    setIsRunning(false);
                    fetchEmpresas();
                }
            }
        }, 2500);
    };

    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredEmpresas.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredEmpresas.map(e => e.id)));
        }
    };

    const handleMoverFunil = async (status_funil: string) => {
        if (selectedIds.size === 0 || !userId) return;
        setMovingToFunil(true);

        const result = await moverParaFunil({
            empresa_ids: Array.from(selectedIds),
            user_id: userId,
            status_funil,
        });

        if (result.success) {
            setSelectedIds(new Set());
            fetchEmpresas();
        }
        setMovingToFunil(false);
    };

    const filteredEmpresas = empresas.filter(e =>
        e.nome?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        e.categoria?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        e.cidade?.toLowerCase().includes(searchFilter.toLowerCase())
    );

    const stats = [
        { label: 'Empresas', value: empresas.length },
        { label: 'Enriquecidas', value: empresas.filter(e => e.status === 'enriquecido').length },
        { label: 'Contatos', value: empresas.reduce((acc, e) => acc + (e.contatos_leads?.length || 0), 0) },
        { label: 'Score Medio', value: empresas.length > 0 ? Math.round(empresas.reduce((acc, e) => acc + (e.ai_score || 0), 0) / empresas.length) : 0 },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 py-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-4"
                    >
                        <Database className="w-3 h-3" />
                        ABM Pipeline
                    </motion.div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        MINERADOR DE <span className="text-purple-400">LEADS B2B</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Prospecte empresas por nicho e cidade com enriquecimento AI.</p>
                </div>

                <Link
                    href="/scraper/funil"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 text-slate-300 hover:text-white font-bold text-sm transition-all"
                >
                    <GripVertical className="w-4 h-4" />
                    Ver Funil
                </Link>

                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400 font-bold">{selectedIds.size} selecionada(s)</span>
                        <button
                            onClick={() => handleMoverFunil('lead_novo')}
                            disabled={movingToFunil}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all disabled:opacity-50"
                        >
                            {movingToFunil ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightCircle className="w-4 h-4" />}
                            Mover para Funil
                        </button>
                    </div>
                )}
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="liquid-glass p-5 rounded-[24px] border border-white/5 bg-white/[0.02]"
                    >
                        <div className="text-2xl font-black text-white">{stat.value}</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Prospection Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02] shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-400 to-purple-600 opacity-50" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Segmento</label>
                        <input
                            type="text"
                            value={segmento}
                            onChange={(e) => setSegmento(e.target.value)}
                            placeholder="Ex: Clinicas Odontologicas"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-slate-600 font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Cidade</label>
                        <input
                            type="text"
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                            placeholder="Ex: Sao Paulo"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-slate-600 font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Max Empresas</label>
                        <input
                            type="number"
                            value={maxEmpresas}
                            onChange={(e) => setMaxEmpresas(Number(e.target.value))}
                            min={1}
                            max={50}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white font-medium"
                        />
                    </div>
                    <button
                        onClick={handleStart}
                        disabled={!segmento || !cidade || isRunning || !userId}
                        className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${
                            isRunning
                                ? 'bg-purple-900/50 text-purple-300 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                        }`}
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Minerando...
                            </>
                        ) : (
                            <>
                                Prospectar
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Progress Log */}
            {progress.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="liquid-glass p-6 rounded-[24px] border border-white/5 bg-white/[0.02] max-h-48 overflow-y-auto"
                >
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-purple-400" />
                        Pipeline Log
                    </div>
                    <div className="space-y-1">
                        {progress.map((msg, i) => (
                            <div key={i} className="text-xs text-slate-400 font-mono flex items-start gap-2">
                                <span className="text-purple-500/50 shrink-0">&gt;</span>
                                {msg}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Results Table */}
            {empresas.length > 0 && (
                <>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            placeholder="Filtrar empresas..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder-slate-600"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="liquid-glass rounded-[32px] border border-white/5 bg-white/[0.01] overflow-hidden shadow-2xl"
                    >
                        {/* Table Header */}
                        <div className="grid grid-cols-[40px_2fr_1fr_80px_80px_60px] items-center px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                            <button onClick={toggleSelectAll} className="text-slate-500 hover:text-purple-400 transition-colors">
                                {selectedIds.size === filteredEmpresas.length && filteredEmpresas.length > 0 ? (
                                    <CheckSquare className="w-4 h-4" />
                                ) : (
                                    <Square className="w-4 h-4" />
                                )}
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Empresa</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cidade</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Nota</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Score</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Info</span>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredEmpresas.map((empresa, idx) => (
                                    <div key={empresa.id}>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className={`grid grid-cols-[40px_2fr_1fr_80px_80px_60px] items-center px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                                                selectedIds.has(empresa.id) ? 'bg-purple-500/5' : ''
                                            }`}
                                            onClick={() => setExpandedId(expandedId === empresa.id ? null : empresa.id)}
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleSelect(empresa.id); }}
                                                className="text-slate-500 hover:text-purple-400 transition-colors"
                                            >
                                                {selectedIds.has(empresa.id) ? (
                                                    <CheckSquare className="w-4 h-4 text-purple-400" />
                                                ) : (
                                                    <Square className="w-4 h-4" />
                                                )}
                                            </button>

                                            <div>
                                                <div className="font-bold text-white text-sm">{empresa.nome}</div>
                                                <div className="text-[10px] text-slate-500 font-medium">
                                                    {empresa.categoria}
                                                    {empresa.website_url && (
                                                        <span className="ml-2 text-purple-500/50">{empresa.website_url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-sm text-slate-400 flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3 text-slate-600" />
                                                {empresa.cidade}{empresa.estado ? `, ${empresa.estado}` : ''}
                                            </div>

                                            <div className="text-center">
                                                {empresa.nota ? (
                                                    <div className="flex items-center justify-center gap-1 text-sm">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                        <span className="font-bold text-white">{empresa.nota}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-700">---</span>
                                                )}
                                            </div>

                                            <div className="flex justify-center">
                                                <ScoreBadge score={empresa.ai_score || 0} />
                                            </div>

                                            <div className="flex justify-center">
                                                {expandedId === empresa.id ? (
                                                    <ChevronUp className="w-4 h-4 text-slate-500" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-slate-500" />
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Expanded Details */}
                                        <AnimatePresence>
                                            {expandedId === empresa.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-white/[0.01] border-t border-white/5"
                                                >
                                                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        {/* Contact Info */}
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contato</h4>
                                                            {empresa.telefone && (
                                                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                                                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                                                                    {empresa.telefone}
                                                                </div>
                                                            )}
                                                            {empresa.emails?.length > 0 && empresa.emails.map((email, i) => (
                                                                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                                                                    {email}
                                                                </div>
                                                            ))}
                                                            <div className="flex items-center gap-3 pt-2">
                                                                {empresa.website_url && (
                                                                    <a href={empresa.website_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors" title="Site">
                                                                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                                                                    </a>
                                                                )}
                                                                {empresa.instagram_url && (
                                                                    <a href={empresa.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-pink-500/30 transition-colors" title="Instagram">
                                                                        <Instagram className="w-3.5 h-3.5 text-slate-400" />
                                                                    </a>
                                                                )}
                                                                {empresa.linkedin_url && (
                                                                    <a href={empresa.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors" title="LinkedIn">
                                                                        <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                                                                    </a>
                                                                )}
                                                                {empresa.whatsapp_url && (
                                                                    <a href={empresa.whatsapp_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors" title="WhatsApp">
                                                                        <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* AI Analysis */}
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Analise AI</h4>
                                                            {empresa.ai_resumo && (
                                                                <p className="text-sm text-slate-300 leading-relaxed">{empresa.ai_resumo}</p>
                                                            )}
                                                            {empresa.ai_diferenciais?.length > 0 && (
                                                                <div className="space-y-1.5">
                                                                    {empresa.ai_diferenciais.slice(0, 3).map((dif, i) => (
                                                                        <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                                                                            <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                                                            {dif}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Decision Makers */}
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                                <Users className="w-3 h-3" />
                                                                Tomadores de Decisao ({empresa.contatos_leads?.length || 0})
                                                            </h4>
                                                            {empresa.contatos_leads?.map((contato) => (
                                                                <div key={contato.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-bold text-white">{contato.nome}</span>
                                                                        {contato.linkedin_url && (
                                                                            <a href={contato.linkedin_url} target="_blank" rel="noopener noreferrer">
                                                                                <ExternalLink className="w-3 h-3 text-blue-400 hover:text-blue-300" />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-500 font-medium">{contato.cargo}</div>
                                                                    {contato.email_corporativo && (
                                                                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                                                                            <Mail className="w-3 h-3" />
                                                                            {contato.email_corporativo}
                                                                            {contato.email_confidence && (
                                                                                <span className="text-[9px] text-slate-500 ml-1">({contato.email_confidence}%)</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {(!empresa.contatos_leads || empresa.contatos_leads.length === 0) && (
                                                                <div className="text-xs text-slate-600 italic">Nenhum contato encontrado</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredEmpresas.length === 0 && (
                            <div className="p-16 text-center space-y-4">
                                <Database className="w-10 h-10 text-slate-800 mx-auto" />
                                <h3 className="text-slate-600 font-bold uppercase tracking-widest text-sm">Nenhuma empresa encontrada</h3>
                            </div>
                        )}
                    </motion.div>
                </>
            )}

            {/* Empty State */}
            {empresas.length === 0 && !isRunning && progress.length === 0 && (
                <div className="py-20 text-center">
                    <div className="w-24 h-24 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center">
                        <Database className="w-10 h-10 text-slate-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Pronto para prospectar</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Digite um segmento e cidade acima para minerar leads B2B com enriquecimento AI automatico.
                    </p>
                </div>
            )}

            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
        </div>
    );
}
