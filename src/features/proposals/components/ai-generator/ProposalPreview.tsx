'use client';

import { ProposalData } from './ProposalGenerator';
import { motion } from 'motion/react';
import { CheckCircle2, ShieldCheck, Zap, BarChart3, Clock, Download } from 'lucide-react';

interface ProposalPreviewProps {
  data: ProposalData;
  clientName: string;
}

export function ProposalPreview({ data, clientName }: ProposalPreviewProps) {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-8 lg:p-16 print:p-0 print:max-w-none">

      {/* Action Bar (Hidden in print) */}
      <div className="flex justify-end mb-8 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors text-sm font-medium border border-white/10"
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-24 print:space-y-16"
      >

        {/* Hero Section */}
        <section className="relative pt-20 pb-12 border-b border-white/10">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute -top-[50%] -right-[20%] w-[70%] h-[150%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-[0_0_30px_rgba(147,51,234,0.3)]">
              G
            </div>
            <span className="font-semibold tracking-widest uppercase text-sm text-zinc-400">Grooway</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-6">
            {data.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-sm text-zinc-400 font-mono mt-12">
            <div className="flex flex-col">
              <span className="uppercase tracking-wider text-xs text-zinc-500 mb-1">Preparado para</span>
              <span className="text-zinc-200">{clientName}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase tracking-wider text-xs text-zinc-500 mb-1">Escopo</span>
              <span className="text-zinc-200">Máquina de Vendas & Inteligência de Dados</span>
            </div>
          </div>
        </section>

        {/* Concept Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-purple-500 text-xl">01.</span>
            <h2 className="text-3xl font-medium">{data.concept.title}</h2>
          </div>
          <div className="prose prose-invert prose-lg max-w-none text-zinc-400">
            {data.concept.paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed">{p}</p>
            ))}
          </div>
        </section>

        {/* Pillars Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-purple-500 text-xl">02.</span>
            <h2 className="text-3xl font-medium">Pilares da Estratégia</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {data.pillars.map((pillar, i) => (
              <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 hover:bg-zinc-900 transition-colors">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
                  {i === 0 ? <Zap className="w-6 h-6" /> : i === 1 ? <BarChart3 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-medium mb-3">{pillar.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Scope Section */}
        <section className="print:break-before-page">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-purple-500 text-xl">03.</span>
            <h2 className="text-3xl font-medium">Escopo de Entrega</h2>
          </div>

          <div className="space-y-6">
            {data.scope.map((module, i) => (
              <div key={i} className="border border-white/10 rounded-2xl p-8 bg-gradient-to-br from-zinc-900/50 to-transparent">
                <h3 className="text-2xl font-medium mb-6 text-purple-100">{module.title}</h3>
                <ul className="space-y-4">
                  {module.items.map((item, j) => (
                    <li key={j} className="flex gap-4 text-zinc-300">
                      <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Investment Section */}
        <section className="print:break-before-page">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-purple-500 text-xl">04.</span>
            <h2 className="text-3xl font-medium">Engenharia Financeira</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full"></div>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">Valor Único</div>
              <h3 className="text-xl font-medium mb-2">{data.investment.setup.title}</h3>
              <p className="text-zinc-400 text-sm mb-8 min-h-[60px]">{data.investment.setup.description}</p>
              <div className="text-3xl font-semibold text-white">
                {data.investment.setup.value.includes('R$') ? data.investment.setup.value : `R$ ${data.investment.setup.value}`}
              </div>
            </div>

            <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(147,51,234,0.1)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full"></div>
              <div className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-4">Recorrência</div>
              <h3 className="text-xl font-medium mb-2">{data.investment.monthly.title}</h3>
              <p className="text-zinc-300 text-sm mb-8 min-h-[60px]">{data.investment.monthly.description}</p>
              <div className="text-3xl font-semibold text-white flex items-end gap-1">
                {data.investment.monthly.value.includes('R$') ? data.investment.monthly.value : `R$ ${data.investment.monthly.value}`}
                <span className="text-sm text-purple-300 font-normal mb-1">/mês</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full"></div>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">Plataformas</div>
              <h3 className="text-xl font-medium mb-2">{data.investment.media.title}</h3>
              <p className="text-zinc-400 text-sm mb-8 min-h-[60px]">{data.investment.media.description}</p>
              <div className="text-3xl font-semibold text-white flex items-end gap-1">
                {data.investment.media.value.includes('R$') ? data.investment.media.value : `R$ ${data.investment.media.value}`}
                <span className="text-sm text-zinc-500 font-normal mb-1">/mês</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security Lock */}
        <section>
          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
              <Clock className="w-8 h-8 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-2xl font-medium mb-4">{data.security.title}</h2>
              <p className="text-zinc-400 leading-relaxed mb-6">{data.security.description}</p>
              <ul className="space-y-3">
                {data.security.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-300 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="pb-24">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-purple-500 text-xl">05.</span>
            <h2 className="text-3xl font-medium">Próximos Passos</h2>
          </div>

          <div className="bg-gradient-to-r from-purple-900/40 to-zinc-900 border border-purple-500/20 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between gap-12">
              <div className="flex-1">
                <div className="space-y-6">
                  {data.nextSteps.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono text-sm border border-purple-500/30">
                        {i + 1}
                      </div>
                      <span className="text-lg text-zinc-200">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-72 shrink-0 flex flex-col justify-center">
                <div className="bg-black/50 rounded-xl p-6 border border-white/5">
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Validade</div>
                  <div className="text-lg font-medium text-purple-300">{data.nextSteps.validity}</div>
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-sm text-zinc-400 italic">"O setup inicial é subsidiado com base neste tempo mínimo de permanência."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </motion.div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          * {
            border-color: #e5e7eb !important;
          }
          .text-zinc-400, .text-zinc-300, .text-zinc-500, .text-purple-300, .text-purple-400, .text-purple-100 {
            color: #4b5563 !important;
          }
          .text-zinc-200, .text-zinc-100, .text-white {
            color: #111827 !important;
          }
          .bg-zinc-900, .bg-zinc-800 {
            background: white !important;
          }
          .bg-zinc-900\\/50, .bg-purple-900\\/20, .bg-purple-900\\/40, .bg-black\\/50 {
            background: #f9fafb !important;
          }
          .border-white\\/10, .border-white\\/5, .border-purple-500\\/30, .border-purple-500\\/20 {
            border-color: #e5e7eb !important;
          }
          .text-purple-500 {
            color: #7e22ce !important;
          }
          .bg-purple-600 {
            background: #7e22ce !important;
            color: white !important;
          }
          .blur-\\[120px\\], .blur-\\[50px\\] {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
