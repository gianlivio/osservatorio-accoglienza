"use client";
import { useState } from "react";
import { euro, type Contratto } from "@/lib/dati";

export default function ElencoContratti({ contratti }: { contratti: Contratto[] }) {
  const [anno, setAnno] = useState("tutti");
  const [quanti, setQuanti] = useState(40);

  const anniDisponibili = Array.from(new Set(contratti.map((c) => c.data.slice(0, 4)))).sort().reverse();
  const filtrati = anno === "tutti" ? contratti : contratti.filter((c) => c.data.startsWith(anno));
  const mostrati = filtrati.slice(0, quanti);

  return (
    <>
      <div className="periodi">
        <button type="button" className={"periodo" + (anno === "tutti" ? " attivo" : "")}
          onClick={() => { setAnno("tutti"); setQuanti(40); }}>tutti</button>
        {anniDisponibili.map((a) => (
          <button key={a} type="button" className={"periodo" + (anno === a ? " attivo" : "")}
            onClick={() => { setAnno(a); setQuanti(40); }}>{a}</button>
        ))}
        <span className="conteggio-prov">{filtrati.length} contratti</span>
      </div>

      <ul className="contratti">
        {mostrati.map((c, i) => (
          <li key={c.cig + "-" + i} className="contratto">
            <div className="riga-alta">
              <span className="data-c">{c.data}</span>
              <span className={"badge badge-" + c.modalita}>
                {c.modalita === "diretto" ? "affidamento diretto"
                  : c.modalita === "negoziata" ? "negoziata, senza bando"
                  : c.modalita === "gara" ? "gara con bando"
                  : "altra procedura"}
              </span>
              {c.da_accordo && <span className="badge badge-neutro">da accordo quadro</span>}
              {c.confidenza === "probabile" && <span className="badge badge-neutro" title="Il contratto è stato incluso automaticamente sulla base di parole generiche: potrebbe non riguardare l'accoglienza di migranti.">da verificare</span>}
            </div>
            <p className="oggetto">{c.oggetto}</p>
            <dl className="dettagli">
              <div><dt>Ufficio</dt><dd>{c.amministrazione}</dd></div>
              {c.ente && <div><dt>Assegnato a</dt><dd>{c.ente}</dd></div>}
              <div><dt>Importo a bando</dt><dd>{euro(c.base)}</dd></div>
              {c.aggiudicato !== null && <div><dt>Importo assegnato</dt><dd>{euro(c.aggiudicato)}</dd></div>}
              {c.durata_gg && <div><dt>Durata</dt><dd>{c.durata_gg} giorni</dd></div>}
              <div><dt>Procedura</dt><dd>{c.procedura.toLowerCase()}</dd></div>
              <div><dt>Codice gara</dt><dd className="mono">{c.cig}</dd></div>
            </dl>
          </li>
        ))}
      </ul>

      {mostrati.length < filtrati.length && (
        <button type="button" className="periodo altri" onClick={() => setQuanti(quanti + 60)}>
          mostra altri {Math.min(60, filtrati.length - mostrati.length)} →
        </button>
      )}
    </>
  );
}
