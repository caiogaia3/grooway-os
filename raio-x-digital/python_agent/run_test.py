import json
from main import PredatorOrchestrator

params = {
    "companyName": "Brago facilities",
    "city": "Uberaba",
    "instagram": "https://www.instagram.com/bragofacilities/",
    "url": "https://bragofacilities.com.br/"
}
print("Running orchestration...")
bot = PredatorOrchestrator(params)
report = bot.run()
print("\n--- Final Report ---")
print(json.dumps(report, indent=2, ensure_ascii=False))
