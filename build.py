#!/usr/bin/env python3
"""Génère les pages HTML du portfolio MIKIN_DEV à partir de src/.

Usage :  python3 build.py
Le header, le footer et le layout sont écrits une seule fois (src/) puis
insérés dans chaque page. Le résultat (index.html, about.html, ...) est du
HTML statique, utilisable sur n'importe quel hébergement.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

# ---------------------------------------------------------------------------
# CONFIGURATION : renseignez ces valeurs quand vous les avez.
# Laissées vides, les éléments correspondants sont simplement masqués
# (aucune fausse coordonnée n'est affichée).
# ---------------------------------------------------------------------------
CONFIG = {
    # URL finale du site, sans slash final. Ex. "https://mikin-dev.com"
    "site_url": "",
    # Adresse e-mail professionnelle affichée sur le site.
    "email": "",
    # Numéro WhatsApp au format international sans "+" ni espaces. Ex. "2250700000000"
    "whatsapp": "2250748424342",
    # Adresse qui reçoit les messages du formulaire (service de formulaire).
    # Ex. Formspree : "https://formspree.io/f/xxxxxxx"
    "form_endpoint": "",
    "linkedin": "https://www.linkedin.com/in/koffi-marcel-yede-8180503a9/",
    "github": "https://github.com/mikinpayne-png",
}

# (fichier de sortie, clé de navigation, titre, description SEO)
PAGES = [
    ("index.html", "index", "Marcel Yédé – Développeur Web & Designer | MIKIN_DEV",
     "Portfolio de Marcel Yédé (MIKIN_DEV), développeur web et designer à Abidjan : sites web, applications de gestion et créations graphiques."),
    ("apropos.html", "about", "À propos – Marcel Yédé | MIKIN_DEV",
     "Qui est Marcel Yédé ? Développeur web et designer en Licence 3 de Sciences informatiques à l'UPCI, basé à Abidjan."),
    ("competences.html", "skills", "Compétences – Marcel Yédé | MIKIN_DEV",
     "Compétences techniques de Marcel Yédé : front-end, back-end, design UI/UX, outils et environnements de développement."),
    ("projects.html", "projects", "Réalisations – Marcel Yédé | MIKIN_DEV",
     "Réalisations web de Marcel Yédé : MentorCI, application de gestion de pressing, Ounzie PKA, gestion scolaire UPCI."),
    ("creations.html", "designs", "Créations graphiques – Marcel Yédé | MIKIN_DEV",
     "Affiches, flyers, logos et visuels de communication réalisés par Marcel Yédé, designer graphique à Abidjan."),
    ("parcours.html", "career", "Parcours – Marcel Yédé | MIKIN_DEV",
     "Parcours professionnel et académique de Marcel Yédé : stage, formations et certifications."),
    ("contact.html", "contact", "Contact – Marcel Yédé | MIKIN_DEV",
     "Contactez Marcel Yédé (MIKIN_DEV) pour un projet web, un design ou une collaboration."),
]

LEGACY_PAGES = {
    "apropos.html": "about.html",
    "competences.html": "skills.html",
    "creations.html": "designs.html",
    "parcours.html": "career.html",
}


def contact_buttons() -> str:
    if CONFIG["whatsapp"]:
        return (
            f'<a class="btn btn-primary btn-block" href="https://wa.me/{CONFIG["whatsapp"]}" '
            'target="_blank" rel="noopener noreferrer">Message WhatsApp</a>'
        )
    return ""


def whatsapp_button() -> str:
    if not CONFIG["whatsapp"]:
        return ""
    return (
        f'<a class="btn btn-primary nav-cta" href="https://wa.me/{CONFIG["whatsapp"]}" '
        'target="_blank" rel="noopener noreferrer">WhatsApp</a>'
    )


def email_line() -> str:
    if not CONFIG["email"]:
        return ""
    return f'<li><strong>E-mail :</strong> <a href="mailto:{CONFIG["email"]}">{CONFIG["email"]}</a></li>'


def main() -> None:
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    header = (SRC / "partials" / "header.html").read_text(encoding="utf-8")
    footer = (SRC / "partials" / "footer.html").read_text(encoding="utf-8")

    site = CONFIG["site_url"].rstrip("/")
    for filename, key, title, desc in PAGES:
        content = (SRC / "pages" / f"{key}.html").read_text(encoding="utf-8")

        page_header = header
        for _, k, _, _ in PAGES:
            attr = ' class="active" aria-current="page"' if k == key else ""
            page_header = page_header.replace("{{active_" + k + "}}", attr)
        if site:
            url = f"{site}/" if filename == "index.html" else f"{site}/{filename}"
            seo_url = (f'<link rel="canonical" href="{url}">\n  '
                       f'<meta property="og:url" content="{url}">')
        else:
            seo_url = ""

        html = (layout.replace("{{header}}", page_header)
                      .replace("{{footer}}", footer)
                      .replace("{{content}}", content)
                      .replace("{{seo_url}}", seo_url)
                      .replace("{{title}}", title)
                      .replace("{{description}}", desc)
                      .replace("{{page}}", key))
        html = (html.replace("{{contact_buttons}}", contact_buttons())
                    .replace("{{whatsapp_button}}", whatsapp_button())
                    .replace("{{email_line}}", email_line())
                    .replace("{{form_action}}", CONFIG["form_endpoint"])
                    .replace("{{email}}", CONFIG["email"])
                    .replace("{{linkedin}}", CONFIG["linkedin"])
                    .replace("{{github}}", CONFIG["github"]))
        (ROOT / filename).write_text(html, encoding="utf-8")
        legacy_filename = LEGACY_PAGES.get(filename)
        if legacy_filename:
            (ROOT / legacy_filename).write_text(html, encoding="utf-8")
        print("généré :", filename)

    missing = [k for k in ("email", "whatsapp", "form_endpoint", "site_url") if not CONFIG[k]]
    if missing:
        print("\nÀ renseigner dans CONFIG (build.py) :", ", ".join(missing))


if __name__ == "__main__":
    main()
