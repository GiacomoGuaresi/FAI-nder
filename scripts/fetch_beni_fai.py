import requests
import json
import logging
import warnings
import re
from pathlib import Path
from time import sleep
from urllib3.exceptions import NotOpenSSLWarning

# ─── silenzia warning inutili ─────────────────────
warnings.filterwarnings("ignore", category=NotOpenSSLWarning)

# ─── logging ──────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("FAI")

BASE_URL = "https://platform.fondoambiente.it/api/luoghi/faixme"
OUT_FILE = Path("data/beni-fai.json")
PER_PAGE = 300


def clean_html(html_text):
    """Rimuove i tag HTML dal testo e pulisce il contenuto."""
    if not html_text:
        return None
    
    # Rimuovi i tag HTML
    text = re.sub(r'<[^>]+>', '', html_text)
    
    # Pulisci spazi multipli e caratteri speciali
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Rimuovi caratteri di escape
    text = text.replace('\r', '').replace('\n', ' ')
    
    return text if text else None


def main():
    log.info("🚀 Avvio scraping FAI (solo luoghi)")

    page = 1
    luoghi = {}
    totale_offerte = 0

    while True:
        log.info(f"➡️  Fetch pagina {page}")

        r = requests.get(
            BASE_URL,
            params={
                "limit": PER_PAGE,
                "page": page,
                "slug": "null|NOT",
                "with": "luogo",
            },
            timeout=30,
        )
        r.raise_for_status()

        data = r.json().get("data", [])

        if not data:
            log.info("⛔ Nessun altro dato, fine paginazione")
            break

        log.info(f"📦 Ricevute {len(data)} offerte")
        totale_offerte += len(data)

        for item in data:
            luogo = item.get("luogo")
            if not luogo:
                continue

            lid = luogo["id"]

            if lid in luoghi:
                continue

            lat = luogo.get("coord_geo_lat")
            lng = luogo.get("coord_geo_long")

            if lat is None or lng is None:
                log.debug(f"❌ Luogo {lid} senza coordinate")
                continue

            # Pulisci la descrizione HTML
            descrizione_pulita = clean_html(item.get("descrizione_html"))

            luoghi[lid] = {
                "id": lid,
                "title": luogo["nome"],
                "lat": lat,
                "lng": lng,
                "url": f"https://fondoambiente.it/luoghi/{luogo['slug']}",
                "description": descrizione_pulita,
            }

            log.info(f"📍 Aggiunto luogo: {luogo['nome']}")

        page += 1
        sleep(0.3)

    results = list(luoghi.values())

    OUT_FILE.parent.mkdir(exist_ok=True)
    OUT_FILE.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    log.info("────────────────────────────────")
    log.info(f"📊 Offerte totali API: {totale_offerte}")
    log.info(f"📍 Luoghi unici salvati: {len(results)}")
    log.info(f"💾 File scritto: {OUT_FILE}")
    log.info("✅ FINE")


if __name__ == "__main__":
    main()
