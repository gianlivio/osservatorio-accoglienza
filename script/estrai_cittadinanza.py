#!/usr/bin/env python3
"""Estrae la cittadinanza dei minori stranieri non accompagnati presenti (Ministero del Lavoro) in sito/data/msna-cittadinanza.json.

Uso, dalla radice del repo: python3 script/estrai_cittadinanza.py   (richiede pdfplumber; legge dati-msna/ e dati-msna-sem/)

- 2016–2022: tabella completa dei presenti per cittadinanza dei report mensili di dicembre. Ogni report ha più tabelle per
  cittadinanza (presenti, irreperibili, ingressi del mese, sole minori di genere femminile): si legge solo quella dei presenti,
  riconosciuta dal titolo, e la si controlla contro il totale nazionale di sito/data/msna.json (dicembre dello stesso anno).
- 2023–2025: i rapporti semestrali al 31 dicembre riportano nel testo solo le prime cittadinanze («Le principali cittadinanze
  ... sono l'egiziana (n minori) ...» e le «ulteriori cittadinanze»): si riportano quelle, con file e pagina.
Se un controllo non torna lo script si ferma senza scrivere, e la build ripete i controlli (sito/lib/cittadinanza.ts)."""
import json, re, sys
import pdfplumber
sys.path.insert(0, "script")
from estrai_msna import periodo_testo  # noqa: E402

MENSILI = {
    2016: "Report-MSNA-31122016.pdf", 2017: "Report-MSNA-mese-dicembre2017-31122017.pdf",
    2018: "Report-MSNA-mese-dicembre-2018-15012019.pdf", 2019: "Report-MSNA-mese-dicembre-2019.pdf",
    2020: "Report-MSNA-mese-dicembre-2020.pdf", 2021: "Report-MSNA-mese-dicembre-2021.pdf",
    2022: "Report-MSNA-mese-dicembre-2022.pdf",
}
SEMESTRALI = {2023: "sem-2023-12.pdf", 2024: "sem-2024-12.pdf", 2025: "sem-2025-12.pdf"}
# titolo che precede la tabella dei presenti (le altre tabelle hanno titoli diversi: IRREPERIBILI, DELLE MINORI, IN INGRESSO, dal .. al ..)
TITOLO_PRESENTI = re.compile(r"^(RIPARTIZIONE DEI MINORI PER CITTADINANZA|MSNA PER CITTADINANZA)\s*$", re.M)
RIGA = re.compile(r"^([A-ZÀ-Ù][A-ZÀ-Ù'’ .,\-]+?)\s+(\d[\d.]*)\s+(\d+(?:,\d+)?)\s*$")
NOMI = {  # aggettivo dei rapporti semestrali -> nome del paese
    "egiziana": "Egitto", "ucraina": "Ucraina", "tunisina": "Tunisia", "gambiana": "Gambia", "guineana": "Guinea",
    "avoriana": "Costa d'Avorio", "ivoriana": "Costa d'Avorio", "albanese": "Albania", "pakistana": "Pakistan",
    "malese": "Mali", "burkinabé": "Burkina Faso", "eritrea": "Eritrea", "afghana": "Afghanistan",
    "bangladese": "Bangladesh", "senegalese": "Senegal", "somala": "Somalia",
}
PICCOLE = {"del", "di", "d'", "della"}


def intero(s): return int(s.replace(".", ""))


def bello(nome):
    t = nome.replace("’", "'").title()
    return re.sub(r"\b(D|Del|Di|Della)\b(?=['\s])", lambda m: m.group(1).lower(), t).replace("d'Avorio", "d'Avorio")


def pagine(path):
    with pdfplumber.open(path) as pdf:
        return [p.extract_text() or "" for p in pdf.pages]


def mensile(anno, file):
    pg = pagine("dati-msna/" + file)
    per = periodo_testo("\n".join(pg))
    if per != f"{anno}-12": raise SystemExit(f"{file}: periodo {per}, atteso {anno}-12")
    trovate = []
    for n, t in enumerate(pg, 1):
        for m in TITOLO_PRESENTI.finditer(t):
            righe, totale = [], None
            for riga in t[m.end():].split("\n"):
                if riga.startswith("TOTALE"):
                    totale = intero(re.search(r"TOTALE\s+(\d[\d.]*)", riga).group(1)); break
                r = RIGA.match(riga.strip())
                if r: righe.append({"nome": r.group(1).strip(), "presenti": intero(r.group(2)), "percentuale": float(r.group(3).replace(",", "."))})
            if totale is not None and righe: trovate.append((n, righe, totale))
    if len(trovate) != 1: raise SystemExit(f"{file}: {len(trovate)} tabelle dei presenti per cittadinanza invece di 1")
    n, righe, totale = trovate[0]
    altre = next((r for r in righe if r["nome"] == "ALTRE"), None)
    cit = [{"nome": bello(r["nome"]), "presenti": r["presenti"], "percentuale": r["percentuale"]} for r in righe if r["nome"] != "ALTRE"]
    return {"tipo": "tabella", "data": f"{anno}-12-31", "fonte": file, "pagina": n, "totale": totale,
            "cittadinanze": cit, "altre_nel_report": altre["presenti"] if altre else None}


def coppie(testo):
    """(aggettivo, numero) da frasi come «l'egiziana (4.667 minori), l'ucraina (4.131)»."""
    return [(a.lower(), intero(n)) for a, n in re.findall(r"(?:la|l[’'])\s*([a-zé]+)\s*\(([\d.]+)(?:\s*minori)?\)", testo, re.I)]


def semestrale(anno, file):
    pg = pagine("dati-msna-sem/" + file)
    for n, t in enumerate(pg, 1):
        t1 = re.sub(r"\s+", " ", t)
        i = t1.find("Le principali cittadinanze dei minori censiti")
        if i < 0: continue
        par = t1[i:i + 1400]
        j = par.find("Le ulteriori cittadinanze")
        k = par.find("L’analisi", j) if j >= 0 else -1
        k = k if k > 0 else len(par)
        prima, ulteriori = par[:j], par[j:k]
        voci = coppie(prima)
        mp = re.search(r"rappresentano (?:oltre )?(?:i tre quarti dei MSNA presenti in Italia \(([\d,]+)%\)|l[’']\s*(\d+)%|.*?(?:oltre )?l[’'](\d+)%)", prima)
        stated = re.search(r"\(([\d,]+)%\)", prima) or re.search(r"oltre l[’'](\d+)%", prima)
        pct = float(stated.group(1).replace(",", ".")) if stated else None
        oltre = "oltre l" in prima[prima.find("rappresentano"):]
        extra = coppie(ulteriori)
        for m in re.finditer(r"la ([a-zé]+) e la ([a-zé]+), entrambe con ([\d.]+) minori", ulteriori):
            extra += [(m.group(1), intero(m.group(3))), (m.group(2), intero(m.group(3)))]
        for m in re.finditer(r"la ([a-zé]+) e la ([a-zé]+) con rispettivamente ([\d.]+) e ([\d.]+)", ulteriori):
            extra += [(m.group(1), intero(m.group(3))), (m.group(2), intero(m.group(4)))]
        extra.sort(key=lambda v: -v[1])
        tutte = voci + extra
        ignoti = [a for a, _ in tutte if a not in NOMI]
        if ignoti: raise SystemExit(f"{file}: cittadinanze non riconosciute {ignoti}")
        return {"tipo": "testo", "data": f"{anno}-12-31", "fonte": file, "pagina": n,
                "cittadinanze": [{"nome": NOMI[a], "presenti": v, "percentuale": None} for a, v in tutte],
                "gruppo_citato": len(voci), "percentuale_gruppo": pct, "percentuale_oltre": oltre}
    raise SystemExit(f"{file}: frase sulle principali cittadinanze non trovata")


def controlli(anni, naz):
    """Elenco degli errori e delle note sui controlli non possibili."""
    err, note = [], []
    for a, d in sorted(anni.items()):
        if d["tipo"] == "tabella":
            tot = naz.get(f"{a}-12")
            somma = sum(c["presenti"] for c in d["cittadinanze"]) + (d["altre_nel_report"] or 0)
            if d["totale"] != tot: err.append(f"{a}: totale della tabella {d['totale']} ≠ totale nazionale {tot}")
            if somma != tot: err.append(f"{a}: somma delle cittadinanze {somma} ≠ totale nazionale {tot}")
            for c in d["cittadinanze"]:
                if abs(c["presenti"] / d["totale"] * 100 - c["percentuale"]) > 0.1:  # i report arrotondano le percentuali in modo che sommino a 100: fino a ±0,1
                    err.append(f"{a} {c['nome']}: percentuale {c['percentuale']} ≠ {c['presenti']}/{d['totale']}")
            note.append(f"{a}: controllo sui valori citati nel testo possibile solo con la colonna delle percentuali (grafici non testuali o assenti)")
        else:
            tot = naz.get(f"{a}-12")
            v = [c["presenti"] for c in d["cittadinanze"]]
            if v != sorted(v, reverse=True): err.append(f"{a}: cittadinanze non in ordine decrescente")
            if sum(v) > tot: err.append(f"{a}: somma delle citate {sum(v)} > totale {tot}")
            s = sum(v[: d["gruppo_citato"]]) / tot * 100
            p = d["percentuale_gruppo"]
            if p is None: err.append(f"{a}: percentuale citata nel testo non trovata")
            elif d["percentuale_oltre"] and not s > p: err.append(f"{a}: prime {d['gruppo_citato']} = {s:.1f}% non oltre {p}%")
            elif not d["percentuale_oltre"] and abs(s - p) > 0.1: err.append(f"{a}: prime {d['gruppo_citato']} = {s:.2f}% invece di {p}% citato nel testo")
            note.append(f"{a}: nessuna tabella (solo il testo): controllato contro la percentuale delle prime {d['gruppo_citato']} citata nel report e il totale")
    return err, note


def main():
    msna = json.load(open("sito/data/msna.json"))
    naz = {p["periodo"]: p["presenti"] for p in msna["nazionale"]}
    anni = {a: mensile(a, f) for a, f in MENSILI.items()}
    anni.update({a: semestrale(a, f) for a, f in SEMESTRALI.items()})
    err, note = controlli(anni, naz)
    for n in note: print("NOTA", n)
    for e in err: print("ERRORE", e, file=sys.stderr)
    if err: sys.exit(1)
    for a, d in anni.items(): d["totale"] = d.get("totale") or naz[f"{a}-12"]
    json.dump({"anni": {str(a): d for a, d in sorted(anni.items())}}, open("sito/data/msna-cittadinanza.json", "w"), ensure_ascii=False, indent=1)
    print("scritto sito/data/msna-cittadinanza.json")


if __name__ == "__main__":
    main()
