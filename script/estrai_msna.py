#!/usr/bin/env python3
"""Estrae i minori stranieri non accompagnati (MSNA) presenti per regione dai report mensili PDF del Ministero del Lavoro
e scrive sito/data/msna.json (serie mensile per regione e nazionale fino a dicembre 2022; i totali semestrali dal 2023
vengono da dati-msna-sem/nazionale.json).

Uso, dalla radice del repo: python3 script/estrai_msna.py   (richiede pdfplumber; legge dati-msna/*.pdf)

Nei report fino al 2021 ci sono DUE tabelle «Ripartizione ... per regione di accoglienza»: la prima è dei minori presenti
(totale), la seconda delle sole minori di genere femminile. Si usa quella con il TOTALE più alto, che deve coincidere con la
cifra dei presenti del report; il controllo sui valori attesi (sito/data/msna-attesi.json) e la somma delle regioni
fanno fallire lo script, e la build del sito ripete gli stessi controlli (sito/lib/dati.ts)."""
import glob, json, logging, os, re, sys, warnings
import pdfplumber
warnings.filterwarnings("ignore")
logging.getLogger("pdfminer").setLevel(logging.ERROR)

ULTIMO_MENSILE = "2022-12"
NORM = {"EMILIA": "Emilia-Romagna", "FRIULI": "Friuli-Venezia Giulia", "FRIULIA": "Friuli-Venezia Giulia",
        "VALLE": "Valle d'Aosta", "VAL": "Valle d'Aosta", "ABRUZZO": "Abruzzo", "BASILICATA": "Basilicata",
        "CALABRIA": "Calabria", "CAMPANIA": "Campania", "LAZIO": "Lazio", "LIGURIA": "Liguria",
        "LOMBARDIA": "Lombardia", "MARCHE": "Marche", "MOLISE": "Molise", "PIEMONTE": "Piemonte",
        "PUGLIA": "Puglia", "SARDEGNA": "Sardegna", "SICILIA": "Sicilia", "TOSCANA": "Toscana",
        "UMBRIA": "Umbria", "VENETO": "Veneto",
        "VENEZIA": "Veneto"}  # report di giugno 2016: la riga del Veneto porta la dicitura «VENEZIA» (la somma torna solo così)
MESI = {"gennaio": 1, "febbraio": 2, "marzo": 3, "aprile": 4, "maggio": 5, "giugno": 6,
        "luglio": 7, "agosto": 8, "settembre": 9, "ottobre": 10, "novembre": 11, "dicembre": 12}


def regione(riga):
    u = riga.upper()
    if "TRENTO" in u: return "Trento"
    if "BOLZANO" in u: return "Bolzano"
    prima = re.split(r"[\s-]", u, maxsplit=1)[0]
    return NORM.get(prima)


def periodo_testo(t):
    m = re.search(r"Dati al\s+\d{1,2}\s+([a-zà]+)\s+(20\d\d)", t, re.I)
    if m and m.group(1).lower() in MESI: return f"{m.group(2)}-{MESI[m.group(1).lower()]:02d}"
    m = re.search(r"\b\d{2}/(\d{2})/(20\d\d)\b", t)
    if m: return f"{m.group(2)}-{m.group(1)}"
    return None


def intero(s): return int(s.replace(".", ""))


def blocchi(t):
    """Tutte le tabelle per regione del testo: (totale dichiarato, {regione: presenti})."""
    out = []
    for m in re.finditer(r"REGIONE DI ACCOGLIENZA", t):
        resto = t[m.end():]
        mt = re.search(r"^TOTALE\s+(\d[\d.]*)", resto, re.M)
        if not mt: continue
        righe = {}
        for riga in resto[:mt.start()].split("\n"):
            r = regione(riga.strip())
            mm = re.search(r"(\d[\d.]*)\s+[\d,]+%?\s*$", riga.strip())
            if r and mm: righe[r] = intero(mm.group(1))
        if righe: out.append((intero(mt.group(1)), righe))
    return out


def estrai():
    mesi, errori = {}, []
    for pdf_path in sorted(glob.glob("dati-msna/*.pdf")):
        nome = os.path.basename(pdf_path)
        with pdfplumber.open(pdf_path) as pdf:
            t = "\n".join(p.extract_text() or "" for p in pdf.pages)
        per = periodo_testo(t)
        if not per: errori.append(f"{nome}: periodo non riconosciuto"); continue
        if per > ULTIMO_MENSILE: continue
        bl = blocchi(t)
        if not bl: errori.append(f"{per} ({nome}): nessuna tabella per regione"); continue
        totale, righe = max(bl, key=lambda b: b[0])
        if per in mesi: errori.append(f"{per}: due report ({nome})"); continue
        mesi[per] = {"totale": totale, "regioni": righe, "file": nome}
    return mesi, errori


def controlla(mesi):
    """Elenco dei mesi in cui la somma delle regioni non è uguale al totale del report."""
    return [f"{p}: somma regioni {sum(m['regioni'].values())} ≠ totale {m['totale']} ({m['file']})"
            for p, m in sorted(mesi.items()) if sum(m["regioni"].values()) != m["totale"]]


def controlla_attesi(mesi):
    attesi = json.load(open("sito/data/msna-attesi.json"))
    return [f"{a['periodo']}: estratto {mesi.get(a['periodo'], {}).get('totale')} ≠ atteso {a['presenti']}"
            for a in attesi if mesi.get(a["periodo"], {}).get("totale") != a["presenti"]]


def main():
    mesi, errori = estrai()
    somme = controlla(mesi)
    attesi = controlla_attesi(mesi)
    for e in errori + somme + attesi: print("ERRORE", e, file=sys.stderr)
    if errori or somme or attesi: sys.exit(1)

    periodi = sorted(mesi)
    nomi = sorted({r for m in mesi.values() for r in m["regioni"]})
    regioni = []
    for r in nomi:
        serie = [{"periodo": p, "presenti": mesi[p]["regioni"].get(r, 0)} for p in periodi]  # riga assente = 0 (la somma torna)
        regioni.append({"regione": r, "ultimo": serie[-1]["presenti"], "primo": serie[0]["presenti"], "serie": serie})
    regioni.sort(key=lambda r: -r["ultimo"])
    sem = json.load(open("dati-msna-sem/nazionale.json"))
    nazionale = ([{"periodo": p, "presenti": mesi[p]["totale"], "tipo": "mensile"} for p in periodi]
                 + [{"periodo": s["periodo"], "presenti": s["presenti"], "tipo": "semestrale"} for s in sem])
    out = {"primo_periodo": periodi[0], "ultimo_periodo": periodi[-1], "totale_ultimo": mesi[periodi[-1]]["totale"],
           "nazionale": nazionale, "regioni": regioni,
           "ultimo_totale_periodo": nazionale[-1]["periodo"], "ultimo_totale": nazionale[-1]["presenti"]}
    json.dump(out, open("sito/data/msna.json", "w"), ensure_ascii=False, indent=1)
    print(f"{len(periodi)} mesi, {len(regioni)} regioni, somme e valori attesi verificati -> sito/data/msna.json")


if __name__ == "__main__":
    main()
