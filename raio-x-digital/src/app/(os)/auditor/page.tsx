"use client";
// Cache bust to force Next.js Turbopack HMR reload

import { useState, useEffect } from 'react';
import { Search, Loader2, Target, Smartphone, Database, Instagram, Activity, AlertTriangle, ArrowRight, Briefcase, XCircle, X, Play, MapPin, Shield, Clock, ExternalLink, BarChart3, MessageSquare, Camera, KeyRound, CheckCircle2, Phone, Users, FileText, Star, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { runPythonOrchestrator, PythonReport } from '@/features/xray-auditor/actions/run_python';
import { generateProposal, CommercialPlan } from '@/features/xray-auditor/actions/generate_proposal';
import { saveReportLocally } from '@/features/xray-auditor/actions/save_report';
import { getAuditHistory, AuditHistoryItem } from '@/features/xray-auditor/actions/get_history';
import { loadReportById } from '@/features/xray-auditor/actions/load_report';
import { getValuePropositionFromReport, ValuePropositionData } from '@/features/xray-auditor/actions/get_value_proposition';
import { ValuePropositionModal } from '@/features/xray-auditor/components/ValuePropositionModal';
import { DiagnosticPDF } from '@/components/export/DiagnosticPDF';
import { ProposalPDF } from '@/components/export/ProposalPDF';
import { useRouter } from 'next/navigation';
import { generateProposalFromDiagnostic } from '@/features/proposals/actions/generate_proposal_action';

type AppState = 'input' | 'analyzing' | 'result';

export default function DigitalPredatorScanner() {
  const [appState, setAppState] = useState<AppState>('input');
  const [url, setUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [activeTab, setActiveTab] = useState('tracking');
  const [instagram, setInstagram] = useState('');

  const AVAILABLE_AGENTS = [
    { id: 'tracking', label: 'Tracking & Infraestrutura', default: true },
    { id: 'performance', label: 'UX & SEO Técnico', default: true },
    { id: 'market', label: 'Pesquisa de Mercado', default: true },
    { id: 'social', label: 'Mapeamento Social', default: true },
    { id: 'gmb', label: 'Google Meu Negócio', default: true },
    { id: 'keywords', label: 'Palavras-Chave & Ads', default: true },
  ];

  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    AVAILABLE_AGENTS.filter(a => a.default).map(a => a.id)
  );

  const [progress, setProgress] = useState(0);
  const [analysisText, setAnalysisText] = useState('Autenticando...');

  // Data retrieved from Python Orchestrator
  const [reportData, setReportData] = useState<PythonReport | null>(null);
  const [error, setError] = useState('');

  // Proposta Comercial Gerada via IA NextJS
  const [commercialPlan, setCommercialPlan] = useState<CommercialPlan | null>(null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [isGeneratingGroowayProposal, setIsGeneratingGroowayProposal] = useState(false);
  const router = useRouter();

  const handleCreateGroowayProposal = async () => {
    if (!reportData) return;
    setIsGeneratingGroowayProposal(true);
    try {
      let currentReportId = reportData.id;

      if (!currentReportId) {
        const savedResult = await saveReportLocally(reportData, companyName);
        if (savedResult) {
          currentReportId = savedResult.id;
          setReportData({ ...reportData, id: savedResult.id });
        } else {
          throw new Error("Falha ao salvar relatório no banco de dados.");
        }
      }

      const generated = await generateProposalFromDiagnostic(currentReportId);
      if (generated && generated.id) {
        router.push(`/proposals/${generated.id}/edit`);
      } else {
        alert("Erro interno ao gerar a Proposta Premium (Grooway Proposals).");
      }
    } catch (e) {
      console.error(e);
      alert("Ocorreu um erro ao gerar a proposta.");
    }
    setIsGeneratingGroowayProposal(false);
  };

  // Compartilhamento
  const [isSaving, setIsSaving] = useState(false);
  const [shareLink, setShareLink] = useState('');

  // Proposta de Valor
  const [showValueProposition, setShowValueProposition] = useState(false);
  const [valuePropositionData, setValuePropositionData] = useState<ValuePropositionData | null>(null);
  const [isLoadingVP, setIsLoadingVP] = useState(false);

  // Diagnostic Modal
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);

  // Histórico de Auditorias
  const [auditHistory, setAuditHistory] = useState<AuditHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    getAuditHistory().then(setAuditHistory).catch(console.error);
  }, []);


  const analysisSteps = [
    { threshold: 10, text: 'Acionando Skill: Tracking & Data...' },
    { threshold: 30, text: 'Minerando tags, Pixels e GTM no DOM...' },
    { threshold: 45, text: 'Acionando Skill: Performance UX/SEO...' },
    { threshold: 60, text: 'Calculando TTFB e varrendo atributos HTML...' },
    { threshold: 80, text: 'Acionando Skill: Memória Estratégica (Gemini)...' },
    { threshold: 95, text: 'Analisando nicho e dores do segmento...' },
    { threshold: 100, text: 'Compilando Dossiê Premium...' }
  ];

  const handleLoadFromHistory = async (reportId: string) => {
    setAppState('analyzing');
    setProgress(50);
    setShowHistory(false);
    try {
      const report = await loadReportById(reportId);
      if (report) {
        setReportData(report);
        setUrl(report.target_url || '');
        setAppState('result');
        setActiveTab('tracking');
      } else {
        setError('Relatório não encontrado no banco de dados.');
        setAppState('input');
      }
    } catch (e) {
      console.error(e);
      setError('Erro ao carregar relatório do histórico.');
      setAppState('input');
    }
    setProgress(100);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setAppState('analyzing');
    setProgress(0);
    setError('');
    setReportData(null);

    let isApiDone = false;
    let localReport: PythonReport | null = null;
    let localError = '';

    runPythonOrchestrator({
      url,
      companyName,
      city,
      instagram,
      selectedAgents
    }).then(result => {
      localReport = result;
      isApiDone = true;
    }).catch(err => {
      localError = err.message;
      isApiDone = true;
    });

    const interval = setInterval(() => {
      setProgress((prev) => {
        let next = prev + (Math.random() * 5 + 1);

        if (!isApiDone && next > 95) {
          next = 95;
          setAnalysisText('Aguardando retorno do Cérebro Neural...');
        } else if (isApiDone) {
          next += 15;
        }

        if (next >= 100) {
          next = 100;
          clearInterval(interval);
          setTimeout(() => {
            if (localError) setError(localError);
            else if (localReport) setReportData(localReport);
            setAppState('result');
          }, 800);
        }

        if (next <= 95) {
          const currentStep = analysisSteps.findLast(step => next >= step.threshold);
          if (currentStep) setAnalysisText(currentStep.text);
        }

        return next;
      });
    }, 400);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">Score: {score}</span>;
    if (score >= 50) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Score: {score}</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">Score: {score}</span>;
  };

  const trackingSkill = reportData?.skills_results.find(s => s.name === "Tracking & Data Agent");
  const performanceSkill = reportData?.skills_results.find(s => s.name?.includes("Audit UX/SEO Agent"));
  const marketSkill = reportData?.skills_results.find(s => s.name === "Market Research & Intelligence");
  const socialSkill = reportData?.skills_results.find(s => s.name === "Social Media Agent (Apify + AI)");
  const gmbSkill = reportData?.skills_results.find(s => s.name === "Google My Business Auditor (Local SEO)");
  const cmoSkill = reportData?.skills_results.find(s => s.name === "Senior CMO Agent (Business & Sales)");
  const keywordSkill = reportData?.skills_results.find(s => s.name === "Keyword Research Agent");
  const designSkill = reportData?.skills_results.find(s => s.name === "O General do Design & Arquiteto Visionário") || reportData?.skills_results.find(s => s.name?.includes("Design"));

  const [isGeneratingDiagnosticPDF, setIsGeneratingDiagnosticPDF] = useState(false);
  const [isGeneratingProposalPDF, setIsGeneratingProposalPDF] = useState(false);

  const handleGenerateDiagnosticPDF = async () => {
    if (!reportData) return;
    setIsGeneratingDiagnosticPDF(true);
    // Pequeno delay para garantir renderização antes do print
    setTimeout(() => {
      window.print();
      setIsGeneratingDiagnosticPDF(false);
    }, 500);
  };

  const handleGenerateProposalPDF = async () => {
    if (!reportData) return;
    setIsGeneratingProposalPDF(true);
    // Tenta gerar a proposta via IA caso não exista ainda
    if (!commercialPlan) {
      await handleGenerateProposal();
    }
    setTimeout(() => {
      window.print();
      setIsGeneratingProposalPDF(false);
    }, 500);
  };

  const handleGenerateProposal = async () => {
    if (!reportData) return;
    setIsGeneratingProposal(true);
    try {
      const proposal = await generateProposal(reportData);
      setCommercialPlan(proposal);
    } catch (e) {
      console.error(e);
    }
    setIsGeneratingProposal(false);
  };

  const handleShareReport = async () => {
    if (!reportData) return;
    setIsSaving(true);
    try {
      const savedResult = await saveReportLocally(reportData, companyName);
      if (savedResult) {
        const url = `${window.location.origin}/diagnostico/${savedResult.slug}`;
        setShareLink(url);

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
          } else {
            // Fallback: Tenta criar um elemento de input temporário
            const textArea = document.createElement("textarea");
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
          }
        } catch (clipboardError) {
          console.error("Failed to copy to clipboard:", clipboardError);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const handleOpenValueProposition = async () => {
    if (!reportData) return;
    if (!valuePropositionData) {
      setIsLoadingVP(true);
      try {
        const vp = await getValuePropositionFromReport(reportData);
        setValuePropositionData(vp);
      } catch (e) {
        console.error(e);
      }
      setIsLoadingVP(false);
    }
    setShowValueProposition(true);
  };

  // --- UI COMPONENTS FOR STANDARDIZATION ---

  const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
      <div className="relative inline-block w-full" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
        {children}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900 border border-white/10 text-white text-[11px] font-medium rounded-xl shadow-2xl backdrop-blur-md min-w-[180px] max-w-[240px] text-center"
            >
              {text}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const MetricCard = ({
    label,
    value,
    status,
    tooltip,
    subValue,
    variant = "default",
    icon: Icon
  }: {
    label: string,
    value: React.ReactNode,
    status?: boolean,
    tooltip: string,
    subValue?: string,
    variant?: "default" | "success" | "warning" | "error" | "purple" | "blue" | "fuchsia",
    icon?: any
  }) => {
    const variants = {
      default: "bg-black/40 border-white/5",
      success: "bg-emerald-500/5 border-emerald-500/20",
      warning: "bg-orange-500/5 border-orange-500/20",
      error: "bg-red-500/5 border-red-500/20",
      purple: "bg-brand-purple/5 border-brand-purple/20",
      blue: "bg-blue-500/5 border-blue-500/20",
      fuchsia: "bg-fuchsia-500/5 border-fuchsia-500/20",
    };

    return (
      <Tooltip text={tooltip}>
        <div className={`p-4 rounded-2xl border ${variants[variant]} text-center transition-all hover:bg-white/5 active:scale-95 cursor-help group h-full flex flex-col justify-center min-h-[100px]`}>
          <p className="text-slate-500 text-[10px] uppercase mb-1.5 font-black tracking-widest flex items-center justify-center gap-1.5 group-hover:text-slate-300 transition-colors">
            {Icon && <Icon className="w-3 h-3 opacity-60" />}
            {label}
          </p>
          <div className="flex flex-col items-center gap-0.5">
            <span className={`text-xl font-black tracking-tight ${status === true ? 'text-emerald-400' :
              status === false ? 'text-red-400' :
                variant === 'purple' ? 'text-brand-purple' :
                  variant === 'blue' ? 'text-blue-400' :
                    variant === 'fuchsia' ? 'text-fuchsia-400' : 'text-slate-200'
              }`}>
              {value}
            </span>
            {subValue && <span className="text-[10px] text-slate-500 font-mono opacity-80">{subValue}</span>}
          </div>
        </div>
      </Tooltip>
    );
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 font-sans relative overflow-hidden pb-32 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-hero-glow opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[120px] pointer-events-none" />



      <div className="w-full max-w-6xl z-10 pt-4">

        {/* Header Compacto */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-white drop-shadow-lg flex items-center gap-3">
              <Target className="w-8 h-8 text-brand-purple" />
              Diagnóstico Estratégico
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Auditoria profunda de presença digital, tráfego, SEO e vendas usando IA.
            </p>
          </div>

          {/* Header Controls (History) */}
          <div className="flex items-center gap-3">
            {auditHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl border border-white/10"
              >
                <Clock className="w-4 h-4 text-brand-purple" />
                Histórico Recente ({auditHistory.length})
              </button>
            )}
          </div>
        </div>

        {/* Formulário Fixo no Topo */}
        <form onSubmit={handleAnalyze} className="liquid-glass p-5 sm:p-6 !rounded-2xl shadow-xl backdrop-blur-xl relative mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end text-left">
            <div className="lg:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Site Institucional</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  required
                  placeholder="https://suaempresa.com.br"
                  className="w-full bg-[#0f172a]/60 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/70 text-sm shadow-inner placeholder-slate-500"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={appState === 'analyzing'}
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Empresa</label>
              <input
                type="text"
                required
                placeholder="Nome Fantasia"
                className="w-full bg-[#0f172a]/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 text-sm shadow-inner"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={appState === 'analyzing'}
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Localização</label>
              <input
                type="text"
                placeholder="Ex: São Paulo, SP"
                className="w-full bg-[#0f172a]/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 text-sm shadow-inner"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={appState === 'analyzing'}
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={appState === 'analyzing'}
                className="btn-shine w-full py-2.5 px-4 text-sm font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
              >
                {appState === 'analyzing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                {appState === 'analyzing' ? 'Extraindo...' : 'Analisar'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3 text-left">
            <div className="lg:col-span-8">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">Instagram URL (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: instagram.com/empresa"
                className="w-full bg-[#0f172a]/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 text-sm shadow-inner"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                disabled={appState === 'analyzing'}
              />
            </div>
          </div>

          <div className="mt-5 border-t border-slate-700/50 pt-5 text-left">
            <label className="block text-xs font-semibold text-slate-300 mb-3 ml-1">Motores de Análise Inteligente</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_AGENTS.map((agent) => (
                <label
                  key={agent.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedAgents.includes(agent.id)
                    ? 'bg-brand-purple/20 border-brand-purple/50 shadow-inner'
                    : 'bg-black/20 border-white/5 opacity-60 hover:opacity-100 hover:bg-black/40'
                    }`}
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={selectedAgents.includes(agent.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAgents((prev) => [...prev, agent.id]);
                        } else {
                          setSelectedAgents((prev) => prev.filter((id) => id !== agent.id));
                        }
                      }}
                      disabled={appState === 'analyzing'}
                    />
                    <div className="w-5 h-5 rounded border border-slate-500 peer-checked:bg-brand-purple peer-checked:border-brand-purple flex items-center justify-center transition-colors">
                      {selectedAgents.includes(agent.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold select-none ${selectedAgents.includes(agent.id) ? 'text-white' : 'text-slate-400'}`}>
                    {agent.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* O Modal de histórico foi movido para fora do formulário */}
        </form>

        {/* Modal de Histórico */}
        <AnimatePresence>
          {showHistory && auditHistory.length > 0 && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
                onClick={() => setShowHistory(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Header do Modal */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center border border-brand-purple/30">
                      <Clock className="w-5 h-5 text-brand-purple" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Histórico de Diagnósticos</h3>
                      <p className="text-xs text-slate-400">Últimas 10 empresas analisadas pelo sistema</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Grid de Cards */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {auditHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowHistory(false);
                          handleLoadFromHistory(item.id);
                        }}
                        className="flex flex-col text-left bg-slate-800/40 hover:bg-brand-purple/10 border border-slate-700/50 hover:border-brand-purple/40 rounded-2xl p-5 transition-all group relative overflow-hidden"
                      >
                        {/* Status/Score Indicator */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-transparent rounded-bl-3xl -mr-2 -mt-2 group-hover:from-brand-purple/40 transition-colors" />

                        <div className="flex items-start justify-between w-full mb-3 relative z-10">
                          <div className="flex-1 pr-4">
                            <h4 className="text-lg font-bold text-white truncate mb-1 group-hover:text-brand-purple transition-colors">
                              {item.company_name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <ExternalLink className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{item.target_url.replace(/^https?:\/\//, '')}</span>
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-full bg-slate-900 border border-slate-700 group-hover:border-brand-purple/30 shadow-inner">
                            <span className="text-[10px] text-slate-500 font-medium leading-none mb-0.5">Score</span>
                            <span className="text-sm font-bold text-white leading-none">{item.score || '--'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-slate-700/50 relative z-10">
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {item.saved_at ? new Date(item.saved_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' às') : 'Recente'}
                          </p>
                          <div className="text-[10px] uppercase tracking-wider font-bold text-brand-purple/70 group-hover:text-brand-purple flex items-center gap-1 transition-colors">
                            Ver Análise
                            <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* =========================================
            STATE: ANALYZING 
        ========================================= */}
          {appState === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-center z-10 liquid-glass p-8 mb-8 !rounded-2xl"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 mb-5">
                  <div className="absolute inset-0 border-4 border-brand-purple/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-brand-purple rounded-full border-t-transparent animate-spin"></div>
                  <Loader2 className="w-6 h-6 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>

                <h2 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-white">Analisando o Alvo...</h2>
                <p className="text-slate-400 mb-5 font-mono text-xs h-4">
                  {analysisText}
                </p>

                <div className="w-full max-w-md h-2 bg-slate-900/50 rounded-full overflow-hidden border border-slate-800 backdrop-blur-sm relative mb-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-purple to-indigo-400 rounded-full relative"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-shimmer"></div>
                  </motion.div>
                </div>
                <div className="font-mono font-bold text-xs text-brand-purple drop-shadow-md">
                  {Math.min(Math.round(progress), 100)}% CONCLUÍDO
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================
            STATE: RESULT 
        ========================================= */}
          {appState === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full z-10"
            >
              {error ? (
                <div className="text-center p-12 liquid-glass border-red-500/20">
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-400 text-2xl font-bold mb-4 drop-shadow-md">Falha de Varredura</p>
                  <p className="text-slate-400 mb-8">{error}</p>
                  <button onClick={() => setAppState('input')} className="px-6 py-3 glass-btn rounded-full font-bold shadow-lg">Voltar ao Console</button>
                </div>
              ) : reportData && (
                <div className="space-y-8">

                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between liquid-glass p-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Target className="w-6 h-6 text-brand-purple animate-pulse" />
                        Dossiê Executivo Aberto
                      </h2>
                      <p className="text-slate-400 text-sm font-mono mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-spring-green-400 animate-pulse"></span>
                        Alvo: {reportData.target_url}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleCreateGroowayProposal}
                        disabled={isGeneratingGroowayProposal}
                        className="px-4 py-2 text-xs font-black flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider"
                      >
                        {isGeneratingGroowayProposal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
                        {isGeneratingGroowayProposal ? 'Gerando...' : 'Gerar Proposta Premium'}
                      </button>

                      <button
                        onClick={() => setShowDiagnosticModal(true)}
                        className="px-4 py-2 text-xs bg-brand-purple/10 text-brand-purple hover:bg-brand-purple hover:text-white border border-brand-purple/30 rounded-full transition-all font-black flex items-center gap-2 uppercase tracking-wider"
                      >
                        <Target className="w-3.5 h-3.5" />
                        Compartilhar Dossiê
                      </button>
                      <button
                        onClick={() => setAppState('input')}
                        className="px-4 py-2 text-xs glass-btn hover:bg-slate-800 rounded-full transition-all font-black flex items-center gap-2 uppercase tracking-wider text-slate-400"
                      >
                        Nova Extração
                      </button>
                    </div>
                  </div>

                  {/* Menu de Abas (Tabs UI) */}
                  <div className="flex flex-wrap md:flex-nowrap gap-2 bg-black/40 p-2 rounded-2xl border border-white/10 mb-6 overflow-x-auto custom-scrollbar">
                    {[
                      { id: 'tracking', label: 'Tracking & Dados', icon: <Database className="w-4 h-4" /> },
                      { id: 'performance', label: 'UX / SEO', icon: <Smartphone className="w-4 h-4" /> },
                      { id: 'market', label: 'Pesquisa de Mercado', icon: <Search className="w-4 h-4" /> },
                      { id: 'social', label: 'Mapeamento Social', icon: <Instagram className="w-4 h-4" /> },
                      { id: 'gmb', label: 'Google Meu Negócio', icon: <MapPin className="w-4 h-4" /> },
                      { id: 'keywords', label: 'Keywords & Ads', icon: <KeyRound className="w-4 h-4" /> },
                      { id: 'cmo', label: 'Boss (Vendas)', icon: <Briefcase className="w-4 h-4" /> },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 justify-center ${activeTab === tab.id
                          ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6">

                    {/* Tela 1: Tracking */}
                    {activeTab === 'tracking' && trackingSkill && (
                      <div className="liquid-glass p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-lg font-bold mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
                          <span className="flex items-center gap-2 text-slate-100"><Database className="w-5 h-5 text-indigo-400" /> Infraestrutura de Dados</span>
                          {getScoreBadge(trackingSkill.score)}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <MetricCard
                            label="GA4 Base"
                            value={trackingSkill.findings.has_ga4_base ? 'ATIVO' : 'NÃO DETECTADO'}
                            status={trackingSkill.findings.has_ga4_base}
                            tooltip="Google Analytics 4: O padrão ouro para rastreamento de comportamento do usuário e conversões."
                          />
                          <MetricCard
                            label="GTM Control"
                            value={trackingSkill.findings.has_gtm ? 'ATIVO' : 'LIVRE'}
                            status={trackingSkill.findings.has_gtm}
                            tooltip="Google Tag Manager: Gerenciador central de scripts. Permite agilidade total em campanhas sem mexer no código."
                          />
                          <MetricCard
                            label="Meta Pixel"
                            value={trackingSkill.findings.has_meta_pixel ? 'ATIVO' : 'NÃO DETECTADO'}
                            status={trackingSkill.findings.has_meta_pixel}
                            tooltip="Pixel do Facebook: Essencial para remarketing e mensuração de vendas vindas do Instagram/Facebook."
                          />
                          <MetricCard
                            label="Maturidade"
                            value={trackingSkill.findings.data_maturity_level}
                            variant="purple"
                            tooltip="Índice Grooway de maturidade de dados: O quanto sua empresa está pronta para escalar com inteligência."
                          />
                        </div>

                        {/* New row: WhatsApp, Google Ads, Meta Ads */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <MetricCard
                            label="WhatsApp"
                            value={trackingSkill.findings.has_whatsapp_button ? '✓ DETECTADO' : '✕ AUSENTE'}
                            status={trackingSkill.findings.has_whatsapp_button}
                            subValue={trackingSkill.findings.whatsapp_number}
                            icon={Phone}
                            tooltip="Presença de botão de contato direto. Vital para taxa de conversão em mobile."
                          />
                          <MetricCard
                            label="Google Ads"
                            value={trackingSkill.findings.has_google_ads_signals ? '✓ SINAIS ATIVOS' : 'SEM SINAIS'}
                            variant={trackingSkill.findings.has_google_ads_signals ? "blue" : "default"}
                            tooltip="Detectamos se sua empresa está investindo em anúncios no Google através de tags de conversão."
                          />
                          <MetricCard
                            label="Meta Ads"
                            value={trackingSkill.findings.has_meta_ads_signals ? '✓ CAMPANHA ATIVA' : 'SEM CAMPANHA'}
                            variant={trackingSkill.findings.has_meta_ads_signals ? "fuchsia" : "default"}
                            tooltip="Sinais de tráfego pago ativos no ecossistema Meta (Instagram/FB)."
                          />
                        </div>

                        {/* Ads details */}
                        {(trackingSkill.findings.google_ads_details?.length > 0 || trackingSkill.findings.meta_ads_details?.length > 0) && (
                          <div className="mb-4 bg-indigo-950/10 border-l-2 border-indigo-400 p-4 rounded-r-xl">
                            <h4 className="text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wider">Detalhes de Ads Detectados</h4>
                            <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">
                              {trackingSkill.findings.google_ads_details?.map((d: string, i: number) => (
                                <li key={`gad-${i}`} className="leading-snug">{d}</li>
                              ))}
                              {trackingSkill.findings.meta_ads_details?.map((d: string, i: number) => (
                                <li key={`mad-${i}`} className="leading-snug">{d}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {trackingSkill.critical_pains.length > 0 && (
                          <div className="bg-red-900/10 border-l-2 border-red-500 p-4 rounded-r-xl">
                            <h4 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2 uppercase tracking-wider text-xs">
                              <AlertTriangle className="w-4 h-4" /> Alertas Críticos de Vendas (Cegueira)
                            </h4>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-sm">
                              {trackingSkill.critical_pains.map((pain: string, idx: number) => (
                                <li key={idx} className="leading-snug">{pain}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {trackingSkill.findings.evidences && trackingSkill.findings.evidences.length > 0 && (
                          <div className="mt-4 bg-indigo-950/20 border-l-2 border-indigo-500 p-4 rounded-r-xl">
                            <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-2 uppercase tracking-wider text-xs">
                              <Database className="w-4 h-4" /> Evidências Rastreadas no DOM
                            </h4>
                            <ul className="list-disc pl-5 space-y-1.5 text-indigo-200/80 text-sm italic">
                              {trackingSkill.findings.evidences.map((evidence: string, idx: number) => (
                                <li key={idx} className="leading-snug">{evidence}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tela 2: Performance Agent */}
                    {activeTab === 'performance' && performanceSkill && performanceSkill.findings && Object.keys(performanceSkill.findings).length > 0 && (
                      <div className="liquid-glass p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-lg font-bold mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
                          <span className="flex items-center gap-2 text-slate-100"><Smartphone className="w-5 h-5 text-emerald-400" /> Interface & Performance P/ Conversão</span>
                          {getScoreBadge(performanceSkill.score ?? 0)}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <MetricCard
                            label="Responsividade"
                            value={performanceSkill.findings?.is_mobile_responsive_ui ? 'OTIMIZADO' : 'QUEBRADO'}
                            status={performanceSkill.findings?.is_mobile_responsive_ui}
                            tooltip="A UI se adapta corretamente a celulares? Sites não responsivos são penalizados severamente pelo Google."
                          />
                          <MetricCard
                            label="TTFB / Load"
                            value={`${performanceSkill.load_time_seconds ?? 'N/A'}s`}
                            variant="blue"
                            tooltip="Time to First Byte: O tempo que o servidor leva para começar a enviar os dados. Essencial para SEO."
                          />
                          <MetricCard
                            label="Busca (H1)"
                            value={performanceSkill.findings?.has_h1 ? 'OK' : 'FALHA'}
                            status={performanceSkill.findings?.has_h1}
                            tooltip="A tag H1 é o título principal que diz ao Google sobre o que é sua página."
                          />
                          <MetricCard
                            label="Copy (Meta)"
                            value={performanceSkill.findings?.has_meta_desc ? 'OK' : 'FALHA'}
                            status={performanceSkill.findings?.has_meta_desc}
                            tooltip="Meta Description: O texto que aparece no Google e convence o usuário a clicar no seu link."
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <MetricCard
                            label="Imagens S/ Alt"
                            value={performanceSkill.findings?.images_without_alt ?? 0}
                            variant={(performanceSkill.findings?.images_without_alt ?? 0) > 5 ? "warning" : "default"}
                            tooltip="Imagens sem o atributo 'alt' são invisíveis para o Google e dificultam a acessibilidade."
                          />
                          <MetricCard
                            label="Lead Form"
                            value={performanceSkill.findings?.has_contact_form ? 'DETETADO' : 'AUSENTE'}
                            status={performanceSkill.findings?.has_contact_form}
                            tooltip="Presença de formulário de contato. É o principal canal de geração de leads do site."
                          />
                          <MetricCard
                            label="Hub Conteúdo"
                            value={performanceSkill.findings?.has_blog ? 'ATIVO' : 'AUSENTE'}
                            status={performanceSkill.findings?.has_blog}
                            tooltip="Ter um blog ou hub de conteúdo é a estratégia #1 para autoridade orgânica a longo prazo."
                          />
                          <MetricCard
                            label="Total CTAs"
                            value={performanceSkill.findings?.cta_buttons_count ?? 0}
                            variant={(performanceSkill.findings?.cta_buttons_count ?? 0) > 0 ? "success" : "error"}
                            tooltip="Call to Action: Botões que convidam o usuário a realizar uma ação comercial."
                          />
                        </div>
                        {performanceSkill.findings?.cta_examples?.length > 0 && (
                          <div className="bg-indigo-950/10 p-3.5 rounded-xl border border-indigo-500/10">
                            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Exemplos de CTAs:</p>
                            <p className="text-sm text-slate-300 font-mono">{performanceSkill.findings.cta_examples.join(' • ')}</p>
                          </div>
                        )}

                        {/* UI Clinical Analysis via LLM - Enhanced Contrast */}
                        {performanceSkill.findings?.ui_clinical_analysis && (
                          <div className="mt-4 mb-4 bg-fuchsia-500/10 border-l-4 border-fuchsia-500 p-5 rounded-r-2xl shadow-lg shadow-fuchsia-500/5">
                            <h4 className="text-xs font-black text-fuchsia-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                              <Activity className="w-4 h-4 animate-pulse" /> Análise Clínica de UI (via Cérebro Grooway)
                            </h4>
                            <p className="text-sm text-slate-100 leading-relaxed font-semibold italic">{performanceSkill.findings.ui_clinical_analysis}</p>
                          </div>
                        )}

                        {performanceSkill.findings?.blog_exploration_sample && (
                          <div className="mt-4 mb-4 bg-blue-500/5 border-l-2 border-blue-500 p-4 rounded-r-xl">
                            <h4 className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                              <FileText className="w-4 h-4" /> Amostra Tática P/ Blog (IA)
                            </h4>
                            <p className="text-sm text-slate-200 leading-relaxed font-medium italic">{performanceSkill.findings.blog_exploration_sample}</p>
                          </div>
                        )}

                        {(performanceSkill.critical_pains?.length ?? 0) > 0 && (
                          <div className="mt-5 bg-red-900/10 border-l-2 border-red-500 p-4 rounded-r-xl">
                            <h4 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2 uppercase tracking-wider text-xs">
                              <AlertTriangle className="w-4 h-4" /> Pontos Críticos de Atrito com o Cliente
                            </h4>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-sm">
                              {performanceSkill.critical_pains.map((pain: string, idx: number) => (
                                <li key={idx} className="leading-snug">{pain}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {performanceSkill.findings?.evidences && performanceSkill.findings.evidences.length > 0 && (
                          <div className="mt-4 bg-emerald-950/20 border-l-2 border-emerald-500 p-4 rounded-r-xl">
                            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2 uppercase tracking-wider text-xs">
                              <Smartphone className="w-4 h-4" /> Evidências Técnicas (Web Vitals / On-Page)
                            </h4>
                            <ul className="list-disc pl-5 space-y-1.5 text-emerald-200/80 text-sm italic">
                              {performanceSkill.findings.evidences.map((evidence: string, idx: number) => (
                                <li key={idx} className="leading-snug">{evidence}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'performance' && performanceSkill && (!performanceSkill.findings || Object.keys(performanceSkill.findings).length === 0) && (
                      <div className="liquid-glass p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg font-semibold">Dados de UX/SEO não disponíveis</p>
                        <p className="text-slate-500 text-sm mt-2">O agente de performance não conseguiu analisar a página (site pode estar offline ou inacessível).</p>
                      </div>
                    )}
                    {activeTab === 'performance' && !performanceSkill && (
                      <div className="liquid-glass p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg font-semibold">Agente de UX/SEO não foi executado</p>
                        <p className="text-slate-500 text-sm mt-2">Esta auditoria foi feita sem o motor de UX/SEO selecionado.</p>
                      </div>
                    )}

                    {/* Tela 3: Inteligência de Mercado (Gemini Grounding) */}
                    {activeTab === 'market' && marketSkill && (
                      <div className="liquid-glass p-0 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500">


                        <div className="p-6">
                          <h3 className="text-lg font-bold mb-5 flex items-center justify-between border-b border-white/5 pb-3">
                            <span className="flex items-center gap-2 text-white">
                              <Search className="w-5 h-5 text-blue-400" />
                              Cérebro Estratégico (Pesquisa Avançada com IA Grounding)
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase">Inteligência Competitiva Ativada</span>
                          </h3>

                          <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="md:col-span-1 bg-black/40 p-5 rounded-2xl border border-white/5">
                              <h4 className="text-xs font-black text-brand-purple mb-2 uppercase tracking-widest">Nicho Global Detectado</h4>
                              <p className="text-slate-100 font-medium text-sm leading-relaxed mb-6">{marketSkill.findings.niche}</p>

                              <h4 className="text-xs font-black text-indigo-400 mb-2 uppercase tracking-widest">O Cliente Ideal Mapeado (ICP)</h4>
                              <p className="text-slate-100 font-medium text-sm leading-relaxed">{marketSkill.findings.target_icp}</p>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-2 border-b border-white/10 pb-2"><Users className="w-4 h-4 text-blue-400" /> Raio-X do Cliente Final (ICP)</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-black/40 p-4 rounded-2xl border border-red-500/10">
                                  <h5 className="text-xs font-black text-red-400 mb-2 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3" /> Dores do Cliente Ideal</h5>
                                  <ul className="space-y-1.5 text-slate-300 text-xs">
                                    {marketSkill.findings.dores_icp?.map((pain: string, i: number) => (
                                      <li key={i} className="flex gap-1.5 leading-snug">
                                        <span className="text-red-500 font-bold">✕</span> {pain}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-4 rounded-2xl border border-orange-500/20">
                                  <h5 className="text-xs font-black text-orange-400 mb-2 uppercase tracking-widest flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Objeções Comuns do ICP</h5>
                                  <ul className="space-y-1.5 text-slate-200 text-xs font-medium">
                                    {marketSkill.findings.objecoes_icp?.map((arg: string, i: number) => (
                                      <li key={i} className="flex gap-1.5 leading-snug">
                                        <span className="text-orange-400 font-bold">⚠</span> {arg}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="md:col-span-2 bg-gradient-to-r from-spring-green-400/10 to-transparent p-4 rounded-2xl border border-spring-green-400/20">
                                  <h5 className="text-xs font-black text-spring-green-400 mb-2 uppercase tracking-widest flex items-center gap-2"><Star className="w-3 h-3" /> Sonhos e Desejos do ICP</h5>
                                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-200 text-xs font-medium">
                                    {marketSkill.findings.sonhos_icp?.map((arg: string, i: number) => (
                                      <li key={i} className="flex gap-1.5 leading-snug">
                                        <span className="text-spring-green-400 font-bold">⭐</span> {arg}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mt-6 mb-2 border-b border-white/10 pb-2"><Building2 className="w-4 h-4 text-brand-purple" /> Desafios da Emrpesa e Marketing</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-red-950/20 p-4 rounded-2xl border border-red-500/20">
                                  <h5 className="text-xs font-black text-red-400 mb-2 uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Gargalos de Vendas</h5>
                                  <ul className="space-y-1.5 text-slate-300 text-xs">
                                    {marketSkill.findings.dores_empresa_marketing?.map((pain: string, i: number) => (
                                      <li key={i} className="flex gap-1.5 leading-snug">
                                        <span className="text-red-500 font-bold">❗</span> {pain}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="bg-indigo-950/20 p-4 rounded-2xl border border-indigo-500/20">
                                  <h5 className="text-xs font-black text-indigo-400 mb-2 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3" /> Desempenho e Aquisição</h5>
                                  <ul className="space-y-1.5 text-slate-300 text-xs">
                                    {marketSkill.findings.desafios_empresa_marketing?.map((pain: string, i: number) => (
                                      <li key={i} className="flex gap-1.5 leading-snug">
                                        <span className="text-indigo-400 font-bold">→</span> {pain}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="bg-gradient-to-r from-brand-purple/10 to-transparent p-5 rounded-2xl border border-brand-purple/20">
                                <h4 className="text-xs font-black text-brand-purple mb-3 uppercase tracking-widest flex items-center gap-2"><Activity className="w-3 h-3" /> Brechas de Diferenciação</h4>
                                <ul className="space-y-2 text-slate-200 text-sm font-medium">
                                  {marketSkill.findings.brechas_diferenciacao?.map((arg: string, i: number) => (
                                    <li key={i} className="flex gap-2">
                                      <span className="text-brand-purple font-bold">✓</span> {arg}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Benchmarks Section */}
                          {marketSkill.findings.competitor_benchmarks && marketSkill.findings.competitor_benchmarks.length > 0 && (
                            <div className="mt-2 pt-6 border-t border-white/10">
                              <h4 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><Activity className="w-4 h-4 text-spring-green-400" /> Gigantes do Mercado (Benchmarks Referência)</h4>
                              <div className="grid md:grid-cols-3 gap-4">
                                {marketSkill.findings.competitor_benchmarks.map((bench: string, i: number) => (
                                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                    <p className="text-sm text-slate-300 leading-relaxed">{bench}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Deep Research absorbed here */}
                          {marketSkill.findings.deep_research_markdown && (
                            <div className="mt-6 pt-6 border-t border-orange-500/20">
                              <details className="group">
                                <summary className="cursor-pointer flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
                                  <Shield className="w-5 h-5 text-orange-400" />
                                  <span className="text-lg font-bold text-orange-300">Dossiê de Inteligência Corporativa (Deep Research)</span>
                                  <span className="text-xs text-slate-500 ml-auto group-open:hidden">Clique para expandir ▸</span>
                                  <span className="text-xs text-slate-500 ml-auto hidden group-open:inline">Clique para fechar ▾</span>
                                </summary>
                                <div className="prose prose-invert prose-orange max-w-none text-slate-300 leading-relaxed space-y-4 text-sm bg-[#0B0F19]/50 p-6 rounded-xl border border-white/5 whitespace-pre-wrap custom-scrollbar overflow-y-auto max-h-[60vh]">
                                  {marketSkill.findings.deep_research_markdown.split('\n').map((line: string, i: number) => {
                                    if (line.trim().match(/^#{1,3}\s/)) {
                                      const level = line.match(/^#+/)?.[0].length;
                                      const text = line.replace(/^#+\s/, '');
                                      if (level === 1) return <h1 key={i} className="text-2xl font-black text-white mt-8 mb-3 pb-2 border-b border-white/10">{text.replace(/\*\*/g, '')}</h1>;
                                      if (level === 2) return <h2 key={i} className="text-xl font-bold text-orange-400 mt-6 mb-3 border-l-4 border-orange-500 pl-3">{text.replace(/\*\*/g, '')}</h2>;
                                      return <h3 key={i} className="text-lg font-bold text-amber-200 mt-5 mb-2">{text.replace(/\*\*/g, '')}</h3>;
                                    }
                                    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                                      const text = line.replace(/^[-*]\s/, '');
                                      const formattedText = text.split(/(\*\*.*?\*\*)/).map((part, idx) => {
                                        if (part.startsWith('**') && part.endsWith('**')) return <strong key={idx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                                        return part;
                                      });
                                      return <li key={i} className="ml-4 mb-2 list-disc marker:text-orange-500 text-slate-300">{formattedText}</li>;
                                    }
                                    if (line.includes('**')) {
                                      const formattedText = line.split(/(\*\*.*?\*\*)/).map((part, idx) => {
                                        if (part.startsWith('**') && part.endsWith('**')) return <strong key={idx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                                        return part;
                                      });
                                      return <p key={i} className="mb-3 font-medium">{formattedText}</p>;
                                    }
                                    if (line.trim() === '') return <br key={i} />;
                                    return <p key={i} className="mb-3 font-medium">{line}</p>;
                                  })}
                                </div>
                              </details>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                    {/* Tela 4: Redes Sociais (Apify Instaloader API) */}
                    {activeTab === 'social' && socialSkill && (
                      <div className="liquid-glass p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border-brand-purple/20">
                        <h3 className="text-lg font-bold mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
                          <span className="flex items-center gap-2 text-slate-100"><Instagram className="w-5 h-5 text-fuchsia-400" /> Inteligência de Posicionamento Frio (Apify Extraction)</span>
                          {getScoreBadge(socialSkill.score)}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-center flex flex-col justify-center">
                            <p className="text-slate-400 text-xs uppercase mb-1 font-semibold tracking-wider">Base Endossada</p>
                            <p className="text-2xl font-black text-slate-50">{socialSkill.findings.followers ?? '???'}</p>
                          </div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-center flex flex-col justify-center">
                            <p className="text-slate-400 text-xs uppercase mb-1 font-semibold tracking-wider">Acervo Visual</p>
                            <p className="text-2xl font-black text-slate-50">{socialSkill.findings.posts_count ?? '???'}</p>
                          </div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-center flex flex-col justify-center">
                            <p className="text-slate-400 text-xs uppercase mb-1 font-semibold tracking-wider">Motor Inbound</p>
                            <p className={`text-xl font-black ${socialSkill.findings.bio_has_link ? 'text-spring-green-400' : 'text-red-400'}`}>
                              {socialSkill.findings.bio_has_link ? 'BIO COM LINK' : 'SEM ROTA DE FUGA'}
                            </p>
                          </div>
                          <div className="bg-brand-purple/10 p-4 rounded-2xl border border-brand-purple/20 text-center flex flex-col justify-center">
                            <p className="text-brand-purple text-xs uppercase mb-1 font-bold tracking-wider">Engajamento IA</p>
                            <p className="text-lg font-black text-white">{socialSkill.findings.engagement_estimate ?? socialSkill.score}</p>
                          </div>
                          <div className={`p-4 rounded-2xl border text-center flex flex-col justify-center md:col-span-1 col-span-2 ${socialSkill.findings.is_profile_selling ? 'bg-spring-green-900/20 border-spring-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                            <p className="text-xs uppercase mb-1 font-bold tracking-wider text-white">O Perfil Vende?</p>
                            <p className={`text-lg font-black ${socialSkill.findings.is_profile_selling ? 'text-spring-green-400' : 'text-red-400'}`}>
                              {socialSkill.findings.is_profile_selling ? 'SIM (CONVERSÃO)' : 'NÃO VENDÁVEL'}
                            </p>
                          </div>
                        </div>

                        {/* Veredito de IA (Gemini/OpenAI) Estratégico Diário */}
                        <div className="mt-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gradient-to-r from-brand-purple/10 to-transparent rounded-xl border border-brand-purple/20">
                            <h4 className="text-xs font-black text-brand-purple mb-2 uppercase tracking-widest flex items-center gap-2">
                              <Activity className="w-4 h-4" /> Alinhamento Comercial dos Posts (IA)
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                              {socialSkill.findings.sales_alignment || "Análise das legendas indisponível."}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
                            <h4 className="text-xs font-black text-blue-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                              <Shield className="w-4 h-4" /> Posicionamento de Autoridade (IA)
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                              {socialSkill.findings.authority_triggers || "Análise de autoridade indisponível."}
                            </p>
                          </div>
                        </div>

                        {/* Bio Links Section */}
                        {socialSkill.findings.bio_links && socialSkill.findings.bio_links.length > 0 && (
                          <div className="mt-4 mb-4 bg-fuchsia-950/10 border-l-2 border-fuchsia-400 p-4 rounded-r-xl">
                            <h4 className="text-xs font-bold text-fuchsia-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" /> Links Encontrados na Bio
                            </h4>
                            <ul className="space-y-1.5 mb-3">
                              {socialSkill.findings.bio_links.map((link: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-2 text-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 flex-shrink-0"></span>
                                  <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer" className="text-fuchsia-200/80 hover:text-white underline underline-offset-2 truncate">{link}</a>
                                </li>
                              ))}
                            </ul>

                            {socialSkill.findings.compiled_links && socialSkill.findings.compiled_links.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-fuchsia-500/20">
                                <h5 className="text-[10px] font-black text-fuchsia-400 mb-2 uppercase tracking-widest bg-fuchsia-500/10 inline-block px-2 py-1 rounded">Extração Linktree / Compiladores</h5>
                                <ul className="space-y-1.5">
                                  {socialSkill.findings.compiled_links.map((link: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs">
                                      <span className="w-1 h-1 rounded-full bg-fuchsia-300 flex-shrink-0"></span>
                                      <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer" className="text-fuchsia-100 hover:text-white hover:underline truncate">{link}</a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Plano de Ação Tático (Content Ideas) */}
                        {socialSkill.findings.content_ideas && socialSkill.findings.content_ideas.length > 0 && (
                          <div className="mt-4 mb-6 bg-gradient-to-r from-blue-900/20 to-transparent border border-blue-500/20 p-5 rounded-2xl">
                            <h4 className="text-sm font-black text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                              <Target className="w-4 h-4" /> Plano Tático de Conteúdo (Foco em Conversão)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {socialSkill.findings.content_ideas.map((idea: string, idx: number) => (
                                <div key={idx} className="bg-black/40 p-3 rounded-xl border border-white/5 flex gap-3 items-start">
                                  <span className="text-blue-500 font-black text-lg leading-none mt-0.5">{idx + 1}.</span>
                                  <p className="text-slate-300 text-sm leading-relaxed">{idea}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {socialSkill.critical_pains.length > 0 && (
                          <div className="bg-red-900/10 border-l-2 border-red-500 p-4 rounded-r-xl">
                            <h4 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2 uppercase tracking-wider text-xs">
                              <AlertTriangle className="w-4 h-4" /> Riscos do Posicionamento Digital
                            </h4>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-sm">
                              {socialSkill.critical_pains.map((pain: string, idx: number) => (
                                <li key={idx} className="leading-snug">{pain}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {socialSkill.findings.evidences && socialSkill.findings.evidences.length > 0 && (
                          <div className="mt-4 bg-fuchsia-950/20 border-l-2 border-fuchsia-500 p-4 rounded-r-xl">
                            <h4 className="text-sm font-bold text-fuchsia-400 flex items-center gap-2 mb-2 uppercase tracking-wider text-xs">
                              <Instagram className="w-4 h-4" /> Fundamentos Raspados da API (Apify)
                            </h4>
                            <ul className="list-disc pl-5 space-y-1.5 text-fuchsia-200/80 text-sm italic">
                              {socialSkill.findings.evidences.map((evidence: string, idx: number) => (
                                <li key={idx} className="leading-snug">{evidence}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tela 5: Auditoria Vendas / CMO Sênior */}
                    {activeTab === 'cmo' && cmoSkill && cmoSkill.findings && (
                      <div className="bg-gradient-to-br from-indigo-950/40 via-purple-900/10 to-transparent p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-3xl border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.08)] relative overflow-hidden">
                        {/* Background decorations */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-fuchsia-500/10 blur-[80px] rounded-full"></div>
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                          <div>
                            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-indigo-300 to-white flex items-center gap-3 drop-shadow-sm">
                              <span className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                <Briefcase className="w-6 h-6 text-fuchsia-400" />
                              </span>
                              O Veredito Final (Boss)
                            </h3>
                            <p className="text-sm font-medium text-slate-400 mt-2 px-1">
                              O CMO cruzou todos os dados técnicos coletados pelos agentes e formulou o diagnóstico comercial definitivo.
                            </p>
                          </div>
                          {getScoreBadge(cmoSkill.score)}
                        </div>

                        <div className="relative z-10 grid md:grid-cols-2 gap-6 bg-black/40 p-6 rounded-xl border border-zinc-800 mb-6">
                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-red-400 mb-4 uppercase tracking-wide border-b border-red-500/20 pb-2">
                              <XCircle className="w-4 h-4" /> Pontos Negativos Consolidados
                            </h4>
                            <ul className="space-y-3">
                              {cmoSkill.findings.pontos_negativos_consolidados?.map((item: string, idx: number) => {
                                const isAgentSource = item.includes('[Fonte:');
                                const text = isAgentSource ? item.split(']')[1] : item;
                                const source = isAgentSource ? item.split(']')[0] + ']' : '';
                                return (
                                  <li key={idx} className="flex gap-3 text-sm text-zinc-300 items-start">
                                    <span className="text-red-500 font-bold mt-0.5">✕</span>
                                    <span className="leading-relaxed">
                                      {source && <span className="text-[10px] text-red-400 uppercase tracking-wider block font-bold mb-0.5">{source.replace('❌ ', '')}</span>}
                                      {text.replace('❌ ', '').trim()}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-spring-green-400 mb-4 uppercase tracking-wide border-b border-spring-green-500/20 pb-2">
                              <CheckCircle2 className="w-4 h-4" /> Pontos Fortes e Brechas
                            </h4>
                            <ul className="space-y-3 mb-6">
                              {cmoSkill.findings.pontos_positivos_consolidados?.map((item: string, idx: number) => {
                                const isAgentSource = item.includes('[Fonte:');
                                const text = isAgentSource ? item.split(']')[1] : item;
                                const source = isAgentSource ? item.split(']')[0] + ']' : '';
                                return (
                                  <li key={`pos-${idx}`} className="flex gap-3 text-sm text-zinc-300 items-start">
                                    <span className="text-spring-green-500 font-bold mt-0.5">✓</span>
                                    <span className="leading-relaxed">
                                      {source && <span className="text-[10px] text-spring-green-400/70 uppercase tracking-wider block font-bold mb-0.5">{source.replace('✅ ', '')}</span>}
                                      {text.replace('✅ ', '').trim()}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>

                            <h5 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-1"><Search className="w-3 h-3" /> Diferenciação</h5>
                            <ul className="space-y-2">
                              {cmoSkill.findings.brechas_diferenciacao?.map((item: string, idx: number) => (
                                <li key={`brecha-${idx}`} className="flex gap-2 text-sm text-zinc-300 items-start bg-blue-950/20 p-2 rounded-lg border border-blue-500/10">
                                  <span className="text-blue-500 font-bold">💡</span>
                                  <span className="leading-relaxed">{item.replace('💡 ', '').trim()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Cross Analysis */}
                        {cmoSkill.findings.cross_analysis && cmoSkill.findings.cross_analysis.length > 0 && (
                          <div className="relative z-10 mb-8 bg-black/40 p-5 rounded-2xl border-l-4 border-fuchsia-500 text-slate-200 shadow-inner">
                            <h4 className="flex items-center gap-2 text-xs font-black text-fuchsia-400 mb-3 uppercase tracking-widest"><Activity className="w-4 h-4" /> Cruzamento de Dados dos Agentes</h4>
                            <ul className="space-y-3">
                              {cmoSkill.findings.cross_analysis.map((cruzamento: string, idx: number) => (
                                <li key={`cross-${idx}`} className="flex gap-3 text-sm items-start">
                                  <span className="text-fuchsia-500 font-bold mt-0.5">🔗</span>
                                  <span className="leading-relaxed font-medium italic">{cruzamento.replace('🔗 ', '')}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Plano Comercial */}
                        {cmoSkill.findings.plano_comercial?.servicos_recomendados && (
                          <div className="relative z-10 space-y-4 mb-8">
                            <h4 className="text-lg font-black text-white flex items-center gap-2"><Target className="w-5 h-5 text-indigo-400" /> Plano Comercial High-Ticket</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {cmoSkill.findings.plano_comercial.servicos_recomendados.map((srv: any, idx: number) => (
                                <div key={idx} className="bg-gradient-to-br from-indigo-950/40 to-black border border-indigo-500/20 rounded-2xl p-5 flex flex-col shadow-lg">
                                  <h5 className="text-lg font-black text-indigo-300 mb-4 pb-3 border-b border-indigo-500/20 flex items-center justify-between">
                                    {srv.nome_servico}
                                    <span className="text-[10px] w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">0{idx + 1}</span>
                                  </h5>

                                  <div className="space-y-4 flex-1">
                                    <div>
                                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Por que vender (Base em Dados)</p>
                                      <p className="text-sm text-slate-300 leading-relaxed font-medium bg-white/5 p-3 rounded-xl shadow-inner border border-white/5">{srv.por_que_vender}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500/70 mb-1 flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Impacto Direto</p>
                                      <p className="text-sm text-emerald-100/80 font-medium leading-relaxed">{srv.impacto_esperado}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Veredito Implacável */}
                        <div className="relative z-10 mt-6 bg-indigo-950/50 border-x border-y border-indigo-500/40 p-6 rounded-2xl text-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                          <h4 className="text-xs font-black text-indigo-400 mb-3 uppercase tracking-widest">Pitch de Fechamento (P/ Vendedor)</h4>
                          <p className="text-white text-lg sm:text-xl font-bold italic leading-relaxed max-w-4xl mx-auto">&quot;{cmoSkill.findings.cmo_verdict}&quot;</p>
                        </div>

                      </div>
                    )}

                    {/* Tela 6: Local SEO GMB Auditor */}
                    {activeTab === 'gmb' && gmbSkill && gmbSkill.findings && (
                      <div className="bg-gradient-to-br from-emerald-900/30 to-black p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                        <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-slate-100"><Target className="w-5 h-5 text-emerald-400" /> Auditoria de Presença Local (Google Maps/GMB)</span>
                          {getScoreBadge(gmbSkill.score)}
                        </h3>

                        {/* KPIs Row */}
                        <div className="flex flex-wrap gap-4 mb-6">
                          <div className="bg-emerald-950/20 px-4 py-3 rounded-lg border border-emerald-500/20 flex-1 min-w-[140px] text-center">
                            <p className="text-xs text-emerald-400 uppercase font-bold tracking-widest mb-1">Autoridade/Estrelas</p>
                            <p className="text-2xl font-black text-white">{gmbSkill.findings.estimated_rating}</p>
                          </div>
                          <div className="bg-emerald-950/20 px-4 py-3 rounded-lg border border-emerald-500/20 flex-1 min-w-[140px] text-center">
                            <p className="text-xs text-emerald-400 uppercase font-bold tracking-widest mb-1">Total de Avaliações</p>
                            <p className="text-2xl font-black text-white">{gmbSkill.findings.reviews_volume}</p>
                          </div>
                          <div className="bg-emerald-950/20 px-4 py-3 rounded-lg border border-emerald-500/20 flex-1 min-w-[140px] text-center">
                            <p className="text-xs text-emerald-400 uppercase font-bold tracking-widest mb-1">Fotos na Ficha</p>
                            <p className={`text-2xl font-black ${(gmbSkill.findings.photos_count || 0) >= 20 ? 'text-emerald-400' : 'text-orange-400'}`}>{gmbSkill.findings.photos_count || 0}</p>
                          </div>
                          <div className="bg-emerald-950/20 px-4 py-3 rounded-lg border border-emerald-500/20 flex-1 min-w-[140px] text-center">
                            <p className="text-xs text-emerald-400 uppercase font-bold tracking-widest mb-1">Eficácia da Ficha</p>
                            <p className={`text-2xl font-black ${(gmbSkill.findings.profile_effectiveness_pct || 0) >= 80 ? 'text-emerald-400' : (gmbSkill.findings.profile_effectiveness_pct || 0) >= 50 ? 'text-orange-400' : 'text-red-400'}`}>{gmbSkill.findings.profile_effectiveness_pct || 0}%</p>
                          </div>
                        </div>

                        {/* Efficiency Breakdown Checklist */}
                        {gmbSkill.findings.effectiveness_detail && (
                          <div className="mb-6 bg-black/40 p-5 rounded-xl border border-zinc-800">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 uppercase tracking-wide border-b border-zinc-700 pb-2">
                              <Shield className="w-4 h-4 text-emerald-400" /> Checklist de Eficácia (7 Itens para 100%)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {gmbSkill.findings.effectiveness_detail.map((item: any, idx: number) => (
                                <div key={`ef-${idx}`} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${item.status ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-red-950/20 border-red-500/20'}`}>
                                  <span className={`text-lg font-black ${item.status ? 'text-emerald-400' : 'text-red-400'}`}>{item.status ? '✓' : '✕'}</span>
                                  <div>
                                    <p className={`text-sm font-bold ${item.status ? 'text-emerald-300' : 'text-red-300'}`}>{item.label}</p>
                                    <p className="text-xs text-slate-500">{item.description} <span className="text-slate-600">({item.impact})</span></p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* What's Missing for 100% */}
                        {gmbSkill.findings.missing_for_100_pct && gmbSkill.findings.missing_for_100_pct.length > 0 && (
                          <div className="mb-6 bg-orange-950/20 border-l-4 border-orange-500 p-5 rounded-r-xl">
                            <h4 className="text-sm font-bold text-orange-400 flex items-center gap-2 mb-3 uppercase tracking-wider">
                              <AlertTriangle className="w-4 h-4" /> O Que Falta Para 100% de Eficácia
                            </h4>
                            <div className="space-y-2">
                              {gmbSkill.findings.missing_for_100_pct.map((item: any, idx: number) => (
                                <div key={`miss-${idx}`} className="flex items-start gap-3 p-2.5 bg-orange-950/20 rounded-lg">
                                  <span className="text-orange-500 font-bold mt-0.5">•</span>
                                  <div>
                                    <span className="text-sm font-bold text-orange-200">{item.item}</span>
                                    <span className="text-xs text-orange-400/80 ml-2">(-{item.impact})</span>
                                    <p className="text-xs text-orange-300/60 mt-0.5">{item.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reviews Section */}
                        {gmbSkill.findings.reviews_list_raw && gmbSkill.findings.reviews_list_raw.length > 0 && (
                          <div className="mb-6 bg-black/40 p-5 rounded-xl border border-zinc-800">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 uppercase tracking-wide border-b border-zinc-700 pb-2">
                              <MessageSquare className="w-4 h-4 text-blue-400" /> Avaliações dos Clientes ({gmbSkill.findings.reviews_list_raw.length} analisadas)
                            </h4>

                            {/* Sentiment Score Badge */}
                            {gmbSkill.findings.sentiment_score && (
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${gmbSkill.findings.sentiment_score === 'Positivo' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : gmbSkill.findings.sentiment_score === 'Negativo' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
                                <Star className="w-3 h-3" /> Sentimento Geral: {gmbSkill.findings.sentiment_score}
                              </div>
                            )}

                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                              {gmbSkill.findings.reviews_list_raw.map((review: any, idx: number) => (
                                <div key={`rev-${idx}`} className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex gap-0.5">
                                      {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} className={`w-3 h-3 ${star <= review.stars ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} />
                                      ))}
                                    </div>
                                    <span className="text-xs text-slate-500">{review.stars}/5</span>
                                  </div>
                                  <p className="text-sm text-slate-300 leading-relaxed">{review.text || <span className="italic text-slate-500">Avaliação sem texto</span>}</p>
                                  {review.has_response && (
                                    <div className="mt-2 pl-3 border-l-2 border-emerald-500/30">
                                      <p className="text-xs text-emerald-400 font-semibold mb-0.5">↳ Resposta do proprietário:</p>
                                      <p className="text-xs text-slate-400 italic">{review.response_preview}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Review Highlights from AI */}
                        {gmbSkill.findings.reviews_highlights && (gmbSkill.findings.reviews_highlights.best?.length > 0 || gmbSkill.findings.reviews_highlights.worst?.length > 0) && (
                          <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {gmbSkill.findings.reviews_highlights.best?.length > 0 && (
                              <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20">
                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Melhores Comentários</h4>
                                <ul className="space-y-2">
                                  {gmbSkill.findings.reviews_highlights.best.map((q: string, i: number) => (
                                    <li key={`best-${i}`} className="text-sm text-emerald-200/80 italic bg-emerald-950/30 p-2 rounded-md">&ldquo;{q}&rdquo;</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {gmbSkill.findings.reviews_highlights.worst?.length > 0 && (
                              <div className="bg-red-950/20 p-4 rounded-xl border border-red-500/20">
                                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2"><XCircle className="w-3 h-3" /> Comentários Críticos</h4>
                                <ul className="space-y-2">
                                  {gmbSkill.findings.reviews_highlights.worst.map((q: string, i: number) => (
                                    <li key={`worst-${i}`} className="text-sm text-red-200/80 italic bg-red-950/30 p-2 rounded-md">&ldquo;{q}&rdquo;</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Sentiment Summary from AI */}
                        {gmbSkill.findings.review_sentiment_summary && (
                          <div className="mb-6 p-4 rounded-xl border bg-black/40 border-zinc-800">
                            <p className="text-xs font-bold text-brand-purple uppercase tracking-widest mb-2 flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Análise de Sentimento (IA)</p>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed">{gmbSkill.findings.review_sentiment_summary}</p>
                          </div>
                        )}

                        {/* Optimization Tips */}
                        <div className="mb-6">
                          <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-4 uppercase tracking-wide">
                            <ArrowRight className="w-4 h-4" /> Ações Corretivas Recomendadas
                          </h4>
                          <ul className="space-y-2">
                            {gmbSkill.findings.optimization_tips?.map((tip: string, idx: number) => (
                              <li key={idx} className="flex gap-3 text-sm text-zinc-300 items-start bg-black/20 p-3 rounded-lg border border-zinc-800/50">
                                <span className="text-emerald-500 font-bold mt-0.5 min-w-5 text-center">{idx + 1}</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Forensic Verdict */}
                        {gmbSkill.findings.forensic_review_verdict && (
                          <div className="bg-indigo-950/20 p-5 rounded-xl border-l-4 border-indigo-500">
                            <h4 className="text-xs uppercase font-bold text-indigo-300 mb-2 tracking-widest flex items-center gap-2"><Briefcase className="w-3 h-3" /> Veredito Forense</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">{gmbSkill.findings.forensic_review_verdict}</p>
                          </div>
                        )}

                        {/* Critical Pains extras do GMB */}
                        {gmbSkill.critical_pains && gmbSkill.critical_pains.length > 0 && (
                          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <h4 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4" /> Motivos Pelos Quais Eles Não Aparecem na Pesquisa Maps Local
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-red-400 text-sm">
                              {gmbSkill.critical_pains.map((pain: string, idx: number) => (
                                <li key={idx}>{pain}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'keywords' && keywordSkill && keywordSkill.findings && (
                      <div className="bg-gradient-to-br from-blue-900/30 to-black p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.05)]">
                        <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-slate-100"><KeyRound className="w-5 h-5 text-blue-400" /> Inteligência de Busca e Oportunidades</span>
                          {getScoreBadge(keywordSkill.score)}
                        </h3>

                        {/* KPIs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20 text-center">
                            <p className="text-xs uppercase font-bold text-blue-400 mb-1 tracking-widest">Variações Pesquisadas</p>
                            <p className="text-xl font-black text-white">{keywordSkill.findings.keywords_analyzed?.length || 0}</p>
                          </div>
                          <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20 text-center">
                            <p className="text-xs uppercase font-bold text-blue-400 mb-1 tracking-widest">Termos Relacionados</p>
                            <p className="text-xl font-black text-white">{keywordSkill.findings.related_queries?.length || 0}</p>
                          </div>
                          <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20 text-center">
                            <p className="text-xs uppercase font-bold text-blue-400 mb-1 tracking-widest">Concorrência Paga</p>
                            <p className="text-xl font-black text-white">{keywordSkill.findings.paid_competition_map?.reduce((sum: number, p: any) => sum + (p.paid_count || 0), 0) || 0} ads</p>
                          </div>
                          <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20 text-center">
                            <p className="text-xs uppercase font-bold text-blue-400 mb-1 tracking-widest">Status</p>
                            <p className={`text-sm font-black ${keywordSkill.findings.strategic_readiness?.includes('Dominação') ? 'text-emerald-400' : 'text-orange-400'}`}>{keywordSkill.findings.strategic_readiness || 'Analisando'}</p>
                          </div>
                        </div>

                        {/* TOP 10 KEYWORDS TABLE */}
                        {keywordSkill.findings.top_10_keywords_regiao && keywordSkill.findings.top_10_keywords_regiao.length > 0 && (
                          <div className="mb-6 bg-blue-950/20 p-5 rounded-2xl border border-blue-500/10">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 uppercase tracking-wide border-b border-blue-500/20 pb-2">
                              <BarChart3 className="w-4 h-4 text-blue-400" /> Top 10 Keywords do Segmento na Região
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-xs text-blue-300 uppercase tracking-widest border-b border-blue-500/20">
                                    <th className="text-left py-2 px-3 w-8">#</th>
                                    <th className="text-left py-2 px-3">Palavra-Chave</th>
                                    <th className="text-center py-2 px-3">Volume</th>
                                    <th className="text-center py-2 px-3">Intenção</th>
                                    <th className="text-center py-2 px-3 hidden md:table-cell">Cidade</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {keywordSkill.findings.top_10_keywords_regiao.map((kw: any, idx: number) => (
                                    <tr key={`top-kw-${idx}`} className="border-b border-zinc-800/50 hover:bg-blue-950/30 transition-colors">
                                      <td className="py-2.5 px-3 text-blue-400 font-black">{idx + 1}</td>
                                      <td className="py-2.5 px-3 text-slate-200 font-semibold">{kw.keyword}</td>
                                      <td className="py-2.5 px-3 text-center">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kw.volume_estimado === 'Alto' ? 'bg-emerald-500/20 text-emerald-300' : kw.volume_estimado === 'Médio' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-slate-500/20 text-slate-300'}`}>{kw.volume_estimado}</span>
                                      </td>
                                      <td className="py-2.5 px-3 text-center">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kw.intencao === 'Compra' ? 'bg-violet-500/20 text-violet-300' : kw.intencao === 'Comparação' ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'}`}>{kw.intencao}</span>
                                      </td>
                                      <td className="py-2.5 px-3 text-center text-slate-400 hidden md:table-cell">{kw.cidade}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Competition Map */}
                        {keywordSkill.findings.opportunity_chart_data && keywordSkill.findings.opportunity_chart_data.length > 0 && (
                          <div className="mb-6 bg-black/40 p-5 rounded-xl border border-zinc-800">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 uppercase tracking-wide border-b border-zinc-700 pb-2">
                              <Target className="w-4 h-4 text-blue-400" /> Mapa de Concorrência por Keyword
                            </h4>
                            <div className="space-y-3">
                              {keywordSkill.findings.opportunity_chart_data.map((item: any, idx: number) => (
                                <div key={`comp-${idx}`} className="group">
                                  <div className="flex justify-between items-end mb-1.5">
                                    <span className="text-sm text-slate-200 font-bold group-hover:text-white transition-colors truncate pr-4 max-w-[60%]">{item.keyword}</span>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${item.competition_level === 'Alta' ? 'bg-red-500/20 text-red-300' : item.competition_level === 'Média' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{item.competition_level}</span>
                                      <span className="text-xs text-slate-500">{item.paid_ads_count} ads</span>
                                    </div>
                                  </div>
                                  <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${item.competition_level === 'Alta' ? 'bg-gradient-to-r from-red-600 to-red-400' : item.competition_level === 'Média' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`} style={{ width: `${item.opportunity_score}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Strategic Insights */}
                        {keywordSkill.findings.purchasing_power_verdict && (
                          <div className="bg-indigo-950/20 p-5 rounded-xl border-l-4 border-indigo-500 mb-6">
                            <h4 className="text-xs uppercase font-bold text-indigo-300 mb-2 tracking-widest flex items-center gap-2"><Briefcase className="w-3 h-3" /> Veredito de Poder de Compra</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">{keywordSkill.findings.purchasing_power_verdict}</p>
                          </div>
                        )}

                        {keywordSkill.findings.competitor_analysis && (
                          <div className="bg-orange-950/20 p-5 rounded-xl border-l-4 border-orange-500 mb-6">
                            <h4 className="text-xs uppercase font-bold text-orange-300 mb-2 tracking-widest flex items-center gap-2"><Users className="w-3 h-3" /> Análise de Concorrência</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">{keywordSkill.findings.competitor_analysis}</p>
                          </div>
                        )}

                        {/* Related Queries */}
                        {keywordSkill.findings.related_queries && keywordSkill.findings.related_queries.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-xs uppercase font-bold text-blue-400 mb-3 tracking-widest border-b border-white/5 pb-2">Termos Sugeridos pelo Google (Live)</h4>
                            <div className="flex flex-wrap gap-2">
                              {keywordSkill.findings.related_queries.map((term: string, idx: number) => (
                                <span key={`rq-${idx}`} className="text-xs bg-blue-950/30 text-blue-200 border border-blue-500/20 px-2.5 py-1.5 rounded-lg hover:bg-blue-900/30 transition-colors">{term}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Domination Plan */}
                        {keywordSkill.findings.search_domination_plan && keywordSkill.findings.search_domination_plan.length > 0 && (
                          <div className="mb-6 bg-violet-950/20 p-5 rounded-xl border border-violet-500/20">
                            <h4 className="text-xs uppercase font-bold text-violet-300 mb-3 tracking-widest flex items-center gap-2"><KeyRound className="w-3 h-3" /> Plano de Dominação de Busca</h4>
                            <div className="flex flex-wrap gap-2">
                              {keywordSkill.findings.search_domination_plan.map((kw: string, idx: number) => (
                                <span key={`dom-${idx}`} className="text-sm bg-violet-950/40 text-violet-200 border border-violet-500/20 px-3 py-1.5 rounded-lg font-semibold">{kw}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {keywordSkill.critical_pains && keywordSkill.critical_pains.length > 0 && (
                          <div className="mt-4 bg-red-950/20 border-l-2 border-red-500 p-4 rounded-r-xl">
                            <h4 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2 uppercase tracking-wider text-xs">
                              <AlertTriangle className="w-4 h-4" /> Alertas de Campanha / SEO
                            </h4>
                            <ul className="list-disc pl-5 space-y-1.5 text-red-200/80 text-sm">
                              {keywordSkill.critical_pains.map((pain: string, idx: number) => (
                                <li key={`kwp-${idx}`} className="leading-snug">{pain}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tela 7: Plano Comercial AI */}
                    {activeTab === 'commercial' && (
                      <div className="bg-gradient-to-br from-indigo-950/40 via-purple-900/10 to-transparent p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-3xl border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.08)] relative overflow-hidden">
                        {/* Background decorations */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-fuchsia-500/10 blur-[80px] rounded-full"></div>
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                          <div>
                            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-indigo-300 to-white flex items-center gap-3 drop-shadow-sm">
                              <span className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                <Target className="w-6 h-6 text-fuchsia-400" />
                              </span>
                              Plano Comercial High-Ticket
                            </h3>
                            <p className="text-sm font-medium text-slate-400 mt-2 px-1">
                              A Inteligência Artificial cruza os gargalos do Dossiê para formatar pacotes de venda da Agência perfeitamente alinhados à dor do Cliente.
                            </p>
                          </div>

                          {!commercialPlan && (
                            <button
                              onClick={handleGenerateProposal}
                              disabled={isGeneratingProposal}
                              className={`whitespace-nowrap flex items-center gap-3 px-6 py-3.5 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all ${isGeneratingProposal ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' : 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white scale-100 hover:scale-105 active:scale-95'}`}
                            >
                              {isGeneratingProposal ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Processando Dores...</>
                              ) : (
                                <><Play className="w-5 h-5 fill-white" /> Gerar Plano de Vendas</>
                              )}
                            </button>
                          )}
                        </div>

                        {commercialPlan && (
                          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 relative z-10">
                            <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border-l-4 border-fuchsia-500 text-slate-200 shadow-inner">
                              <p className="text-sm md:text-base font-medium leading-relaxed italic">&quot;{commercialPlan.mensagem_abertura}&quot;</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                              {commercialPlan.servicos_recomendados.map((srv, idx) => (
                                <div key={idx} className="bg-black/30 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-5 flex flex-col hover:bg-black/50 hover:border-indigo-400/40 transition-all hover:-translate-y-1 shadow-lg group">
                                  <h4 className="text-lg font-black text-indigo-300 mb-4 pb-3 border-b border-white/5 flex items-center justify-between group-hover:text-fuchsia-300 transition-colors">
                                    {srv.nome_servico}
                                    <span className="text-[10px] w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">0{idx + 1}</span>
                                  </h4>

                                  <div className="space-y-4 flex-1">
                                    <div>
                                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Evidência / Por Que Vender</p>
                                      <p className="text-sm text-slate-300 leading-relaxed font-medium bg-white/5 p-3 rounded-xl shadow-inner border border-white/5">{srv.por_que_vender}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500/70 mb-1 flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Impacto de Conversão</p>
                                      <p className="text-sm text-emerald-100/80 font-medium leading-relaxed">{srv.impacto_esperado}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-8 bg-indigo-950/40 p-6 rounded-2xl border border-indigo-500/30 text-center">
                              <h4 className="text-xs uppercase font-black tracking-widest text-indigo-400 mb-3">Tese de Venda (Closings)</h4>
                              <p className="text-indigo-100/90 text-sm font-semibold max-w-3xl mx-auto leading-relaxed">
                                {commercialPlan.projecao_resultado}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Diagnostic Modal Overlay */}
      {
        showDiagnosticModal && reportData && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto p-4 py-8"
              onClick={(e) => e.target === e.currentTarget && setShowDiagnosticModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-4xl bg-[#080c14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-brand-purple/40 via-indigo-900/30 to-[#080c14] px-8 pt-8 pb-6 border-b border-white/10">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-purple/20 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                  </div>
                  <button
                    onClick={() => setShowDiagnosticModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors z-10"
                  >
                    <XCircle className="w-4 h-4 text-slate-400" />
                  </button>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-indigo-600 flex items-center justify-center shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-brand-purple uppercase tracking-widest">Dossiê Digital Completo</p>
                        <p className="text-xs text-slate-500">Relatório de Auditoria — {companyName || reportData?.target_url}</p>
                      </div>
                    </div>
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                      Diagnóstico de Presença Digital
                    </h1>
                  </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-6">
                  {/* Score Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {reportData.skills_results.filter(s => s.score !== undefined && !s.name?.includes('Value')).map((skill, idx) => (
                      <div key={`diag-${idx}`} className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                        <p className="text-xs text-slate-400 font-semibold mb-1 truncate">{skill.name?.replace(/ Agent.*$/, '').replace(/^(.*Skill|.*Auditor).*$/, skill.name.split('(')[0]?.trim()) || 'Motor'}</p>
                        <p className={`text-2xl font-black ${(skill.score || 0) >= 70 ? 'text-emerald-400' : (skill.score || 0) >= 40 ? 'text-orange-400' : 'text-red-400'}`}>
                          {skill.score || 0}<span className="text-sm text-slate-600">/100</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Critical Issues */}
                  {reportData.skills_results.some(s => s.critical_pains && s.critical_pains.length > 0) && (
                    <div className="bg-red-950/20 border-l-4 border-red-500 p-5 rounded-r-xl">
                      <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Problemas Críticos Detectados
                      </h3>
                      <ul className="space-y-1.5">
                        {reportData.skills_results.flatMap(s => s.critical_pains || []).slice(0, 8).map((pain, idx) => (
                          <li key={`diag-pain-${idx}`} className="text-sm text-red-200/80 flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span> {pain}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Boss Verdict */}
                  {(() => {
                    const bossSkill = reportData.skills_results.find(s => s.name?.includes('Senior CMO') || s.name?.includes('Boss'));
                    return bossSkill?.findings?.cmo_verdict ? (
                      <div className="bg-indigo-950/20 p-5 rounded-xl border-l-4 border-indigo-500">
                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Briefcase className="w-3 h-3" /> Veredito do Analista Senior
                        </h3>
                        <p className="text-sm text-slate-300 leading-relaxed">{bossSkill.findings.cmo_verdict}</p>
                      </div>
                    ) : null;
                  })()}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={handleGenerateDiagnosticPDF}
                      disabled={isGeneratingDiagnosticPDF}
                      className="px-6 py-3 text-sm font-bold flex items-center gap-2 bg-gradient-to-r from-brand-purple to-indigo-600 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-60"
                    >
                      {isGeneratingDiagnosticPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      Exportar Diagnóstico em PDF
                    </button>

                    <button
                      onClick={async () => {
                        await handleShareReport();
                      }}
                      disabled={isSaving}
                      className="px-5 py-3 text-sm font-semibold flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition-all"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                      Gerar Link de Compartilhamento
                    </button>

                    {shareLink && (
                      <div className="flex items-center gap-2 bg-spring-green-400/10 px-4 py-2 rounded-full border border-spring-green-400/20">
                        <CheckCircle2 className="w-4 h-4 text-spring-green-400" />
                        <a href={shareLink} target="_blank" rel="noopener noreferrer" className="text-xs text-spring-green-400 hover:text-white underline truncate max-w-[250px]">
                          {shareLink.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )
      }

      {/* Value Proposition Modal Overlay */}
      {
        showValueProposition && valuePropositionData && (
          <ValuePropositionModal
            data={valuePropositionData}
            companyName={companyName || reportData?.target_url || ''}
            onClose={() => setShowValueProposition(false)}
            onDownloadDiagnostic={handleGenerateDiagnosticPDF}
          />
        )
      }
      {/* Hidden PDF Content for Printing */}
      <DiagnosticPDF reportData={reportData} designSkill={designSkill} />
      {
        reportData && (
          <ProposalPDF
            reportData={reportData}
            designSkill={designSkill}
            commercialPlan={commercialPlan}
          />
        )
      }
    </main >
  );
}
