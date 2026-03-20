'use client';

import { useState } from 'react';
import { ProposalForm } from './ProposalForm';
import { ProposalPreview } from './ProposalPreview';
import { GoogleGenAI, Type } from '@google/genai';
import { Loader2 } from 'lucide-react';

export interface FormData {
  clientName: string;
  clientNiche: string;
  mainPain: string;
  services: string;
  techDifferential: string;
  setupValue: string;
  monthlyValue: string;
}

export interface ProposalData {
  title: string;
  concept: {
    title: string;
    paragraphs: string[];
  };
  pillars: {
    title: string;
    description: string;
  }[];
  scope: {
    title: string;
    items: string[];
  }[];
  investment: {
    setup: { title: string; description: string; value: string };
    monthly: { title: string; description: string; value: string };
    media: { title: string; description: string; value: string };
  };
  security: {
    title: string;
    description: string;
    bullets: string[];
  };
  nextSteps: {
    validity: string;
    steps: string[];
  };
}

const mockProposal: ProposalData = {
  title: "Proposta Comercial: Brago Facilities",
  concept: {
    title: "Tecnologia a Serviço da Confiança",
    paragraphs: [
      "O mercado de Facilities é tradicional, mas a forma de contratar mudou. O gestor predial ou de compras não quer apenas preço; ele quer segurança técnica e agilidade.",
      "A Grooway não propõe apenas 'anúncios'. Propomos implementar um ecossistema comercial que une Performance (Tráfego Pago) com Automação (IA). Vamos garantir que a Brago seja encontrada por quem tem a dor urgente e percebida como a autoridade técnica do setor, tudo isso com processos automatizados."
    ]
  },
  pillars: [
    {
      title: "Aquisição de Demanda",
      description: "Foco total em capturar quem já está procurando. Não vamos gastar energia tentando convencer quem não precisa. Vamos aparecer para quem digita 'empresa de limpeza terceirizada' ou 'portaria remota'."
    },
    {
      title: "Autoridade Automática",
      description: "Para vender contratos de alto valor, a Brago precisa provar que entende do assunto. Implementaremos uma Máquina de Conteúdo dentro do site gerida por Inteligência Artificial."
    },
    {
      title: "Transparência Total",
      description: "Chega de relatórios confusos no fim do mês. Você terá acesso a um Dashboard em Tempo Real. Saberá exatamente quanto foi investido e quantos pedidos de orçamento chegaram."
    }
  ],
  scope: [
    {
      title: "Módulo 1: Performance B2B & Business Intelligence",
      items: [
        "Google Ads (Fundo de Funil): Campanhas focadas em intenção de compra e contratos recorrentes.",
        "Meta Ads (Remarketing): Perseguição inteligente para quem visitou o site e não pediu cotação.",
        "Tracking Avançado: Configuração de GA4, GTM e Pixel para rastrear cada conversão.",
        "Dashboard em Tempo Real: Painel exclusivo para a diretoria acompanhar os leads diariamente."
      ]
    },
    {
      title: "Módulo 2: O Hub de Conversão & Blog IA",
      items: [
        "Landing Page de Alta Performance: Página focada 100% em conversão (gatilhos de autoridade, prova social e CTA direto).",
        "Blog Automático (IA): Implementação de sistema que pesquisa tendências, escreve e publica artigos otimizados para SEO automaticamente, garantindo que o site esteja sempre 'vivo' e relevante para o Google."
      ]
    }
  ],
  investment: {
    setup: {
      title: "Setup & Implementação",
      description: "Desenvolvimento de toda a estrutura proprietária da Brago para receber os leads. Este valor é pago apenas uma vez.",
      value: "1.600,00"
    },
    monthly: {
      title: "Acelerador de Negócios",
      description: "Honorários da Grooway pela inteligência, gestão das campanhas e custos das ferramentas de automação (IA).",
      value: "2.700,00"
    },
    media: {
      title: "Verba de Mídia",
      description: "Valor investido diretamente no Google e Meta para comprar os cliques e impressões. Pago diretamente às plataformas.",
      value: "2.500,00"
    }
  },
  security: {
    title: "Vigência e Maturação",
    description: "O trabalho de posicionamento B2B e Inteligência Artificial exige consistência para gerar dados confiáveis.",
    bullets: [
      "Contrato Mínimo: 6 Meses (Renovação automática após o período).",
      "Treinar a IA do Google para encontrar os gerentes de compras certos (e não curiosos).",
      "Indexar os artigos do Blog no Google (o que leva de 3 a 5 meses).",
      "Acompanhar o lead desde a captura até o fechamento do contrato real."
    ]
  },
  nextSteps: {
    validity: "7 dias corridos",
    steps: [
      "Aceite Formal: Confirmação por WhatsApp ou E-mail.",
      "Formalização: Envio do contrato digital e link de pagamento do Setup.",
      "Kick-off: Agendamento da reunião de alinhamento e coleta de acessos."
    ]
  }
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Título principal da proposta" },
    concept: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        paragraphs: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["title", "paragraphs"]
    },
    pillars: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "description"]
      }
    },
    scope: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          items: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "items"]
      }
    },
    investment: {
      type: Type.OBJECT,
      properties: {
        setup: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, value: { type: Type.STRING } },
          required: ["title", "description", "value"]
        },
        monthly: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, value: { type: Type.STRING } },
          required: ["title", "description", "value"]
        },
        media: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, value: { type: Type.STRING } },
          required: ["title", "description", "value"]
        }
      },
      required: ["setup", "monthly", "media"]
    },
    security: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["title", "description", "bullets"]
    },
    nextSteps: {
      type: Type.OBJECT,
      properties: {
        validity: { type: Type.STRING },
        steps: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["validity", "steps"]
    }
  },
  required: ["title", "concept", "pillars", "scope", "investment", "security", "nextSteps"]
};

export function ProposalGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState<ProposalData | null>(mockProposal);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (data: FormData) => {
    setIsGenerating(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      const prompt = `
Você é um Estrategista Comercial Senior especializado em vendas B2B de Alto Ticket (High Ticket).
Sua função não é escrever "textos bonitos", mas sim criar documentos de venda persuasivos, baseados em lógica econômica, autoridade técnica e escassez.

# OBJETIVO
Criar uma Proposta Comercial Irresistível baseada na metodologia "Growth Partner". A proposta deve fugir do padrão "agência de marketing" e posicionar o ofertante como um "Parceiro de Negócios e Tecnologia".

# TONE OF VOICE (TOM DE VOZ)
- Confiança Técnica: Use termos que demonstrem domínio (ex: "Ecossistema", "Ativo Comercial", "Maturação de Dados").
- Direto e Financeiro: Fale a língua do dono da empresa (ROI, Custo de Oportunidade, Margem).
- Não use clichês: Proibido começar com "No mundo digital de hoje...". Vá direto ao ponto.
- Parceiro, não Funcionário: A linguagem deve ser de igual para igual.

# ESTRUTURA OBRIGATÓRIA DA PROPOSTA (Siga esta ordem)
1. O CONCEITO (Reframing): Não venda o serviço, venda o resultado macro. Crie uma tese que justifique por que o método antigo do cliente está falho.
2. PILARES DA ESTRATÉGIA: Divida a solução em 3 pilares claros. Pilar 1: Curto Prazo (Dinheiro rápido/Tráfego). Pilar 2: Longo Prazo/Autoridade (SEO, Blog com IA, Conteúdo). Pilar 3: Segurança/Dados (Tracking, Dashboards).
3. ESCOPO DE ENTREGA (Módulos): Descreva o que será feito, foque no BENEFÍCIO. Inclua um elemento de INOVAÇÃO/IA.
4. INVESTIMENTO (A Engenharia Financeira): Separe os valores em 3 categorias: Setup/Implementação (Valor Único), Fee Mensal (Recorrência), Verba de Mídia (Terceiros).
5. A TRAVA DE SEGURANÇA (Maturação): Inclua uma cláusula de fidelidade (ex: 6 meses). Justifique por necessidade técnica.
6. PRÓXIMOS PASSOS: Validade curta (ex: 7 dias) e 3 passos para iniciar.

# VARIÁVEIS DE ENTRADA DO CLIENTE
- Nome do Cliente: ${data.clientName}
- Nicho do Cliente: ${data.clientNiche}
- Dor Principal: ${data.mainPain}
- Serviços Oferecidos: ${data.services}
- Diferencial Tecnológico: ${data.techDifferential}
- Valor Setup: ${data.setupValue}
- Valor Mensal: ${data.monthlyValue}

# REGRA DE OURO
Sempre que mencionar "Marketing", substitua por termos como "Máquina de Vendas", "Aquisição de Demanda" ou "Inteligência Comercial". O cliente B2B odeia gastar com marketing, mas adora investir em Vendas.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.7,
        }
      });

      if (response.text) {
        const generatedData = JSON.parse(response.text) as ProposalData;
        setProposal(generatedData);
      } else {
        throw new Error("Resposta vazia da IA.");
      }
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao gerar a proposta. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar Form */}
      <div className="w-full lg:w-[400px] border-r border-white/10 bg-[#0A0A0A] p-6 lg:h-screen lg:overflow-y-auto shrink-0">
        <div className="mb-8">
          <p className="text-sm text-neutral-400">Preencha o briefing e a IA gerará uma proposta de alto valor.</p>
        </div>

        <ProposalForm onSubmit={handleGenerate} isGenerating={isGenerating} />

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#050505] lg:h-screen lg:overflow-y-auto relative">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/80 backdrop-blur-sm z-10">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <h3 className="font-display text-xl font-medium mb-2">Construindo a Engenharia Financeira...</h3>
            <p className="text-neutral-400 text-sm max-w-xs text-center">
              A IA está estruturando os pilares, reframing e escopo da proposta. Isso leva alguns segundos.
            </p>
          </div>
        ) : proposal ? (
          <ProposalPreview data={proposal} clientName={proposal.title} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <h2 className="font-display text-2xl font-medium text-neutral-300 mb-2">Nenhuma proposta gerada</h2>
            <p className="max-w-md">
              Preencha os dados do briefing ao lado e clique em gerar para criar uma proposta comercial irresistível.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
