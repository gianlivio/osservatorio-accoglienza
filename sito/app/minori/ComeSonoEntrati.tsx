"use client";
import { useState } from "react";
import Link from "next/link";
import { nItal } from "@/lib/dati";
import type { AnnoComeEntrati } from "@/lib/msnaIngressi";

export default function ComeSonoEntrati({ anni }: { anni: AnnoComeEntrati[] }) {
  const [anno, setAnno] = useState(anni[anni.length - 1].anno);
  const d = anni.find((a) => a.anno === anno)!;
  const note = d.righe.filter((r) => r.nota);
  return (
    <>
      <div className="periodi" role="group" aria-label="Anno degli ingressi">
        {anni.map((a) => (
          <button key={a.anno} type="button" className={"periodo" + (anno === a.anno ? " attivo" : "")} onClick={() => setAnno(a.anno)}>
            {a.anno}
          </button>
        ))}
      </div>
      <p className="frase-provincia">
        Nel {d.anno} sono entrati in Italia {nItal(d.totale)} minori non accompagnati; il {d.percentuale} con eventi di sbarco.
      </p>
      <table className="tabella">
        <caption className="sr-only">Quota di minori non accompagnati entrata con eventi di sbarco nel {d.anno}, per cittadinanza, nell&apos;ordine del rapporto</caption>
        <thead>
          <tr><th>Cittadinanza</th><th className="num">Entrati con eventi di sbarco</th><th className="col-barra-cit" aria-hidden="true" /></tr>
        </thead>
        <tbody>
          {d.righe.map((r) => (
            <tr key={r.nome}>
              <td className="nome-prov">{r.nome}</td>
              <td className="num">{r.testo ?? "—"}</td>
              <td className="col-barra-cit">
                {r.valore !== null && <span className="barra-pista" aria-hidden="true"><span className="barra" style={{ width: `${r.valore}%` }} /></span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="nota-tabella">
        {note.map((r) => <span key={r.nome}>{r.nome}: {r.nota} </span>)}
        Cittadinanze nell&apos;ordine del rapporto, che è per numero di ingressi. Le quote approssimate sono scritte con la parola del rapporto; la barra usa il valore
        numerico. Il Ministero del Lavoro divide gli ingressi in «eventi di sbarco» e «ritrovamenti nel territorio italiano, compresi quelli effettuati negli scali aeroportuali
        e marittimi e nei valichi terrestri». Il Ministero non distingue tra arrivi via terra e via aerea. Fonte: {d.fonte}.{" "}
        <Link href="/metodologia#minori" className="link-interno">Metodologia</Link>
      </p>
    </>
  );
}
