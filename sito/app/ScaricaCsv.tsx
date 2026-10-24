import { licenza } from "@/lib/jsonld";

export default function ScaricaCsv({ percorso, rss }: { percorso: string; rss?: string }) {
  return (
    <p className="nota-tabella">
      <a href={percorso} download className="link-interno">Scarica i dati (CSV)</a>
      {rss && <>{" "}· <a href={rss} className="link-interno">Segui gli aggiornamenti (RSS)</a></>}
      {" "}· Fonte: ANAC · Licenza{" "}
      <a href={licenza} target="_blank" rel="noopener">CC BY-SA 4.0</a>
    </p>
  );
}
