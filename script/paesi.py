#!/usr/bin/env python3
"""Costruisce sito/data/paesi.json: richiedenti asilo, decisioni di prima istanza e minori non accompagnati richiedenti
(Eurostat, solo Italia), morti in conflitti armati (UCDP v26.1) e minori presenti (Ministero del Lavoro, da
sito/data/msna-cittadinanza.json) per i 24 paesi di provenienza, anni 2015–2025.

Uso, dalla radice del repo: python3 script/paesi.py
I file scaricati stanno in dati-asilo/ (non versionata): se ci sono si usano, altrimenti si scaricano.

- Eurostat (API di diffusione, geo=IT): migr_asyappctza, migr_asydcfsta, migr_asyunaa. Sesso totale, età totale.
  Valori arrotondati da Eurostat a multipli di 5. Un valore assente nel file è un valore mancante, non zero.
- UCDP v26.1 (CC BY 4.0): Battle-related Deaths (conflitto-anno), One-sided Violence, Non-state Conflict. Si somma la stima
  migliore per paese (codice Gleditsch-Ward della località) e anno, solo righe a paese singolo; le righe con più paesi
  non si attribuiscono a nessuno e si contano a parte. Un anno senza riga non è «zero morti»: UCDP registra un
  conflitto solo sopra 25 morti l'anno.
- UNHCR (Refugee Data Finder, API pubblica, coa=ITA): solo per il confronto con Eurostat (domande, decisioni totali, decisioni
  positive), riassunto in «confronto_unhcr»; le cifre UNHCR per paese non entrano nelle pagine.
- Paesi: quelli comparsi tra le prime dieci cittadinanze dei minori presenti o degli sbarcati dal 2016 (elenco in
  dati-asilo/inventario.md) o dei richiedenti asilo in Italia in un anno 2015–2025 (Eurostat migr_asyappctza): quest'ultimo
  criterio è controllato qui, e uno sfuggito ferma lo script.
- Se un controllo non torna lo script si ferma senza scrivere; la build ripete i controlli (sito/lib/paesi.ts)."""
import csv, datetime, io, json, os, statistics, sys, urllib.request, zipfile

ANNI = list(range(2015, 2026))
ES = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{}?format=JSON&lang=EN&geo=IT"
DATASET = {"richiedenti": "migr_asyappctza", "decisioni": "migr_asydcfsta", "minori": "migr_asyunaa"}
UCDP = "https://ucdp.uu.se/downloads/"
UCDP_VERSIONE = "26.1"
UCDP_FILE = {  # chiave: (zip, csv interno, colonna del paese, colonna dei morti)
    "battaglia": ("brd/ucdp-brd-conf-261-csv.zip", "BattleDeaths_v26_1_conf.csv", "gwno_loc", "bd_best"),
    "unilaterale": ("nsos/ucdp-onesided-261-csv.zip", "OneSided_v26_1.csv", "gwno_location", "best_fatality_estimate"),
    "non_statale": ("nsos/ucdp-nonstate-261-csv.zip", "NonState_v26_1.csv", "gwno_location", "best_fatality_estimate"),
}
UNHCR = "https://api.unhcr.org/population/v1/{}/?coa=ITA&coo_all=true&year_from=2015&year_to=2025&limit=10000&cf_type=ISO"
SOGLIA_CONFRONTO = 100  # sotto questa cifra (entrambe le fonti) lo scarto % non è significativo: Eurostat arrotonda a 5
CACHE = "dati-asilo"
TOTALE_DECISIONI_2025 = 104560  # Asylum Information Database (AIDA), su dati Eurostat

# nome, aggettivo (per «cittadinanza ...»), ISO2 Eurostat, ISO3, codice Gleditsch-Ward UCDP, slug della pagina paese su ecoi.net,
# «da» + paese con la preposizione articolata (scritta a mano e controllata paese per paese, per i titoli)
PAESI = [
    ("Afghanistan", "afghana", "AF", "AFG", "700", "afghanistan", "dall'Afghanistan"),
    ("Albania", "albanese", "AL", "ALB", "339", "albania", "dall'Albania"),
    ("Algeria", "algerina", "DZ", "DZA", "615", "algeria", "dall'Algeria"),
    ("Bangladesh", "bangladese", "BD", "BGD", "771", "bangladesh", "dal Bangladesh"),
    ("Burkina Faso", "burkinabé", "BF", "BFA", "439", "burkina-faso", "dal Burkina Faso"),
    ("Costa d'Avorio", "ivoriana", "CI", "CIV", "437", "cote-d-ivoire", "dalla Costa d'Avorio"),
    ("Egitto", "egiziana", "EG", "EGY", "651", "egypt", "dall'Egitto"),
    ("El Salvador", "salvadoregna", "SV", "SLV", "92", "el-salvador", "da El Salvador"),
    ("Eritrea", "eritrea", "ER", "ERI", "531", "eritrea", "dall'Eritrea"),
    ("Etiopia", "etiope", "ET", "ETH", "530", "ethiopia", "dall'Etiopia"),
    ("Gambia", "gambiana", "GM", "GMB", "420", "gambia", "dal Gambia"),
    ("Georgia", "georgiana", "GE", "GEO", "372", "georgia", "dalla Georgia"),
    ("Ghana", "ghanese", "GH", "GHA", "452", "ghana", "dal Ghana"),
    ("Guinea", "guineana", "GN", "GIN", "438", "guinea", "dalla Guinea"),
    ("India", "indiana", "IN", "IND", "750", "india", "dall'India"),
    ("Iran", "iraniana", "IR", "IRN", "630", "islamic-republic-of-iran", "dall'Iran"),
    ("Iraq", "irachena", "IQ", "IRQ", "645", "iraq", "dall'Iraq"),
    ("Kosovo", "kosovara", "XK", "XKX", "347", "kosovo", "dal Kosovo"),
    ("Mali", "maliana", "ML", "MLI", "432", "mali", "dal Mali"),
    ("Marocco", "marocchina", "MA", "MAR", "600", "morocco", "dal Marocco"),
    ("Nigeria", "nigeriana", "NG", "NGA", "475", "nigeria", "dalla Nigeria"),
    ("Pakistan", "pakistana", "PK", "PAK", "770", "pakistan", "dal Pakistan"),
    ("Perù", "peruviana", "PE", "PER", "135", "peru", "dal Perù"),
    ("Senegal", "senegalese", "SN", "SEN", "433", "senegal", "dal Senegal"),
    ("Siria", "siriana", "SY", "SYR", "652", "syrian-arab-republic", "dalla Siria"),
    ("Somalia", "somala", "SO", "SOM", "520", "somalia", "dalla Somalia"),
    ("Sri Lanka", "srilankese", "LK", "LKA", "780", "sri-lanka", "dallo Sri Lanka"),
    ("Sudan", "sudanese", "SD", "SDN", "625", "sudan", "dal Sudan"),
    ("Tunisia", "tunisina", "TN", "TUN", "616", "tunisia", "dalla Tunisia"),
    ("Ucraina", "ucraina", "UA", "UKR", "369", "ukraine", "dall'Ucraina"),
    ("Venezuela", "venezuelana", "VE", "VEN", "101", "bolivarian-republic-of-venezuela", "dal Venezuela"),
]
# nome nel file dei minori presenti, se diverso
NOME_MSNA = {"Perù": "Peru'"}
# voci aggregate di Eurostat, non paesi
AGGREGATI = {"TOTAL", "EU27_2020", "EXT_EU27_2020", "NON_EU27_2020", "UK_OCT", "RNC", "STLS", "UNK"}
PRIME = 10  # criterio: prime dieci cittadinanze dei richiedenti asilo in Italia, per ogni anno


def slug(nome):
    import re, unicodedata
    s = unicodedata.normalize("NFD", nome.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", s))


def scarica(url, dest):
    if os.path.exists(dest): return
    print("scarico", url)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=300) as r, open(dest, "wb") as f: f.write(r.read())


def eurostat(codice):
    """Valori JSON-stat come dizionario {dimensioni: valore}, più la data di aggiornamento e la versione."""
    dest = f"{CACHE}/{codice}.json"
    scarica(ES.format(codice), dest)
    j = json.load(open(dest))
    ids, sizes = j["id"], j["size"]
    cat = [list(j["dimension"][k]["category"]["index"]) for k in ids]
    out = {}
    for pos, v in j["value"].items():
        p, idx = int(pos), []
        for s in reversed(sizes): idx.append(p % s); p //= s
        idx.reverse()
        out[tuple(cat[i][idx[i]] for i in range(len(ids)))] = v
    ann = {a["type"]: a for a in j["extension"]["annotation"]}
    return ids, out, {
        "dataset": codice, "titolo": j["label"], "aggiornamento": ann["UPDATE_DATA"]["date"][:10],
        "versione": j["extension"]["datastructure"]["version"], "ultimo_anno": ann["OBS_PERIOD_OVERALL_LATEST"]["title"],
    }


def serie_eurostat():
    """{(cittadinanza, anno, voce): valore} per le tre serie; voce = richiedenti | minori | rifugiato | sussidiaria | umanitaria | rifiuti | totale."""
    S, fonti = {}, {}
    ids, v, fonti["richiedenti"] = eurostat(DATASET["richiedenti"])
    for t, x in v.items():
        d = dict(zip(ids, t))
        if d["sex"] == "T" and d["age"] == "TOTAL" and d["applicant"] == "TOTAL":
            S[(d["citizen"], int(d["time"]), "richiedenti")] = x
    ids, v, fonti["decisioni"] = eurostat(DATASET["decisioni"])
    voce = {"TOTAL": "totale", "POS": "positive", "POS_RFG": "rifugiato", "POS_SPROT": "sussidiaria", "POS_HUM": "umanitaria", "NEG": "rifiuti"}
    for t, x in v.items():
        d = dict(zip(ids, t))
        if d["sex"] == "T" and d["age"] == "TOTAL" and d["decision"] in voce:
            S[(d["citizen"], int(d["time"]), voce[d["decision"]])] = x
    ids, v, fonti["minori"] = eurostat(DATASET["minori"])
    for t, x in v.items():
        d = dict(zip(ids, t))
        if d["sex"] == "T" and d["age"] == "TOTAL":
            S[(d["citizen"], int(d["time"]), "minori")] = x
    return S, fonti


def ucdp():
    """({chiave: {codice: {anno: morti}}}, {chiave: {codice: {anno: righe multi-paese}}})"""
    os.makedirs(f"{CACHE}/ucdp", exist_ok=True)
    morti, multi = {}, {}
    for k, (zp, nome, colp, colm) in UCDP_FILE.items():
        dest = f"{CACHE}/ucdp/{os.path.basename(zp)}"
        scarica(UCDP + zp, dest)
        righe = list(csv.DictReader(io.TextIOWrapper(zipfile.ZipFile(dest).open(nome), encoding="utf-8")))
        if {r["version"] for r in righe} != {UCDP_VERSIONE}: sys.exit(f"UCDP {k}: versione diversa da {UCDP_VERSIONE}")
        morti[k], multi[k] = {}, {}
        for r in righe:
            a = int(r["year"])
            if a not in ANNI: continue
            codici = [c.strip() for c in r[colp].split(",")]
            if len(codici) == 1:
                d = morti[k].setdefault(codici[0], {})
                d[a] = d.get(a, 0) + int(float(r[colm]))
            else:
                for c in codici:
                    d = multi[k].setdefault(c, {})
                    d[a] = d.get(a, 0) + 1
    return morti, multi


def confronto_unhcr(S):
    """Scarto % di UNHCR su Eurostat per domande (N+R), decisioni totali e decisioni positive (riconosciute + altre):
    mediana dello scarto assoluto, celle con scarto oltre il 20% e i cinque scarti maggiori. Solo celle con almeno una
    cifra >= SOGLIA_CONFRONTO; Kosovo escluso (UNHCR lo accorpa alla Serbia)."""
    app, dec = {}, {}
    for nome, url in (("asylum-applications", app), ("asylum-decisions", dec)):
        dest = f"{CACHE}/unhcr_{nome}.json"
        scarica(UNHCR.format(nome), dest)
        url["items"] = json.load(open(dest))["items"]
    n = lambda x: int(x) if x not in (None, "") else 0
    ua, ud = {}, {}
    for i in app["items"]:
        if i["app_type"] in ("N", "R"): ua[(i["coo_iso"], i["year"])] = ua.get((i["coo_iso"], i["year"]), 0) + n(i["applied"])
    for i in dec["items"]:
        ud[(i["coo_iso"], i["year"])] = (n(i["dec_total"]), n(i["dec_recognized"]) + n(i["dec_other"]))
    celle = []
    for nome, agg, iso2, iso3, gw, ecoi, da in PAESI:
        if nome == "Kosovo": continue
        for a in ANNI:
            for misura, e, u in (("domande", S.get((iso2, a, "richiedenti")), ua.get((iso3, a))),
                                 ("decisioni", S.get((iso2, a, "totale")), ud[(iso3, a)][0] if (iso3, a) in ud else None),
                                 ("decisioni positive", S.get((iso2, a, "positive")), ud[(iso3, a)][1] if (iso3, a) in ud else None)):
                if e is None or u is None or e == 0 or max(e, u) < SOGLIA_CONFRONTO: continue
                celle.append({"paese": nome, "anno": a, "misura": misura, "eurostat": e, "unhcr": u, "scarto_pct": round((u - e) / e * 100, 1)})
    misure = {}
    for m in ("domande", "decisioni", "decisioni positive"):
        s = [abs(c["scarto_pct"]) for c in celle if c["misura"] == m]
        misure[m] = {"celle": len(s), "mediana_pct": round(statistics.median(s), 1), "oltre_20_pct": sum(x > 20 for x in s)}
    maggiori = sorted(celle, key=lambda c: -abs(c["scarto_pct"]))[:5]
    return {"soglia": SOGLIA_CONFRONTO, "misure": misure, "maggiori": maggiori,
            "url": "https://api.unhcr.org/population/v1/", "estratto": datetime.date.today().isoformat()}


def minori_presenti():
    """{nome: {anno: presenti al 31 dicembre}} solo per le cittadinanze citate nel report di quell'anno."""
    d = json.load(open("sito/data/msna-cittadinanza.json"))["anni"]
    out = {}
    for anno, v in d.items():
        for c in v["cittadinanze"]:
            out.setdefault(c["nome"], {})[int(anno)] = c["presenti"]
    return out


def main():
    S, fonti = serie_eurostat()
    morti, multi = ucdp()
    presenti = minori_presenti()
    errori, scarti = [], []

    italia = {}
    for a in ANNI:
        italia[str(a)] = {k: S.get(("TOTAL", a, k)) for k in ("richiedenti", "totale", "rifugiato", "sussidiaria", "umanitaria", "rifiuti")}
    if italia["2025"]["totale"] != TOTALE_DECISIONI_2025:
        errori.append(f"totale Italia decisioni 2025: {italia['2025']['totale']} invece di {TOTALE_DECISIONI_2025}")

    # controllo: ogni cittadinanza tra le prime dieci dei richiedenti di un anno deve essere nell'elenco dei paesi
    prime, ISO2 = {}, {p[2] for p in PAESI}
    for a in ANNI:
        r = sorted(((v, c) for (c, y, k), v in S.items() if y == a and k == "richiedenti" and c not in AGGREGATI), reverse=True)[:PRIME]
        prime[a] = {c for v, c in r}
        errori += [f"{a}: {c} è tra le prime {PRIME} cittadinanze dei richiedenti ma non è nell'elenco dei paesi" for c in sorted(prime[a] - ISO2)]

    paesi = []
    for nome, agg, iso2, iso3, gw, ecoi, da in PAESI:
        anni = {}
        for a in ANNI:
            r = {k: S.get((iso2, a, k)) for k in ("richiedenti", "minori", "totale", "rifugiato", "sussidiaria", "umanitaria", "rifiuti")}
            mancanti = [k for k, x in r.items() if x is None]
            if mancanti: errori.append(f"{nome} {a}: valori Eurostat mancanti ({', '.join(mancanti)})")
            else:
                diff = r["totale"] - (r["rifugiato"] + r["sussidiaria"] + r["umanitaria"] + r["rifiuti"])
                if diff != 0: scarti.append((nome, a, r["totale"], diff))
                if abs(diff) > 10: errori.append(f"{nome} {a}: totale decisioni {r['totale']}, somma dei tipi differisce di {diff}")
            anni[str(a)] = {"richiedenti": r["richiedenti"], "minori_richiedenti": r["minori"],
                            "decisioni": {"totale": r["totale"], "rifugiato": r["rifugiato"], "sussidiaria": r["sussidiaria"],
                                          "umanitaria": r["umanitaria"], "rifiuti": r["rifiuti"]}}
        paesi.append({
            "slug": slug(nome), "nome": nome, "aggettivo": agg, "da": da, "iso3": iso3,
            "prime_dieci_richiedenti": [a for a in ANNI if iso2 in prime[a]],
            "anni": anni,
            "minori_presenti": {str(a): n for a, n in sorted(presenti.get(NOME_MSNA.get(nome, nome), {}).items())},
            "ucdp": {
                "morti": {k: {str(a): n for a, n in sorted(morti[k].get(gw, {}).items())} for k in UCDP_FILE},
                "righe_multipaese": {k: {str(a): n for a, n in sorted(multi[k].get(gw, {}).items())} for k in UCDP_FILE},
            },
            "ecoi": f"https://www.ecoi.net/en/countries/{ecoi}/",
        })
    if errori: sys.exit("Controlli non superati:\n  " + "\n  ".join(errori))

    oggi = datetime.date.today().isoformat()
    out = {
        "estratto": oggi, "anni": [str(a) for a in ANNI], "italia": italia,
        "fonti": {
            "eurostat": {**fonti, "estratto": oggi, "arrotondamento": 5,
                         "licenza": "CC BY 4.0, decisione della Commissione 12 dicembre 2011",
                         "url": "https://ec.europa.eu/eurostat/web/main/help/copyright-notice"},
            "ucdp": {"versione": UCDP_VERSIONE, "estratto": oggi, "licenza": "CC BY 4.0", "url": "https://ucdp.uu.se/downloads/",
                     "soglia_morti": 25},
            "ecoi": {"url": "https://www.ecoi.net/en/countries/", "verificato": "2026-11-25"},
        },
        "confronto_unhcr": confronto_unhcr(S),
        "paesi": paesi,
    }
    json.dump(out, open("sito/data/paesi.json", "w"), ensure_ascii=False, indent=1)
    print("scritto sito/data/paesi.json:", len(paesi), "paesi")
    print(f"scarti totale decisioni − somma dei tipi diversi da 0: {len(scarti)}")
    for s in scarti: print("  ", *s)


if __name__ == "__main__":
    main()
