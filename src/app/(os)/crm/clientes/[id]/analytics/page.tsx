"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  PieChart,
  ArrowUpRight,
  MessageSquare,
  Zap,
  ChevronDown,
  Calendar,
  Filter,
  Maximize2,
  Sparkles,
  Search,
  Plus,
  Brain
} from "lucide-react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { getClientMetrics } from "../../../../../actions/client_metrics";
import { askGeminiAnalytics } from "../../../../../actions/ask_gemini_analytics";

export default function ClientAnalyticsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"report" | "analyst">("report");
  const [aiQuery, setAiQuery] = useState("");
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);

  const LOOKER_URL = "https://lookerstudio.google.com/embed/reporting/6577fa33-cf6c-44c4-8b94-dcc26630a9a5/page/p_ffqfubejnd";

  const handleGeminiQuery = async (predefinedQuery?: string) => {
    const queryToUse = predefinedQuery || aiQuery;
    if (!queryToUse.trim()) return;

    setAiQuery(queryToUse);
    setGeminiLoading(true);
    setGeminiResponse(null);

    const res = await askGeminiAnalytics(queryToUse, metrics);
    if (res.success && res.text) {
      setGeminiResponse(res.text);
    } else {
      setGeminiResponse("Desculpe, não consegui processar a análise no momento. Tente novamente.");
    }
    setGeminiLoading(false);
  };

  useEffect(() => {
    async function loadData() {
      const response = await getClientMetrics(params.id);
      if (response && response.success) {
        setMetrics(response.data);
      }
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-blue-500 animate-ping"></div>
      </div>
    );
  }

  // Map the backend data to the UI widget format
  const topWidgets = [
    { label: "Investimento Total", value: `R$ ${(metrics?.meta?.spend_brl || 0) + (metrics?.google?.spend_brl || 0)}`, change: "+12.4%", color: "text-blue-400", trend: "up" },
    { label: "Oportunidades (Sheets)", value: metrics?.conversions?.total || 0, change: "+8.3%", color: "text-emerald-400", trend: "up" },
    { label: "CPA Médio Real", value: `R$ ${metrics?.conversions?.cpl_brl || 0}`, change: "-5.2%", color: "text-purple-400", trend: "down" },
    { label: "ROI Multiplicador", value: `${metrics?.roi_multiplier || 0}x`, change: "+41.7%", color: "text-orange-400", trend: "up" },
    { label: "Taxa de Conversão", value: "39,67%", change: "+16.6%", color: "text-pink-400", trend: "up" },
  ];

  return (
    <div className="min-h-screen bg-[#050508] p-4 lg:p-6 text-white font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 tracking-wider uppercase">
              Premium Analytics
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Marketing Intelligence</h1>
          </div>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Interface Híbrida Ativa • <span className="opacity-70 italic truncate">Brisa Laser</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setActiveTab("report")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${activeTab === 'report' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Relatório Real
          </button>
          <button
            onClick={() => setActiveTab("analyst")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${activeTab === 'analyst' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Brain className="w-4 h-4" />
            Analista IA
          </button>
        </div>
      </div>

      {activeTab === "report" ? (
        /* Report View - Full Viewport Iframe */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 min-h-[700px] bg-white/5 border border-white/10 rounded-[32px] overflow-hidden relative group"
        >
          <iframe
            src={LOOKER_URL}
            className="w-full h-full border-none"
            allowFullScreen
            loading="lazy"
          />
          {/* Subtle Overlay Glow */}
          <div className="absolute inset-0 pointer-events-none border-[12px] border-[#050508] rounded-[32px] z-10" />
        </motion.div>
      ) : (
        /* AI Analyst View - Keep existing widgets and Gemini console */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 overflow-y-auto pr-2 no-scrollbar"
        >
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topWidgets.map((m, i) => (
              <div key={i} className="p-6 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-3xl">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">{m.label}</p>
                <h3 className={`text-xl font-black tracking-tighter ${m.color}`}>{m.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gemini AI Console */}
            <div className="lg:col-span-7 bg-[#0b0b14] border border-blue-500/20 rounded-[32px] p-8 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight uppercase">AI Command Center</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Consulte o Analista de Performance</p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ex: 'Avalie a tendência do CPL nesta semana e sugira ajustes de público...'"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 pb-16 text-sm focus:outline-none focus:border-blue-500/50 min-h-[150px] transition-all"
                />
                <button
                  onClick={() => handleGeminiQuery()}
                  disabled={geminiLoading}
                  className="absolute bottom-4 right-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all text-xs font-black uppercase">
                  {geminiLoading ? 'Analisando...' : 'Pedir Diagnóstico'}
                </button>
              </div>

              {geminiResponse && (
                <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-sm prose prose-invert max-w-none">
                  <ReactMarkdown>{geminiResponse}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Right Column: Demographics & Sources */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                  <PieChart className="w-4 h-4 text-indigo-400" />
                  Demografia de Campanha
                </h3>
                <div className="flex items-center gap-6">
                  {/* Mini Donut */}
                  <div className="relative w-20 h-20 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#1c1c2b" strokeWidth="6" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="transparent" stroke="#3B82F6" strokeWidth="6"
                        strokeDasharray={`${metrics?.meta?.demographics?.Feminino || 50} 100`}
                      />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-slate-400">Feminino</span>
                      <span>{(metrics?.meta?.demographics?.Feminino || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-slate-400">Masculino</span>
                      <span>{(metrics?.meta?.demographics?.Masculino || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-8">
                <h3 className="text-xs font-bold uppercase text-white/70 mb-2">ROI Global Estimado</h3>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black">{metrics?.roi_multiplier || 0}x</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full mb-2 uppercase font-black tracking-tighter cursor-default">+12% vs last month</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Luxury Footer Indicator */}
      <div className="mt-auto pt-8 flex justify-between items-center opacity-30 shrink-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.5em]">GroowayOS Performance Engine • v2.2.0 Hybrid</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-[8px] font-black uppercase">Meta Ads API</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
            <span className="text-[8px] font-black uppercase">Google Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
