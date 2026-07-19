#!/usr/bin/env python3
"""Unisce i 12 mesi in un file unico, pulisce, e stampa i numeri nazionali."""
import csv, glob, collections, statistics

righe = []
for f in sorted(glob.glob("output/accoglienza_2025_*_completo.csv")):
    righe += list(csv.DictReader(open(f)))

def num(v, lo=None, hi=None):
    try: x = float(v)
    except (TypeError, ValueError): return None
    if lo is not None and x < lo: return None
    if hi is not None and x > hi: return None
    return x

# normalizzazione ente: il codice fiscale e' l'unica chiave stabile
per_cf = collections.defaultdict(set)
for r in righe:
    cf = (r.get("cf_amministrazione_appaltante") or "").strip()
    if cf: per_cf[cf].add(r.get("denominazione_amministrazione_appaltante",""))

def e_prefettura(r):
    d = (r.get("denominazione_amministrazione_appaltante") or "").upper()
    return "PREFETT" in d or "TERRITORIALE DEL GOVERNO" in d or "TERRITORIALE GOVERNO" in d

with open("output/accoglienza_2025_ANNO.csv","w",newline="",encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(righe[0].keys())+["canale"])
    w.writeheader()
    for r in righe:
        r["canale"] = "prefettura" if e_prefettura(r) else "ente locale"
        w.writerow(r)

diretti = sum(1 for r in righe if "AFFIDAMENTO DIRETTO" in (r["tipo_scelta_contraente"] or ""))
con_mod = sum(1 for r in righe if (r["tipo_scelta_contraente"] or "").strip())
rib = [x for x in (num(r["ribasso"], 0, 100) for r in righe) if x is not None]
imp = [x for x in (num(r["importo_lotto"], 0) for r in righe) if x is not None]

print(f"\n=== OSSERVATORIO ACCOGLIENZA — ANNO 2025 ===")
print(f"gare totali:            {len(righe):,}")
print(f"certe:                  {sum(1 for r in righe if r['confidenza']=='certa'):,}")
print(f"affidamenti diretti:    {diretti:,} su {con_mod:,}  ({diretti/con_mod*100:.1f}%)")
print(f"ribassi validi:         {len(rib):,}  mediana {statistics.median(rib):.2f}%  media {statistics.mean(rib):.2f}%")
print(f"importo totale:         {sum(imp):,.0f} EUR")
print(f"enti appaltanti unici:  {len(per_cf):,}")
print(f"cf con piu' nomi:       {sum(1 for v in per_cf.values() if len(v)>1):,}")

print("\ncanale:")
for k,n in collections.Counter(r["canale"] for r in righe).most_common():
    print(f"  {n:5,}  {k}")

print("\nprime 15 province per numero di gare:")
for p,n in collections.Counter(r["provincia"] for r in righe).most_common(15):
    print(f"  {n:4}  {p}")
print()
