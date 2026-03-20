"use client";
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Edit3,
    ChevronDown,
    ChevronUp,
    Crosshair,
    Tag,
    FileText,
    Zap,
    AlertTriangle,
    Rocket,
    X,
} from 'lucide-react';

// Mock campaign structure — will come from generateCampaign server action
const MOCK_CAMPAIGN = {
    resumo_estrategico: "Campanha de captacao de leads para Clinica Sorriso focando em implantes dentarios e lentes de contato dental em Belo Horizonte. Estrategia de busca com keywords de alta intencao e copies focadas em parcelamento sem juros.",
    campanhas: [
        {
            nome: "Implante Dentario - BH - Leads",
            tipo: "Search",
            objetivo: "Leads",
            budget_diario: 100,
            estrategia_lances: "CPA alvo",
            localizacao: "Belo Horizonte",
            grupos_anuncios: [
                {
                    nome: "Implante - Intencao Alta",
                    keywords: [
                        { termo: "implante dentario belo horizonte", match_type: "exact", intencao: "Compra" },
                        { termo: "preco implante dentario bh", match_type: "phrase", intencao: "Compra" },
                        { termo: "melhor dentista implante bh", match_type: "phrase", intencao: "Pesquisa" },
                        { termo: "implante dentario parcelado", match_type: "broad", intencao: "Compra" },
                    ],
                    anuncios: [
                        {
                            headline_1: "Implante Dentario em BH",
                            headline_2: "Ate 48x Sem Juros",
                            headline_3: "Agende sua Avaliacao",
                            description_1: "Implantes com tecnologia de ponta. Avaliacao gratuita. Parcele em ate 48x.",
                            description_2: "Clinica Sorriso: especialistas em implantes ha 15 anos. Ligue agora!",
                            cta: "Agende Gratis",
                        },
                    ],
                    extensoes: {
                        sitelinks: ["Implantes", "Lentes Dentais", "Avaliacao Gratis", "Depoimentos"],
                        callouts: ["Ate 48x sem juros", "Avaliacao Gratuita", "15 anos de experiencia"],
                    },
                },
                {
                    nome: "Lente de Contato Dental - BH",
                    keywords: [
                        { termo: "lente de contato dental bh", match_type: "exact", intencao: "Compra" },
                        { termo: "faceta porcelana belo horizonte", match_type: "phrase", intencao: "Pesquisa" },
                        { termo: "sorriso perfeito dentista bh", match_type: "broad", intencao: "Descoberta" },
                    ],
                    anuncios: [
                        {
                            headline_1: "Lentes Dentais em BH",
                            headline_2: "Sorriso dos Sonhos",
                            headline_3: "Resultado Natural",
                            description_1: "Lentes de contato dental com resultado natural e duradouro. Agende!",
                            description_2: "Transforme seu sorriso na Clinica Sorriso. Parcelamento facilitado.",
                            cta: "Quero Meu Sorriso",
                        },
                    ],
                    extensoes: {
                        sitelinks: ["Lentes Dentais", "Antes e Depois", "Valores"],
                        callouts: ["Resultado Natural", "Parcelamos", "Atendimento VIP"],
                    },
                },
            ],
            keywords_negativas: ["gratuito", "curso", "emprego", "vagas", "como fazer em casa"],
        },
    ],
    estimativas: {
        cpc_medio_estimado: "R$ 3,50",
        leads_estimados_mes: "25 a 50 leads",
        cpl_estimado: "R$ 60 a R$ 120 por lead",
    },
    recomendacoes_pre_aprovacao: [
        "Verifique se a landing page tem formulario de captura visivel",
        "Configure conversoes no Google Tag Manager antes de ativar",
        "Revise os headlines — personalize com nome/diferencial real",
    ],
};

export default function ReviewPage() {
    const { clienteId } = useParams<{ clienteId: string }>();
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [isApproving, setIsApproving] = useState(false);
    const [approved, setApproved] = useState(false);

    const campaign = MOCK_CAMPAIGN;

    const toggleGroup = (name: string) => {
        setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const handleApprove = async () => {
        setIsApproving(true);
        await new Promise((r) => setTimeout(r, 1500));
        setApproved(true);
        setIsApproving(false);
    };

    const matchTypeColors: Record<string, string> = {
        exact: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        phrase: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        broad: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };

    return (
        <div className="space-y-8 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">
                        Review de Campanha
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tighter mt-1">
                        {campaign.campanhas[0]?.nome || 'Campanha'}
                    </h1>
                    <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                        {campaign.resumo_estrategico}
                    </p>
                </div>
                {!approved && (
                    <button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0"
                    >
                        {isApproving ? (
                            <span className="animate-pulse">Aprovando...</span>
                        ) : (
                            <>
                                <Rocket className="w-4 h-4" />
                                Aprovar e Subir
                            </>
                        )}
                    </button>
                )}
                {approved && (
                    <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Campanha Aprovada
                    </div>
                )}
            </div>

            {/* Estimativas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(campaign.estimativas).map(([key, value]) => {
                    const labels: Record<string, string> = {
                        cpc_medio_estimado: 'CPC Medio',
                        leads_estimados_mes: 'Leads/Mes',
                        cpl_estimado: 'Custo por Lead',
                    };
                    return (
                        <div key={key} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                {labels[key] || key}
                            </span>
                            <p className="text-lg font-black text-white mt-1">{value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Campanhas */}
            {campaign.campanhas.map((camp) => (
                <div key={camp.nome} className="space-y-4">
                    {/* Campaign Header */}
                    <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <Crosshair className="w-5 h-5 text-purple-400" />
                                <h2 className="text-lg font-black text-white">{camp.nome}</h2>
                            </div>
                            <div className="flex gap-4 mt-2">
                                <span className="text-xs text-slate-400">Tipo: <strong className="text-white">{camp.tipo}</strong></span>
                                <span className="text-xs text-slate-400">Budget: <strong className="text-white">R${camp.budget_diario}/dia</strong></span>
                                <span className="text-xs text-slate-400">Lances: <strong className="text-white">{camp.estrategia_lances}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Ad Groups */}
                    {camp.grupos_anuncios.map((grupo) => {
                        const isExpanded = expandedGroups[grupo.nome] !== false; // default expanded
                        return (
                            <motion.div
                                key={grupo.nome}
                                className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden"
                            >
                                {/* Group Header */}
                                <button
                                    onClick={() => toggleGroup(grupo.nome)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-4 h-4 text-cyan-400" />
                                        <span className="text-sm font-black text-white">{grupo.nome}</span>
                                        <span className="text-[10px] text-slate-500 font-bold">
                                            {grupo.keywords.length} keywords | {grupo.anuncios.length} anuncio(s)
                                        </span>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                </button>

                                {isExpanded && (
                                    <div className="px-5 pb-5 space-y-5 border-t border-white/5 pt-4">
                                        {/* Keywords */}
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Keywords</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {grupo.keywords.map((kw, i) => (
                                                    <span
                                                        key={i}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${matchTypeColors[kw.match_type] || 'text-slate-300 bg-white/5 border-white/10'}`}
                                                    >
                                                        {kw.match_type === 'exact' && `[${kw.termo}]`}
                                                        {kw.match_type === 'phrase' && `"${kw.termo}"`}
                                                        {kw.match_type === 'broad' && kw.termo}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Anuncios */}
                                        {grupo.anuncios.map((ad, adIdx) => (
                                            <div key={adIdx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Anuncio {adIdx + 1}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-blue-400 text-base font-bold">{ad.headline_1} | {ad.headline_2} | {ad.headline_3}</p>
                                                    <p className="text-sm text-slate-300">{ad.description_1}</p>
                                                    <p className="text-sm text-slate-400">{ad.description_2}</p>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2">
                                                    <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                                        {ad.cta}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Extensoes */}
                                        {grupo.extensoes && (
                                            <div className="grid grid-cols-2 gap-3">
                                                {grupo.extensoes.sitelinks.length > 0 && (
                                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sitelinks</span>
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {grupo.extensoes.sitelinks.map((s, i) => (
                                                                <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-slate-300">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {grupo.extensoes.callouts.length > 0 && (
                                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Callouts</span>
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {grupo.extensoes.callouts.map((c, i) => (
                                                                <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-slate-300">{c}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}

                    {/* Keywords Negativas */}
                    <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                        <div className="flex items-center gap-2 mb-2">
                            <X className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Keywords Negativas</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {camp.keywords_negativas.map((kw, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-300 text-xs font-bold border border-red-500/20">
                                    -{kw}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            {/* Recomendacoes */}
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Antes de Aprovar</span>
                </div>
                <ul className="space-y-2">
                    {campaign.recomendacoes_pre_aprovacao.map((rec, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300">
                            <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-amber-500/20">
                                {i + 1}
                            </span>
                            {rec}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
