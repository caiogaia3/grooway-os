"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, Filter, Download, Zap, Building2, MapPin, Globe, ArrowRight } from 'lucide-react';

export default function ScraperPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const handleScrape = () => {
        if (!searchQuery) return;
        setIsScraping(true);
        // Simulate scraping
        setTimeout(() => {
            setResults([
                { id: 1, name: 'Tech Solutions Inc', industry: 'Software', location: 'São Paulo, SP', email: 'contato@techsolutions.com', phone: '(11) 9999-9999', score: 92 },
                { id: 2, name: 'Logística Avançada BR', industry: 'Logistics', location: 'Campinas, SP', email: 'comercial@logbr.com.br', phone: '(11) 8888-8888', score: 85 },
                { id: 3, name: 'Construtora Horizonte', industry: 'Construction', location: 'Rio de Janeiro, RJ', email: 'vendas@horizonte.com', phone: '(21) 7777-7777', score: 78 },
            ]);
            setIsScraping(false);
        }, 3000);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4"
                    >
                        <Database className="w-3 h-3" />
                        Data Extraction
                    </motion.div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        SCRAPER DE <span className="text-slate-400">LEADS B2B</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Motor de extração inteligente focado no seu Ideal Customer Profile.</p>
                </div>

                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all">
                        <Filter className="w-4 h-4" />
                        Filtros Avançados
                    </button>
                    {results.length > 0 && (
                        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all shadow-lg">
                            <Download className="w-4 h-4" />
                            Exportar
                        </button>
                    )}
                </div>
            </header>

            {/* Search Bar section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02] shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-500 via-gray-400 to-slate-600 opacity-50" />

                <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Ex: Clínicas odontológicas em São Paulo..."
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-lg focus:outline-none focus:border-slate-500 transition-all text-white placeholder-slate-600 font-medium"
                            onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                        />
                    </div>
                    <button
                        onClick={handleScrape}
                        disabled={!searchQuery || isScraping}
                        className={`flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${isScraping
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-white text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                            }`}
                    >
                        {isScraping ? (
                            <>
                                <Zap className="w-5 h-5 animate-pulse text-slate-400" />
                                <span className="animate-pulse">Minerando...</span>
                            </>
                        ) : (
                            <>
                                Executar
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Results Section */}
            {results.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {results.map((lead, idx) => (
                        <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="liquid-glass p-6 rounded-[28px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-white/10 group-hover:border-slate-400/50 transition-colors">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-black text-white">{lead.score}</span>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Score</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-slate-300 transition-colors">{lead.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium mb-6">
                                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs">{lead.industry}</span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                    {lead.location}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <Globe className="w-4 h-4 text-slate-500" />
                                    {lead.email}
                                </div>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors text-sm uppercase tracking-widest">
                                Adicionar ao Leads
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            ) : !isScraping ? (
                <div className="py-20 text-center">
                    <div className="w-24 h-24 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center">
                        <Database className="w-10 h-10 text-slate-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Pronto para extrair</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Digite um nicho e localização acima para começar a minerar leads B2B altamente qualificados.
                    </p>
                </div>
            ) : null}

            {/* Background Details */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-500/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
        </div>
    );
}
