# Osservatorio Accoglienza

**osservatorioaccoglienza.org**

Archivio dei contratti pubblici per i servizi di accoglienza a migranti e richiedenti
asilo in Italia, ricostruito dai dati aperti dell'Autorità Nazionale Anticorruzione.

Provincia per provincia: quanti affidamenti, con quale procedura, di quale importo,
verso quali enti gestori. Anni 2023, 2024, 2025.

## Perché

I dati esistono ma sono dispersi su tre dataset diversi, senza una categoria che
identifichi l'accoglienza. Ricostruire il quadro di una singola provincia richiede
oggi settimane di lavoro manuale. Questo archivio lo rende una pagina.

## Risultati principali

- Su 5.728 affidamenti registrati nel triennio, la maggioranza è disposta senza gara.
- La quota di affidamenti diretti passa dal 52% al 71% tra il primo e il secondo
  semestre 2023, e da allora resta stabile. Lo stacco coincide con il 1° luglio 2023,
  data di efficacia del d.lgs. 36/2023. Il meccanismo che lo produce non è
  ricostruibile da questi dati.
- Numero e valore non coincidono: gli affidamenti senza gara sono la maggioranza per
  numero ma una minoranza per importo. Sotto la soglia dei 140.000 euro quasi tutto è
  diretto, sopra quasi nulla.

## Fonti

Dataset aperti ANAC — Banca Dati Nazionale dei Contratti Pubblici:
CIG (per anno), aggiudicazioni, aggiudicatari. Uniti tramite il codice CIG.

## Come funziona

    script/estrai2.py      filtra le gare di accoglienza da un file CIG mensile
    script/costruisci.py   unisce aggiudicazioni e aggiudicatari, aggrega, produce il JSON
    sito/                  applicazione Next.js che legge sito-dati/province.json

I dati grezzi non sono versionati: si scaricano da
`dati.anticorruzione.it/opendata/download/dataset/cig-ANNO/filesystem/cig_csv_ANNO_MM.zip`

## Limiti noti

Il perimetro è ricostruito per codice CPV e ricerca testuale: produce sia falsi
positivi sia esclusioni, e viene corretto nel tempo. L'archivio conta gli affidamenti
pubblicati in un anno, non l'accoglienza attiva: i contratti pluriennali compaiono solo
nell'anno di stipula. Gli importi non vanno sommati, perché gli accordi quadro
riportano un tetto di spesa pluriennale. L'aggiudicatario non è comunicato per una
quota degli affidamenti. Le comunicazioni ad ANAC possono arrivare con mesi o anni di
ritardo, quindi gli anni recenti sono destinati a crescere.

La pagina `/metodologia` del sito riporta questi limiti per esteso.

## Licenza

Codice: MIT. Dati derivati: CC BY 4.0, coerentemente con la fonte.
