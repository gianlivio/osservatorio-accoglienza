#!/usr/bin/env python3
"""Arricchisce gli estratti mensili e produce il JSON multi-anno per il sito."""
import csv, glob, os, re, json, html, zipfile, io, collections, statistics

csv.field_size_limit(10_000_000)
ANNI   = [str(a) for a in range(2015, 2026)]
ANNI_ESITO = {"2024", "2025"}  # esiti e aggiudicatari attendibili solo da qui
SOGLIA = 140000
Z_AGG  = "dati-grezzi/aggiudicazioni_csv.zip"
Z_VIN  = "dati-grezzi/aggiudicatari_csv.zip"
OUTJS  = "sito-dati/province.json"

def pulisci(v):
    return re.sub(r"\s+", " ", html.unescape(v or "")).strip()

# --- 1. carica gli estratti mensili -----------------------------------------
righe = []
for a in ANNI:
    for f in sorted(glob.glob(f"output/accoglienza_{a}_[01]*.csv")):
        if "_completo" in f: continue
        for r in csv.DictReader(open(f)):
            r["anno"] = a
            r["oggetto_gara"]  = pulisci(r.get("oggetto_gara"))
            r["oggetto_lotto"] = pulisci(r.get("oggetto_lotto"))
            righe.append(r)
print(f"righe caricate: {len(righe):,}")
cig = {r["cig"] for r in righe}

# --- 2. una sola passata su ciascun archivio --------------------------------
def scorri(percorso, chiavi):
    trovati = {}
    with zipfile.ZipFile(percorso) as z:
        nome = [n for n in z.namelist() if n.endswith(".csv")][0]
        with z.open(nome) as f:
            for r in csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"),
                                    delimiter=";", quotechar='"'):
                c = (r.get("cig") or "").strip()
                if c in cig and c not in trovati:
                    if "tipo_soggetto" in r and "STAZIONE APPALTANTE" in (r.get("tipo_soggetto") or "").upper():
                        continue
                    trovati[c] = {k: (r.get(v) or "").strip() for k, v in chiavi.items()}
    return trovati

print("lettura aggiudicazioni...")
agg = scorri(Z_AGG, {"importo_aggiudicazione": "importo_aggiudicazione",
                     "ribasso": "ribasso_aggiudicazione",
                     "criterio": "criterio_aggiudicazione",
                     "n_offerte": "numero_offerte_ammesse"})
print(f"  {len(agg):,} aggiudicazioni")

print("lettura aggiudicatari...")
vin = scorri(Z_VIN, {"vincitore": "denominazione",
                     "cf_vincitore": "codice_fiscale",
                     "tipo_soggetto": "tipo_soggetto"})
print(f"  {len(vin):,} aggiudicatari")

def prefettura(r):
    d = (r.get("denominazione_amministrazione_appaltante") or "").upper()
    return "PREFETT" in d or "TERRITORIALE DEL GOVERNO" in d or "TERRITORIALE GOVERNO" in d

for r in righe:
    r.update(agg.get(r["cig"], {"importo_aggiudicazione": "", "ribasso": "",
                                "criterio": "", "n_offerte": ""}))
    r.update(vin.get(r["cig"], {"vincitore": "", "cf_vincitore": "", "tipo_soggetto": ""}))
    r["canale"] = "prefettura" if prefettura(r) else "ente locale"

# --- 3. un CSV per anno ------------------------------------------------------
os.makedirs("sito-dati", exist_ok=True)
campi = list(righe[0].keys())
for a in ANNI:
    rr = [r for r in righe if r["anno"] == a]
    with open(f"output/accoglienza_{a}_completo.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=campi); w.writeheader(); w.writerows(rr)

# --- 4. aggregazione ---------------------------------------------------------
def num(v, lo=None, hi=None):
    try: x = float(v)
    except (TypeError, ValueError): return None
    if lo is not None and x < lo: return None
    if hi is not None and x > hi: return None
    return x

def diretto(r):
    return "AFFIDAMENTO DIRETTO" in (r["tipo_scelta_contraente"] or "")

def modalita(r):
    t = (r["tipo_scelta_contraente"] or "").upper()
    if "AFFIDAMENTO DIRETTO" in t or "COTTIMO FIDUCIARIO" in t or "AFFIDAMENTO RISERVATO" in t:
        return "diretto"
    if "APERTA" in t or "RISTRETTA" in t or "DIALOGO" in t or "CONFRONTO COMPETITIVO" in t or "PROCEDURA DI GARA" in t or "SISTEMA DINAMICO" in t or ("PREVIA PUBBLICAZIONE" in t and "SENZA" not in t) or "PREVIA INDIZIONE" in t or "AVVISI CON CUI SI INDICE" in t:
        return "gara"
    if "NEGOZIATA" in t or "COMPETITIVA CON NEGOZIAZIONE" in t or "PARTE" in t or "ALTRA PROCEDURA" in t:
        return "negoziata"
    return "altro"

PROROGA = re.compile(r"prosecuzion|prorog|rinnov|proseguimento", re.I)

def blocco(rr):
    if not rr: return None
    imp = [x for x in (num(r["importo_lotto"], 0) for r in rr) if x is not None]
    d   = sum(1 for r in rr if diretto(r))
    sotto = [r for r in rr if (num(r["importo_lotto"], 0) or 0) < SOGLIA]
    val = sum(imp) or 1
    val_d = sum(x for r, x in zip(rr, (num(r["importo_lotto"], 0) or 0 for r in rr)) if diretto(r))
    return {
        "affidamenti": len(rr),
        "certi": sum(1 for r in rr if r["confidenza"] == "certa"),
        "diretti": d,
        "quota_diretti": round(d / len(rr) * 100, 1),
        "mod_diretto": sum(1 for r in rr if modalita(r) == "diretto"),
        "mod_negoziata": sum(1 for r in rr if modalita(r) == "negoziata"),
        "mod_gara": sum(1 for r in rr if modalita(r) == "gara"),
        "mod_altro": sum(1 for r in rr if modalita(r) == "altro"),
        "quota_diretti_per_importo": round(val_d / val * 100, 1),
        "sotto_soglia": len(sotto),
        "quota_diretti_sotto_soglia": round(sum(1 for r in sotto if diretto(r)) / len(sotto) * 100, 1) if sotto else None,
        "importo_mediano": round(statistics.median(imp)) if imp else None,
        "prosecuzioni": sum(1 for r in rr if PROROGA.search(r["oggetto_gara"] + r["oggetto_lotto"])),
        "canale_prefettura": sum(1 for r in rr if r["canale"] == "prefettura"),
        "canale_ente_locale": sum(1 for r in rr if r["canale"] == "ente locale"),
        "enti_gestori": len({r["cf_vincitore"] for r in rr if r["cf_vincitore"]}),
        "copertura_vincitore": round(sum(1 for r in rr if r["cf_vincitore"]) / len(rr) * 100, 1),
        "copertura_esito": round(sum(1 for r in rr if r["importo_aggiudicazione"]) / len(rr) * 100, 1),
    }

def mesi(rr):
    per_m = collections.defaultdict(list)
    for r in rr:
        d = (r.get("data_pubblicazione") or "")[:7]
        if len(d) == 7: per_m[d].append(r)
    out = {}
    for k in sorted(per_m):
        mm = per_m[k]
        imp = [x for x in (num(r["importo_lotto"], 0) for r in mm) if x is not None]
        d = sum(1 for r in mm if diretto(r))
        out[k] = {"affidamenti": len(mm), "diretti": d,
                  "quota_diretti": round(d / len(mm) * 100, 1),
                  "importo_mediano": round(statistics.median(imp)) if imp else None}
    return out

per_prov = collections.defaultdict(list)
for r in righe:
    per_prov[(r["provincia"] or "NON INDICATA").strip()].append(r)

province = []
for p, rr in sorted(per_prov.items()):
    if p == "NON INDICATA": continue
    rr_e = [r for r in rr if r["anno"] in ANNI_ESITO]
    elenco = sorted(rr, key=lambda r: (r["data_pubblicazione"] or ""), reverse=True)
    contratti = [{
        "cig": r["cig"],
        "data": r["data_pubblicazione"],
        "oggetto": (r["oggetto_lotto"] or r["oggetto_gara"])[:180],
        "amministrazione": r["denominazione_amministrazione_appaltante"],
        "ente": r["vincitore"] or None,
        "procedura": r["tipo_scelta_contraente"],
        "diretto": diretto(r),
        "modalita": modalita(r),
        "base": num(r["importo_lotto"], 0),
        "aggiudicato": num(r["importo_aggiudicazione"], 0),
        "durata_gg": (lambda d: d if d and 25 <= d <= 2000 else None)(num(r["DURATA_PREVISTA"])),
        "da_accordo": bool((r.get("cig_accordo_quadro") or "").strip()),
        "confidenza": r["confidenza"],
    } for r in elenco]

    enti = collections.Counter(r["vincitore"] for r in rr_e if r["vincitore"])
    cop  = collections.Counter((r["denominazione_amministrazione_appaltante"], r["vincitore"])
                               for r in rr_e if diretto(r) and r["vincitore"])
    province.append({
        "provincia": p,
        "totale": blocco(rr),
        "per_anno": {a: blocco([r for r in rr if r["anno"] == a]) for a in ANNI},
        "per_mese": mesi(rr),
        "anni_enti": sorted(ANNI_ESITO),
        "contratti": contratti,
        "top_enti": [{"nome": k, "affidamenti": v} for k, v in enti.most_common(10)],
        "rapporti_ricorrenti": [{"amministrazione": a, "ente": e, "affidamenti_diretti": v}
                                for (a, e), v in cop.most_common(8) if v >= 3],
    })

dati = {
    "anni": ANNI,
    "fonte": "ANAC - Banca Dati Nazionale dei Contratti Pubblici (CIG, aggiudicazioni, aggiudicatari)",
    "totale": blocco(righe),
    "per_anno": {a: blocco([r for r in righe if r["anno"] == a]) for a in ANNI},
    "per_mese": mesi(righe),
    "serie_anni": [
        {
            "anno": a,
            "affidamenti": len(rr),
            "quota_diretti": round(sum(1 for r in rr if diretto(r)) / len(rr) * 100, 1),
            "affidamenti_40k": len(big),
            "quota_diretti_40k": round(sum(1 for r in big if diretto(r)) / len(big) * 100, 1) if big else None,
            "importo_mediano": round(statistics.median([x for x in (num(r["importo_lotto"], 0) for r in rr) if x is not None])),
            "copertura_esito": round(sum(1 for r in rr if r["importo_aggiudicazione"]) / len(rr) * 100, 1),
        }
        for a in ANNI
        for rr in [[r for r in righe if r["anno"] == a]] if rr
        for big in [[r for r in rr if (num(r["importo_lotto"], 0) or 0) >= 40000]]
    ],
    "anni_esito": sorted(ANNI_ESITO),
    "amministrazioni": len({r["cf_amministrazione_appaltante"] for r in righe if r["cf_amministrazione_appaltante"]}),
    "province": province,
}
json.dump(dati, open(OUTJS, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

for a in ANNI:
    b = dati["per_anno"][a]
    if not b: continue
    print(f"{a}: {b['affidamenti']:5,} affidamenti · {b['quota_diretti']:5.1f}% senza gara "
          f"· mediana {b['importo_mediano'] or 0:>9,} EUR · esiti noti {b['copertura_esito']:5.1f}%")
print(f"\nprovince: {len(province)}  ->  {OUTJS}")
