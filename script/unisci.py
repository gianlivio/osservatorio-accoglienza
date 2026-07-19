#!/usr/bin/env python3
"""Unisce le gare di accoglienza con i dati di aggiudicazione, tramite CIG."""
import csv, zipfile, io, statistics, collections, sys

csv.field_size_limit(10_000_000)

MESE = sys.argv[1] if len(sys.argv)>1 else "2025_01"
GARE = f"output/accoglienza_{MESE}.csv"
ZIP  = "dati-grezzi/aggiudicazioni_csv.zip"
OUT  = f"output/accoglienza_{MESE}_completo.csv"

gare = {r["cig"]: r for r in csv.DictReader(open(GARE))}
print(f"gare da cercare: {len(gare):,}")

trovate = {}
with zipfile.ZipFile(ZIP) as z:
    nome = z.namelist()[0]
    with z.open(nome) as f:
        testo = io.TextIOWrapper(f, encoding="utf-8", errors="replace")
        for r in csv.DictReader(testo, delimiter=";", quotechar='"'):
            cig = (r.get("cig") or "").strip()
            if cig in gare:
                trovate[cig] = r

print(f"aggiudicazioni trovate: {len(trovate):,}")

def num(v):
    try: return float(v)
    except (TypeError, ValueError): return None

righe = []
for cig, g in gare.items():
    a = trovate.get(cig, {})
    g2 = dict(g)
    g2["importo_aggiudicazione"] = a.get("importo_aggiudicazione", "")
    g2["ribasso"] = a.get("ribasso_aggiudicazione", "")
    g2["criterio"] = a.get("criterio_aggiudicazione", "")
    g2["n_offerte"] = a.get("numero_offerte_ammesse", "")
    righe.append(g2)

with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(righe[0].keys()))
    w.writeheader(); w.writerows(righe)

rib = [num(r["ribasso"]) for r in righe]
rib = [x for x in rib if x is not None]
print(f"\ncon ribasso valorizzato: {len(rib):,}")
if rib:
    print(f"  ribasso medio:   {statistics.mean(rib):.2f}%")
    print(f"  mediana:         {statistics.median(rib):.2f}%")
    print(f"  minimo/massimo:  {min(rib):.2f}% / {max(rib):.2f}%")

print("\nmodalita' di scelta del contraente:")
for k, n in collections.Counter(r["tipo_scelta_contraente"] for r in righe).most_common(8):
    print(f"  {n:4}  {k[:60]}")

print(f"\n-> {OUT}\n")
