import requests
import json
import logging
from pathlib import Path
from time import sleep

BASE_URL = "https://platform.fondoambiente.it/api/luoghi"
PER_PAGE = 300
OUT_FILE = Path("data/beni-fai.json")

# ─────────────────────────────────────────────
# Logging setup
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("FAI-scraper")


def fetch_page(page: int):
    log.info(f"Richiesta pagina {page}")
    params = {
        "limit": PER_PAGE,
        "page": page,
        "coord_geo_lat": "null|NOT",
        "coord_geo_long": "null|NOT",
    }

    r = requests.get(BASE_URL, params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def normalize(luogo: dict):
    return {
        "id": luogo["id"],
        "title": luogo["nome"],
        "description": luogo.get("metadescription")
        or luogo.get("descrizione_short"),
        "lat": luogo["coord_geo_lat"],
        "lng": luogo["coord_geo_long"],
        "url": f"https://fondoambiente.it/luoghi/{luogo['slug']}",
    }


def main():
    log.info("🚀 Avvio scraping beni FAI")

    page = 1
    total_raw = 0
    total_valid = 0
    all_luoghi = []

    while True:
        data = fetch_page(page).get("data", [])

        if not data:
            log.info("Nessun dato restituito, fine paginazione")
            break

        log.info(f"Pagina {page}: ricevuti {len(data)} luoghi")
        total_raw += len(data)

        for luogo in data:
            if (
                luogo.get("slug")
                and luogo.get("coord_geo_lat")
                and luogo.get("coord_geo_long")
            ):
                all_luoghi.append(normalize(luogo))
                total_valid += 1

        page += 1
        sleep(0.3)  # piccolo delay di cortesia

    log.info(f"Totale luoghi ricevuti: {total_raw}")
    log.info(f"Totale luoghi validi:   {total_valid}")

    OUT_FILE.parent.mkdir(exist_ok=True)
    OUT_FILE.write_text(
        json.dumps(all_luoghi, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    log.info(f"💾 JSON scritto in {OUT_FILE}")
    log.info("✅ Scraping completato con successo")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        log.exception("❌ Errore durante lo scraping")
        raise
