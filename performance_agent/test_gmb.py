import os
from apify_client import ApifyClient
from dotenv import load_dotenv

load_dotenv(dotenv_path="../raio-x-digital/.env.local")
token = os.getenv("APIFY_API_TOKEN")

if not token:
    print("Sem token")
    exit()

client = ApifyClient(token)

print("Iniciando busca no Google Maps via Apify...")
run_input = {
    "searchStringsArray": ["advocacia sao paulo"],
    "maxCrawledPlacesPerSearch": 1,
    "language": "pt",
}

try:
    # dJkUcVMAQwbpaE83I is the compass/google-maps scraper
    run = client.actor("dJkUcVMAQwbpaE83I").call(run_input=run_input)
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        print(f"Nome: {item.get('title')}")
        print(f"Nota: {item.get('totalScore')}")
        print(f"Reviews: {item.get('reviewsCount')}")
        print(f"Site: {item.get('website')}")
        break
except Exception as e:
    print(f"Erro: {e}")
