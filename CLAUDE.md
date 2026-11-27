# Osservatorio Accoglienza

Sito statico (osservatorioaccoglienza.org) che ricostruisce dai dati aperti ANAC i contratti pubblici per l'accoglienza dei migranti, provincia per provincia e ente per ente, dal 2015.
Affianca i dati sui centri (Centri d'Italia, CC BY 4.0) e sui minori non accompagnati (Ministero del Lavoro). Next.js 16 su Vercel; testi, commit e nomi in italiano.

## Struttura
- `script/estrai2.py`: filtra un file CIG mensile ANAC (CPV, FORTI/DEBOLI/VETO, esclusione della sola formazione); scrive `accoglienza_ANNO_MM.csv`.
- `script/costruisci.py`: unisce estratti, aggiudicazioni e aggiudicatari; produce tutti i JSON e i CSV del sito.
- `script/centri.py`: aggrega Centri d'Italia (CAS, prima accoglienza, SAI) per provincia e anno.
- `script/cronologia.py`: scrive `sito/data/cronologia.json` per `/dieci-anni`: legge `province-lite.json` e `centri.json` e contiene ancora, con rapporto e pagina, le cifre sulle notizie di Carta di Roma / Osservatorio di Pavia (i PDF stanno in `dati-media/`, non versionata): sono nel repo ma non usate da nessuna pagina.
- `script/coordinate.mjs`: coordinate (centroidi dai contorni di world-atlas), contorno e continente di ogni paese di `paesi.json`, per il globo di `/paesi`; lo chiama `script/paesi.py` (servono node e le dipendenze di `sito/`).
- `script/mappa.py`: tracciati delle province (confini ISTAT generalizzati, `dati-istat/confini/`) → `sito/data/mappa.json` (home e `/quanto-costa`) e `sito/data/mappa-regioni.json` (regioni, con Trento e Bolzano separate; `/minori`).
- `script/estrai_msna.py`: estrae i minori non accompagnati dai PDF del Ministero in `sito/data/msna.json` (serve `pdfplumber`). Si ferma, e la build di `lib/dati.ts` fallisce, se un valore di `sito/data/msna-attesi.json` non coincide o se le regioni non sommano al totale di un mese. Nei report fino al 2021 la seconda tabella per regione è quella delle sole minori: si usa la prima, con il totale più alto.
- `script/estrai_ingressi.py`: ingressi di minori per anno (2023–2025, solo anno solare) e quota via mare per cittadinanza dai rapporti semestrali di dicembre (`dati-msna-sem/`, serve `pdfplumber`) → `sito/data/msna-ingressi.json`, con testo e pagina di ogni cifra; la build ripete i controlli (`sito/lib/msnaIngressi.ts`).
- `script/esclusi.csv`: CIG esclusi a mano (cig, motivo). `unisci.py`, `consolida.py`, `aggiudicatari.py`: analisi su un solo anno, fuori dalla pipeline.
- `output/`: versionati solo gli estratti mensili `accoglienza_ANNO_MM.csv`; i `*_completo.csv` sono ignorati.
- `dati-grezzi/`, `dati-centri/`, `dati-msna*/`, `dati-istat/`: non versionate (ANAC, Centri d'Italia, PDF del Ministero).
- `.github/workflows/aggiorna.yml`: il 25 di ogni mese apre una issue con i comandi di aggiornamento.
- `sito/app/`: pagine `/`, `/che-cose`, `/minori`, `/metodologia`, `/quanto-costa`, `/dieci-anni`, `/provincia/[slug]` (con `feed.xml`), `/ente/[slug]`, `/feed.xml`, `/ricerca.json`, `sitemap.ts`, `robots.ts`; nel primo caricamento della home ci sono, oltre alla tabella, solo `Ricerca.tsx` e `Figura3DLoader.tsx`. Le figure in rilievo (home, `/quanto-costa`, `/dieci-anni`, `/minori`) passano da `Figura3D.tsx`: SVG statico al build (`Figura3DStatico.tsx`) e canvas in un pacchetto separato (`Figura3DTela.tsx`).
- `sito/lib/`: `dati.ts` (tipi, `slug`, `nomeProvincia`, `nItal`, `euro`), `enti.ts`, `centri.ts`, `regioni.ts` (provincia→regione), `scena3d.ts`, `mappa3d.ts`, `anni3d.ts` e `motori.ts` (motori delle figure in rilievo, comuni all'SVG del build e al canvas; non importano dati), `figure.ts` e `italiaDati.ts` (dati e testi delle figure, scaricati dal browser da `/figure/[nome]`), `nomi.ts` (`nomeEnte`), `jsonld.ts`, `metadati.ts`, `feed.ts`.
- `sito/data/`: `province-lite.json` (totali e anni per provincia, caricato dalla home), `provincia/<slug>.json`, `ente/<slug>.json` + `enti.json`, `centri.json`, `msna.json`. `sito/public/dati/`: CSV scaricabili (uno per provincia, `contratti.csv`).

## Rigenerare i dati (dalla radice del repo)
- `python3 script/costruisci.py`: legge `output/accoglienza_*_MM.csv` e gli zip in `dati-grezzi/` (aggiornamenti mensili più recenti del file completo); scrive `sito/data/province-lite.json`, `provincia/`, `ente/`, `enti.json` e `sito/public/dati/`. Salta i CIG di `script/esclusi.csv` e i CIG ripetuti (vale la prima riga); il campo `aggiornato` è la data degli archivi letti.
- `python3 script/centri.py`: legge i CSV in `dati-centri/`, scrive `sito/data/centri.json`; si ferma se le presenze 2024 di CAS e prima accoglienza non coincidono con quelle pubblicate.
- `python3 script/estrai_msna.py`: `dati-msna/*.pdf` → `sito/data/msna.json`.
- Dopo la rigenerazione committare i dati in un commit separato dal codice.

## Decisioni di metodo da non toccare
- Procedura: `modalita()` in `costruisci.py` classifica ogni contratto in diretto, negoziata, gara (più un residuo "altro"); il termine pubblico è «affidamento diretto», non «senza gara»: `quota_diretti` conta le righe con "AFFIDAMENTO DIRETTO" in `tipo_scelta_contraente` (non la negoziata). L'etichetta «affidamento diretto» dell'elenco (`modalita` = diretto) coincide con la quota; cottimo fiduciario e affidamento riservato hanno `modalita` «cottimo» e «riservato»; la build controlla l'uguaglianza per ogni provincia e ente. Nei testi «contratti» (mai «affidamenti»), «importo mediano» (mai «valore tipico»), «enti che hanno ricevuto contratti» (mai «enti diversi»).
- Dal 2024 entrano in archivio contratti di piccolo importo: gli anni non sono confrontabili tra loro. Il confronto corretto è tutti i contratti contro quelli da 40.000 € in su; esiti attendibili solo dal 2024 (`ANNI_ESITO`).
- I corsi di formazione professionale non contano come accoglienza (`solo_formazione` in `estrai2.py`), salvo se uniti a ospitalità.
- Falsi positivi esclusi a mano in `script/esclusi.csv`, con il motivo; per i mesi futuri si aggiunge anche un VETO in `estrai2.py`. Gli estratti in `output/` non si modificano.
- Enti per codice fiscale: 11 cifre = impresa o ente (hanno una pagina `/ente/`), 16 caratteri = persona fisica (esclusa), altri formati o assenti = contati per nome. Il nome è il più frequente per quel codice.
- Performance: la home carica solo `province-lite.json` (la figura 3D scarica `/figure/home` dopo il primo rendering); il dettaglio di provincia, ente e centri si carica a build time nelle rispettive pagine, mai nella home. `Ricerca.tsx` non importa `lib/dati` e scarica `/ricerca.json` al primo focus.
- I `Link` negli elenchi lunghi (tabelle e liste di province, enti e paesi) hanno `prefetch={false}`, per contenere il Fast Origin Transfer di Vercel; il menu e i link singoli nel testo restano con il precaricamento.
- Centri d'Italia: SAI dal file dei progetti; CAS e prima accoglienza sommando tutte le righe, righe ripetute comprese, come la fonte.

## Registro del copy
- Preciso, piano, senza interpretazioni (niente "solo", "elevato", "preoccupante"). Modello di voce: la pagina `/che-cose`.
- Cifre solo dai dati, mai scritte a mano: si leggono da JSON o da `nItal`/`euro` (separatore delle migliaia sempre attivo).
- Unica eccezione: il pocket money di 2,50 € al giorno in `/quanto-costa` non viene dai dati ma da una decisione di contrarre della Prefettura di Chieti (prot. 41889 del 10/05/2024, che applica il capitolato del D.M. 4 marzo 2024); l'obbligo di versarlo in denaro da una determinazione a contrarre della Prefettura di Avellino (prot. 36387 del 22/04/2024). Sta in `sito/lib/capitolato.ts` ed è dichiarata in `/metodologia` e nella pagina; nessun'altra cifra esterna senza dichiararla così.
- Dove un dato manca, si dice ("n.d.", "nessun centro nei dati"), non si mette 0.

## SEO
- Title e description di ogni pagina passano da `metadatiPagina()` in `sito/lib/metadati.ts` (con og e twitter, `/og.png`); un `openGraph` di pagina sostituisce quello del layout, quindi va sempre ripetuto per intero. Un `alternates` di pagina sostituisce il canonical del layout: va ripetuto `canonical: "./"`.
- Description entro 155 caratteri; quelle di provincia e di ente sono generate dai dati.
- JSON-LD con `app/JsonLd.tsx` e `lib/jsonld.ts` (creatore, licenza CC BY-SA 4.0, `fonteAnac`, `fonteCentri`, `breadcrumb`, `distribuzioneCsv`). Nessun `WebSite`/`SearchAction`.
- `app/sitemap.ts`: `lastmod` dal campo `aggiornato`; gli enti con almeno 2 contratti.

## Regole di lavoro
- Prima leggere il codice e i dati, poi proporre; ambiguità o dati mancanti si segnalano, non si inventano.
- Un commit per modifica; messaggi in italiano.
- `cd sito && npm run build` senza errori prima di dichiarare finito.
- Mai `git push`, salvo richiesta esplicita: di norma lo fa l'autore.
