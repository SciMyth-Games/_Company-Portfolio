import os, json, re

projects_dir = r"D:\_Portfolio\projects"
cv_path = r"D:\_Company Portfolio\cv.json"

with open(cv_path, 'r', encoding='utf-8') as f:
    cv = json.load(f)

for folder in os.listdir(projects_dir):
    p_path = os.path.join(projects_dir, folder, 'index.html')
    if os.path.exists(p_path):
        with open(p_path, 'r', encoding='utf-8') as f:
            html = f.read()

        dl_match = re.search(r'href="([^"]+)"[^>]*>(?:Play Game|Download)', html)
        vid_match = re.search(r'youtube\.com/embed/([^"?]+)', html)

        for proj in cv.get('projects', []):
            demo = proj.get('demo', '')
            if demo and folder + '/' in demo:
                if vid_match:
                    proj['video'] = 'https://youtu.be/' + vid_match.group(1)
                if dl_match:
                    proj['download'] = dl_match.group(1)

with open(cv_path, 'w', encoding='utf-8') as f:
    json.dump(cv, f, indent=2)

print("Updated OK")

