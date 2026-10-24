#!/usr/bin/env python3
"""Aggrega i dati di Centri d'Italia (ActionAid e Openpolis, CC BY 4.0) per provincia e anno.
Uso: python3 script/centri.py  (legge dati-centri/*.csv, scrive sito/data/centri.json)"""
import csv, collections, json, statistics

CAS = "dati-centri/centri_cas_cpa_hotspot_v2026.csv"
SAI = "dati-centri/sai_struttura_v2026.csv"
OUT = "sito/data/centri.json"
PROVINCE_LITE = "sito/data/province-lite.json"
NOMI = {"BOLZANO/BOZEN": "BOLZANO", "REGGIO DI CALABRIA": "REGGIO CALABRIA"}
PUBBLICATI_2024 = {"CAS": 96738, "prima accoglienza": 4610, "SAI": 33201}  # presenze, centriditalia.it

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

# --- SAI: file strutture; per ogni anno la rilevazione più tarda -------------
sai = list(csv.DictReader(open(SAI, encoding="utf-8")))
date_sai = {}
tutte_sai = collections.defaultdict(set)
for r in sai:
    a = r["data_rilevazione"][:4]
    date_sai[a] = max(date_sai.get(a, ""), r["data_rilevazione"])
    tutte_sai[a].add(r["data_rilevazione"])
strutture = collections.defaultdict(list)
vuote = collections.defaultdict(lambda: [0, 0, 0])  # righe, senza capienza, senza presenze
for r in sai:
    a = r["data_rilevazione"][:4]
    if r["data_rilevazione"] != date_sai[a]:
        continue
    strutture[(provincia(r), a)].append(r)
    nazionale[a]["SAI"] += num(r["presenze_giornaliere"]) or 0
    v = vuote[a]; v[0] += 1; v[1] += num(r["capienza"]) is None; v[2] += num(r["presenze_giornaliere"]) is None

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
for (p, a), rr in sorted(strutture.items()):
    province.setdefault(p, {}).setdefault(a, {})["sai"] = {
        "strutture": len({r["sai_struttura_id"] for r in rr}),
        "capienza": somma(num(r["capienza"]) for r in rr),
        "presenze": somma(num(r["presenze_giornaliere"]) for r in rr),
    }

dati = {
    "fonte": "Centri d'Italia (ActionAid e Openpolis)",
    "url": "https://centriditalia.it",
    "licenza": "CC BY 4.0",
    "anni": anni,
    "rilevazioni_cas": {a: max(r["rilevazione_data"] for r in cas if r["rilevazione_data"][:4] == a) for a in anni},
    "rilevazioni_sai": {a: date_sai[a] for a in anni if a in date_sai},
    "rilevazioni_sai_scartate": {a: sorted(tutte_sai[a] - {date_sai[a]}) for a in anni if len(tutte_sai[a]) > 1},
    "province": province,
}
json.dump(dati, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# --- controlli ----------------------------------------------------------------
print("Presenze nazionali per anno")
for a in anni:
    n = nazionale[a]
    print(f"{a}: CAS {n['CAS']:>8,.0f} · prima accoglienza {n['prima accoglienza']:>6,.0f} · SAI {n['SAI']:>7,.0f}  (SAI rilevato il {date_sai.get(a)})")
print("\nSAI, righe con capienza o presenze vuote")
for a in sorted(vuote):
    t, c, p = vuote[a]
    print(f"{a}: {t:>5} righe · senza capienza {c:>5} · senza presenze {p:>5}")
for tipo, atteso in PUBBLICATI_2024.items():
    trovato = round(nazionale["2024"][tipo])
    if trovato != atteso:
        raise SystemExit(f"2024 {tipo}: presenze {trovato:,}, pubblicato {atteso:,}")
print("\n2024: 96.738 / 4.610 / 33.201 come pubblicato")
print(f"province con dati: {len(province)}  ->  {OUT}")
