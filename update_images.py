import os, json

cv_path = r"D:\_Company Portfolio\data\cv.json"
assets_path = r"D:\_Company Portfolio\assets\Screenshots"

# Load the JSON
with open(cv_path, 'r', encoding='utf-8') as f:
    cv = json.load(f)

# Optional mapping to handle differences in project title vs folder name
folder_mapping = {
    "Realm Rival": "Realm Rivals",
    "Word Dash": "Word Dash",
    "Legend of Indra vs Vritrasur": "Legend of Indra vs Vritrasur",
    "Isles Of Echoes On Cybertrom": "Isles Of Echoes On Cybertrom",
    "Reality Run": "RealityRun",
    "Rewind Component System": "Rewind System",
    "RPG Systems Architecture": "Prototype For RPG Game",
    "Lost Cure": "The Lost Cure",
    "It's Me Pico": "Paint Runner",
    "Slimey Jump": "Slimey Jump",
    "Bubble Trap": "Bubble Trap",
    "Word Game": "Word Game",
    "Surprise Sprint": "Surprise Sprint"
}

for proj in cv.get('projects', []):
    title = proj.get('title')
    folder_name = folder_mapping.get(title, title)
    folder_path = os.path.join(assets_path, folder_name)
    
    images = []
    if os.path.exists(folder_path):
        for f in os.listdir(folder_path):
            if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                img_rel_path = f"assets/Screenshots/{folder_name}/{f}"
                images.append(img_rel_path)
    
    if images:
        proj['images'] = images
        # Ensure the main image is the first one
        if not proj.get('image') or proj['image'] not in images:
            proj['image'] = images[0]

with open(cv_path, 'w', encoding='utf-8') as f:
    json.dump(cv, f, indent=2)

print("cv.json updated with all images from the assets folder.")

