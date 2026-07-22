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
      <p className="occhiello">Un&apos;altra faccia dello stesso fenomeno</p>
      <h1 className="tesi">Minori stranieri <em>non accompagnati</em>.</h1>
      <p className="sommario">
        I minori stranieri non accompagnati sono le persone sotto i diciotto anni che si
        trovano in Italia senza un adulto legalmente responsabile per loro. La legge ne
        affida l&apos;accoglienza allo Stato. Il Ministero del Lavoro ne pubblica il numero
        presente in ciascuna regione, mese per mese. Qui è raccolto dal {primoAnno} al {pa}.
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">Quante regioni accolgono, al {dataLeggibile}</h2>
        <p className="nota-tabella">
          La linea mostra l&apos;andamento dei minori presenti in ogni regione nel tempo.
          L&apos;ordine è per numero attuale.
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
        <p className="avviso">
          Fonte: Ministero del Lavoro e delle Politiche Sociali, report mensili sui minori
          stranieri non accompagnati. La serie copre i mesi da {primoAnno} a dicembre 2022,
          l&apos;ultimo periodo pubblicato in forma di report scaricabile. Da giugno 2023 il
          Ministero diffonde questi dati solo attraverso una dashboard online, non più in
          documenti; per questo la serie qui si ferma al 2022. Il dato è regionale: il
          Ministero non lo pubblica per provincia.
        </p>
      </section>
    </main>
  );
}
