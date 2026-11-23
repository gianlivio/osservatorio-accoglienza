#!/usr/bin/env python3
"""Costruisce sito/data/cronologia.json per la pagina /dieci-anni: tre serie annuali 2015-2025 e le leggi sull'accoglienza.

- Contratti sopra 40.000 €: letti da sito/data/province-lite.json (serie_anni).
- Presenze e costo mediano dei CAS per adulti: letti da sito/data/centri.json.
- Notizie in prima pagina e nei telegiornali: cifre citate dai rapporti annuali di Carta di Roma / Osservatorio di Pavia.
  Non vengono dai file del repo (i PDF non sono versionati): sono scritte qui sotto, ciascuna con rapporto e pagina,
  lette dal testo e verificate sulle immagini delle pagine. Non sono copiati testi o grafici dei rapporti.

Uso, dalla radice del repo: python3 script/cronologia.py
"""
import json
from datetime import date
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
DATI = RADICE / "sito/data"
BASE = "https://www.cartadiroma.org/wp-content/uploads/"

ANNI = [str(a) for a in range(2015, 2026)]

# Rapporto di ciascun anno (n. romano, titolo, file). Il rapporto 2025 è l'unico che pubblica la serie dei TG 2015-2025.
RAPPORTI = {
    "2015": ("III", "Notizie di confine", "2015/12/Rapporto-2015_-cartadiroma.pdf"),
    "2016": ("IV", "Notizie oltre i muri", "2024/12/NOTIZIE-OLTRE-I-MURI_2016.pdf"),
    "2017": ("V", "Notizie da paura", "2018/01/Rapporto-2017_-cartadiroma_small.pdf"),
    "2018": ("VI", "Notizie di chiusura", "2018/12/Notizie-di-chiusura.pdf"),
    "2019": ("VII", "Notizie senza approdo", "2019/12/CdR-Report-2019_FInal.pdf"),
    "2020": ("VIII", "Notizie di transito", "2020/12/Notizie-di-transito.pdf"),
    "2021": ("IX", "Notizie ai margini", "2021/12/Notizie-ai-margini.pdf"),
    "2022": ("X", "Notizie dal fronte", "2022/12/Notizie_dal_fronte_XRapportoCdR-1.pdf"),
    "2023": ("XI", "Notizie a memoria", "2023/12/Notizie-a-memoria_XIRapporto_CdR.pdf"),
    "2024": ("XII", "Notizie di contrasto", "2025/01/Notizie-di-contrasto_XII-Rapporto-CdR.pdf"),
    "2025": ("XIII", "Notizie senza volto", "2025/12/Rapporto_CdR_Notizie-senza-volto_2025.pdf"),
}

# Titoli sulle prime pagine, 1 gennaio - 31 ottobre di ogni anno, per testata.
# 2015-2023: grafico per testata e anno del rapporto 2023 (PDF p.9, stampata p.9), che dà la serie 2015-2023 con le
# correzioni di un'unità del Giornale 2016 (269, non 268) e 2017 (253, non 254) rispetto ai rapporti di quegli anni.
# 2024: rapporto 2024, Grafico 1 (PDF p.15). 2025: rapporto 2025, Grafico 1 (PDF p.17).
# Il Fatto Quotidiano (dal 2019) è escluso dalla serie: i totali pubblicati lo comprendono, qui si somma solo alle 5 testate.
TESTATE = ["Avvenire", "Il Giornale", "La Stampa", "la Repubblica", "Corriere della Sera"]
PRIME_PAGINE = {
    #       Avv  Gio  Sta  Rep  Cor    Fatto (solo per il controllo dei totali)
    "2015": (300, 271, 268, 271, 226, None),
    "2016": (349, 269, 306, 245, 220, None),
    "2017": (265, 253, 190, 157, 141, None),
    "2018": (251, 190, 137, 133, 123, None),
    "2019": (340, 226, 166, 196, 163, 166),
    "2020": (291, 116, 129, 117, 91, 90),
    "2021": (203, 112, 123, 95, 62, 65),
    "2022": (183, 57, 135, 82, 60, 45),
    "2023": (299, 291, 344, 223, 197, 182),
    "2024": (254, 116, 193, 117, 111, 106),
    "2025": (255, 188, 182, 117, 128, 115),
}
# Totali delle sei testate pubblicati dal rapporto 2025 (Grafico 3, PDF p.18): servono solo a controllare le somme.
TOTALE_PUBBLICATO = dict(zip(ANNI, [1336, 1389, 1006, 834, 1257, 834, 660, 563, 1536, 897, 985]))

# Notizie nei telegiornali di prima serata (TG1, TG2, TG3, TG4, TG5, Studio Aperto, TgLa7).
# Un'unica serie: rapporto 2025, Grafico 37 (PDF p.74, stampata p.70). 2015-2024 sono totali dell'anno (l'1.803 del 2022 è
# «l'intero 2022» nel rapporto 2023, PDF p.29; gli altri anni sono più alti dei dati gennaio-ottobre dei rispettivi rapporti).
# 2025 (asterisco nel grafico) coincide con le 2.239 notizie di gennaio-ottobre 2025 (rapporto 2025, p.57): dato parziale.
TG = dict(zip(ANNI, [3997, 3302, 4268, 4513, 4487, 2116, 1881, 1803, 3425, 2256, 2239]))

LEGGI = [
    {"anno": "2015", "atto": "D.Lgs. 18 agosto 2015, n. 142", "data": "2015-08-18", "gu": "2015-09-15", "nome_comune": None,
     "titolo": "Attuazione della direttiva 2013/33/UE recante norme relative all'accoglienza dei richiedenti protezione internazionale, nonché della direttiva 2013/32/UE, recante procedure comuni ai fini del riconoscimento e della revoca dello status di protezione internazionale.",
     "urn": "urn:nir:stato:decreto.legislativo:2015-08-18;142",
     "cosa_cambia": "Definisce il sistema di accoglienza in due fasi: prima accoglienza (centri governativi, art. 9; strutture temporanee disposte dal prefetto, art. 11) e seconda accoglienza (art. 14, sistema degli enti locali). I minori non accompagnati sono accolti in strutture di prima accoglienza per non più di sessanta giorni (art. 19)."},
    {"anno": "2018", "atto": "D.L. 4 ottobre 2018, n. 113, convertito dalla L. 1 dicembre 2018, n. 132", "data": "2018-10-04", "gu": "2018-10-04",
     "data_conversione": "2018-12-01", "nome_comune": "decreto sicurezza (detto anche decreto Salvini)",
     "titolo": "Disposizioni urgenti in materia di protezione internazionale e immigrazione, sicurezza pubblica, nonché misure per la funzionalità del Ministero dell'interno e l'organizzazione e il funzionamento dell'Agenzia nazionale per l'amministrazione e la destinazione dei beni sequestrati e confiscati alla criminalità organizzata.",
     "urn": "urn:nir:stato:decreto.legge:2018-10-04;113", "urn_conversione": "urn:nir:stato:legge:2018-12-01;132",
     "cosa_cambia": "Il sistema di accoglienza degli enti locali (art. 1-sexies D.L. 416/1989) riguarda ora i titolari di protezione internazionale e i minori stranieri non accompagnati, non più i richiedenti asilo (art. 12). In conversione: monitoraggio dei flussi per la progressiva chiusura delle strutture temporanee (art. 12-bis) e obblighi di trasparenza per le cooperative sociali (art. 12-ter)."},
    {"anno": "2020", "atto": "D.L. 21 ottobre 2020, n. 130, convertito dalla L. 18 dicembre 2020, n. 173", "data": "2020-10-21", "gu": "2020-10-21",
     "data_conversione": "2020-12-18", "nome_comune": "decreto Lamorgese (uso giornalistico)",
     "titolo": "Disposizioni urgenti in materia di immigrazione, protezione internazionale e complementare, modifiche agli articoli 131-bis, 391-bis, 391-ter e 588 del codice penale, nonché misure in materia di divieto di accesso agli esercizi pubblici ed ai locali di pubblico trattenimento, di contrasto all'utilizzo distorto del web e di disciplina del Garante nazionale dei diritti delle persone private della libertà personale.",
     "urn": "urn:nir:stato:decreto.legge:2020-10-21;130", "urn_conversione": "urn:nir:stato:legge:2020-12-18;173",
     "cosa_cambia": "I richiedenti protezione internazionale sono di nuovo accolti, nei limiti dei posti, nel «Sistema di accoglienza e integrazione», con servizi di primo livello e di secondo livello (integrazione, orientamento al lavoro, formazione) (art. 4). Percorsi di integrazione alla scadenza dell'accoglienza (art. 5)."},
    {"anno": "2023", "atto": "D.L. 10 marzo 2023, n. 20, convertito dalla L. 5 maggio 2023, n. 50", "data": "2023-03-10", "gu": "2023-03-10",
     "data_conversione": "2023-05-05", "nome_comune": "decreto Cutro",
     "titolo": "Disposizioni urgenti in materia di flussi di ingresso legale dei lavoratori stranieri e di prevenzione e contrasto all'immigrazione irregolare.",
     "urn": "urn:nir:stato:decreto.legge:2023-03-10;20", "urn_conversione": "urn:nir:stato:legge:2023-05-05;50",
     "cosa_cambia": "Aggiunti in conversione: i richiedenti protezione internazionale escono dal sistema dell'art. 1-sexies D.L. 416/1989, salvo chi è arrivato con corridoi umanitari, evacuazioni o reinsediamenti (art. 5-ter); potenziamento tecnico-logistico dei punti di crisi e dei centri di prima accoglienza, con deroghe fino al 31 dicembre 2025 (art. 5-bis); riduzione o revoca delle condizioni di accoglienza (art. 5-quater)."},
]
ORIGINE = [
    {"anno": "1998", "atto": "L. 6 marzo 1998, n. 40", "data": "1998-03-06", "gu": "1998-03-12", "nome_comune": "Turco-Napolitano",
     "titolo": "Disciplina dell'immigrazione e norme sulla condizione dello straniero.", "urn": "urn:nir:stato:legge:1998-03-06;40",
     "nota": "Confluita nel D.Lgs. 25 luglio 1998, n. 286 (testo unico), di cui è l'origine: art. 12, 18 e 38 della legge corrispondono agli art. 14, 20 e 40 del testo unico.",
     "cosa_cambia": "Prevede centri di accoglienza predisposti dalle Regioni per stranieri regolarmente soggiornanti (art. 38), misure straordinarie di accoglienza per eventi eccezionali (art. 18) e il trattenimento nei centri di permanenza temporanea (art. 12). Non parla dell'accoglienza dei richiedenti asilo."},
    {"anno": "2002", "atto": "L. 30 luglio 2002, n. 189", "data": "2002-07-30", "gu": "2002-08-26", "nome_comune": "Bossi-Fini",
     "titolo": "Modifica alla normativa in materia di immigrazione e di asilo.", "urn": "urn:nir:stato:legge:2002-07-30;189",
     "cosa_cambia": "Inserisce nel D.L. 416/1989 il «Sistema di protezione per richiedenti asilo e rifugiati»: gli enti locali che accolgono richiedenti asilo e rifugiati accedono al Fondo nazionale per le politiche e i servizi dell'asilo (art. 32, nuovi art. 1-sexies e 1-septies)."},
]


NORMATTIVA = "https://www.normattiva.it/uri-res/N2Ls?"
for _l in LEGGI + ORIGINE:
    _l["url"] = NORMATTIVA + _l["urn"]
    if "urn_conversione" in _l:
        _l["url_conversione"] = NORMATTIVA + _l["urn_conversione"]


def carica(nome):
    return json.loads((DATI / nome).read_text())


def main():
    lite, centri = carica("province-lite.json"), carica("centri.json")

    pp, controllo = {}, {}
    for a in ANNI:
        *v, fatto = PRIME_PAGINE[a]
        tot5 = sum(v)
        r = RAPPORTI[a]
        pp[a] = {"totale_5_testate": tot5, "per_testata": dict(zip(TESTATE, v))}
        if fatto is not None:
            pp[a]["fatto_quotidiano_escluso"] = fatto
        sei = tot5 + (fatto or 0)
        if sei != TOTALE_PUBBLICATO[a]:
            controllo[a] = {"somma_testate": sei, "totale_pubblicato": TOTALE_PUBBLICATO[a]}

    serie = {s["anno"]: s for s in lite["serie_anni"]}
    contratti = {a: serie[a]["affidamenti_40k"] for a in ANNI}
    presenze = {a: centri["nazionale"]["presenze"][a] for a in centri["anni"]}
    costo = {a: {k: centri["nazionale"]["costo_per_tipo"][a]["cas_adulti"][k] for k in ("mediana", "q1", "q3", "centri_con_costo")} for a in centri["anni"]}

    out = {
        "generato": date.today().isoformat(),
        "anni": ANNI,
        "rapporti": {a: {"numero": r[0], "titolo": r[1], "url": BASE + r[2]} for a, r in RAPPORTI.items()},
        "prime_pagine": {
            "periodo": "1 gennaio - 31 ottobre di ogni anno",
            "testate": TESTATE,
            "escluso": "il Fatto Quotidiano (nel campione dal 2019) e l'Unità (fino al 2017); 2013 e 2014 non entrano nella serie",
            "per_anno": pp,
            "controllo_totali_con_il_fatto": controllo,
            "fonti": {"2015-2023": "rapporto 2023, grafico per testata e anno (PDF p.9)", "2024": "rapporto 2024, Grafico 1 (PDF p.15)", "2025": "rapporto 2025, Grafico 1 (PDF p.17)"},
        },
        "telegiornali": {
            "reti": ["TG1", "TG2", "TG3", "TG4", "TG5", "Studio Aperto", "TgLa7"],
            "fonte": "rapporto 2025, Grafico 37 (PDF p.74, stampata p.70): unica serie 2015-2025",
            "periodo": {a: ("anno intero" if a != "2025" else "gennaio-ottobre, dato parziale") for a in ANNI},
            "notizie": TG,
        },
        "leggi": LEGGI,
        "origine": ORIGINE,
        "contratti_40k": {
            "fonte": "ANAC, estratti di questo sito (province-lite.json, serie_anni)",
            "nota": "contratti da 40.000 € in su: dal 2024 entrano in archivio contratti di importo minore e il confronto tra anni è corretto solo su questa soglia",
            "affidamenti_40k": contratti,
            "aggiornato": lite["aggiornato"],
        },
        "centri": {
            "fonte": "Centri d'Italia (centri.json)",
            "anni": centri["anni"],
            "presenze": presenze,
            "rilevazioni_cas": centri["rilevazioni_cas"],
            "rilevazioni_sai": centri["rilevazioni_sai"],
            "costo_cas_adulti": costo,
        },
    }
    (DATI / "cronologia.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print("Scritto sito/data/cronologia.json")
    for a, c in controllo.items():
        print("Controllo totali:", a, c)


if __name__ == "__main__":
    main()
