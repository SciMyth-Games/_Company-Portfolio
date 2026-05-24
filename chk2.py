import urllib.request
import json
import sys

response = urllib.request.urlopen("https://rez26.github.io/_Portfolio/data/cv.json")
data = json.loads(response.read())

for p in data["projects"]:
    t = p["title"]
    if "Surprise" in t or "Word Dash" in t:
        print(f"TITLE: {t}")
        print(f"  DL: {p.get('download')}")
        print(f"  VID: {p.get('video')}")
        print(f"  DEMO: {p.get('demo')}")

