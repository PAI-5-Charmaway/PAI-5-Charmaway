"""Genera una tarjeta resumen con datos REALES de la API de DefectDojo."""
import requests
import matplotlib.pyplot as plt
import matplotlib.patches as mp
from datetime import datetime

URL = "http://localhost:8088"
TOKEN_RES = requests.post(
    f"{URL}/api/v2/api-token-auth/",
    json={"username": "admin", "password": "admin"},
    timeout=10,
)
TOKEN = TOKEN_RES.json()["token"]
H = {"Authorization": f"Token {TOKEN}"}

active = requests.get(f"{URL}/api/v2/findings/?test=1&active=true&limit=50", headers=H).json()
mitig = requests.get(f"{URL}/api/v2/findings/?test=1&is_mitigated=true&limit=50", headers=H).json()
print(f"active={active['count']} mitig={mitig['count']}")

ours_mitigated = [
    f for f in mitig["results"]
    if "python-dotenv:1.2.1" in f["title"] or "sqlparse:0.5.3" in f["title"]
]
remaining = [f for f in active["results"] if "1.2.1" not in f["title"] and "0.5.3" not in f["title"]]

PRIMARY = "#1F4E79"
GREEN = "#2E7D32"
ORANGE = "#B7950B"
GREY = "#606060"

fig, axes = plt.subplots(1, 2, figsize=(13, 5), gridspec_kw={"width_ratios": [1, 1.4]})

# Chart: bar
ax = axes[0]
labels = ["Activas", "Mitigadas"]
counts = [active["count"], mitig["count"]]
colors = [ORANGE, GREEN]
bars = ax.bar(labels, counts, color=colors, edgecolor="white", width=0.55)
for b, c in zip(bars, counts):
    ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 0.4, str(c),
            ha="center", va="bottom", fontsize=14, fontweight="bold", color=PRIMARY)
ax.set_title("Charmaway · Engagement CI - SCA", fontsize=12, fontweight="bold", color=PRIMARY, pad=12)
ax.set_ylim(0, max(counts) * 1.25)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.tick_params(colors=GREY)

# Right panel: table-like
ax = axes[1]
ax.axis("off")
ax.text(0.0, 1.0, "Findings mitigados durante esta práctica",
        fontsize=12, fontweight="bold", color=GREEN, transform=ax.transAxes)

y = 0.85
for f in ours_mitigated:
    ax.text(0.0, y, "✓", fontsize=14, color=GREEN, fontweight="bold", transform=ax.transAxes)
    ax.text(0.05, y, f["title"], fontsize=11, color="#202020", transform=ax.transAxes)
    ax.text(0.05, y - 0.05,
            f"  Severidad: {f['severity']} · Mitigada: {f.get('mitigated', '?')[:19].replace('T', ' ')}",
            fontsize=9, color=GREY, transform=ax.transAxes)
    y -= 0.13

y -= 0.04
ax.text(0.0, y, "Findings activos pendientes",
        fontsize=12, fontweight="bold", color=ORANGE, transform=ax.transAxes)
y -= 0.07
for f in remaining:
    ax.text(0.0, y, "•", fontsize=14, color=ORANGE, fontweight="bold", transform=ax.transAxes)
    ax.text(0.05, y, f["title"], fontsize=11, color="#202020", transform=ax.transAxes)
    ax.text(0.05, y - 0.05, f"  Severidad: {f['severity']}",
            fontsize=9, color=GREY, transform=ax.transAxes)
    y -= 0.13

fig.suptitle("DefectDojo · Estado de findings tras la mitigación",
             fontsize=14, fontweight="bold", color=PRIMARY, y=1.02)
plt.tight_layout()
plt.savefig("E:/Visual Studio/PAI-5-Charmaway/docs/entrega/evidencias/cap-dojo.png",
            dpi=150, bbox_inches="tight", facecolor="white")
print("Saved")
