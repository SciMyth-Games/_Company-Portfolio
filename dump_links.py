import sys
import urllib.request, json
response = urllib.request.urlopen('https://rez26.github.io/_Portfolio/data/cv.json')
data = json.loads(response.read())

for p in data['projects']:
    if p['title'] in ['Surprise Sprint', 'Word Dash']:
        print("=======", p['title'], "=======")
        for k, v in p.items():
            print(f"{k}: {v}")

