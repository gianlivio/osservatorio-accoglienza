#!/usr/bin/env python3
"""Arricchisce gli estratti mensili e produce il JSON multi-anno per il sito."""
import csv, glob, os, re, json, html, zipfile, io, collections, statistics, unicodedata

csv.field_size_limit(10_000_000)
ANNI   = sorted({os.path.basename(f)[12:16] for f in glob.glob("output/accoglienza_*_[01]*.csv")})  # solo anni con estratti
ANNI_ESITO = {a for a in ANNI if a >= "2024"}  # esiti attendibili dal 2024
SOGLIA = 140000
Z_AGG  = "dati-grezzi/aggiudicazioni_csv.zip"
Z_VIN  = "dati-grezzi/aggiudicatari_csv.zip"
OUTJS  = "sito/data/province-lite.json"
ESCLUSI = "script/esclusi.csv"  # CIG selezionati dal filtro ma estranei all'accoglienza, esclusi a mano
OUTDIR_PROV = "sito/data/provincia"
OUTDIR_CSV = "sito/public/dati"
OUTDIR_ENTI = "sito/data/ente"
OUTENTI = "sito/data/enti.json"
CAMPI_ANNO_LITE = ("affidamenti", "quota_diretti", "importo_mediano", "enti_gestori")

def pulisci(v):
    return re.sub(r"\s+", " ", html.unescape(v or "")).strip()

def slug(nome):
    s = unicodedata.normalize("NFD", nome.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s

# --- 1. carica gli estratti mensili -----------------------------------------
esclusi = {r["cig"] for r in csv.DictReader(open(ESCLUSI, encoding="utf-8"))}
scartati = set()
righe = []
visti = set()  # ANAC ripete alcuni CIG negli estratti (stesso CIG con più CPV, o righe identiche): vale la prima riga
for a in ANNI:
    for f in sorted(glob.glob(f"output/accoglienza_{a}_[01]*.csv")):
        if "_completo" in f: continue
        for r in csv.DictReader(open(f)):
            if r["cig"] in esclusi:
                scartati.add(r["cig"]); continue
            if r["cig"] in visti: continue
            visti.add(r["cig"])
            r["anno"] = a
            r["oggetto_gara"]  = pulisci(r.get("oggetto_gara"))
            r["oggetto_lotto"] = pulisci(r.get("oggetto_lotto"))
            righe.append(r)
print(f"righe caricate: {len(righe):,}")
print(f"CIG esclusi a mano: {len(scartati)} di {len(esclusi)}" + (f" (non trovati: {sorted(esclusi - scartati)})" if scartati != esclusi else ""))
cig = {r["cig"] for r in righe}

# --- 2. una sola passata su ciascun archivio --------------------------------
def data_zip(percorso):
    with zipfile.ZipFile(percorso) as z:
        return "%04d%02d%02d" % z.infolist()[0].date_time[:3]

def data_archivi(percorsi):
    """Data più recente (AAAA-MM-GG) fra gli archivi letti: dal nome per gli aggiornamenti, dallo zip per il completo."""
    d = max(os.path.basename(f)[:8] if os.path.basename(f)[:1] == "2" else data_zip(f) for f in percorsi)
    return f"{d[:4]}-{d[4:6]}-{d[6:]}"

def archivi(completo):
    """Aggiornamenti mensili ANAC (AAAAMMGG-nome.zip) dal più recente, poi il file completo."""
    cartella, nome = os.path.split(completo)
    data_completo = data_zip(completo)  # gli aggiornamenti anteriori sono già inclusi
    nuovi = [f for f in glob.glob(os.path.join(cartella, f"2*-{nome}")) if os.path.basename(f)[:8] > data_completo]
    return sorted(nuovi, reverse=True) + [completo]

def scorri(percorsi, chiavi):
    trovati = {}  # vale la prima occorrenza: l'archivio più recente prevale
    for percorso in percorsi:
        print(f"  {percorso}")
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
arch_agg = archivi(Z_AGG)
agg = scorri(arch_agg, {"importo_aggiudicazione": "importo_aggiudicazione",
                     "ribasso": "ribasso_aggiudicazione",
                     "criterio": "criterio_aggiudicazione",
                     "n_offerte": "numero_offerte_ammesse"})
print(f"  {len(agg):,} aggiudicazioni")

print("lettura aggiudicatari...")
arch_vin = archivi(Z_VIN)
vin = scorri(arch_vin, {"vincitore": "denominazione",
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
os.makedirs("sito/data", exist_ok=True)
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

CF_VALIDO = re.compile(r"\d{11}|[A-Za-z0-9]{16}")  # impresa/ente o persona fisica; il resto è testo libero, si conta per nome

CAMPI_CONTRATTO = ("cig", "data", "oggetto", "amministrazione", "ente", "procedura", "diretto",
                   "modalita", "base", "aggiudicato", "durata_gg", "da_accordo", "confidenza")

def contratto(r, oggetto_max=180):
    return {
        "cig": r["cig"],
        "data": r["data_pubblicazione"],
        "oggetto": (r["oggetto_lotto"] or r["oggetto_gara"])[:oggetto_max],
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
    }

def scrivi_csv(percorso, rr, con_provincia=False):
    """CSV scaricabile: gli stessi campi dell'elenco contratti, oggetto per intero, dal più recente."""
    os.makedirs(os.path.dirname(percorso), exist_ok=True)
    elenco = sorted(rr, key=lambda r: (r["data_pubblicazione"] or "", r["cig"]), reverse=True)
    with open(percorso, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow((("provincia",) if con_provincia else ()) + CAMPI_CONTRATTO)
        for r in elenco:
            c = contratto(r, oggetto_max=None)
            riga = [("true" if v else "false") if isinstance(v, bool) else ("" if v is None else v)
                    for v in (c[k] for k in CAMPI_CONTRATTO)]
            w.writerow(([(r["provincia"] or "").strip()] if con_provincia else []) + riga)

per_prov = collections.defaultdict(list)
for r in righe:
    per_prov[(r["provincia"] or "NON INDICATA").strip()].append(r)

province = []
for p, rr in sorted(per_prov.items()):
    if p == "NON INDICATA": continue
    rr_e = [r for r in rr if r["anno"] in ANNI_ESITO]
    elenco = sorted(rr, key=lambda r: (r["data_pubblicazione"] or ""), reverse=True)
    contratti = [contratto(r) for r in elenco]
    scrivi_csv(f"{OUTDIR_CSV}/provincia/{slug(p)}.csv", rr)

    enti = collections.Counter()
    nomi_cf = collections.defaultdict(collections.Counter)
    for r in rr_e:
        if not r["vincitore"]: continue
        if CF_VALIDO.fullmatch(r["cf_vincitore"]):
            enti[("cf", r["cf_vincitore"])] += 1
            nomi_cf[r["cf_vincitore"]][r["vincitore"]] += 1
        else:
            enti[("nome", r["vincitore"])] += 1
    cop  = collections.Counter((r["denominazione_amministrazione_appaltante"], r["vincitore"])
                               for r in rr_e if diretto(r) and r["vincitore"])
    per_anno_completo = {a: blocco([r for r in rr if r["anno"] == a]) for a in ANNI}
    province.append({
        "provincia": p,
        "totale": blocco(rr),
        "per_anno": per_anno_completo,
        "per_mese": mesi(rr),
        "anni_enti": sorted(ANNI_ESITO),
        "contratti": contratti,
        "top_enti": [{"nome": nomi_cf[k].most_common(1)[0][0] if t == "cf" else k,
                      "cf": k if t == "cf" else None, "affidamenti": v}
                     for (t, k), v in enti.most_common(10)],
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
    "aggiornato": max(data_archivi(arch_agg), data_archivi(arch_vin)),
    "esclusi_a_mano": len(scartati),
    "amministrazioni": len({r["cf_amministrazione_appaltante"] for r in righe if r["cf_amministrazione_appaltante"]}),
}

# --- 5. livello lite (tutte le province) + un file di dettaglio per provincia -
os.makedirs(OUTDIR_PROV, exist_ok=True)
province_lite = []
for p in province:
    per_anno_lite = {
        a: ({k: b[k] for k in CAMPI_ANNO_LITE} if b is not None else None)
        for a, b in p["per_anno"].items()
    }
    province_lite.append({
        "provincia": p["provincia"],
        "totale": p["totale"],
        "per_anno": per_anno_lite,
        "anni_enti": p["anni_enti"],
    })
    dettaglio = {
        "per_anno": p["per_anno"],
        "per_mese": p["per_mese"],
        "top_enti": p["top_enti"],
        "rapporti_ricorrenti": p["rapporti_ricorrenti"],
        "contratti": p["contratti"],
    }
    with open(f"{OUTDIR_PROV}/{slug(p['provincia'])}.json", "w", encoding="utf-8") as f:
        json.dump(dettaglio, f, ensure_ascii=False, indent=1)

scrivi_csv(f"{OUTDIR_CSV}/contratti.csv", righe, con_provincia=True)

dati["province"] = province_lite
json.dump(dati, open(OUTJS, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# --- 6. enti gestori: una pagina per codice fiscale di 11 cifre (le persone fisiche e i record senza cf restano fuori)
CF_ENTE = re.compile(r"\d{11}")
per_cf = collections.defaultdict(list)
for r in righe:
    if r["vincitore"] and CF_ENTE.fullmatch(r["cf_vincitore"]):
        per_cf[r["cf_vincitore"]].append(r)

def nome_ente(rr):
    return collections.Counter(r["vincitore"] for r in rr).most_common(1)[0][0]

nomi = {cf: nome_ente(rr) for cf, rr in per_cf.items()}
usati = collections.Counter(slug(n) or cf for cf, n in nomi.items())  # omonimi: lo slug porta anche il cf
slug_ente = {cf: (slug(n) or cf) if usati[slug(n) or cf] == 1 else f"{slug(n)}-{cf}" for cf, n in nomi.items()}

os.makedirs(OUTDIR_ENTI, exist_ok=True)
for vecchio in glob.glob(f"{OUTDIR_ENTI}/*.json"):
    os.remove(vecchio)
indice_enti = []
for cf, rr in per_cf.items():
    elenco = sorted(rr, key=lambda r: (r["data_pubblicazione"] or "", r["cig"]), reverse=True)
    per_anno_e = {}
    for a in sorted({r["anno"] for r in rr}):
        ra = [r for r in rr if r["anno"] == a]
        d = sum(1 for r in ra if diretto(r))
        per_anno_e[a] = {"affidamenti": len(ra), "diretti": d, "quota_diretti": round(d / len(ra) * 100, 1)}
    d_tot = sum(1 for r in rr if diretto(r))
    prov_e = collections.Counter((r["provincia"] or "").strip() for r in rr if (r["provincia"] or "").strip())
    dettaglio_e = {
        "nome": nomi[cf],
        "cf": cf,
        "affidamenti": len(rr),
        "diretti": d_tot,
        "quota_diretti": round(d_tot / len(rr) * 100, 1),
        "per_anno": per_anno_e,
        "province": [{"provincia": k, "affidamenti": v} for k, v in sorted(prov_e.items(), key=lambda kv: (-kv[1], kv[0]))],
        "contratti": [dict(contratto(r), provincia=(r["provincia"] or "").strip() or None) for r in elenco],
    }
    with open(f"{OUTDIR_ENTI}/{slug_ente[cf]}.json", "w", encoding="utf-8") as f:
        json.dump(dettaglio_e, f, ensure_ascii=False, indent=1)
    indice_enti.append({"nome": nomi[cf], "slug": slug_ente[cf], "cf": cf, "affidamenti": len(rr)})
indice_enti.sort(key=lambda e: (-e["affidamenti"], e["nome"]))
json.dump(indice_enti, open(OUTENTI, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"enti: {len(indice_enti)}  ->  {OUTENTI}, {OUTDIR_ENTI}/")

for a in ANNI:
    b = dati["per_anno"][a]
    if not b: continue
    print(f"{a}: {b['affidamenti']:5,} affidamenti · {b['quota_diretti']:5.1f}% senza gara "
          f"· mediana {b['importo_mediano'] or 0:>9,} EUR · esiti noti {b['copertura_esito']:5.1f}%")
print(f"\nprovince: {len(province)}  ->  {OUTJS}")
