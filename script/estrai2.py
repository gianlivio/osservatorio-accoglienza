#!/usr/bin/env python3
import csv, sys, os, re, html
csv.field_size_limit(10_000_000)

CPV_AMMESSI = {"85311000","85311300","85310000","85320000",
               "85321000","85300000","98000000","75310000","99999999"}
CPV_ESCLUSI = {"45234115", "79992000","63513000","98341120","98341140","79710000",
               "92000000","34913000","60172000","60424000","33690000",
               "79952000","79210000","66510000"}

# Espressioni inequivocabili: bastano da sole, qualunque sia il CPV.
FORTI = [
    r"minori stranieri non accompagnati", r"minore straniero non accompagnat",
    r"\bmsna\b", r"richiedenti asilo", r"richiedenti protezione",
    r"\bsprar\b", r"\bsiproimi\b", r"(progett|rete|sistema|servizi|struttur)\w* sai\b", r"\bsai\b.{0,25}accoglienz", r"centri? di accoglienza straordinaria",
    r"\bprofugh", r"protezione internazionale", r"corridoi umanitari",
]
# Espressioni ambigue: richiedono anche un CPV compatibile.
DEBOLI = [r"\bmigrant", r"\bprofug", r"\brifugiat", r"\bimmigrat",
          r"cittadin\w* stranier", r"minori stranier", r"person\w* stranier",
          r"sportello stranier", r"stranier\w* richiedent", r"utenti stranier"]

# Contesti da escludere sempre: accoglienza in senso alberghiero o turistico.
VETO = [r"caserm", r"\bcas\.", r"ferrovi", r"\brfi\b", r"binari",
        r"somministrazione (di )?lavoro", r"agenzia per il lavoro",
        r"manutenzione impiant", r"energia elettrica", r"fotovoltaic",
        r"segnalament", r"armament", r"\brtb\b", r"\brtf\b", r"tecnologia ducati", r"portierat", r"portineria", r"bancone", r"reception",
        r"foresteria", r"studenti all'estero", r"informazione turistica",
        r"car rental", r"spettacol"]

COLONNE = ["cig","cig_accordo_quadro","n_lotti_componenti","oggetto_gara","oggetto_lotto","importo_lotto",
    "importo_complessivo_gara","provincia","luogo_istat","data_pubblicazione",
    "tipo_scelta_contraente","cf_amministrazione_appaltante",
    "denominazione_amministrazione_appaltante","denominazione_centro_costo",
    "cod_cpv","descrizione_cpv","DURATA_PREVISTA","ESITO"]

def cpv_base(v): return v.strip().split("-")[0][:8] if v else ""
def pulisci(v): return html.unescape(v or "").replace("\u2013","-").strip()
def testo(r): return " ".join([pulisci(r.get("oggetto_gara")),
                               pulisci(r.get("oggetto_lotto"))]).lower()

def classifica(r):
    t = testo(r)
    if any(re.search(p, t) for p in VETO): return None
    c = cpv_base(r.get("cod_cpv"))
    if c in CPV_ESCLUSI: return None
    if any(re.search(p, t) for p in FORTI): return "certa"
    if any(re.search(p, t) for p in DEBOLI) and c in CPV_AMMESSI: return "probabile"
    return None

def main():
    percorso = sys.argv[1]
    base = os.path.basename(percorso).replace("cig_csv_","").replace(".csv","")
    out = f"accoglienza_{base}.csv"
    n = {"certa":0, "probabile":0}
    enti = {}
    with open(percorso, newline="", encoding="utf-8", errors="replace") as fi, \
         open(out, "w", newline="", encoding="utf-8") as fo:
        w = csv.DictWriter(fo, fieldnames=COLONNE+["confidenza"], extrasaction="ignore")
        w.writeheader()
        for r in csv.DictReader(fi, delimiter=";", quotechar='"'):
            c = classifica(r)
            if c:
                r["confidenza"] = c; w.writerow(r); n[c] += 1
                e = r.get("denominazione_amministrazione_appaltante") or "?"
                enti[e] = enti.get(e,0)+1
    print(f"\nCerte:      {n['certa']:,}")
    print(f"Probabili:  {n['probabile']:,}")
    print(f"Totale:     {sum(n.values()):,}  -> {out}\n")
    for e,k in sorted(enti.items(), key=lambda x:-x[1])[:12]: print(f"  {k:4}  {e}")
    print()

main()
