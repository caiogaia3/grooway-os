'use client';

import { useState, useEffect } from 'react';
import { FormData } from './ProposalGenerator';
import { Loader2 } from 'lucide-react';

interface ProposalFormProps {
  onSubmit: (data: FormData) => void;
  isGenerating: boolean;
}

export function ProposalForm({ onSubmit, isGenerating }: ProposalFormProps) {
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientNiche: '',
    mainPain: '',
    services: '',
    techDifferential: '',
    setupValue: '',
    monthlyValue: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setFormData(prev => ({
        clientName: params.get('clientName') || prev.clientName,
        clientNiche: params.get('clientNiche') || prev.clientNiche,
        mainPain: params.get('mainPain') || prev.mainPain,
        services: params.get('services') || prev.services,
        techDifferential: params.get('techDifferential') || prev.techDifferential,
        setupValue: params.get('setupValue') || prev.setupValue,
        monthlyValue: params.get('monthlyValue') || prev.monthlyValue,
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationError) setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientName || !formData.clientNiche || !formData.mainPain || !formData.services || !formData.techDifferential || !formData.setupValue || !formData.monthlyValue) {
      setValidationError("Por favor, preencha todos os campos para gerar a proposta.");
      return;
    }

    setValidationError(null);
    onSubmit(formData);
  };

  const inputClasses = "w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all";
  const labelClasses = "block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClasses}>Nome do Cliente / Empresa</label>
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          placeholder="Ex: Brago Facilities"
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Nicho de Atuação</label>
        <input
          type="text"
          name="clientNiche"
          value={formData.clientNiche}
          onChange={handleChange}
          placeholder="Ex: Limpeza e Portaria Terceirizada"
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>Dor Principal</label>
        <textarea
          name="mainPain"
          value={formData.mainPain}
          onChange={handleChange}
          placeholder="Ex: Não conseguem leads qualificados, apenas curiosos pedindo preço."
          rows={3}
          className={`${inputClasses} resize-none`}
        />
      </div>

      <div>
        <label className={labelClasses}>Serviços Oferecidos (O que vamos vender)</label>
        <textarea
          name="services"
          value={formData.services}
          onChange={handleChange}
          placeholder="Ex: Máquina de Vendas B2B, Google Ads, Landing Page."
          rows={3}
          className={`${inputClasses} resize-none`}
        />
      </div>

      <div>
        <label className={labelClasses}>Diferencial Tecnológico (IA/Automação)</label>
        <textarea
          name="techDifferential"
          value={formData.techDifferential}
          onChange={handleChange}
          placeholder="Ex: Blog Automático com IA para SEO, Dashboard em Tempo Real."
          rows={2}
          className={`${inputClasses} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Valor Setup (R$)</label>
          <input
            type="text"
            name="setupValue"
            value={formData.setupValue}
            onChange={handleChange}
            placeholder="Ex: 1.600,00"
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Valor Mensal (R$)</label>
          <input
            type="text"
            name="monthlyValue"
            value={formData.monthlyValue}
            onChange={handleChange}
            placeholder="Ex: 2.300,00"
            className={inputClasses}
          />
        </div>
      </div>

      {validationError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {validationError}
        </div>
      )}

      <button
        type="submit"
        disabled={isGenerating}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gerando Proposta...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path>
              <path d="m14 7 3 3"></path>
              <path d="M5 6v4"></path>
              <path d="M19 14v4"></path>
              <path d="M10 2v2"></path>
              <path d="M7 8H3"></path>
              <path d="M21 16h-4"></path>
              <path d="M11 3H9"></path>
            </svg>
            Gerar Proposta de Alto Valor
          </>
        )}
      </button>
    </form>
  );
}
