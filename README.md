Orbital Portfolio — Showcase Only

Files
- index.html — single page markup
- index.css.txt — styles
- app.js — interactive behavior

Run locally (PowerShell):

```powershell
# From the repository root (D:\_Company Portfolio)
python -m http.server 8000; Start-Process "http://localhost:8000"
```

If you don't have Python, you can use Node's serve package:

```powershell
npx serve . -l 8000
```
