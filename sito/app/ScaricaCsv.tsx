import { licenza } from "@/lib/jsonld";

export default function ScaricaCsv({ percorso }: { percorso: string }) {
  return (
    <p className="nota-tabella">
      <a href={percorso} download className="link-interno">Scarica i dati (CSV)</a>
      {" "}· Fonte: ANAC · Licenza{" "}
      <a href={licenza} target="_blank" rel="noopener">CC BY-SA 4.0</a>
    </p>
  );
}
