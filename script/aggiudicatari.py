#!/usr/bin/env python3
"""Chi vince gli affidamenti dell'accoglienza, e con quale ricorrenza."""
import csv, zipfile, io, collections
csv.field_size_limit(10_000_000)

ANNO = "output/accoglienza_2025_ANNO.csv"
ZIP  = "dati-grezzi/aggiudicatari_csv.zip"
OUT  = "output/accoglienza_2025_ANNO_vincitori.csv"

gare = {}
for r in csv.DictReader(open(ANNO)):
    gare.setdefault(r["cig"], []).append(r)
print(f"CIG da cercare: {len(gare):,}")

vinc, multi = {}, collections.Counter()
with zipfile.ZipFile(ZIP) as z:
    n = [x for x in z.namelist() if x.endswith(".csv")][0]
    with z.open(n) as f:
        for r in csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"),
                                delimiter=";", quotechar='"'):
            cig = (r.get("cig") or "").strip()
            if cig in gare:
                if "STAZIONE APPALTANTE" in (r.get("tipo_soggetto") or "").upper():
                    continue
                multi[cig] += 1
                if cig not in vinc: vinc[cig] = r
print(f"vincitori trovati: {len(vinc):,}   (CIG con piu' soggetti/RTI: {sum(1 for v in multi.values() if v>1):,})")

righe = []
for cig, lista in gare.items():
    v = vinc.get(cig, {})
    for g in lista:
        g2 = dict(g)
        g2["vincitore"] = (v.get("denominazione") or "").strip()
        g2["cf_vincitore"] = (v.get("codice_fiscale") or "").strip()
        g2["tipo_soggetto"] = (v.get("tipo_soggetto") or "").strip()
        righe.append(g2)

with open(OUT,"w",newline="",encoding="utf-8") as f:
    w=csv.DictWriter(f,fieldnames=list(righe[0].keys())); w.writeheader(); w.writerows(righe)

con = [r for r in righe if r["cf_vincitore"]]
print(f"righe con vincitore: {len(con):,} su {len(righe):,}\n")

nome = {}
for r in con: nome.setdefault(r["cf_vincitore"], r["vincitore"])

print("=== primi 20 enti gestori per numero di affidamenti ===")
for cf,n in collections.Counter(r["cf_vincitore"] for r in con).most_common(20):
    prov = {r["provincia"] for r in con if r["cf_vincitore"]==cf}
    print(f"  {n:4}  {nome[cf][:50]:50} {len(prov)} prov.")

print("\n=== tipo di soggetto ===")
for t,n in collections.Counter(r["tipo_soggetto"][:45] for r in con).most_common(8):
    print(f"  {n:5}  {t}")

print("\n=== coppie amministrazione-ente con piu' affidamenti diretti ripetuti ===")
c = collections.Counter((r["denominazione_amministrazione_appaltante"], r["cf_vincitore"])
    for r in con if "AFFIDAMENTO DIRETTO" in (r["tipo_scelta_contraente"] or ""))
for (a,cf),n in c.most_common(20):
    print(f"  {n:3}x  {a[:40]:40} -> {nome[cf][:40]}")
print(f"\nrapporti ricorrenti (>=5 affidamenti diretti): {sum(1 for v in c.values() if v>=5)}")
print(f"-> {OUT}\n")
