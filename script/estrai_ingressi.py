#!/usr/bin/env python3
"""Ingressi di minori stranieri non accompagnati per anno, con la quota entrata via mare («eventi di sbarco») per cittadinanza.
Fonte: rapporti semestrali del Ministero del Lavoro al 31 dicembre 2023, 2024 e 2025 (dati-msna-sem/sem-AAAA-12.pdf), paragrafo
3.3 «Dati di flusso – Ingressi e uscite di competenza». Si usano solo cifre riferite all'intero anno solare: i rapporti di giugno
danno il solo semestre e non si usano.

Uso, dalla radice del repo: python3 script/estrai_ingressi.py   (richiede pdfplumber)
Scrive sito/data/msna-ingressi.json. Ogni cifra porta il testo del rapporto e la pagina; lo script verifica che il testo si trovi
davvero in quella pagina del PDF. I controlli sulle cifre sono ripetuti dalla build (sito/lib/msnaIngressi.ts)."""
import json, re, sys, datetime
import pdfplumber

def P(valore, testo, pagina, dec=0, appr=None):
    """Una percentuale o un numero come scritto nel rapporto: appr = «oltre», «quasi», «circa» se la cifra è approssimata."""
    return {"valore": valore, "decimali": dec, "approssimazione": appr, "testo": testo, "pagina": pagina}

def N(valore, testo, pagina, appr=None):
    return {"valore": valore, "approssimazione": appr, "testo": testo, "pagina": pagina}

def C(nome, ingressi, quota, testo, pagina, sbarco=None, **extra):
    """Cittadinanza: ingressi nell'anno, quota sul totale degli ingressi (come scritta), testo e pagina di entrambi; sbarco = quota via mare."""
    return {"nome": nome, "ingressi": ingressi, "quota_ingressi": quota, "testo": testo, "pagina": pagina, "sbarco": sbarco, **extra}

ANNI = {
 "2023": {
  "rapporto": "sem-2023-12.pdf",
  "ingressi_totali": N(27476, "ha censito nel SIM (Sistema Informativo Minori) l’ingresso nel Paese di 27.476 minori stranieri non accompagnati", 19),
  "sbarchi": {
    "numero": N(17000, "sono oltre 17mila i minori arrivati in Italia via mare", 19, "oltre"),
    "percentuale": P(62, "rappresentano il 62% del totale dei minori censiti nell’anno 2023 come nuovi ingressi", 19)},
  "cittadinanze": [
    C("Egitto", 4984, P(18, "", 21), "l’Egitto, con 4.984 minori, pari al 18% dei nuovi ingressi", 21,
      P(42, "il 42% dei minori egiziani è arrivato via mare", 21)),
    C("Tunisia", 4034, P(14.7, "", 21, 1), "la Tunisia, con 4.034 minori, pari al 14,7% del totale degli ingressi censiti", 21,
      P(65, "Quasi il 65% dei tunisini sono arrivati in seguito ad eventi di sbarchi", 21, 0, "quasi")),
    C("Guinea", 3650, P(13.3, "", 21, 1), "la Guinea, con 3.650 minori, pari al 13,3% del totale degli ingressi censiti nel 2023", 21,
      P(87.6, "ha fatto ingresso in Italia in seguito ad eventi di sbarco (l’87,6%)", 21, 1)),
    C("Gambia", 2261, P(8.3, "", 21, 1), "il Gambia, con 2.261 minori, pari all’8,3% del totale dei nuovi ingressi", 21,
      P(85.6, "la modalità di ingresso prevalente è in seguito ad eventi di sbarco (85,6%)", 21, 1)),
    C("Costa d'Avorio", 2630, P(7.5, "", 21, 1), "la Costa d’Avorio con 2.630 minori (7,5%)", 21,
      P(85.5, "I minori dalla Costa d’Avorio arrivano prevalentemente via mare (85,5%)", 21, 1),
      incoerenza={"altro_valore": 2063, "altro_testo": "la Costa d’Avorio: paese di origine di 2.063 minori entrati in Italia nel 2023", "altra_pagina": 22,
                  "nota": "A p. 21 il rapporto scrive 2.630 minori (7,5%); 2.630 sono il 9,6% di 27.476. A p. 22 scrive 2.063 minori, che sono il 7,5%: probabile inversione di cifre in p. 21."}),
    C("Afghanistan", 1295, P(4.7, "", 21, 1), "l’Afghanistan con 1.295 minori (4,7%)", 21, None,
      nota={"testo": "i minori afghani hanno utilizzato nel 2023 soprattutto rotte terresti (94,7%)", "pagina": 21, "rotte_terrestri": 94.7,
            "avviso": "Il rapporto non dà la quota via mare per l’Afghanistan: indica solo le rotte terrestri."}),
  ]},
 "2024": {
  "rapporto": "sem-2024-12.pdf",
  "ingressi_totali": N(14828, "ha censito nel SIM (Sistema Informativo Minori) l’ingresso nel Paese di 14.828 minori stranieri non accompagnati", 20),
  "sbarchi": {
    "numero": N(8000, "sono quasi 8mila i minori arrivati in Italia via mare", 20, "quasi"),
    "percentuale": P(53, "rappresentano il 53% del totale dei minori censiti nell’anno 2024 come nuovi ingressi", 20)},
  "cittadinanze": [
    C("Egitto", 3140, P(21, "", 21), "l’Egitto, con 3.140 minori, pari al 21% dei nuovi ingressi", 21,
      P(25, "il 25% dei minori egiziani è arrivato via mare", 21)),
    C("Tunisia", 2213, P(15, "", 21, 0, "circa"), "la Tunisia, con 2.213 minori, pari al 15% circa del totale degli ingressi censiti", 21,
      P(63, "Oltre il 63% dei tunisini è arrivato in seguito ad eventi di sbarchi", 21, 0, "oltre")),
    C("Gambia", 1280, P(8.6, "", 22, 1), "il Gambia, con 1.280 minori, pari all’8,6% del totale dei nuovi ingressi", 22,
      P(74.3, "la modalità di ingresso prevalente è in seguito ad eventi di sbarco (74,3%)", 22, 1)),
    C("Guinea", 1262, P(8.5, "", 22, 1), "la Guinea, con 1.262 minori, pari all’8,5% del totale degli ingressi censiti nel 2024", 22,
      P(88, "ha fatto ingresso in Italia in seguito ad eventi di sbarco (l’88%)", 22)),
    C("Eritrea", 699, P(4.7, "", 22, 1), "l’Eritrea con 699 minori (4,7% del totale)", 22,
      P(82, "arrivati in gran parte in seguito ad eventi di sbarco (82%)", 22)),
    C("Siria", 699, P(4.7, "", 22, 1), "la Siria con 699 minori (4,7%)", 22,
      P(78.4, "I minori dalla Siria sono arrivati prevalentemente via mare (78,4%)", 22, 1)),
    C("Bangladesh", 661, P(4.5, "", 22, 1), "il Bangladesh con 661 minori (4,5%)", 22,
      P(61, "i minori bangladesi arrivati via mare sono stati il 61%", 22)),
  ]},
 "2025": {
  "rapporto": "sem-2025-12.pdf",
  "ingressi_totali": N(16228, "ha censito nel SIM (Sistema Informativo Minori) l’ingresso nel Paese di 16.228 minori stranieri non accompagnati", 20),
  "sbarchi": {
    "numero": N(9000, "sono oltre 9mila i minori arrivati in Italia via mare", 20, "oltre"),
    "percentuale": P(56, "rappresentano il 56% del totale dei minori censiti nell’anno come nuovi ingressi", 20)},
  "cittadinanze": [
    C("Egitto", 5656, P(35, "", 21), "l’Egitto, con 5.656 minori, pari al 35% dei nuovi ingressi", 21,
      P(43, "il 43% dei minori egiziani è arrivato via mare", 21)),
    C("Bangladesh", 2096, P(13, "", 21, 0, "circa"), "il Bangladesh, con 2.096 minori, pari al 13% circa del totale degli ingressi censiti", 21,
      P(65, "Quasi il 65% dei bangladesi è arrivato in seguito ad eventi di sbarchi", 21, 0, "quasi")),
    C("Eritrea", 1793, P(11, "", 21), "l’Eritrea, con 1.793 minori, pari all’11% del totale dei nuovi ingressi", 21,
      P(93.4, "la modalità di ingresso prevalente è in seguito ad eventi di sbarco (93,4%)", 21, 1)),
    C("Somalia", 1115, P(7, "", 21), "la Somalia, con 1.115 minori, pari al 7% del totale degli ingressi censiti nel 2025", 21,
      P(92, "ha fatto ingresso in Italia in seguito ad eventi di sbarco (il 92%)", 21)),
    C("Tunisia", 641, P(4, "", 21), "Tunisia con 641 minori (4% del totale)", 21,
      P(41, "i minori arrivati via mare sono stati rispettivamente il 41%, il 92% e l’85%", 21),
      nota={"testo": "Per i tre paesi i minori arrivati via mare sono stati rispettivamente il 41%, il 92% e l’85%", "pagina": 21,
            "avviso": "Il rapporto dà le tre quote insieme, nell’ordine Tunisia, Etiopia, Sudan."}),
    C("Etiopia", 508, P(3, "", 21), "l’Etiopia con 508 minori (3%)", 21,
      P(92, "i minori arrivati via mare sono stati rispettivamente il 41%, il 92% e l’85%", 21)),
    C("Sudan", 473, P(3, "", 21), "il Sudan con 473 minori (3%)", 21,
      P(85, "i minori arrivati via mare sono stati rispettivamente il 41%, il 92% e l’85%", 21)),
  ]},
}

def norm(t): return re.sub(r"\s+", " ", t or "")

def cifre(c):
    """Tutti i (testo, pagina) citati da una voce."""
    for k in ("ingressi", "quota_ingressi", "sbarco"):
        v = c.get(k)
        if isinstance(v, dict) and v.get("testo"): yield v["testo"], v["pagina"]
    if c.get("testo"): yield c["testo"], c["pagina"]
    if isinstance(c.get("nota"), dict): yield c["nota"]["testo"], c["nota"]["pagina"]
    if c.get("incoerenza"): yield c["incoerenza"]["altro_testo"], c["incoerenza"]["altra_pagina"]

def main():
    errori = []
    out = {"estratto": datetime.date.today().isoformat(),
           "fonte": "Ministero del Lavoro e delle Politiche Sociali, rapporti semestrali sui minori stranieri non accompagnati in Italia, dati al 31 dicembre; paragrafo 3.3 «Dati di flusso – Ingressi e uscite di competenza»",
           "periodo": "anno solare",
           "non_usati": [f"sem-{a}-06.pdf: dà solo il primo semestre" for a in ("2023", "2024", "2025")],
           "note": ["I rapporti consolidano i dati: il totale 2024 è 14.828 nel rapporto al 31 dicembre 2024; il rapporto 2025 scrive che il 2025 è +235 unità rispetto al 2024 (p. 20), cioè 15.993 per il 2024. Ogni anno porta la cifra del proprio rapporto.",
                    "Nei rapporti le quote per cittadinanza sono scritte con 0 o 1 decimale, a volte con «oltre», «quasi» o «circa»: si riportano come scritte."],
           "confronto_2024_nel_rapporto_2025": {"differenza": 235, "testo": "il dato degli ingressi dei minori stranieri è risultato in leggero aumento rispetto agli ingressi registrati nel 2024 (+235 unità)", "pagina": 20, "rapporto": "sem-2025-12.pdf"},
           "anni": {}}
    for anno, d in ANNI.items():
        with pdfplumber.open(f"dati-msna-sem/{d['rapporto']}") as pdf:
            pagine = {}
            def pag(n):
                if n not in pagine: pagine[n] = norm(pdf.pages[n - 1].extract_text())
                return pagine[n]
            voci = [(d["ingressi_totali"]["testo"], d["ingressi_totali"]["pagina"])]
            for k in ("numero", "percentuale"): voci.append((d["sbarchi"][k]["testo"], d["sbarchi"][k]["pagina"]))
            for c in d["cittadinanze"]: voci += list(cifre(c))
            for t, n in voci:
                if norm(t) not in pag(n): errori.append(f"{anno}: testo non trovato a p. {n} di {d['rapporto']}: {t}")
        out["anni"][anno] = {"rapporto": d["rapporto"], "data": f"{anno}-12-31", "periodo": "anno solare", **{k: v for k, v in d.items() if k != "rapporto"}}
    with pdfplumber.open("dati-msna-sem/sem-2025-12.pdf") as pdf:
        if norm(out["confronto_2024_nel_rapporto_2025"]["testo"]) not in norm(pdf.pages[19].extract_text()): errori.append("2025: testo del confronto con il 2024 non trovato a p. 20")
    if errori: sys.exit("Controlli non superati:\n  " + "\n  ".join(errori))
    json.dump(out, open("sito/data/msna-ingressi.json", "w"), ensure_ascii=False, indent=1)
    print("scritto sito/data/msna-ingressi.json:", ", ".join(f"{a} ({len(x['cittadinanze'])} cittadinanze)" for a, x in out["anni"].items()))

if __name__ == "__main__":
    main()
