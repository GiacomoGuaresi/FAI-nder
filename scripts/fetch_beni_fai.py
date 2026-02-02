import requests
import json
from pathlib import Path

BASE_URL = "https://platform.fondoambiente.it/api/luoghi"
PER_PAGE = 100
OUT_FILE = Path("data/beni-fai.json")


def fetch_page(page: int):
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
    page = 1
    all_luoghi = []

    while True:
        print(f"📥 pagina {page}")
        data = fetch_page(page).get("data", [])
        if not data:
            break

        all_luoghi.extend(data)
        page += 1

    clean = [
        normalize(l)
        for l in all_luoghi
        if l.get("slug") and l.get("coord_geo_lat") and l.get("coord_geo_long")
    ]

    OUT_FILE.parent.mkdir(exist_ok=True)
    OUT_FILE.write_text(
        json.dumps(clean, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(f"✅ salvati {len(clean)} luoghi")


if __name__ == "__main__":
    main()
