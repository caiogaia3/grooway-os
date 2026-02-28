import abc
import requests
from bs4 import BeautifulSoup
import time
import os
import json
from tenacity import retry, stop_after_attempt, wait_exponential

class PredatorSkill(abc.ABC):
    """
    Interface base para todos os Agentes Especialistas (Skills).
    Cada agente DEVE retornar um 'boss_briefing' padronizado para alimentar o Boss.
    """
    def __init__(self, target_url):
        self.target_url = target_url
        self.raw_html = ""
        self.soup = None
        self.load_time = 0.0
        self.previous_results_context = None

    def setup(self, html_content=None, load_time=0.0, previous_results_context=None):
        """Inicializa a Skill com o HTML pré-carregado e qualquer contexto anterior do pipeline."""
        self.raw_html = html_content
        if html_content:
            self.soup = BeautifulSoup(html_content, 'html.parser')
        self.load_time = load_time
        self.previous_results_context = previous_results_context

    @staticmethod
    def _empty_boss_briefing():
        """Retorna a estrutura padrão do briefing que cada agente entrega ao Boss."""
        return {
            "pontos_negativos": [],
            "pontos_positivos": [],
            "brechas_diferenciacao": [],
            "recomendacoes": []
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def _call_llm_json(self, prompt: str, temperature: float = 0.1) -> dict:
        """
        Tenta Gemini primeiro com retry automático. Fallback para OpenAI se esgotar.
        """
        gemini_key = os.getenv("GEMINI_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")
        
        # --- TENTATIVA 1: GEMINI ---
        if gemini_key:
            try:
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=gemini_key)
                response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=temperature,
                        response_mime_type="application/json"
                    )
                )
                if response.text:
                    return json.loads(response.text)
            except Exception as gemini_err:
                err_str = str(gemini_err)
                print(f"  [LLM Error] Gemini falhou: {err_str}")
                # Prossegue para o fallback se houver chave OpenAI
        
        # --- TENTATIVA 2: OPENAI FALLBACK ---
        if openai_key:
            try:
                import openai
                client = openai.OpenAI(api_key=openai_key)
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "Você é um assistente de análise que responde SOMENTE em JSON válido. Sem explicações, sem markdown, apenas o JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=temperature,
                    response_format={"type": "json_object"}
                )
                text = response.choices[0].message.content
                if text:
                    return json.loads(text)
            except Exception as oai_err:
                print(f"  [LLM Fallback] OpenAI também falhou: {oai_err}")
        
        return {}

    @abc.abstractmethod
    def execute(self) -> dict:
        """
        Executa a varredura específica da Skill e retorna um dicionário
        com os achados (Dores, Notas, Métricas) e um boss_briefing padronizado.
        """
        pass

