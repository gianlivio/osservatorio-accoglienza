#!/usr/bin/env python3
"""Aggrega i dati di Centri d'Italia (ActionAid e Openpolis, CC BY 4.0) per provincia e anno.
Uso: python3 script/centri.py  (legge dati-centri/*.csv, scrive sito/data/centri.json)"""
import csv, collections, json, statistics

CAS = "dati-centri/centri_cas_cpa_hotspot_v2026.csv"
SAI = "dati-centri/sai_progetti_v2026.csv"
SAI_STRUTTURE = "dati-centri/sai_struttura_v2026.csv"
OUT = "sito/data/centri.json"
PROVINCE_LITE = "sito/data/province-lite.json"
NOMI = {"BOLZANO/BOZEN": "BOLZANO", "REGGIO DI CALABRIA": "REGGIO CALABRIA"}
PUBBLICATI_2024 = {"CAS": 96738, "prima accoglienza": 4610}  # presenze, centriditalia.it
PUBBLICATO_SAI_2024 = 33201  # calcolato sul file delle strutture

def num(v):
    try: return float(v)
    except (TypeError, ValueError): return None

def intero(v):
    return int(v) if v is not None else None

nostre = {p["provincia"] for p in json.load(open(PROVINCE_LITE, encoding="utf-8"))["province"]}
sconosciute = set()

def provincia(r):
    nome = NOMI.get(r["provincia_cm_denominazione"], r["provincia_cm_denominazione"])
    if nome not in nostre:
        sconosciute.add(nome)
    return nome

def somma(valori):
    v = [x for x in valori if x is not None]
    return intero(sum(v)) if v else None

# --- CAS, CPA e hotspot: una rilevazione al 31 dicembre per anno --------------
cas = list(csv.DictReader(open(CAS, encoding="utf-8")))
gruppi = collections.defaultdict(list)
nazionale = collections.defaultdict(lambda: collections.defaultdict(float))
for r in cas:
    anno = r["rilevazione_data"][:4]
    gruppi[(provincia(r), anno)].append(r)
    tipo = "CAS" if r["tipologia_centro"].startswith("CAS") else "prima accoglienza"
    nazionale[anno][tipo] += num(r["presenze_giornaliere"]) or 0

# --- SAI: file progetti, una rilevazione per anno. Un progetto è un codice distinto; le righe senza codice contano ciascuna come un progetto
sai = list(csv.DictReader(open(SAI, encoding="utf-8")))
date_sai = {}
for r in sai:
    a = r["data_riferimento"][:4]
    date_sai[a] = max(date_sai.get(a, ""), r["data_riferimento"])
progetti = collections.defaultdict(list)
vuote = collections.defaultdict(lambda: [0, 0, 0, 0])  # righe, senza codice, senza capienza, senza presenze
for i, r in enumerate(sai):
    a = r["data_riferimento"][:4]
    if r["data_riferimento"] != date_sai[a]:
        continue
    r["_id"] = r["progetto_codice"] or f"riga-{i}"
    progetti[(provincia(r), a)].append(r)
    nazionale[a]["SAI"] += num(r["presenze"]) or 0
    v = vuote[a]; v[0] += 1; v[1] += not r["progetto_codice"]
    v[2] += num(r["capienza"]) is None; v[3] += num(r["presenze"]) is None

# presenze SAI sul file delle strutture, ultimo anno: è il totale che Centri d'Italia pubblica
strutture = list(csv.DictReader(open(SAI_STRUTTURE, encoding="utf-8")))
ultimo = max(date_sai)
data_s = max(r["data_rilevazione"] for r in strutture if r["data_rilevazione"][:4] == ultimo)
presenze_strutture = round(sum(num(r["presenze_giornaliere"]) or 0 for r in strutture if r["data_rilevazione"] == data_s))

if sconosciute:
    raise SystemExit(f"Nomi di provincia che non corrispondono alle 107 province: {sorted(sconosciute)}")

anni = sorted({a for _, a in gruppi} | set(date_sai))
province = {}
for (p, a), rr in sorted(gruppi.items()):
    costi = [c for c in (num(r["costo_giornaliero_per_ospite"]) for r in rr) if c is not None]
    province.setdefault(p, {}).setdefault(a, {})["cas"] = {
        "centri": len({r["centro_id"] for r in rr}),
        "capienza": somma(num(r["capienza"]) for r in rr),
        "presenze": somma(num(r["presenze_giornaliere"]) for r in rr),
        "costo_mediano": round(statistics.median(costi), 2) if costi else None,
    }
for (p, a), rr in sorted(progetti.items()):
    province.setdefault(p, {}).setdefault(a, {})["sai"] = {
        "progetti": len({r["_id"] for r in rr}),
        "capienza": somma(num(r["capienza"]) for r in rr),
        "presenze": somma(num(r["presenze"]) for r in rr),
        "senza_presenze": sum(1 for r in rr if num(r["presenze"]) is None),
    }

dati = {
    "fonte": "Centri d'Italia (ActionAid e Openpolis)",
    "url": "https://centriditalia.it",
    "licenza": "CC BY 4.0",
    "anni": anni,
    "rilevazioni_cas": {a: max(r["rilevazione_data"] for r in cas if r["rilevazione_data"][:4] == a) for a in anni},
    "rilevazioni_sai": {a: date_sai[a] for a in anni if a in date_sai},
    "sai_ultimo_anno": {"anno": ultimo, "presenze_progetti": round(nazionale[ultimo]["SAI"]),
                        "presenze_strutture": presenze_strutture},
    "province": province,
}
json.dump(dati, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# --- controlli ----------------------------------------------------------------
print("Presenze nazionali per anno")
for a in anni:
    n = nazionale[a]
    print(f"{a}: CAS {n['CAS']:>8,.0f} · prima accoglienza {n['prima accoglienza']:>6,.0f} · SAI {n['SAI']:>7,.0f}  (SAI rilevato il {date_sai.get(a)})")
print("\nSAI (progetti), righe con capienza o presenze vuote")
for a in sorted(vuote):
    t, sc, c, p = vuote[a]
    print(f"{a}: {t:>4} progetti · senza codice {sc:>3} · senza capienza {c:>3} · senza presenze {p:>3}")
for tipo, atteso in PUBBLICATI_2024.items():
    trovato = round(nazionale["2024"][tipo])
    if trovato != atteso:
        raise SystemExit(f"2024 {tipo}: presenze {trovato:,}, pubblicato {atteso:,}")
print("\n2024: CAS 96.738 e prima accoglienza 4.610 come pubblicato")
sai24 = round(nazionale["2024"]["SAI"])
print(f"2024 SAI: presenze {sai24:,} nel file progetti, {PUBBLICATO_SAI_2024:,} pubblicato (differenza {sai24 - PUBBLICATO_SAI_2024:+,}); file strutture: {presenze_strutture:,}")
print(f"province con dati: {len(province)}  ->  {OUT}")
