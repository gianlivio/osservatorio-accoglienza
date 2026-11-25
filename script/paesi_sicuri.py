#!/usr/bin/env python3
"""Costruisce sito/data/paesi-sicuri.json: per ogni paese di sito/data/paesi.json, gli intervalli di presenza nell'elenco italiano dei
paesi di origine sicuri (art. 2-bis del d.lgs. 28 gennaio 2008, n. 25), atto per atto.

Uso, dalla radice del repo: python3 script/paesi_sicuri.py

Gli atti e gli elenchi qui sotto sono trascritti a mano dai testi ufficiali, letti il 25/11/2026:
- decreti del Ministro degli affari esteri (di concerto con Interno e Giustizia) del 4 ottobre 2019, 17 marzo 2023 e 7 maggio 2024:
  Gazzetta Ufficiale (PDF delle Serie generali n. 235 del 7-10-2019, n. 72 del 25-3-2023, n. 105 del 7-5-2024), art. 1 e 5 di ciascuno;
- d.l. 23 ottobre 2024, n. 158, art. 1 (Gazzetta Ufficiale n. 249 del 23-10-2024), in vigore dal 24 ottobre 2024;
- d.l. 11 ottobre 2024, n. 145, art. 12-bis, introdotto dalla legge di conversione 9 dicembre 2024, n. 187, in vigore dall'11 dicembre 2024
  (che abroga il d.l. 158/2024 facendone salvi gli effetti): testo vigente dell'art. 2-bis su Normattiva, invariato al 25/11/2026.
Ogni decreto «si applica dal quindicesimo giorno successivo a quello della sua pubblicazione» (art. 4 o 5 di ciascuno): la data di
inizio è calcolata così. La data di fine di un elenco è il giorno prima dell'inizio del successivo.
Il testo dell'art. 1 di ogni decreto è un elenco di nomi, senza eccezioni. Le eccezioni sono nella Relazione del Governo al Parlamento sulla situazione
dei Paesi di origine sicuri, anno 2024 (Camera, Doc. CCXXXIX n. 1, trasmessa il 1° aprile 2025; PDF letto il 25/11/2026): a p. 5 del documento
(p. 3 della Relazione) scrive che «per taluni dei Paesi in elenco» sono state applicate eccezioni «per categorie di persone o per parti di
territorio», senza dire per quali paesi né quali. Lo dice nel paragrafo sul decreto 17 marzo 2023: l'eccezione si attribuisce agli intervalli
che includono il 9 aprile 2023; gli altri hanno «non indicate nella fonte». Nessun'altra pagina della Relazione (132 p.) riporta eccezioni per paese.
Lo script si ferma se il numero di paesi di un elenco non è quello dell'atto, o se ci sono doppioni."""
import datetime, json, sys

NORMATTIVA = "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:"
GU = "https://www.gazzettaufficiale.it/eli/id/"
D = datetime.date.fromisoformat

ATTI = [
    {
        "id": "dm-2019-10-04",
        "titolo": "Decreto del Ministro degli affari esteri e della cooperazione internazionale 4 ottobre 2019, «Individuazione dei Paesi di origine sicuri, ai sensi dell'articolo 2-bis del decreto legislativo 28 gennaio 2008, n. 25»",
        "breve": "decreto del Ministro degli affari esteri 4 ottobre 2019",
        "pubblicazione": {"fonte": "Gazzetta Ufficiale, Serie generale n. 235", "data": "2019-10-07", "codice": "19A06239"},
        "inizio": {"regola": "art. 4, comma 1: si applica dal quindicesimo giorno successivo a quello della pubblicazione", "giorni": 15},
        "url": GU + "2019/10/07/19A06239/sg",
        "elenco": ["Albania", "Algeria", "Bosnia-Erzegovina", "Capo Verde", "Ghana", "Kosovo", "Macedonia del Nord", "Marocco",
                   "Montenegro", "Senegal", "Serbia", "Tunisia", "Ucraina"],
        "transitoria": None,
    },
    {
        "id": "dm-2023-03-17",
        "titolo": "Decreto del Ministro degli affari esteri e della cooperazione internazionale 17 marzo 2023, «Aggiornamento periodico della lista dei Paesi di origine sicuri per i richiedenti protezione internazionale»",
        "breve": "decreto del Ministro degli affari esteri 17 marzo 2023",
        "pubblicazione": {"fonte": "Gazzetta Ufficiale, Serie generale n. 72", "data": "2023-03-25", "codice": "23A01952"},
        "inizio": {"regola": "art. 5, comma 1: si applica dal quindicesimo giorno successivo a quello della pubblicazione", "giorni": 15},
        "url": GU + "2023/03/25/23A01952/sg",
        "elenco": ["Albania", "Algeria", "Bosnia-Erzegovina", "Capo Verde", "Costa d'Avorio", "Gambia", "Georgia", "Ghana", "Kosovo",
                   "Macedonia del Nord", "Marocco", "Montenegro", "Nigeria", "Senegal", "Serbia", "Tunisia"],
        "transitoria": {
            "riferimento": "art. 4, comma 1",
            "testo": "Ai fini dell'esame delle domande di protezione internazionale, l'inclusione della Costa d'Avorio, del Gambia, della Georgia e della Nigeria nell'elenco di cui all'art. 1 non ha effetto sulle domande presentate da cittadini di detti Paesi prima dell'adozione del presente decreto.",
            "paesi": ["Costa d'Avorio", "Gambia", "Georgia", "Nigeria"],
        },
    },
    {
        "id": "dm-2024-05-07",
        "titolo": "Decreto del Ministro degli affari esteri e della cooperazione internazionale 7 maggio 2024, «Aggiornamento della lista dei Paesi di origine sicuri prevista dall'articolo 2-bis del decreto legislativo 28 gennaio 2008, n. 25»",
        "breve": "decreto del Ministro degli affari esteri 7 maggio 2024",
        "pubblicazione": {"fonte": "Gazzetta Ufficiale, Serie generale n. 105", "data": "2024-05-07", "codice": "24A02369"},
        "inizio": {"regola": "art. 5, comma 1: si applica dal quindicesimo giorno successivo a quello della pubblicazione", "giorni": 15},
        "url": GU + "2024/05/07/24A02369/sg",
        "elenco": ["Albania", "Algeria", "Bangladesh", "Bosnia-Erzegovina", "Camerun", "Capo Verde", "Colombia", "Costa d'Avorio", "Egitto",
                   "Gambia", "Georgia", "Ghana", "Kosovo", "Macedonia del Nord", "Marocco", "Montenegro", "Nigeria", "Perù", "Senegal",
                   "Serbia", "Sri Lanka", "Tunisia"],
        "transitoria": {
            "riferimento": "art. 4, comma 1",
            "testo": "Ai fini dell'esame delle domande di protezione internazionale, l'inclusione di Bangladesh, Camerun, Colombia, Egitto, Perù e Sri Lanka, nell'elenco di cui all'art. 1 non ha effetto sulle domande presentate da cittadini di detti Paesi prima dell'adozione del presente decreto.",
            "paesi": ["Bangladesh", "Egitto", "Perù", "Sri Lanka"],
        },
    },
    {
        "id": "dl-2024-158",
        "titolo": "Decreto-legge 23 ottobre 2024, n. 158, art. 1, che sostituisce il comma 1 dell'art. 2-bis del decreto legislativo 28 gennaio 2008, n. 25 (elenco dei Paesi di origine sicuri nella legge)",
        "breve": "decreto-legge 23 ottobre 2024, n. 158",
        "pubblicazione": {"fonte": "Gazzetta Ufficiale, Serie generale n. 249", "data": "2024-10-23", "codice": "24G00177"},
        "inizio": {"regola": "in vigore dal 24 ottobre 2024 (Normattiva)", "data": "2024-10-24"},
        "url": NORMATTIVA + "decreto.legislativo:2008-01-28;25~art2bis!vig=2024-10-24",
        "elenco": ["Albania", "Algeria", "Bangladesh", "Bosnia-Erzegovina", "Capo Verde", "Costa d'Avorio", "Egitto", "Gambia", "Georgia",
                   "Ghana", "Kosovo", "Macedonia del Nord", "Marocco", "Montenegro", "Perù", "Senegal", "Serbia", "Sri Lanka", "Tunisia"],
        "transitoria": None,
        "premessa": "Considerata la straordinaria necessità ed urgenza di designare i Paesi di origine sicuri, tenendo conto della sentenza della Corte di Giustizia dell'Unione Europea, del 4 ottobre 2024 (causa C-406/22), escludendo i Paesi che non soddisfano le condizioni per determinate parti del loro territorio (Camerun, Colombia e Nigeria)",
    },
    {
        "id": "dl-2024-145-art-12-bis",
        "titolo": "Decreto-legge 11 ottobre 2024, n. 145, art. 12-bis, introdotto dalla legge 9 dicembre 2024, n. 187 di conversione, che sostituisce il comma 1 dell'art. 2-bis del decreto legislativo 28 gennaio 2008, n. 25 (testo vigente)",
        "breve": "art. 12-bis del decreto-legge 11 ottobre 2024, n. 145, come convertito dalla legge 9 dicembre 2024, n. 187",
        "pubblicazione": {"fonte": "Gazzetta Ufficiale, Serie generale n. 289", "data": "2024-12-10", "codice": "24G00206"},
        "inizio": {"regola": "in vigore dall'11 dicembre 2024 (Normattiva)", "data": "2024-12-11"},
        "url": NORMATTIVA + "decreto.legislativo:2008-01-28;25~art2bis",
        "elenco": ["Albania", "Algeria", "Bangladesh", "Bosnia-Erzegovina", "Capo Verde", "Costa d'Avorio", "Egitto", "Gambia", "Georgia",
                   "Ghana", "Kosovo", "Macedonia del Nord", "Marocco", "Montenegro", "Perù", "Senegal", "Serbia", "Sri Lanka", "Tunisia"],
        "transitoria": None,
    },
]
NUMERO_ELENCO = {"dm-2019-10-04": 13, "dm-2023-03-17": 16, "dm-2024-05-07": 22, "dl-2024-158": 19, "dl-2024-145-art-12-bis": 19}

# Testo vigente dell'art. 2-bis, comma 5, d.lgs. 25/2008 (Normattiva, letto il 25/11/2026; invariato dal 4 dicembre 2018)
EFFETTO = {
    "riferimento": "art. 2-bis, comma 5, del decreto legislativo 28 gennaio 2008, n. 25 (testo vigente)",
    "testo": "Un Paese designato di origine sicuro ai sensi del presente articolo può essere considerato Paese di origine sicuro per il richiedente solo se questi ha la cittadinanza di quel Paese o è un apolide che in precedenza soggiornava abitualmente in quel Paese e non ha invocato gravi motivi per ritenere che quel Paese non è sicuro per la situazione particolare in cui lo stesso richiedente si trova.",
    "url": NORMATTIVA + "decreto.legislativo:2008-01-28;25~art2bis",
}
ULTIMO_CONTROLLO = "2026-11-25"

RELAZIONE = {
    "titolo": "Relazione del Governo al Parlamento sulla situazione dei Paesi di origine sicuri inclusi nell'elenco di cui all'articolo 2-bis, comma 1, del decreto legislativo 28 gennaio 2008, n. 25 (anno 2024), Camera dei deputati, Doc. CCXXXIX, n. 1",
    "breve": "Relazione del Governo al Parlamento sui Paesi di origine sicuri, anno 2024 (Camera, Doc. CCXXXIX, n. 1)",
    "url": "https://documenti.camera.it/_dati/leg19/lavori/documentiparlamentari/indiceetesti/239/001_RS/INTERO_COM.pdf",
    "pagina": "p. 5 del documento (p. 3 della Relazione)",
    "letto": "2026-11-25",
}
ECCEZIONI_RELAZIONE = {
    "testo": "Per taluni dei Paesi in elenco sono state applicate alla designazione di \"Paese di origine sicuro\" eccezioni per categorie di persone o per parti di territorio.",
    "contesto": "paragrafo sul decreto 17 marzo 2023",
    "per_paese": False,  # la Relazione non dice per quali paesi né quali eccezioni
    "data_riferimento": "2023-04-09",  # inizio dell'applicazione del decreto 17 marzo 2023
}
NON_INDICATE = "non indicate nella fonte"
# Paesi usciti dall'elenco col d.l. 158/2024, con le parole della Relazione (stessa pagina) e della premessa del decreto-legge
USCITA_DL_158 = {
    "testo": "tre Paesi (Camerun, Colombia e Nigeria) sono stati espunti dalla lista avendo il Governo ritenuto che, alla luce degli approfondimenti condotti sulle schede a corredo dell'istruttoria del D.I. 7 maggio 2024, le situazioni di criticità presenti in parte dei relativi territori non giustificassero più l'inclusione di tali paesi nell'elenco",
    "paesi": ["Nigeria"],
}
# Art. 2-bis, comma 2, secondo periodo, dopo l'art. 1, lett. b), d.l. 158/2024 (GU n. 249 del 23-10-2024): soppresse le parole «di parti del territorio o»
NORMA_ECCEZIONI = {
    "dal": "2024-10-24",
    "riferimento": "art. 2-bis, comma 2, del d.lgs. 25/2008, come modificato dall'art. 1, comma 1, lettera b), del d.l. 158/2024 e dall'art. 12-bis del d.l. 145/2024 convertito",
    "testo": "La designazione di un Paese di origine sicuro può essere fatta con l'eccezione di categorie di persone.",
    "soppresso": "di parti del territorio o",
}


def inizio(a):
    i = a["inizio"]
    pub = D(a["pubblicazione"]["data"])
    return D(i["data"]) if "data" in i else pub + datetime.timedelta(days=i["giorni"])


def main():
    paesi = json.load(open("sito/data/paesi.json"))["paesi"]
    atti = sorted(ATTI, key=inizio)
    for a in atti:
        if len(a["elenco"]) != NUMERO_ELENCO[a["id"]] or len(set(a["elenco"])) != len(a["elenco"]):
            sys.exit(f"{a['id']}: {len(a['elenco'])} paesi nell'elenco invece di {NUMERO_ELENCO[a['id']]} (o doppioni)")
        if a["transitoria"] and not set(a["transitoria"]["paesi"]) <= set(a["elenco"]):
            sys.exit(f"{a['id']}: norma transitoria su paesi non nell'elenco")
    out_paesi = {}
    for p in paesi:
        presente = [p["nome"] in a["elenco"] for a in atti]
        intervalli, i = [], 0
        while i < len(atti):
            if not presente[i]: i += 1; continue
            j = i
            while j + 1 < len(atti) and presente[j + 1]: j += 1
            dal = inizio(atti[i])
            al = inizio(atti[j + 1]) - datetime.timedelta(days=1) if j + 1 < len(atti) else None
            iv = {"dal": dal.isoformat(), "al": al.isoformat() if al else None, "atto": atti[i]["id"],
                  "atti": [a["id"] for a in atti[i:j + 1]]}
            rif = D(ECCEZIONI_RELAZIONE["data_riferimento"])
            if dal <= rif and (al is None or al >= rif):
                iv["eccezioni"] = {"testo": ECCEZIONI_RELAZIONE["testo"], "fonte": RELAZIONE["breve"], "pagina": RELAZIONE["pagina"],
                                   "per_paese": False}
            else:
                iv["eccezioni"] = NON_INDICATE
            if al is not None and p["nome"] in USCITA_DL_158["paesi"]:
                iv["uscita"] = {"testo": USCITA_DL_158["testo"], "fonte": RELAZIONE["breve"], "pagina": RELAZIONE["pagina"]}
            t = atti[i]["transitoria"]
            if t and p["nome"] in t["paesi"]: iv["norma_transitoria"] = {"atto": atti[i]["id"], "riferimento": t["riferimento"], "testo": t["testo"]}
            intervalli.append(iv)
            i = j + 1
        out_paesi[p["slug"]] = {"nome": p["nome"], "intervalli": intervalli}
    out = {
        "controllato": ULTIMO_CONTROLLO,
        "primo_elenco_dal": inizio(atti[0]).isoformat(),
        "eccezioni_atti": "Il testo dell'art. 1 di ciascun decreto e del comma 1 dell'art. 2-bis è un elenco di nomi di paesi, senza eccezioni.",
        "relazione": RELAZIONE,
        "norma_eccezioni": NORMA_ECCEZIONI,
        "effetto": EFFETTO,
        "atti": [{"id": a["id"], "titolo": a["titolo"], "breve": a["breve"], "pubblicazione": a["pubblicazione"],
                  "in_applicazione_dal": inizio(a).isoformat(), "regola_inizio": a["inizio"]["regola"], "url": a["url"],
                  "elenco": a["elenco"], "norma_transitoria": a["transitoria"], "premessa": a.get("premessa")} for a in atti],
        "paesi": out_paesi,
    }
    json.dump(out, open("sito/data/paesi-sicuri.json", "w"), ensure_ascii=False, indent=1)
    print("scritto sito/data/paesi-sicuri.json")
    for p in paesi:
        iv = out_paesi[p["slug"]]["intervalli"]
        print(f"  {p['nome']:16}", "; ".join(f"{x['dal']} → {x['al'] or 'oggi'} ({x['atto']})" for x in iv) or "mai nell'elenco")


if __name__ == "__main__":
    main()
