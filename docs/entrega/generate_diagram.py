import matplotlib.pyplot as plt
import matplotlib.patches as mp

PRIMARY = "#1F4E79"
ACCENT = "#D9E2F3"
LIGHT = "#F2F2F2"
GREEN = "#2E7D32"
ORANGE = "#B7950B"
RED = "#C0392B"
TEXT = "#202020"
GREY = "#808080"

fig, ax = plt.subplots(figsize=(13, 7))
ax.set_xlim(0, 13)
ax.set_ylim(0, 7)
ax.axis("off")


def box(x, y, w, h, label, sub=None, color=PRIMARY, fill=ACCENT, fontsize=10, bold=True):
    rect = mp.FancyBboxPatch(
        (x, y), w, h,
        boxstyle="round,pad=0.04,rounding_size=0.12",
        linewidth=1.6, edgecolor=color, facecolor=fill,
    )
    ax.add_patch(rect)
    ax.text(x + w / 2, y + h / 2 + (0.18 if sub else 0), label,
            ha="center", va="center", fontsize=fontsize,
            fontweight="bold" if bold else "normal", color=TEXT)
    if sub:
        ax.text(x + w / 2, y + h / 2 - 0.22, sub,
                ha="center", va="center", fontsize=fontsize - 1, color=GREY)


def arrow(x1, y1, x2, y2, color=PRIMARY, style="->", lw=1.4):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=lw,
                                connectionstyle="arc3,rad=0"))


# Title
ax.text(6.5, 6.65, "Pipeline DevSecOps — Charmaway",
        ha="center", va="center", fontsize=14, fontweight="bold", color=PRIMARY)

# 1. Developer / commit
box(0.2, 5.0, 2.0, 0.9, "Push / PR", "develop · main", color=PRIMARY, fill="#FFFFFF")

# 2. GitHub Actions trigger
box(2.7, 5.0, 2.4, 0.9, "GitHub Actions",
    "devsecops.yml", color=PRIMARY, fill=ACCENT)

arrow(2.2, 5.45, 2.7, 5.45)

# 3. Four parallel jobs
job_y = 3.2
job_w = 2.3
job_h = 1.1
gap = 0.3
start_x = 0.6

jobs = [
    ("SCA", "pip-audit", "4 CVEs"),
    ("SAST", "Bandit", "339 hallazgos"),
    ("IaC", "Trivy fs", "4 vulns"),
    ("DAST", "OWASP ZAP", "12 alertas"),
]

job_centers = []
for i, (phase, tool, finding) in enumerate(jobs):
    x = start_x + i * (job_w + gap)
    box(x, job_y, job_w, job_h, f"{phase}", f"{tool}\n{finding}", color=PRIMARY, fill=ACCENT, fontsize=10)
    job_centers.append(x + job_w / 2)
    # arrow from GA to job
    arrow(3.9, 5.0, x + job_w / 2, job_y + job_h)

# 4. Reports as artifacts (small box per job)
art_y = 1.9
for cx in job_centers:
    box(cx - 0.7, art_y, 1.4, 0.55,
        "Reporte", None, color=GREY, fill=LIGHT, fontsize=9, bold=False)
    arrow(cx, job_y, cx, art_y + 0.55)

# 5. DefectDojo (centered, big)
box(3.5, 0.4, 6, 1.0,
    "DefectDojo",
    "reimport-scan · deduplicación · ciclo de vida",
    color=PRIMARY, fill=ACCENT, fontsize=11)

for cx in job_centers:
    arrow(cx, art_y, cx if 3.5 < cx < 9.5 else (3.5 if cx <= 3.5 else 9.5), 1.4,
          color=PRIMARY, lw=1.0)

# 6. GitHub Issues (right side)
box(10.4, 5.0, 2.4, 0.9, "GitHub Issues",
    "36 issues triage", color=PRIMARY, fill="#FFFFFF")

# Sync script
box(10.4, 0.4, 2.4, 1.0, "sync_issues.py",
    "Dojo → GitHub", color=PRIMARY, fill=LIGHT, fontsize=10)

# Arrows: DefectDojo -> sync_issues -> GitHub Issues
arrow(9.5, 0.9, 10.4, 0.9)
arrow(11.6, 1.4, 11.6, 5.0)

# Legend
ax.text(0.2, 0.05, "Verde / mitigada · Naranja / activa · Gris / informativa",
        ha="left", va="bottom", fontsize=8, color=GREY, style="italic")

plt.savefig("E:/Visual Studio/PAI-5-Charmaway/docs/entrega/evidencias/diagrama-pipeline.png",
            dpi=160, bbox_inches="tight", facecolor="white")
print("Diagram saved")
