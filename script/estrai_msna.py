#!/usr/bin/env python3
"""Estrae la presenza MSNA per regione dai report mensili PDF del Ministero del Lavoro.
Uso: python3 script/estrai_msna.py  (legge dati-msna/*.pdf, scrive sito-dati/msna.json)"""
import pdfplumber, os, re, glob, json, warnings, logging
warnings.filterwarnings("ignore")
logging.getLogger("pdfminer").setLevel(logging.ERROR)

NORM = {"EMILIA":"Emilia-Romagna","FRIULI":"Friuli-Venezia Giulia",
"VALLE":"Valle d'Aosta","ABRUZZO":"Abruzzo","BASILICATA":"Basilicata",
"CALABRIA":"Calabria","CAMPANIA":"Campania","LAZIO":"Lazio","LIGURIA":"Liguria",
"LOMBARDIA":"Lombardia","MARCHE":"Marche","MOLISE":"Molise","PIEMONTE":"Piemonte",
"PUGLIA":"Puglia","SARDEGNA":"Sardegna","SICILIA":"Sicilia","TOSCANA":"Toscana",
"UMBRIA":"Umbria","VENETO":"Veneto"}
MESI = {"gennaio":1,"febbraio":2,"marzo":3,"aprile":4,"maggio":5,"giugno":6,
"luglio":7,"agosto":8,"settembre":9,"ottobre":10,"novembre":11,"dicembre":12}

def match(u):
    if "TRENTO" in u: return "Trento"
    if "BOLZANO" in u: return "Bolzano"
    for k in NORM:
        if u.startswith(k): return NORM[k]
    return None

def periodo(nome):
    n = nome.lower()
    mese = next((v for k,v in MESI.items() if k in n), None)
    a = re.search(r'20\d\d', n)
    if mese and a: return int(a.group()), mese
    m = re.search(r'(\d{2})[-]?(\d{2})[-]?(20\d\d)', n)
    if m: return int(m.group(3)), int(m.group(2))
    return None

def primo_intero(riga):
    for tok in re.findall(r'\d[\d.]*', riga):
        v = tok.replace(".","")
        if v.isdigit(): return int(v)
    return None

def main():
    righe = []
    for pdf_path in sorted(glob.glob("dati-msna/*.pdf")):
        per = periodo(os.path.basename(pdf_path))
        if not per: continue
        anno, mese = per
        try:
            with pdfplumber.open(pdf_path) as pdf:
                testo = "\n".join(p.extract_text() or "" for p in pdf.pages)
        except Exception: continue
        i = testo.upper().rfind("REGIONE DI ACCOGLIENZA")
        blocco = testo[i:i+2200] if i>=0 else ""
        for riga in blocco.split("\n"):
            reg = match(riga.upper().strip())
            if not reg: continue
            va = primo_intero(riga)
            if va and 0 < va < 100000:
                righe.append({"anno":anno,"mese":mese,"regione":reg,"presenti":va})
    os.makedirs("sito-dati", exist_ok=True)
    json.dump(righe, open("sito-dati/msna.json","w"), ensure_ascii=False)
    mesi = len(set((r["anno"],r["mese"]) for r in righe))
    print(f"{len(righe)} righe, {mesi} mesi -> sito-dati/msna.json")

if __name__ == "__main__":
    main()
