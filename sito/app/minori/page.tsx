import Link from "next/link";
import { msnaData } from "@/lib/dati";

export const metadata = { title: "Minori non accompagnati · Osservatorio Accoglienza" };

function Spark({ serie }: { serie: { presenti: number }[] }) {
  const vals = serie.map((p) => p.presenti);
  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1;
  const w = 240, h = 40;
  const pts = vals.map((v, i) =>
    `${(i / (vals.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`
  ).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="spark" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--timbro)" strokeWidth="1.5" />
    </svg>
  );
}


function GraficoNazionale({ serie }: { serie: { periodo: string; presenti: number; tipo?: string }[] }) {
  const w = 720, h = 200, pad = 34;
  const vals = serie.map((p) => p.presenti);
  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1;
  const x = (i: number) => pad + (i / (serie.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
  const mensili = serie.filter((p) => p.tipo === "mensile");
  const linea = mensili.map((p) => {
    const i = serie.indexOf(p);
    return `${x(i)},${y(p.presenti)}`;
  }).join(" ");
  const semestrali = serie.map((p, i) => ({ p, i })).filter((o) => o.p.tipo === "semestrale");
  const primoAnno = serie[0].periodo.slice(0, 4);
  const ultimoAnno = serie[serie.length - 1].periodo.slice(0, 4);
  return (
    <div className="grafico-naz">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
        <polyline points={linea} fill="none" stroke="var(--timbro)" strokeWidth="1.6" />
        {semestrali.map(({ p, i }) => (
          <circle key={p.periodo} cx={x(i)} cy={y(p.presenti)} r="3.5"
            fill="var(--carta)" stroke="var(--timbro)" strokeWidth="1.6" />
        ))}
        <text x={pad} y={h - 8} className="asse-txt">{primoAnno}</text>
        <text x={w - pad} y={h - 8} className="asse-txt" textAnchor="end">{ultimoAnno}</text>
        <text x={pad} y={y(max) - 6} className="asse-txt">{max.toLocaleString("it-IT")}</text>
      </svg>
      <p className="legenda">
        <span className="leg-linea" /> rilevazione mensile ({primoAnno}–2022)
        <span className="leg-punto" /> rilevazione semestrale (2023–{ultimoAnno})
      </p>
    </div>
  );
}

export default function Minori() {
  const d = msnaData;
  const [pa, pm] = d.ultimo_periodo.split("-");
  const mesi = ["", "gennaio","febbraio","marzo","aprile","maggio","giugno",
    "luglio","agosto","settembre","ottobre","novembre","dicembre"];
  const dataLeggibile = `${mesi[+pm]} ${pa}`;
  const primoAnno = d.primo_periodo.split("-")[0];

  return (
    <main>
      <Link href="/" className="indietro">← torna all&apos;archivio contratti</Link>
      <p className="occhiello">Dati del Ministero del Lavoro</p>
      <h1 className="tesi">Minori stranieri <em>non accompagnati</em>.</h1>
      <p className="sommario">
        I minori stranieri non accompagnati sono le persone sotto la maggiore età che si
        trovano in Italia senza un adulto legalmente responsabile per loro. La legge ne
        affida l&apos;accoglienza allo Stato. Il Ministero del Lavoro ne pubblica il numero
        presente in ciascuna regione, mese per mese. Qui è raccolto dal {primoAnno} al {pa}.
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">
          Minori presenti in Italia, {msnaData.nazionale[0].periodo.slice(0,4)}–{msnaData.ultimo_totale_periodo.slice(0,4)}
        </h2>
        <p className="nota-tabella">
          Quanti minori non accompagnati ci sono in Italia. Fino al 2022 il conteggio era
          mensile (la linea); dal 2023 il Ministero lo pubblica ogni sei mesi (i punti).
        </p>
        <GraficoNazionale serie={msnaData.nazionale} />
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Quante regioni accolgono, al {dataLeggibile}</h2>
        <p className="nota-tabella">
          Ogni linea segue nel tempo i minori presenti in una regione. In ordine di numero,
          dal più alto.
        </p>
        <table className="tabella">
          <thead>
            <tr>
              <th>Regione</th>
              <th className="num">Al {dataLeggibile}</th>
              <th>Andamento dal {primoAnno}</th>
            </tr>
          </thead>
          <tbody>
            {d.regioni.map((r) => (
              <tr key={r.regione}>
                <td className="nome-prov">{r.regione}</td>
                <td className="num">{r.ultimo.toLocaleString("it-IT")}</td>
                <td className="cella-spark"><Spark serie={r.serie} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Da dove vengono questi dati</h2>
        <p>
          Fonte: Ministero del Lavoro e delle Politiche Sociali, report mensili sulla
          presenza dei minori stranieri non accompagnati. I numeri indicano i minori
          presenti in ciascuna regione all&apos;ultimo giorno del mese.
        </p>
        <p>
          La serie copre i mesi da {primoAnno} a {dataLeggibile}. Da allora il Ministero ha
          smesso di pubblicare i report come documenti scaricabili e diffonde questi dati
          solo attraverso una dashboard online: per questo la raccolta si ferma a questo
          punto. Il dato è regionale, non provinciale, perché il Ministero non lo pubblica
          a un dettaglio maggiore.
        </p>
        <p className="avviso">
          Nelle linee di andamento si nota un calo ricorrente a inizio di ogni anno.
          Non è un errore: dipende da come funziona il censimento. Per i minori di cui non si
          conosce la data di nascita esatta viene registrato in via presuntiva il 1° gennaio.
          Al compimento della maggiore età escono dal conteggio, e poiché a molti risulta il
          1° gennaio come compleanno, ogni gennaio una parte del gruppo esce insieme,
          producendo il gradino visibile nel grafico.
        </p>
      </section>
    </main>
  );
}
