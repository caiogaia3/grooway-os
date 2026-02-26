import abc
import requests
from bs4 import BeautifulSoup
import time

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

    @abc.abstractmethod
    def execute(self) -> dict:
        """
        Executa a varredura específica da Skill e retorna um dicionário
        com os achados (Dores, Notas, Métricas) e um boss_briefing padronizado.
        """
        pass
