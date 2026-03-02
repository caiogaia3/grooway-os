"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Search, Target, Smartphone, Instagram, KeyRound, Briefcase,
    Database, Activity, Shield, Users
} from 'lucide-react';

// Modular Components (Local Features)
import { AuditorForm } from '@/features/xray/components/AuditorForm';
import { ScanningProgress } from '@/features/xray/components/ScanningProgress';
import { AuditorHeader } from '@/features/xray/components/AuditorHeader';
import { ResultsTabs } from '@/features/xray/components/ResultsTabs';
import { ResultsSummary, getScoreBadge } from '@/features/xray/components/ResultsSummary';
import { DiagnosticModal } from '@/features/xray/components/DiagnosticModal';
import { HistoryModal } from '@/features/xray/components/HistoryModal';
import { ScoreRateModal } from '@/features/xray/components/ScoreRateModal';

// Tabs
import { TrackingPanel } from '@/features/xray/components/tabs/TrackingPanel';
import { PerformancePanel } from '@/features/xray/components/tabs/PerformancePanel';
import { MarketPanel } from '@/features/xray/components/tabs/MarketPanel';
import { SocialPanel } from '@/features/xray/components/tabs/SocialPanel';
import { GMBPanel } from '@/features/xray/components/tabs/GMBPanel';
import { KeywordsPanel } from '@/features/xray/components/tabs/KeywordsPanel';
import { CMOPanel } from '@/features/xray/components/tabs/CMOPanel';
import { CommercialPlanPanel } from '@/features/xray/components/tabs/CommercialPlanPanel';

// Actions
import { saveDiagnosticAction } from '@/features/xray/actions/save-diagnostic';
import { saveProposalAction } from '@/features/proposals/actions/save-proposal';
import { triggerAnalysisAction } from '@/features/xray/actions/trigger-analysis';

// Hooks
import { useXrayStatus } from '@/core/hooks/useXrayStatus';

// Shared / Relocated Components
import { ValuePropositionModal } from '@/features/xray/components/ValuePropositionModal';
import { DiagnosticPDF } from '@/features/xray/components/DiagnosticPDF';
import { ProposalPDF } from '@/features/proposals/components/ProposalPDF';

export default function AuditorPage() {
    const [url, setUrl] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [city, setCity] = useState('');
    const [instagram, setInstagram] = useState('');
    const [appState, setAppState] = useState<'input' | 'analyzing' | 'result'>('input');
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [activeTab, setActiveTab] = useState('cmo');

    // Entity IDs for Wave 3 persistence
    const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
    const [currentDiagId, setCurrentDiagId] = useState<string | null>(null);

    const [reportData, setReportData] = useState<any>(null);
    const [commercialPlan, setCommercialPlan] = useState<any>(null);
    const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
    const [showValueProposition, setShowValueProposition] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showScoreRate, setShowScoreRate] = useState(false);
    const [valuePropositionData, setValuePropositionData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [proposalShareLink, setProposalShareLink] = useState<string | null>(null);

    // Reactive Status Polling
    const xrayStatus = useXrayStatus(currentDiagId);

    // Sync hook results to page state
    React.useEffect(() => {
        if (xrayStatus.status === 'complete' && xrayStatus.reportData) {
            setReportData(xrayStatus.reportData);
            // Extract commercial plan if exists in skills_results
            const closer = xrayStatus.reportData.skills_results.find((s: any) => s.id === 'closer');
            if (closer) setCommercialPlan(closer.findings);

            // Extract value prop for the modal
            const alchemist = xrayStatus.reportData.skills_results.find((s: any) => s.id === 'alchemist');
            if (alchemist) setValuePropositionData(alchemist.findings);

            // Play notification sound (Futuristic / Scientific)
            try {
                const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_249258a595.mp3'); // Sci-fi notification
                audio.volume = 0.4;
                audio.play().catch(e => console.log('Audio autoplay blocked by browser', e));
            } catch (e) { }

            // Browser Notification
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Raio-X GroowayOS Concluído", {
                    body: `A análise estratégica da ${companyName || 'empresa'} terminou!`,
                    icon: "/favicon.ico"
                });
            }

            setAppState('result');
            setProgress(100);
        } else if (xrayStatus.status === 'failed') {
            setStatusMessage('A análise falhou: ' + xrayStatus.error);
            alert('A análise falhou: ' + xrayStatus.error);
        }
    }, [xrayStatus, companyName]);

    // Helper to get all agent scores as a map
    const getAgentScores = () => {
        if (!reportData?.skills_results) return {};
        const scores: Record<string, number> = {};
        reportData.skills_results.forEach((s: any) => {
            scores[s.id] = s.score;
        });
        return scores;
    };

    // Request permissions on mount
    React.useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const availableAgents = [
        { id: 'tracking', label: 'Rastreador de Pixels', default: true },
        { id: 'performance', label: 'UX & Performance', default: true },
        { id: 'market', label: 'Cérebro do Mercado', default: true },
        { id: 'social', label: 'Posicionamento Social', default: true },
        { id: 'gmb', label: 'Auditoria Local (GMB)', default: true },
        { id: 'keywords', label: 'Inteligência de Busca', default: true }
    ];
    const [selectedAgents, setSelectedAgents] = useState<string[]>(availableAgents.map(a => a.id));

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setAppState('analyzing');
        setProgress(20);
        setStatusMessage('Iniciando motores de análise...');

        // 1. Create Pending Diagnostic Record
        const res = await saveDiagnosticAction({
            companyName,
            targetUrl: url,
            city,
            instagram,
            status: 'processing'
        });

        if (res.success && res.diagnosticId) {
            setCurrentLeadId(res.leadId || null);
            setCurrentDiagId(res.diagnosticId);
            setProgress(40);
            setStatusMessage('Disparando agentes de inteligência...');

            // 2. Trigger Real Python Analysis
            const triggerRes = await triggerAnalysisAction({
                url: url,
                companyName: companyName,
                diagnosticId: res.diagnosticId,
                selectedAgents: selectedAgents,
                instagram: instagram,
                city: city
            });

            if (!triggerRes.success) {
                setAppState('input');
                alert('Erro ao iniciar agentes: ' + triggerRes.error);
            } else {
                setProgress(60);
                setStatusMessage('Aguardando veredito dos especialistas...');
            }
        } else {
            setAppState('input');
            alert(`Falha ao registrar lead: ${res.error || 'Erro desconhecido'}`);
        }
    };

    const handleShareReport = async () => {
        if (!reportData) return;
        setIsSaving(true);

        const result = await saveDiagnosticAction({
            companyName,
            targetUrl: url,
            city,
            instagram,
            reportData,
            finalScore: 85
        });

        if (result.success) {
            setCurrentLeadId(result.leadId);
            setCurrentDiagId(result.diagnosticId);
            setShareLink(`${window.location.origin}/report/${result.diagnosticId}`);
        } else {
            alert('Erro ao salvar: ' + result.error);
        }
        setIsSaving(false);
    };

    const handleGenerateProposal = async () => {
        if (!reportData) return;

        // Ensure we have IDs (auto-save if needed)
        let lId = currentLeadId;
        let dId = currentDiagId;

        if (!lId || !dId) return alert("Houve um erro com os IDs do diagnóstico.");

        setIsSaving(true);
        const propRes = await saveProposalAction({
            leadId: lId,
            diagnosisId: dId,
            contentJson: valuePropositionData
        });

        if (propRes.success) {
            setProposalShareLink(`${window.location.origin}/proposal/${propRes.proposalId}`);
            alert('Proposta estratégica gerada e salva com sucesso!');
        } else {
            alert('Erro ao gerar proposta: ' + propRes.error);
        }
        setIsSaving(false);
    };

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-12 pb-20">
                <AuditorHeader onOpenHistory={() => setShowHistory(true)} />

                {appState === 'input' && (
                    <AuditorForm
                        url={url} setUrl={setUrl}
                        companyName={companyName} setCompanyName={setCompanyName}
                        city={city} setCity={setCity}
                        instagram={instagram} setInstagram={setInstagram}
                        selectedAgents={selectedAgents} setSelectedAgents={setSelectedAgents}
                        availableAgents={availableAgents}
                        appState={appState}
                        onSubmit={handleAnalyze}
                    />
                )}

                {appState === 'analyzing' && <ScanningProgress progress={progress} analysisText={statusMessage} />}

                <AnimatePresence>
                    {appState === 'result' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <ResultsSummary
                                score={reportData?.final_score || 85}
                                companyName={companyName}
                                onShareReport={handleShareReport}
                                onGenerateProposal={handleGenerateProposal}
                                onOpenPDF={() => { }}
                                onOpenScoreRate={() => setShowScoreRate(true)}
                                isSaving={isSaving}
                                shareLink={shareLink}
                            />

                            <ResultsTabs activeTab={activeTab} onTabChange={setActiveTab} scores={getAgentScores()} />

                            <div className="min-h-[500px]">
                                {activeTab === 'cmo' && <CMOPanel cmoSkill={reportData?.skills_results.find((s: any) => s.id === 'cmo')} getScoreBadge={getScoreBadge} />}
                                {activeTab === 'tracking' && <TrackingPanel trackingSkill={reportData?.skills_results.find((s: any) => s.id === 'tracking')} getScoreBadge={getScoreBadge} />}
                                {activeTab === 'performance' && <PerformancePanel performanceSkill={reportData?.skills_results.find((s: any) => s.id === 'performance')} getScoreBadge={getScoreBadge} />}
                                {activeTab === 'market' && <MarketPanel marketSkill={reportData?.skills_results.find((s: any) => s.id === 'market')} />}
                                {activeTab === 'social' && <SocialPanel socialSkill={reportData?.skills_results.find((s: any) => s.id === 'social')} getScoreBadge={getScoreBadge} />}
                                {activeTab === 'gmb' && <GMBPanel gmbSkill={reportData?.skills_results.find((s: any) => s.id === 'gmb')} getScoreBadge={getScoreBadge} />}
                                {activeTab === 'keywords' && <KeywordsPanel keywordSkill={reportData?.skills_results.find((s: any) => s.id === 'keywords')} getScoreBadge={getScoreBadge} />}
                                {activeTab === 'commercial' && (
                                    <CommercialPlanPanel
                                        commercialPlan={commercialPlan}
                                        isGeneratingProposal={isSaving}
                                        handleGenerateProposal={handleGenerateProposal}
                                    />
                                )}
                                {proposalShareLink && (
                                    <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                                        <div className="text-xs font-bold text-indigo-300">LINK DA PROPOSTA ATIVO:</div>
                                        <div className="flex gap-2">
                                            <code className="text-[10px] bg-black/40 px-3 py-1 rounded-md text-indigo-400 border border-indigo-500/10 truncate max-w-[200px]">{proposalShareLink}</code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(proposalShareLink);
                                                    alert('Copiado!');
                                                }}
                                                className="text-[10px] font-black uppercase text-indigo-300 hover:text-white"
                                            >
                                                Copiar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <DiagnosticModal
                isOpen={showDiagnosticModal}
                onClose={() => setShowDiagnosticModal(false)}
                reportData={reportData}
                companyName={companyName}
                isGeneratingPDF={false}
                onGeneratePDF={() => { }}
                isSaving={isSaving}
                onShareReport={handleShareReport}
                shareLink={shareLink}
            />

            <ValuePropositionModal
                isOpen={showValueProposition}
                onClose={() => setShowValueProposition(false)}
                data={valuePropositionData}
                companyName={companyName}
                onDownloadDiagnostic={() => { }}
            />

            <HistoryModal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
            />

            <ScoreRateModal
                isOpen={showScoreRate}
                onClose={() => setShowScoreRate(false)}
            />

            <div className="hidden">
                <DiagnosticPDF reportData={reportData} designSkill={reportData?.skills_results.find((s: any) => s.id === 'cmo')} />
                <ProposalPDF reportData={reportData} designSkill={reportData?.skills_results.find((s: any) => s.id === 'cmo')} commercialPlan={commercialPlan} />
            </div>
        </>
    );
}
