"use client";
import { useState } from "react";
import { nItal } from "@/lib/dati";
import type { CittadinanzaAnno } from "@/lib/cittadinanza";

export default function Cittadinanze({ anni }: { anni: CittadinanzaAnno[] }) {
  const [anno, setAnno] = useState(anni[anni.length - 1].anno);
  const d = anni.find((a) => a.anno === anno)!;
  const max = Math.max(...d.righe.map((r) => r.presenti), 1);
  return (
    <>
      <div className="periodi" role="group" aria-label="Anno">
        {anni.map((a) => (
          <button key={a.anno} type="button" className={"periodo" + (anno === a.anno ? " attivo" : "")} onClick={() => setAnno(a.anno)}>
            {a.anno}
          </button>
        ))}
      </div>
      <table className="tabella">
        <caption className="sr-only">Minori non accompagnati presenti al 31 dicembre {d.anno}, per cittadinanza</caption>
        <thead>
          <tr><th>Cittadinanza</th><th className="num">Presenti</th><th className="col-barra-cit" aria-hidden="true" /></tr>
        </thead>
        <tbody>
          {d.righe.map((r) => (
            <tr key={r.nome}>
              <td className="nome-prov">{r.nome}</td>
              <td className="num">{nItal(r.presenti)}</td>
              <td className="col-barra-cit"><span className="barra-pista" aria-hidden="true"><span className="barra" style={{ width: `${(r.presenti / max) * 100}%` }} /></span></td>
            </tr>
          ))}
          <tr>
            <td className="nome-prov">Altre cittadinanze</td>
            <td className="num">{nItal(d.altre)}</td>
            <td className="col-barra-cit"><span className="barra-pista" aria-hidden="true"><span className="barra barra-resto" style={{ width: `${(d.altre / max) * 100}%` }} /></span></td>
          </tr>
          <tr className="riga-totale">
            <td className="nome-prov">Totale</td>
            <td className="num">{nItal(d.totale)}</td>
            <td className="col-barra-cit" />
          </tr>
        </tbody>
      </table>
      <p className="nota-tabella">
        Fonte: Ministero del Lavoro, {d.fonte.replace(/\.pdf$/, "")}, p. {d.pagina}.
        {d.tipo === "testo" && <> Dal 2023 i rapporti semestrali riportano nel testo solo le prime {d.righe.length} cittadinanze.</>}
      </p>
    </>
  );
}
