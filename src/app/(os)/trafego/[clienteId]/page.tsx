"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Crosshair,
    Sparkles,
    Loader2,
    Building2,
    MapPin,
    Target,
    DollarSign,
    Users,
    Star,
    ArrowRight,
} from 'lucide-react';

// Mock ICP data — will come from Supabase client_icp table
const MOCK_ICP: Record<string, any> = {
    '1': {
        nome_fantasia: 'Clinica Sorriso',
        segmento: 'odontologia',
        cidade: 'Belo Horizonte',
        site_url: 'https://clinicasorriso.com.br',
        publico_alvo: 'Adultos 25-55 anos, classe B/C, buscando tratamentos estéticos e implantes',
        principal_diferencial: 'Pagamento em até 48x sem juros, atendimento humanizado',
        produto_servico_principal: 'Implante dentário e lente de contato dental',
        objetivo_principal: 'gerar leads',
        budget_mensal_google: 3000,
    },
    '2': {
        nome_fantasia: 'Imob Prime',
        segmento: 'imobiliaria',
        cidade: 'São Paulo',
        site_url: 'https://imobprime.com.br',
        publico_alvo: 'Famílias 30-50 anos, renda acima de 10k, buscando imóveis de alto padrão',
        principal_diferencial: 'Empreendimentos exclusivos em bairros nobres',
        produto_servico_principal: 'Apartamentos alto padrão',
        objetivo_principal: 'gerar leads',
        budget_mensal_google: 5000,
    },
    '3': {
        nome_fantasia: 'Studio Fit',
        segmento: 'academia',
        cidade: 'Curitiba',
        site_url: '',
        publico_alvo: 'Jovens 18-35 anos buscando qualidade de vida',
        principal_diferencial: 'Treino personalizado com acompanhamento via app',
        produto_servico_principal: 'Plano mensal de musculação + personal',
        objetivo_principal: 'gerar leads',
        budget_mensal_google: 1500,
    },
};

export default function ClienteTrafegoPage() {
    const { clienteId } = useParams<{ clienteId: string }>();
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);

    const icp = MOCK_ICP[clienteId] || MOCK_ICP['1'];

    const handleGerarCampanha = async () => {
        setIsGenerating(true);
        // Simula chamada ao backend (será generateCampaign server action)
        await new Promise((r) => setTimeout(r, 2000));
        router.push(`/trafego/${clienteId}/review`);
    };

    const icpFields = [
        { label: 'Segmento', value: icp.segmento, icon: Building2 },
        { label: 'Cidade', value: icp.cidade, icon: MapPin },
        { label: 'Objetivo', value: icp.objetivo_principal, icon: Target },
        { label: 'Budget Google', value: `R$ ${icp.budget_mensal_google?.toLocaleString()}/mes`, icon: DollarSign },
        { label: 'Publico-alvo', value: icp.publico_alvo, icon: Users },
        { label: 'Diferencial', value: icp.principal_diferencial, icon: Star },
    ];

    return (
        <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">
                        Painel de Trafego
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tighter mt-1">
                        {icp.nome_fantasia}
                    </h1>
                    {icp.site_url && (
                        <p className="text-sm text-slate-500 font-medium mt-1">{icp.site_url}</p>
                    )}
                </div>
                <button
                    onClick={handleGerarCampanha}
                    disabled={isGenerating}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-purple-800 disabled:to-purple-700 text-white rounded-2xl font-black text-sm transition-all cursor-pointer shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Gerando Campanha...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Gerar Campanha com IA
                        </>
                    )}
                </button>
            </div>

            {/* ICP Card */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Crosshair className="w-4 h-4 text-purple-400" />
                        Perfil do Cliente (ICP)
                    </h2>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/5">
                        Dados pre-preenchidos
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {icpFields.map((field, idx) => (
                        <motion.div
                            key={field.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/10 transition-colors"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <field.icon className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {field.label}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-white leading-relaxed">
                                {field.value || '-'}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Produto Principal — destaque */}
                <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                        Produto/Servico Principal
                    </span>
                    <p className="text-base font-bold text-white mt-2">
                        {icp.produto_servico_principal || '-'}
                    </p>
                </div>
            </div>

            {/* CTA */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 to-transparent border border-purple-500/10 flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-white">Pronto para gerar?</p>
                    <p className="text-xs text-slate-400 mt-1">
                        O agente de IA vai criar campanhas, grupos, keywords e copies baseados no ICP acima.
                    </p>
                </div>
                <button
                    onClick={handleGerarCampanha}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                    Gerar <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
