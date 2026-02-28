import os
from apify_client import ApifyClient
client = ApifyClient(os.getenv("APIFY_API_TOKEN"))
run = client.actor("apify/instagram-profile-scraper").call(run_input={"usernames": ["grooway"]})
for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(item)
