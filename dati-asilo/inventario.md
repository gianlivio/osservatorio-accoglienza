# Paesi di provenienza: inventario delle fonti (Eurostat, EUAA)

Raccolta e verifica, nessuna modifica al sito. Generato il 25/11/2026. Nessuna stima, nessuna lettura del contenuto dei rapporti. File grezzi in questa cartella: `migr_asyappctza.json`, `migr_asydcfsta.json`, `migr_asyunaa.json` (API di diffusione Eurostat, `geo=IT`, JSON-stat, tutte le dimensioni).

## 1. Elenco dei paesi (24)

Unione di due serie. **Minori** = prime 10 cittadinanze dei minori presenti per anno, da `sito/data/msna-cittadinanza.json` (2016–2025, fonte Ministero del Lavoro). **Sbarchi** = prime 10 nazionalità degli sbarcati per anno, da `dati-msna-cittadinanza/inventario.md` tab. B1 (Ministero dell'Interno, 2017–2026; il 2026 è l'anno in corso, cruscotto del 23/11/2026; nessuna tabella per il 2016). Le prime 10 sono prese nell'ordine delle fonti; nel 2025 e nel 2026 i cruscotti hanno 15 righe, qui se ne usano 10. Un paese «solo sbarchi» non compare mai tra le prime 10 dei minori presenti, e viceversa.

| Paese | Codice Eurostat | Minori presenti (anni) | Sbarchi (anni) |
|---|---|---|---|
| Afghanistan | AF | 2020, 2021, 2022 | 2020, 2022 |
| Albania | AL | 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 | — |
| Algeria | DZ | — | 2018, 2019, 2020, 2025, 2026 |
| Bangladesh | BD | 2016, 2017, 2019, 2020, 2021, 2022, 2024, 2025 | 2017, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 |
| Burkina Faso | BF | 2023 | 2023 |
| Costa d'Avorio | CI | 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 | 2017, 2018, 2019, 2020, 2021, 2022, 2023 |
| Egitto | EG | 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 | 2020, 2021, 2022, 2023, 2024, 2025, 2026 |
| Eritrea | ER | 2016, 2017, 2018, 2021 | 2017, 2018, 2021, 2022, 2024, 2025, 2026 |
| Etiopia | ET | — | 2025, 2026 |
| Gambia | GM | 2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025 | 2024 |
| Guinea | GN | 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 | 2017, 2018, 2019, 2021, 2022, 2023, 2024 |
| Iran | IR | — | 2019, 2020, 2021, 2022, 2025 |
| Iraq | IQ | — | 2018, 2019, 2021 |
| Kosovo | XK | 2019, 2020 | — |
| Mali | ML | 2016, 2017, 2018, 2023, 2024 | 2017, 2018, 2023, 2024, 2026 |
| Marocco | MA | — | 2017, 2020, 2021 |
| Nigeria | NG | 2016, 2017, 2018 | 2017, 2018 |
| Pakistan | PK | 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 | 2018, 2019, 2020, 2022, 2023, 2024, 2025, 2026 |
| Senegal | SN | 2016, 2017, 2018, 2019 | 2017 |
| Siria | SY | — | 2021, 2022, 2023, 2024 |
| Somalia | SO | 2020, 2021, 2025 | 2019, 2025, 2026 |
| Sudan | SD | — | 2017, 2018, 2019, 2020, 2023, 2024, 2025, 2026 |
| Tunisia | TN | 2019, 2020, 2021, 2022, 2023, 2024, 2025 | 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 |
| Ucraina | UA | 2022, 2023, 2024, 2025 | — |

Note: nei minori presenti 2023–2025 le fonti (semestrali) riportano 7–10 cittadinanze citate nel testo, non tabelle complete; per il 2023 il JSON ne ha 12, per il 2024 12, per il 2025 10. Kosovo è «Kosovo*» in Eurostat. Costa d'Avorio è «Côte d'Ivoire».

## 2. Eurostat (solo Italia, `geo=IT`, dati annuali)

Metodo: API di diffusione `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/<codice>?format=JSON&lang=EN&geo=IT`, un solo download per dataset, nessun blocco incontrato. Il JSON-stat non riporta simboli: i valori assenti (':') non compaiono tra i valori e non ci sono flag di stato (`status` vuoto).

| Dataset | Titolo | Anni coperti | Aggiornamento dati | Dimensioni | Valori |
|---|---|---|---|---|---|
| `migr_asyappctza` | Richiedenti asilo per tipo, cittadinanza, età e sesso | 2008–2025 | 2026-09-03 | applicant (TOTAL, FRST, SSEQ), sex, age (8 classi), 206 cittadinanze | 259.764 |
| `migr_asydcfsta` | Decisioni di prima istanza per tipo di decisione, cittadinanza, età e sesso | 2008–2025 | 2026-10-28 | decision (TOTAL, POS, POS_RFG, POS_HUM, POS_SPROT, NEG), sex, age (8 classi), 206 cittadinanze | 711.936 |
| `migr_asyunaa` | Richiedenti asilo minori non accompagnati per cittadinanza, età e sesso | 2008–2025 | 2026-10-27 | sex, age (TOTAL, Y_LT14, Y14-15, Y16-17, UNK), 206 cittadinanze | 74.080 |

Metadati Eurostat: `https://ec.europa.eu/eurostat/cache/metadata/en/migr_asyapp_esms.htm` (richiedenti e minori non accompagnati), `…/migr_asydec_esms.htm` (decisioni). DOI: 10.2908/MIGR_ASYAPPCTZA, 10.2908/MIGR_ASYDCFSTA, 10.2908/MIGR_ASYUNAA.

**Presenza dei 24 paesi (sesso totale, età totale):** tutti e 24 sono presenti con un valore per ciascuno degli 11 anni 2015–2025, in tutti e tre i dataset (nessun valore mancante o riservato in quel perimetro; per `migr_asyappctza` tipo richiedente TOTAL, per `migr_asydcfsta` tipo di decisione TOTAL). Non ho verificato i valori mancanti per le altre combinazioni di sesso/età né per gli anni 2008–2014.

**Arrotondamento:** nelle decisioni (`migr_asydcfsta`) i 199 totali per cittadinanza con valore nel 2025 sono tutti multipli di 5. Eurostat non lo indica nel file scaricato; le differenze di cui sotto sono compatibili con questo. Non ho letto la nota metodologica per confermare la regola di arrotondamento.

**Controllo, decisioni 2025 (cittadinanza = TOTALE):** totale decisioni 104.560; positive (POS) 31.365 + negative (NEG) 73.200 = 104.565. **Non torna: differenza di 5.** Le positive tornano: 5.965 (status di rifugiato) + 13.945 (motivi umanitari) + 11.455 (protezione sussidiaria) = 31.365. Per cittadinanza, nel 2025 il totale differisce da POS+NEG in 19 casi su 199 (massimo 5; es. Pakistan 10.555 contro 3.430 + 7.120 = 10.550) e POS differisce dalla somma dei tre tipi in 26 casi (es. Pakistan 3.430 contro 385 + 1.965 + 1.085 = 3.435). Negli anni 2015–2025 il totale coincide con POS+NEG in 8 anni su 11 (differenza di 5 nel 2022, 2024, 2025). La somma delle cittadinanze con codice a due lettere nel 2025 (104.265) è inferiore al totale (104.560) di 295; le voci aggregate (es. sconosciuta 215, apolidi 65) non sono nella somma.

**Condizioni di riuso** (pagina «Copyright notice and free re-use of data», `https://ec.europa.eu/eurostat/web/main/help/copyright-notice`): «The copyright for the editorial content of this website, which is owned by the EU, is licensed under the Creative Commons Attribution 4.0 International licence. This means that you can re-use the content provided you acknowledge the source and indicate any changes you have made.» Inoltre: «Reuse of statistical data, metadata, publications, and other dissemination tools published on this website for commercial or non-commercial purposes is authorised provided the source is acknowledged. The reuse policy of the European Commission is implemented by the Decision of 12 December 2011.» E: «When reuse involves translations of publications or modifications to the data or text, this must be stated clearly to the end user of the information. A disclaimer regarding the non-responsibility of Eurostat shall be included.» L'uso non commerciale senza restrizioni vale per i dati di fonti diverse da Eurostat e per i dati di paesi non UE/EFTA/candidati: non riguarda i dati sull'Italia.

## 3. EUAA: rapporti COI dal 2023 in poi

Metodo: il portale COI (`coi.euaa.europa.eu`) ha la ricerca in un modulo ASP.NET con invio POST e non l'ho usato. Ho letto invece l'elenco delle pubblicazioni di `www.euaa.europa.eu/publications` filtrato sulla categoria «Country of Origin Information» (25 pagine, 247 pubblicazioni dal 06/02/2022 al 16/11/2026, date di pubblicazione del sito) e, per ogni paese, la ricerca per titolo su tutte le categorie. Le Country Guidance sono una categoria a parte e non sono contate. Un «rapporto» è una pubblicazione il cui titolo inizia con «COI Report» (qui compresi «Country Focus» e «Security Situation»); le «COI Query» (risposte a singole domande) sono contate a parte. Non conta il contenuto.

| Paese | Rapporti COI dal 2023 (data, titolo) | COI Query dal 2023 |
|---|---|---|
| Afghanistan | 2026-01-22 — [COI Report - Afghanistan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-afghanistan-country-focus-2)<br>2024-11-11 — [COI Report - Afghanistan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-afghanistan-country-focus-1)<br>2023-12-05 — [COI Report – Afghanistan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-afghanistan-country-focus-0) | 3 |
| Albania | **nessuno trovato** | 0 |
| Algeria | **nessuno trovato** | 0 |
| Bangladesh | 2025-08-05 — [COI Report - Bangladesh: Country Focus](https://www.euaa.europa.eu/publications/coi-report-bangladesh-country-focus-0)<br>2024-07-11 — [COI Report – Bangladesh: Country Focus](https://www.euaa.europa.eu/publications/coi-report-bangladesh-country-focus) | 4 |
| Burkina Faso | **nessuno trovato** | 0 |
| Costa d'Avorio | **nessuno trovato** | 0 |
| Egitto | **nessuno trovato** | 0 |
| Eritrea | **nessuno trovato** | 0 |
| Etiopia | **nessuno trovato** | 0 |
| Gambia | **nessuno trovato** | 0 |
| Guinea | **nessuno trovato** | 3 |
| Iran | 2024-06-27 — [COI Report – Iran: Country Focus](https://www.euaa.europa.eu/publications/coi-report-iran-country-focus)<br>2023-01-11 — [COI Report - Iran: Situation of Afghan refugees](https://www.euaa.europa.eu/publications/coi-report-iran-situation-afghan-refugees) | 15 |
| Iraq | 2026-11-16 — [Iraq: Security Situation](https://www.euaa.europa.eu/publications/iraq-security-situation)<br>2026-11-16 — [Iraq: Country Focus](https://www.euaa.europa.eu/publications/iraq-country-focus)<br>2025-10-08 — [COI Report - Iraq: Country Focus](https://www.euaa.europa.eu/publications/coi-report-iraq-country-focus-0)<br>2024-05-28 — [COI Report: Iraq – Security Situation](https://www.euaa.europa.eu/publications/coi-report-iraq-security-situation)<br>2024-05-28 — [COI Report – Iraq: Country Focus](https://www.euaa.europa.eu/publications/coi-report-iraq-country-focus)<br>2023-04-14 — [COI Report – Iraq: Arab Tribes and Customary Law](https://www.euaa.europa.eu/publications/coi-report-iraq-arab-tribes-and-customary-law) | 7 |
| Kosovo | **nessuno trovato** | 0 |
| Mali | **nessuno trovato** | 0 |
| Marocco | **nessuno trovato** | 0 |
| Nigeria | 2025-11-03 — [COI Report - Nigeria: Security Situation](https://www.euaa.europa.eu/publications/coi-report-nigeria-security-situation-0)<br>2025-11-03 — [COI Report - Nigeria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-nigeria-country-focus-1)<br>2024-07-12 — [COI Report – Nigeria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-nigeria-country-focus) | 18 |
| Pakistan | 2026-05-20 — [COI Report - Pakistan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-pakistan-country-focus-1)<br>2024-12-17 — [COI Report – Pakistan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-pakistan-country-focus) | 10 |
| Senegal | **nessuno trovato** | 0 |
| Siria | 2026-07-13 — [COI Report -Syria: Security Situation](https://www.euaa.europa.eu/publications/coi-report-syria-security-situation-5)<br>2026-07-13 — [COI Report - Syria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-syria-country-focus-3)<br>2025-07-07 — [COI Report - Syria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-syria-country-focus-1)<br>2025-03-25 — [COI Report - Syria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-syria-country-focus)<br>2024-10-22 — [COI Report - Syria: Security Situation](https://www.euaa.europa.eu/publications/coi-report-syria-security-situation-4)<br>2023-10-09 — [COI Report – Syria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-syria-country-focus-0) | 5 |
| Somalia | 2026-05-29 — [COI Report - Somalia: Security Situation](https://www.euaa.europa.eu/publications/coi-report-somalia-security-situation-4)<br>2026-05-29 — [COI Report - Somalia: Displacement in Mogadishu](https://www.euaa.europa.eu/publications/coi-report-somalia-displacement-mogadishu)<br>2025-05-26 — [COI Report - Somalia: Country Focus](https://www.euaa.europa.eu/publications/coi-report-somalia-country-focus)<br>2025-05-26 — [COI Report -  Somalia: Security Situation](https://www.euaa.europa.eu/publications/coi-report-somalia-security-situation-3)<br>2023-02-23 — [COI Report – Somalia: Security Situation](https://www.euaa.europa.eu/publications/coi-report-somalia-security-situation)<br>2023-02-02 — [COI Report – Somalia: Defection, Desertion and Disengagement from Al-Shabaab](https://www.euaa.europa.eu/publications/coi-report-somalia-defection-desertion-and-disengagement-al-shabaab) | 3 |
| Sudan | 2026-10-20 — [COI Report - Sudan: Security Situation](https://www.euaa.europa.eu/publications/coi-report-sudan-security-situation-0)<br>2026-08-25 — [COI Report - Sudan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-sudan-country-focus-1)<br>2025-02-11 — [COI Report – Sudan: Security Situation](https://www.euaa.europa.eu/publications/coi-report-sudan-security-situation)<br>2025-02-11 — [COI Report - Sudan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-sudan-country-focus-0)<br>2024-04-26 — [COI Report – Sudan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-sudan-country-focus) | 2 |
| Tunisia | **nessuno trovato** | 0 |
| Ucraina | **nessuno trovato** | 1 |

Altri documenti EUAA che citano un paese ma non sono rapporti COI (categoria diversa, non contati): Egitto: «Migration Drivers Report: Egypt as a Country of Origin» (29/07/2022, quindi anteriore al 2023) e «Roadmap for Cooperation between the EUAA and EGYPT» (16/06/2025); Bangladesh: due «MedCOI Topical Report» del 30/05/2024 (Hepatitis, Psychiatry); Albania e Kosovo: roadmap di cooperazione e valutazioni esterne; Ucraina: indagini «Surveys of Arriving Migrants from Ukraine» e altri rapporti sul tema dell'accoglienza (2023–2026). Le Country Guidance 2023–2026 esistono per Afghanistan, Iran, Iraq, Nigeria, Pakistan, Siria, Somalia e Sudan: non sono incluse nella tabella.

**Verifica fatta e da ripetere:** l'elenco della categoria COI è paginato (10 per pagina). La ricerca per titolo, per ogni paese, restituisce solo la prima pagina (10 risultati): dove mostra 10 elementi dal 2023 (Iran, Iraq, Nigeria, Pakistan, Siria, Somalia, Ucraina) può essere troncata, ma la tabella sopra si basa sull'elenco completo della categoria COI, non su quella ricerca. Il titolo «Iraq: Security Situation» / «Iraq: Country Focus» del 16/11/2026 non ha il prefisso «COI Report» ma è nella categoria COI e l'ho contato come rapporto.

**Condizioni di riuso dei testi EUAA** (due pagine, con testi diversi):
- Sito EUAA, `https://www.euaa.europa.eu/legal-notice`: «Copyright notice: © European Union Agency for Asylum, 2022. Reproduction is authorised, provided the source is acknowledged, save otherwise stated.»
- Portale COI, `https://coi.euaa.europa.eu/legalnotice`: «© European Asylum Support Office, 2016-2019. Reproduction is authorised, provided the source is acknowledged, save otherwise stated. Reproduction as part of a commercial activity requires permission.» Aggiunge che l'EUAA non detiene il copyright del materiale di terzi elencato sul portale e che loghi e marchi EUAA sono vietati senza permesso scritto.
- Le due pagine non coincidono sull'uso commerciale. Non ho verificato se i singoli rapporti riportino un avviso di copyright proprio (la pagina del sito rinvia con «save otherwise stated»).

## 4. Tabella riassuntiva

| Paese | Presente in minori/sbarchi | Dati Eurostat (richiedenti, decisioni, minori non acc.) | Rapporto EUAA (COI Report dal 2023: più recente, numero) |
|---|---|---|---|
| Afghanistan | minori + sbarchi | sì, 2015–2025 | sì, 2026-01-22 (3) |
| Albania | minori | sì, 2015–2025 | no |
| Algeria | sbarchi | sì, 2015–2025 | no |
| Bangladesh | minori + sbarchi | sì, 2015–2025 | sì, 2025-08-05 (2) |
| Burkina Faso | minori + sbarchi | sì, 2015–2025 | no |
| Costa d'Avorio | minori + sbarchi | sì, 2015–2025 | no |
| Egitto | minori + sbarchi | sì, 2015–2025 | no |
| Eritrea | minori + sbarchi | sì, 2015–2025 | no |
| Etiopia | sbarchi | sì, 2015–2025 | no |
| Gambia | minori + sbarchi | sì, 2015–2025 | no |
| Guinea | minori + sbarchi | sì, 2015–2025 | no |
| Iran | sbarchi | sì, 2015–2025 | sì, 2024-06-27 (2) |
| Iraq | sbarchi | sì, 2015–2025 | sì, 2026-11-16 (6) |
| Kosovo | minori | sì, 2015–2025 | no |
| Mali | minori + sbarchi | sì, 2015–2025 | no |
| Marocco | sbarchi | sì, 2015–2025 | no |
| Nigeria | minori + sbarchi | sì, 2015–2025 | sì, 2025-11-03 (3) |
| Pakistan | minori + sbarchi | sì, 2015–2025 | sì, 2026-05-20 (2) |
| Senegal | minori + sbarchi | sì, 2015–2025 | no |
| Siria | sbarchi | sì, 2015–2025 | sì, 2026-07-13 (6) |
| Somalia | minori + sbarchi | sì, 2015–2025 | sì, 2026-05-29 (6) |
| Sudan | sbarchi | sì, 2015–2025 | sì, 2026-10-20 (5) |
| Tunisia | minori + sbarchi | sì, 2015–2025 | no |
| Ucraina | minori | sì, 2015–2025 | no |

## 5. Punti in cui mi sono fermato o che restano aperti

- Nessun sito ha bloccato i download. Il portale COI (`coi.euaa.europa.eu`) non è stato interrogato per la ricerca (modulo POST): usato l'elenco pubblico delle pubblicazioni sul sito principale.
- Eurostat: il totale delle decisioni 2025 non coincide con POS+NEG (differenza di 5), probabilmente per l'arrotondamento a multipli di 5 (non verificato sulla nota metodologica).
- Eurostat: anni 2008–2014 e combinazioni di sesso/età non controllati per valori mancanti.
- Una prima esecuzione del download delle ricerche EUAA è stata interrotta dal sistema e rifatta in blocchi più piccoli; non ci sono dati parziali nell'inventario.

---

# Seconda parte: UNHCR, UCDP, ecoi.net

Generato il 25/11/2026. Stessi 24 paesi della tabella 1. Nessuna conclusione sul contenuto. File grezzi in `dati-asilo/` (non versionati): `unhcr_asylum-applications.json`, `unhcr_asylum-decisions.json`, `confronto_eurostat_unhcr.csv` (tutte le cifre per paese, anno e misura), `ucdp/` (zip e CSV), `ucdp/ucdp_aggregato.json`, `ecoi_check.tsv`.

## 6. UNHCR (Refugee Data Finder) e confronto con Eurostat

**Metodo.** API pubblica `https://api.unhcr.org/population/v1/asylum-applications/` e `…/asylum-decisions/` con `coa=ITA&coo_all=true`: un download ciascuno, risposta 200. Il filtro sugli anni è stato ignorato (l'API ha restituito dal 2000 al 2026); ho usato 2015–2025. L'anno 2026 (parziale) non è confrontato. Procedura e livello di decisione nei dati scaricati: `procedure_type` = G, `dec_level` = FI (prima istanza) per tutte le righe.

**Pagine UNHCR bloccate.** Le pagine «copyright» e «metodologia» del sito (`https://www.unhcr.org/refugee-statistics/copyright/` e `…/methodology/`) rispondono 403 con la verifica Cloudflare: non le ho potute leggere e non ho riprovato. **Le condizioni di riuso UNHCR non sono verificate.** La documentazione dell'API (`https://api.unhcr.org/docs/refugee-statistics.html`, 200) non contiene condizioni d'uso dei dati: l'unica licenza che nomina (Apache 2.0, `http://apache.org/licenses/LICENSE-2.0.html`) riguarda il generatore di documentazione, non i dati. Da leggere a mano prima di ripubblicare.

**Definizioni.**
- *Eurostat* (metadati `migr_asyapp_esms.htm`, `migr_asydec_esms.htm`): l'unità è la persona; i dati sono arrotondati a multipli di 5; `migr_asydcfsta` riguarda le decisioni di prima istanza; le domande sono «first time and subsequent applicants»; tra le decisioni positive rientrano status di rifugiato, protezione sussidiaria e «autorizzazione a restare per motivi umanitari» (qui POS_HUM); i tipi di decisione sono positivi e negativi, senza una voce «chiuse».
- *UNHCR* (documentazione dell'API): `asylum-applications` = «Asylum claims submitted by year and countries of asylum and origin»; `asylum-decisions` = decisioni che «possono essere positive, negative o altrimenti chiuse». I campi sono `applied` per `app_type` N/R/A, e `dec_recognized`, `dec_other`, `dec_rejected`, `dec_closed`, `dec_total`. **Non ho potuto leggere la definizione di persone o domande, né il significato dei codici N, R, A**: sono noti come nuove, ripetute, ricorsi, ma non l'ho verificato. L'arrotondamento UNHCR non è documentato nel materiale letto (i valori UNHCR non sono multipli di 5).

**Confronto: come sono costruite le tre misure.** Differenza % = (UNHCR − Eurostat) / Eurostat. Misure:
1. *Domande*: Eurostat TOTAL (primi + successivi) contro UNHCR `applied` con `app_type` N + R (esclusi A, riportati nel CSV).
2. *Decisioni totali*: Eurostat TOTAL contro UNHCR `dec_total` (che include le «chiuse»).
3. *Decisioni positive*: Eurostat POS (rifugiato + sussidiaria + umanitaria) contro UNHCR `dec_recognized` + `dec_other`.

Le celle in cui entrambe le cifre sono sotto 100 non entrano nello «scarto massimo» (con l'arrotondamento a 5 di Eurostat la percentuale non è significativa); restano nelle tabelle dell'appendice. Kosovo: **non confrontabile**, perché UNHCR riporta una sola voce «Serbia and Kosovo: S/RES/1244 (1999)» (SRB), che comprende un altro paese di Eurostat.

**Risultati d'insieme** (celle con almeno una cifra ≥ 100, 23 paesi):

| Misura | Celle | Mediana dello scarto assoluto | Celle con scarto > 20% |
|---|---|---|---|
| Domande (N+R contro TOTAL) | 238 | 1,6% | 36 |
| Decisioni totali (`dec_total` contro TOTAL) | 243 | 1,0% | 26 |
| Decisioni positive (riconosciute+altre contro POS) | 215 | 1,1% | 56 |

**Verifiche fatte per capire le differenze** (stesso perimetro, stesse celle; non sono spiegazioni, sono confronti alternativi):
- Domande: UNHCR `N` (nuove) contro Eurostat primi richiedenti (FRST): mediana 0,5%, 7 celle su 237 oltre il 20%. N+R contro TOTAL: 36 su 238. Dove UNHCR riporta R = 0 (es. Nigeria 2017–2022) e Eurostat ha richiedenti successivi (SSEQ) elevati, la differenza sulle domande totali è quella parte; in alcuni anni UNHCR riporta una cifra in A (Nigeria 2020: N 855, A 2.296; Eurostat TOTAL 3.195). **Che A corrisponda ai richiedenti successivi non è verificato.**
- Decisioni totali: `dec_total` meno `dec_closed` contro TOTAL scende a 8 celle su 239 oltre il 20% (da 26). Il confronto è coerente con il fatto che Eurostat non ha una voce «chiuse», ma resta una differenza in alcune celle.
- Decisioni positive: `dec_recognized` contro Eurostat POS_RFG (rifugiato): mediana 0,7%, 3 celle su 117 oltre il 20%. `dec_other` non corrisponde né a POS_SPROT né a POS_HUM (mediane 75% e 90%).

**I cinque scarti più grandi** (celle con almeno una cifra ≥ 100, tre misure insieme):

| # | Paese, anno, misura | Eurostat | UNHCR | Scarto | Spiegazione |
|---|---|---|---|---|---|
| 1 | Guinea 2023, decisioni totali | 480 | 994 | +107% | Parziale: UNHCR comprende 464 decisioni «chiuse»; senza di esse 530 (+10%). I 50 rimanenti: non spiegato (l'arrotondamento a 5 non basta) |
| 2 | Egitto 2025, decisioni positive | 1.785 | 124 | −93% | Non spiegato dalle definizioni lette. Nota numerica: Eurostat POS_HUM è 1.660 e 1.785 − 1.660 = 125, quasi uguale a UNHCR (124); la definizione UNHCR di «positiva» non l'ho potuta leggere |
| 3 | Bangladesh 2023, decisioni positive | 2.020 | 178 | −91% | Non spiegato (stessa nota: vedi tabella sotto per POS_HUM) |
| 4 | Egitto 2024, decisioni positive | 965 | 97 | −90% | Non spiegato (stessa nota) |
| 5 | Bangladesh 2022, decisioni positive | 1.620 | 182 | −89% | Non spiegato (stessa nota) |

Valori Eurostat POS_HUM per le quattro righe «positive»: Egitto 2025 1.660, Bangladesh 2023 1.845, Egitto 2024 870, Bangladesh 2022 1.440. Riportati solo come dato; la definizione UNHCR di «altre decisioni positive» non è stata verificata.

## 7. UCDP

**Fonte e versione.** Pagina `https://ucdp.uu.se/downloads/` (200). Versione **26.1**, anni fino al 2025, scaricati: `ucdp-brd-conf-261-csv.zip` (Battle-related Deaths, livello conflitto-anno), `ucdp-onesided-261-csv.zip` (One-sided Violence), `ucdp-nonstate-261-csv.zip` (Non-state Conflict). I tre dataset sono distinti, per questo sono riportati separatamente. **Licenza** (pagina dei download): «All datasets are free of charge and licensed under CC BY 4.0 — you are free to use and redistribute them provided you cite the relevant publications listed with each dataset.» Le pubblicazioni da citare non le ho lette una per una.

**Come ho aggregato.** Somma della stima migliore (`bd_best`, `best_fatality_estimate`) per paese e anno. Il paese è quello di `gwno_loc` (BRD: località dell'incompatibilità) o `gwno_location` (OSV, non-state), codici Gleditsch-Ward; sono attribuite solo le righe con un solo paese. Le righe con più paesi (es. «Pakistan, Afghanistan») non sono attribuibili e non sono sommate: sono indicate a parte. Nel dataset BRD un conflitto-anno è presente solo se supera la soglia di 25 morti correlate a combattimenti: l'assenza di un anno significa «nessuna riga nel dataset», non zero morti. Tutte le cifre per paese e anno nel file `ucdp/ucdp_aggregato.json`.

| Paese | Battle-related deaths (anni con riga) | One-sided (anni) | Non-state (anni) | Anni con righe multi-paese (non sommate) |
|---|---|---|---|---|
| Afghanistan | 2015–2025 | 2015, 2017–2023 | 2015–2019 | 2015–2025 |
| Albania | — | — | — | — |
| Algeria | 2015–2018, 2020 | — | — | — |
| Bangladesh | 2016–2017 | 2024 | 2024 | 2015–2017, 2020 |
| Burkina Faso | 2018–2025 | 2018–2024 | 2019 | 2016–2025 |
| Costa d'Avorio | — | — | 2016 | 2016 |
| Egitto | 2015–2022 | — | — | 2015–2022 |
| Eritrea | — | — | — | 2016 |
| Etiopia | 2015–2016, 2019–2025 | 2016–2017, 2019–2025 | 2016–2021, 2023–2025 | 2015–2016, 2018, 2020–2021, 2024–2025 |
| Gambia | — | — | — | — |
| Guinea | — | — | 2020 | — |
| Iran | 2016–2021, 2023–2025 | 2019–2022 | — | 2018–2025 |
| Iraq | 2015–2025 | 2015–2017, 2019–2021 | 2015 | 2015–2025 |
| Kosovo | — | — | — | — |
| Mali | 2015–2025 | 2017–2025 | 2015–2025 | 2016–2025 |
| Marocco | — | — | — | — |
| Nigeria | 2015–2025 | 2015–2016, 2018–2025 | 2015–2025 | 2015–2025 |
| Pakistan | 2015–2025 | 2015–2019, 2024–2025 | 2015, 2023–2024 | 2015–2025 |
| Senegal | — | — | — | — |
| Siria | 2015–2025 | 2015–2020, 2025 | 2015–2025 | 2015–2025 |
| Somalia | 2015–2025 | — | 2016–2020, 2023–2025 | 2015–2024 |
| Sudan | 2015–2018, 2020–2025 | 2015–2025 | 2015–2025 | 2017–2018, 2020–2023, 2025 |
| Tunisia | 2015–2016 | — | — | 2015 |
| Ucraina | 2015–2022 | 2022 | — | 2022–2025 |

Costa d'Avorio, Eritrea, Guinea e Tunisia hanno righe solo in un dataset o solo multi-paese; Albania, Gambia, Kosovo, Marocco e Senegal non hanno nessuna riga 2015–2025 in nessuno dei tre dataset (nessun conflitto sopra soglia nei dati, non «zero»). La colonna multi-paese elenca gli anni in cui il paese compare in una riga con altri paesi, in qualunque dei tre dataset.

## 8. ecoi.net

Pagina paese in inglese `https://www.ecoi.net/en/countries/<paese>/`; richiesta GET con redirect, nessun documento letto. Verificato anche il titolo della pagina. Per Costa d'Avorio, Iran e Siria lo slug che avevo ipotizzato rispondeva 404 («Access error»): ho preso gli slug dall'elenco dei paesi (`https://www.ecoi.net/en/countries/`) e li ho richiesti una volta.

| Paese | URL | HTTP | Titolo della pagina |
|---|---|---|---|
| Afghanistan | https://www.ecoi.net/en/countries/afghanistan/ | 200 | Afghanistan - ecoi.net |
| Albania | https://www.ecoi.net/en/countries/albania/ | 200 | Albania - ecoi.net |
| Algeria | https://www.ecoi.net/en/countries/algeria/ | 200 | Algeria - ecoi.net |
| Bangladesh | https://www.ecoi.net/en/countries/bangladesh/ | 200 | Bangladesh - ecoi.net |
| Burkina Faso | https://www.ecoi.net/en/countries/burkina-faso/ | 200 | Burkina Faso - ecoi.net |
| Costa d'Avorio | https://www.ecoi.net/en/countries/cote-d-ivoire/ | 200 | Côte d'Ivoire - ecoi.net |
| Egitto | https://www.ecoi.net/en/countries/egypt/ | 200 | Egypt - ecoi.net |
| Eritrea | https://www.ecoi.net/en/countries/eritrea/ | 200 | Eritrea - ecoi.net |
| Etiopia | https://www.ecoi.net/en/countries/ethiopia/ | 200 | Ethiopia - ecoi.net |
| Gambia | https://www.ecoi.net/en/countries/gambia/ | 200 | Gambia - ecoi.net |
| Guinea | https://www.ecoi.net/en/countries/guinea/ | 200 | Guinea - ecoi.net |
| Iran | https://www.ecoi.net/en/countries/islamic-republic-of-iran/ | 200 | Iran, Islamic Republic - ecoi.net |
| Iraq | https://www.ecoi.net/en/countries/iraq/ | 200 | Iraq - ecoi.net |
| Kosovo | https://www.ecoi.net/en/countries/kosovo/ | 200 | Kosovo - ecoi.net |
| Mali | https://www.ecoi.net/en/countries/mali/ | 200 | Mali - ecoi.net |
| Marocco | https://www.ecoi.net/en/countries/morocco/ | 200 | Morocco - ecoi.net |
| Nigeria | https://www.ecoi.net/en/countries/nigeria/ | 200 | Nigeria - ecoi.net |
| Pakistan | https://www.ecoi.net/en/countries/pakistan/ | 200 | Pakistan - ecoi.net |
| Senegal | https://www.ecoi.net/en/countries/senegal/ | 200 | Senegal - ecoi.net |
| Siria | https://www.ecoi.net/en/countries/syrian-arab-republic/ | 200 | Syrian Arab Republic - ecoi.net |
| Somalia | https://www.ecoi.net/en/countries/somalia/ | 200 | Somalia - ecoi.net |
| Sudan | https://www.ecoi.net/en/countries/sudan/ | 200 | Sudan - ecoi.net |
| Tunisia | https://www.ecoi.net/en/countries/tunisia/ | 200 | Tunisia - ecoi.net |
| Ucraina | https://www.ecoi.net/en/countries/ukraine/ | 200 | Ukraine - ecoi.net |

Le 24 pagine esistono (200). Non ho letto i termini d'uso di ecoi.net.

## 9. Tabella riassuntiva (seconda parte)

«Scarto massimo» = massimo scarto assoluto UNHCR contro Eurostat, 2015–2025, tra le tre misure, sulle celle con almeno una cifra ≥ 100 (nessun valore per Kosovo). «UCDP» = almeno una riga a paese singolo in uno dei tre dataset 2015–2025, oppure, tra parentesi, solo righe multi-paese.

| Paese | Eurostat vs UNHCR (scarto massimo 2015–2025) | UCDP | ecoi.net |
|---|---|---|---|
| Afghanistan | 17% (domande 2021: 5.250 / 4.358) | sì | sì (200) |
| Albania | 87% (positive 2022: 405 / 54) | no | sì (200) |
| Algeria | 47% (decisioni 2017: 75 / 110) | sì | sì (200) |
| Bangladesh | 91% (positive 2023: 2.020 / 178) | sì | sì (200) |
| Burkina Faso | 56% (domande 2019: 125 / 55) | sì | sì (200) |
| Costa d'Avorio | 60% (positive 2022: 475 / 190) | sì | sì (200) |
| Egitto | 93% (positive 2025: 1.785 / 124) | sì | sì (200) |
| Eritrea | 78% (decisioni 2017: 385 / 685) | sì (solo multi-paese) | sì (200) |
| Etiopia | 66% (domande 2018: 80 / 133) | sì | sì (200) |
| Gambia | 85% (domande 2019: 930 / 144) | no | sì (200) |
| Guinea | 107% (decisioni 2023: 480 / 994) | sì | sì (200) |
| Iran | 27% (decisioni 2017: 230 / 291) | sì | sì (200) |
| Iraq | 28% (positive 2025: 555 / 397) | sì | sì (200) |
| Kosovo | non confrontabile (UNHCR: Serbia e Kosovo insieme) | no | sì (200) |
| Mali | 70% (domande 2019: 615 / 184) | sì | sì (200) |
| Marocco | 84% (positive 2024: 435 / 68) | no | sì (200) |
| Nigeria | 75% (domande 2021: 5.105 / 1.280) | sì | sì (200) |
| Pakistan | 58% (positive 2024: 2.960 / 1.232) | sì | sì (200) |
| Senegal | 82% (positive 2022: 465 / 82) | no | sì (200) |
| Siria | 68% (domande 2021: 240 / 76) | sì | sì (200) |
| Somalia | 9% (decisioni 2017: 2.125 / 2.318) | sì | sì (200) |
| Sudan | 69% (decisioni 2017: 270 / 456) | sì | sì (200) |
| Tunisia | 76% (positive 2022: 490 / 117) | sì | sì (200) |
| Ucraina | 19% (positive 2021: 570 / 459) | sì | sì (200) |

## Appendice: Eurostat / UNHCR per paese e anno

Formato: Eurostat / UNHCR (differenza % di UNHCR su Eurostat). «n.d.»: valore assente. «n.c.»: percentuale non calcolabile (0 su 0). Percentuali sotto soglia (entrambe le cifre < 100) riportate comunque; vedi sezione 6 per la regola dello scarto massimo.


### Domande di asilo (UNHCR: N+R)

| Paese | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Afghanistan | 3.975 / 3.986 (+0%) | 2.845 / 2.851 (+0%) | 1.015 / 1.010 (−0%) | 500 / 480 (−4%) | 600 / 587 (−2%) | 645 / 638 (−1%) | 5.250 / 4.358 (−17%) | 2.115 / 2.031 (−4%) | 1.915 / 1.914 (−0%) | 2.040 / 2.042 (+0%) | 2.765 / 2.716 (−2%) |
| Albania | 425 / 420 (−1%) | 365 / 363 (−1%) | 470 / 449 (−4%) | 1.295 / 990 (−24%) | 1.570 / 1.545 (−2%) | 455 / 445 (−2%) | 790 / 758 (−4%) | 1.310 / 1.278 (−2%) | 1.515 / 1.515 (+0%) | 1.880 / 1.882 (+0%) | 1.465 / 1.449 (−1%) |
| Algeria | 165 / 164 (−1%) | 95 / 94 (−1%) | 145 / 142 (−2%) | 180 / 160 (−11%) | 165 / 153 (−7%) | 115 / 109 (−5%) | 185 / 168 (−9%) | 185 / 177 (−4%) | 290 / 289 (−0%) | 470 / 468 (−0%) | 805 / 816 (+1%) |
| Bangladesh | 6.030 / 6.017 (−0%) | 6.665 / 6.668 (+0%) | 12.440 / 12.183 (−2%) | 5.405 / 4.162 (−23%) | 2.950 / 1.336 (−55%) | 2.740 / 2.273 (−17%) | 6.900 / 6.638 (−4%) | 14.840 / 14.590 (−2%) | 23.450 / 23.450 (+0%) | 33.415 / 33.415 (+0%) | 28.365 / 28.039 (−1%) |
| Burkina Faso | 410 / 408 (−0%) | 840 / 841 (+0%) | 945 / 900 (−5%) | 250 / 187 (−25%) | 125 / 55 (−56%) | 95 / 61 (−36%) | 265 / 209 (−21%) | 305 / 252 (−17%) | 5.680 / 5.680 (+0%) | 3.935 / 3.937 (+0%) | 440 / 428 (−3%) |
| Costa d'Avorio | 3.090 / 3.084 (−0%) | 7.455 / 7.456 (+0%) | 8.440 / 8.377 (−1%) | 1.865 / 1.630 (−13%) | 630 / 407 (−35%) | 630 / 502 (−20%) | 1.230 / 1.015 (−17%) | 1.720 / 1.578 (−8%) | 7.120 / 7.118 (−0%) | 2.330 / 2.331 (+0%) | 605 / 606 (+0%) |
| Egitto | 565 / 560 (−1%) | 785 / 787 (+0%) | 810 / 810 (+0%) | 750 / 669 (−11%) | 840 / 802 (−5%) | 380 / 354 (−7%) | 2.710 / 2.683 (−1%) | 8.890 / 8.834 (−1%) | 18.295 / 18.296 (+0%) | 11.965 / 11.965 (+0%) | 11.790 / 11.643 (−1%) |
| Eritrea | 695 / 698 (+0%) | 7.395 / 7.396 (+0%) | 6.370 / 6.279 (−1%) | 845 / 903 (+7%) | 235 / 238 (+1%) | 130 / 131 (+1%) | 205 / 89 (−57%) | 155 / 117 (−25%) | 75 / 73 (−3%) | 95 / 97 (+2%) | 65 / 63 (−3%) |
| Etiopia | 95 / 95 (+0%) | 360 / 361 (+0%) | 270 / 264 (−2%) | 80 / 133 (+66%) | 45 / 46 (+2%) | 30 / 32 (+7%) | 75 / 70 (−7%) | 80 / 72 (−10%) | 35 / 37 (+6%) | 70 / 69 (−1%) | 45 / 45 (+0%) |
| Gambia | 7.995 / 8.015 (+0%) | 8.930 / 8.923 (−0%) | 8.875 / 8.687 (−2%) | 2.270 / 1.632 (−28%) | 930 / 144 (−85%) | 695 / 126 (−82%) | 1.085 / 191 (−82%) | 1.100 / 460 (−58%) | 2.150 / 2.148 (−0%) | 2.320 / 2.321 (+0%) | 880 / 875 (−1%) |
| Guinea | 1.675 / 1.683 (+0%) | 6.050 / 6.053 (+0%) | 7.820 / 7.860 (+1%) | 1.570 / 1.412 (−10%) | 290 / 149 (−49%) | 315 / 186 (−41%) | 590 / 391 (−34%) | 755 / 640 (−15%) | 3.385 / 3.383 (−0%) | 2.200 / 2.199 (−0%) | 735 / 719 (−2%) |
| Iran | 255 / 261 (+2%) | 385 / 385 (+0%) | 225 / 226 (+0%) | 235 / 188 (−20%) | 275 / 268 (−3%) | 150 / 146 (−3%) | 85 / 84 (−1%) | 120 / 116 (−3%) | 175 / 177 (+1%) | 160 / 159 (−1%) | 105 / 103 (−2%) |
| Iraq | 505 / 505 (+0%) | 1.530 / 1.532 (+0%) | 1.660 / 1.653 (−0%) | 1.175 / 965 (−18%) | 945 / 941 (−0%) | 470 / 452 (−4%) | 455 / 425 (−7%) | 710 / 698 (−2%) | 525 / 524 (−0%) | 1.105 / 1.103 (−0%) | 945 / 939 (−1%) |
| Kosovo | 350 / n.d. | 365 / n.d. | 610 / n.d. | 0 / n.d. | 0 / n.d. | 165 / n.d. | 300 / n.d. | 545 / n.d. | 505 / n.d. | 525 / n.d. | 255 / n.d. |
| Mali | 5.425 / 5.446 (+0%) | 6.350 / 6.347 (−0%) | 7.640 / 7.543 (−1%) | 2.465 / 2.018 (−18%) | 615 / 184 (−70%) | 600 / 319 (−47%) | 1.210 / 804 (−34%) | 1.100 / 795 (−28%) | 3.210 / 3.210 (+0%) | 3.260 / 3.261 (+0%) | 1.160 / 1.137 (−2%) |
| Marocco | 580 / 576 (−1%) | 1.550 / 1.551 (+0%) | 1.865 / 1.844 (−1%) | 1.910 / 1.729 (−9%) | 1.595 / 1.502 (−6%) | 490 / 473 (−3%) | 1.635 / 1.589 (−3%) | 2.855 / 2.788 (−2%) | 5.225 / 5.223 (−0%) | 10.360 / 10.359 (−0%) | 9.485 / 9.346 (−1%) |
| Nigeria | 18.145 / 17.779 (−2%) | 27.105 / 27.088 (−0%) | 25.495 / 25.094 (−2%) | 6.975 / 5.141 (−26%) | 3.520 / 1.252 (−64%) | 3.195 / 855 (−73%) | 5.105 / 1.280 (−75%) | 5.020 / 1.804 (−64%) | 3.995 / 3.995 (+0%) | 4.290 / 4.292 (+0%) | 3.385 / 3.408 (+1%) |
| Pakistan | 10.425 / 10.287 (−1%) | 13.660 / 13.637 (−0%) | 9.730 / 9.373 (−4%) | 8.535 / 7.316 (−14%) | 8.735 / 7.278 (−17%) | 5.515 / 4.932 (−11%) | 7.515 / 6.882 (−8%) | 11.870 / 11.365 (−4%) | 17.075 / 17.077 (+0%) | 12.360 / 12.362 (+0%) | 10.350 / 10.160 (−2%) |
| Senegal | 6.360 / 6.371 (+0%) | 7.610 / 7.616 (+0%) | 8.455 / 8.285 (−2%) | 3.065 / 2.444 (−20%) | 1.690 / 864 (−49%) | 695 / 278 (−60%) | 1.095 / 436 (−60%) | 1.120 / 611 (−45%) | 1.835 / 1.835 (+0%) | 2.440 / 2.441 (+0%) | 1.925 / 1.919 (−0%) |
| Siria | 500 / 506 (+1%) | 980 / 981 (+0%) | 1.480 / 1.690 (+14%) | 330 / 411 (+25%) | 200 / 201 (+0%) | 60 / 62 (+3%) | 240 / 76 (−68%) | 485 / 410 (−15%) | 465 / 464 (−0%) | 380 / 378 (−1%) | 120 / 120 (+0%) |
| Somalia | 720 / 719 (−0%) | 2.390 / 2.391 (+0%) | 2.015 / 1.989 (−1%) | 605 / 623 (+3%) | 405 / 408 (+1%) | 760 / 752 (−1%) | 1.195 / 1.144 (−4%) | 1.070 / 1.017 (−5%) | 475 / 473 (−0%) | 450 / 450 (+0%) | 555 / 546 (−2%) |
| Sudan | 145 / 144 (−1%) | 500 / 502 (+0%) | 495 / 468 (−5%) | 255 / 266 (+4%) | 245 / 243 (−1%) | 300 / 298 (−1%) | 215 / 171 (−20%) | 305 / 269 (−12%) | 255 / 255 (+0%) | 255 / 254 (−0%) | 200 / 194 (−3%) |
| Tunisia | 305 / 295 (−3%) | 335 / 337 (+1%) | 465 / 434 (−7%) | 1.025 / 920 (−10%) | 740 / 708 (−4%) | 1.025 / 999 (−3%) | 6.445 / 6.374 (−1%) | 5.515 / 5.364 (−3%) | 7.785 / 7.785 (+0%) | 10.055 / 10.057 (+0%) | 6.290 / 6.226 (−1%) |
| Ucraina | 4.665 / 4.681 (+0%) | 2.570 / 2.571 (+0%) | 2.745 / 2.656 (−3%) | 3.070 / 2.483 (−19%) | 1.840 / 1.769 (−4%) | 405 / 378 (−7%) | 610 / 528 (−13%) | 3.170 / 2.993 (−6%) | 1.255 / 1.256 (+0%) | 1.660 / 1.661 (+0%) | 1.165 / 1.129 (−3%) |

### Decisioni totali

| Paese | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Afghanistan | 3.430 / 3.444 (+0%) | 4.125 / 4.125 (+0%) | 1.970 / 2.156 (+9%) | 1.080 / 1.123 (+4%) | 970 / 1.007 (+4%) | 1.130 / 1.158 (+2%) | 4.015 / 4.280 (+7%) | 4.215 / 3.810 (−10%) | 1.650 / 1.859 (+13%) | 1.835 / 1.974 (+8%) | 1.650 / 1.657 (+0%) |
| Albania | 235 / 237 (+1%) | 225 / 225 (+0%) | 230 / 276 (+20%) | 520 / 520 (+0%) | 1.575 / 1.581 (+0%) | 935 / 934 (−0%) | 525 / 517 (−2%) | 625 / 625 (+0%) | 620 / 563 (−9%) | 850 / 758 (−11%) | 1.075 / 1.086 (+1%) |
| Algeria | 120 / 118 (−2%) | 125 / 124 (−1%) | 75 / 110 (+47%) | 130 / 132 (+2%) | 185 / 184 (−1%) | 120 / 121 (+1%) | 115 / 94 (−18%) | 105 / 105 (+0%) | 115 / 95 (−17%) | 235 / 221 (−6%) | 450 / 457 (+2%) |
| Bangladesh | 5.010 / 5.011 (+0%) | 6.225 / 6.226 (+0%) | 5.775 / 6.467 (+12%) | 10.535 / 10.539 (+0%) | 8.290 / 8.291 (+0%) | 2.910 / 2.915 (+0%) | 3.530 / 3.682 (+4%) | 7.000 / 7.003 (+0%) | 6.530 / 8.506 (+30%) | 15.385 / 16.928 (+10%) | 29.595 / 29.678 (+0%) |
| Burkina Faso | 390 / 392 (+1%) | 530 / 532 (+0%) | 495 / 554 (+12%) | 775 / 777 (+0%) | 450 / 452 (+0%) | 175 / 177 (+1%) | 180 / 173 (−4%) | 285 / 281 (−1%) | 505 / 541 (+7%) | 3.680 / 3.743 (+2%) | 4.220 / 4.225 (+0%) |
| Costa d'Avorio | 2.265 / 2.276 (+0%) | 3.810 / 3.811 (+0%) | 4.335 / 6.032 (+39%) | 5.270 / 5.278 (+0%) | 3.745 / 3.747 (+0%) | 1.325 / 1.328 (+0%) | 1.005 / 991 (−1%) | 1.110 / 1.089 (−2%) | 1.670 / 2.434 (+46%) | 3.055 / 3.575 (+17%) | 1.780 / 1.810 (+2%) |
| Egitto | 695 / 693 (−0%) | 535 / 536 (+0%) | 625 / 765 (+22%) | 795 / 796 (+0%) | 915 / 915 (+0%) | 585 / 586 (+0%) | 655 / 681 (+4%) | 3.665 / 3.667 (+0%) | 3.570 / 6.107 (+71%) | 6.995 / 8.585 (+23%) | 10.685 / 10.738 (+0%) |
| Eritrea | 655 / 659 (+1%) | 480 / 481 (+0%) | 385 / 685 (+78%) | 450 / 453 (+1%) | 235 / 236 (+0%) | 195 / 198 (+2%) | 275 / 171 (−38%) | 190 / 158 (−17%) | 80 / 124 (+55%) | 95 / 106 (+12%) | 40 / 44 (+10%) |
| Etiopia | 150 / 152 (+1%) | 150 / 148 (−1%) | 225 / 295 (+31%) | 200 / 199 (−0%) | 80 / 79 (−1%) | 135 / 135 (+0%) | 70 / 62 (−11%) | 70 / 69 (−1%) | 55 / 62 (+13%) | 35 / 41 (+17%) | 45 / 43 (−4%) |
| Gambia | 8.725 / 8.726 (+0%) | 8.680 / 8.681 (+0%) | 6.430 / 7.057 (+10%) | 6.970 / 6.972 (+0%) | 4.390 / 4.395 (+0%) | 1.080 / 1.079 (−0%) | 1.495 / 1.188 (−21%) | 1.395 / 1.297 (−7%) | 1.170 / 1.253 (+7%) | 1.895 / 1.862 (−2%) | 1.235 / 1.247 (+1%) |
| Guinea | 1.170 / 1.173 (+0%) | 2.555 / 2.554 (−0%) | 3.610 / 4.908 (+36%) | 4.800 / 4.805 (+0%) | 3.055 / 3.059 (+0%) | 805 / 806 (+0%) | 595 / 509 (−14%) | 570 / 532 (−7%) | 480 / 994 (+107%) | 1.290 / 1.773 (+37%) | 1.635 / 1.662 (+2%) |
| Iran | 345 / 347 (+1%) | 300 / 300 (+0%) | 230 / 291 (+27%) | 215 / 215 (+0%) | 270 / 269 (−0%) | 205 / 203 (−1%) | 125 / 132 (+6%) | 90 / 89 (−1%) | 90 / 107 (+19%) | 125 / 138 (+10%) | 90 / 92 (+2%) |
| Iraq | 655 / 656 (+0%) | 925 / 924 (−0%) | 1.410 / 1.550 (+10%) | 1.410 / 1.416 (+0%) | 1.070 / 1.085 (+1%) | 525 / 531 (+1%) | 595 / 630 (+6%) | 700 / 664 (−5%) | 595 / 676 (+14%) | 675 / 702 (+4%) | 650 / 658 (+1%) |
| Kosovo | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. |
| Mali | 8.600 / 8.598 (−0%) | 6.895 / 6.897 (+0%) | 4.490 / 5.269 (+17%) | 5.640 / 5.660 (+0%) | 4.185 / 4.202 (+0%) | 990 / 991 (+0%) | 1.690 / 1.588 (−6%) | 1.710 / 1.583 (−7%) | 1.140 / 1.334 (+17%) | 2.510 / 2.652 (+6%) | 3.060 / 3.079 (+1%) |
| Marocco | 325 / 327 (+1%) | 455 / 456 (+0%) | 1.280 / 1.890 (+48%) | 1.400 / 1.401 (+0%) | 2.555 / 2.555 (+0%) | 1.130 / 1.129 (−0%) | 715 / 714 (−0%) | 865 / 862 (−0%) | 1.340 / 1.039 (−22%) | 4.325 / 3.868 (−11%) | 6.315 / 6.367 (+1%) |
| Nigeria | 12.595 / 12.595 (+0%) | 18.390 / 18.388 (−0%) | 16.785 / 19.203 (+14%) | 19.850 / 19.868 (+0%) | 16.645 / 16.669 (+0%) | 6.505 / 6.515 (+0%) | 6.585 / 6.621 (+1%) | 5.965 / 5.815 (−3%) | 4.090 / 4.560 (+11%) | 4.120 / 4.170 (+1%) | 3.390 / 3.409 (+1%) |
| Pakistan | 7.920 / 7.919 (−0%) | 11.620 / 11.622 (+0%) | 8.915 / 10.489 (+18%) | 9.760 / 9.795 (+0%) | 11.970 / 12.016 (+0%) | 6.065 / 6.102 (+1%) | 6.660 / 7.363 (+11%) | 7.740 / 7.680 (−1%) | 5.935 / 7.647 (+29%) | 9.375 / 10.838 (+16%) | 10.555 / 10.602 (+0%) |
| Senegal | 5.430 / 5.430 (+0%) | 6.625 / 6.625 (+0%) | 5.165 / 5.923 (+15%) | 6.540 / 6.540 (+0%) | 5.675 / 5.679 (+0%) | 1.675 / 1.676 (+0%) | 1.355 / 1.245 (−8%) | 1.070 / 1.042 (−3%) | 875 / 817 (−7%) | 1.590 / 1.451 (−9%) | 1.400 / 1.408 (+1%) |
| Siria | 580 / 583 (+1%) | 1.185 / 1.184 (−0%) | 1.115 / 1.190 (+7%) | 410 / 410 (+0%) | 155 / 154 (−1%) | 120 / 121 (+1%) | 220 / 81 (−63%) | 385 / 318 (−17%) | 355 / 439 (+24%) | 420 / 472 (+12%) | 30 / 30 (+0%) |
| Somalia | 1.145 / 1.147 (+0%) | 1.450 / 1.448 (−0%) | 2.125 / 2.318 (+9%) | 1.380 / 1.380 (+0%) | 710 / 712 (+0%) | 465 / 474 (+2%) | 1.180 / 1.143 (−3%) | 1.310 / 1.269 (−3%) | 690 / 752 (+9%) | 575 / 617 (+7%) | 390 / 396 (+2%) |
| Sudan | 265 / 268 (+1%) | 225 / 225 (+0%) | 270 / 456 (+69%) | 305 / 308 (+1%) | 240 / 239 (−0%) | 145 / 147 (+1%) | 225 / 173 (−23%) | 230 / 209 (−9%) | 160 / 241 (+51%) | 210 / 254 (+21%) | 175 / 176 (+1%) |
| Tunisia | 380 / 381 (+0%) | 215 / 214 (−0%) | 280 / 393 (+40%) | 720 / 722 (+0%) | 880 / 879 (−0%) | 880 / 882 (+0%) | 1.960 / 1.923 (−2%) | 2.095 / 2.097 (+0%) | 2.815 / 2.901 (+3%) | 5.420 / 5.243 (−3%) | 5.895 / 5.936 (+1%) |
| Ucraina | 2.480 / 2.482 (+0%) | 3.245 / 3.244 (−0%) | 1.725 / 1.833 (+6%) | 1.950 / 1.949 (−0%) | 4.005 / 4.007 (+0%) | 1.220 / 1.220 (+0%) | 760 / 711 (−6%) | 1.685 / 1.667 (−1%) | 1.615 / 1.808 (+12%) | 1.130 / 1.224 (+8%) | 955 / 959 (+0%) |

### Decisioni positive (UNHCR: riconosciute + altre)

| Paese | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Afghanistan | 3.280 / 3.278 (−0%) | 4.000 / 4.001 (+0%) | 1.805 / 1.803 (−0%) | 945 / 947 (+0%) | 910 / 908 (−0%) | 1.060 / 1.059 (−0%) | 3.915 / 4.176 (+7%) | 4.035 / 3.613 (−10%) | 1.575 / 1.551 (−2%) | 1.685 / 1.623 (−4%) | 1.625 / 1.392 (−14%) |
| Albania | 110 / 109 (−1%) | 100 / 102 (+2%) | 110 / 108 (−2%) | 155 / 158 (+2%) | 125 / 125 (+0%) | 120 / 118 (−2%) | 295 / 248 (−16%) | 405 / 54 (−87%) | 310 / 71 (−77%) | 180 / 25 (−86%) | 195 / 40 (−79%) |
| Algeria | 35 / 32 (−9%) | 20 / 18 (−10%) | 30 / 32 (+7%) | 25 / 22 (−12%) | 30 / 28 (−7%) | 15 / 16 (+7%) | 50 / 31 (−38%) | 40 / 16 (−60%) | 30 / 5 (−83%) | 30 / 5 (−83%) | 45 / 18 (−60%) |
| Bangladesh | 1.225 / 1.226 (+0%) | 1.610 / 1.610 (+0%) | 1.885 / 1.883 (−0%) | 2.825 / 2.829 (+0%) | 535 / 535 (+0%) | 420 / 420 (+0%) | 760 / 726 (−4%) | 1.620 / 182 (−89%) | 2.020 / 178 (−91%) | 3.030 / 342 (−89%) | 3.355 / 534 (−84%) |
| Burkina Faso | 165 / 165 (+0%) | 165 / 163 (−1%) | 170 / 171 (+1%) | 205 / 206 (+0%) | 90 / 91 (+1%) | 90 / 88 (−2%) | 140 / 136 (−3%) | 245 / 178 (−27%) | 495 / 383 (−23%) | 3.635 / 3.506 (−4%) | 4.210 / 4.083 (−3%) |
| Costa d'Avorio | 930 / 929 (−0%) | 1.180 / 1.178 (−0%) | 1.490 / 1.491 (+0%) | 1.320 / 1.321 (+0%) | 485 / 485 (+0%) | 300 / 298 (−1%) | 370 / 333 (−10%) | 475 / 190 (−60%) | 555 / 288 (−48%) | 1.040 / 606 (−42%) | 865 / 485 (−44%) |
| Egitto | 250 / 252 (+1%) | 275 / 275 (+0%) | 330 / 331 (+0%) | 290 / 289 (−0%) | 90 / 91 (+1%) | 60 / 62 (+3%) | 135 / 129 (−4%) | 355 / 71 (−80%) | 600 / 76 (−87%) | 965 / 97 (−90%) | 1.785 / 124 (−93%) |
| Eritrea | 525 / 527 (+0%) | 405 / 403 (−0%) | 275 / 275 (+0%) | 275 / 276 (+0%) | 145 / 143 (−1%) | 120 / 120 (+0%) | 220 / 114 (−48%) | 165 / 133 (−19%) | 60 / 59 (−2%) | 65 / 59 (−9%) | 35 / 34 (−3%) |
| Etiopia | 130 / 131 (+1%) | 120 / 121 (+1%) | 190 / 190 (+0%) | 150 / 148 (−1%) | 50 / 48 (−4%) | 25 / 26 (+4%) | 50 / 45 (−10%) | 65 / 52 (−20%) | 50 / 41 (−18%) | 30 / 31 (+3%) | 40 / 38 (−5%) |
| Gambia | 2.995 / 2.996 (+0%) | 2.815 / 2.815 (+0%) | 2.605 / 2.605 (+0%) | 2.320 / 2.318 (−0%) | 420 / 418 (−0%) | 150 / 153 (+2%) | 360 / 333 (−8%) | 535 / 110 (−79%) | 395 / 95 (−76%) | 370 / 139 (−62%) | 310 / 84 (−73%) |
| Guinea | 600 / 601 (+0%) | 740 / 741 (+0%) | 1.200 / 1.201 (+0%) | 1.330 / 1.328 (−0%) | 295 / 299 (+1%) | 105 / 106 (+1%) | 185 / 157 (−15%) | 210 / 51 (−76%) | 200 / 73 (−64%) | 315 / 136 (−57%) | 400 / 170 (−57%) |
| Iran | 225 / 227 (+1%) | 240 / 242 (+1%) | 145 / 146 (+1%) | 150 / 150 (+0%) | 185 / 187 (+1%) | 105 / 104 (−1%) | 110 / 109 (−1%) | 80 / 58 (−28%) | 75 / 69 (−8%) | 105 / 82 (−22%) | 85 / 72 (−15%) |
| Iraq | 585 / 585 (+0%) | 880 / 878 (−0%) | 1.270 / 1.271 (+0%) | 1.230 / 1.230 (+0%) | 820 / 820 (+0%) | 335 / 336 (+0%) | 515 / 546 (+6%) | 595 / 477 (−20%) | 505 / 444 (−12%) | 605 / 477 (−21%) | 555 / 397 (−28%) |
| Kosovo | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. | n.d. |
| Mali | 2.785 / 2.784 (−0%) | 3.000 / 3.000 (+0%) | 1.915 / 1.914 (−0%) | 1.830 / 1.828 (−0%) | 840 / 839 (−0%) | 395 / 396 (+0%) | 1.425 / 1.334 (−6%) | 1.470 / 687 (−53%) | 1.070 / 757 (−29%) | 2.395 / 1.886 (−21%) | 3.020 / 2.645 (−12%) |
| Marocco | 95 / 94 (−1%) | 145 / 145 (+0%) | 280 / 278 (−1%) | 345 / 347 (+1%) | 210 / 208 (−1%) | 160 / 160 (+0%) | 260 / 233 (−10%) | 315 / 77 (−76%) | 320 / 74 (−77%) | 435 / 68 (−84%) | 620 / 101 (−84%) |
| Nigeria | 3.740 / 3.743 (+0%) | 4.595 / 4.593 (−0%) | 4.345 / 4.344 (−0%) | 4.700 / 4.700 (+0%) | 2.920 / 2.922 (+0%) | 1.930 / 1.931 (+0%) | 2.340 / 2.263 (−3%) | 2.375 / 1.010 (−57%) | 1.960 / 957 (−51%) | 1.555 / 957 (−38%) | 1.170 / 712 (−39%) |
| Pakistan | 3.495 / 3.496 (+0%) | 4.290 / 4.290 (+0%) | 2.775 / 2.775 (+0%) | 2.435 / 2.437 (+0%) | 1.815 / 1.814 (−0%) | 1.070 / 1.070 (+0%) | 2.335 / 2.486 (+6%) | 2.695 / 1.207 (−55%) | 2.265 / 1.017 (−55%) | 2.960 / 1.232 (−58%) | 3.430 / 1.469 (−57%) |
| Senegal | 1.565 / 1.563 (−0%) | 1.725 / 1.725 (+0%) | 1.465 / 1.466 (+0%) | 1.475 / 1.477 (+0%) | 345 / 347 (+1%) | 190 / 189 (−1%) | 430 / 386 (−10%) | 465 / 82 (−82%) | 270 / 89 (−67%) | 210 / 97 (−54%) | 150 / 50 (−67%) |
| Siria | 330 / 330 (+0%) | 1.170 / 1.168 (−0%) | 1.030 / 1.031 (+0%) | 375 / 374 (−0%) | 130 / 129 (−1%) | 85 / 88 (+4%) | 200 / 70 (−65%) | 320 / 251 (−22%) | 300 / 300 (+0%) | 335 / 327 (−2%) | 30 / 30 (+0%) |
| Somalia | 1.070 / 1.074 (+0%) | 1.400 / 1.402 (+0%) | 2.060 / 2.060 (+0%) | 1.240 / 1.240 (+0%) | 655 / 656 (+0%) | 370 / 371 (+0%) | 1.155 / 1.111 (−4%) | 1.255 / 1.173 (−7%) | 660 / 631 (−4%) | 535 / 516 (−4%) | 385 / 371 (−4%) |
| Sudan | 170 / 172 (+1%) | 165 / 167 (+1%) | 190 / 192 (+1%) | 165 / 166 (+1%) | 140 / 140 (+0%) | 55 / 52 (−5%) | 165 / 119 (−28%) | 195 / 161 (−17%) | 120 / 109 (−9%) | 175 / 172 (−2%) | 170 / 166 (−2%) |
| Tunisia | 80 / 79 (−1%) | 65 / 68 (+5%) | 70 / 68 (−3%) | 70 / 72 (+3%) | 40 / 41 (+2%) | 45 / 45 (+0%) | 390 / 375 (−4%) | 490 / 117 (−76%) | 655 / 175 (−73%) | 785 / 267 (−66%) | 860 / 216 (−75%) |
| Ucraina | 1.635 / 1.634 (−0%) | 1.850 / 1.850 (+0%) | 1.265 / 1.264 (−0%) | 915 / 915 (+0%) | 490 / 492 (+0%) | 350 / 350 (+0%) | 570 / 459 (−19%) | 1.580 / 1.488 (−6%) | 1.525 / 1.497 (−2%) | 995 / 963 (−3%) | 910 / 882 (−3%) |

## Punti in cui mi sono fermato o che restano aperti (seconda parte)

- UNHCR: pagine «copyright» e «metodologia» bloccate (403, Cloudflare), non riprovate. Condizioni di riuso, definizione di persone/domande e significato dei codici N/R/A non verificati.
- UNHCR: il filtro anni dell'API è stato ignorato; i dati scaricati vanno dal 2000 al 2026, usati 2015–2025.
- Kosovo: non confrontabile con UNHCR (Serbia e Kosovo accorpati).
- UCDP: aggregazione per paese con le sole righe a paese singolo; le righe multi-paese non sono attribuite. Pubblicazioni da citare non lette.
- ecoi.net: tre slug ipotizzati davano 404 e sono stati corretti dall'elenco dei paesi.
