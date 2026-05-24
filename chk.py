import urllib.request
import json
import sys

response = urllib.request.urlopen("https://rez26.github.io/_Portfolio/data/cv.json")
data = json.loads(response.read())

for p in data["projects"]:
    if "Surprise" in p["title"] or "Word Dash" in p["title"]:
        print(f"--- {p['title']} ---")
        for k, v in p.items():
            print(f"{k}: {v}")

