import { dominio } from "@/lib/jsonld";
import { aggiornato, euro, slug } from "@/lib/dati";
import { nomeEnte } from "@/lib/nomi";

export type VoceFeed = {
  cig: string; data: string; oggetto: string; amministrazione: string; ente: string | null;
  procedura: string; modalita: string; base: number | null; aggiudicato: number | null;
  provincia: string | null;
};

// Caratteri non ammessi in XML 1.0, poi le cinque entità.
const xml = (t: string) =>
  t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const rfc822 = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`).toUTCString();

function titolo(oggetto: string, cig: string) {
  const t = oggetto.replace(/\s+/g, " ").trim();
  if (!t) return `Contratto ${cig}`;
  if (t.length <= 110) return t;
  const taglio = t.slice(0, 110);
  return taglio.slice(0, Math.max(taglio.lastIndexOf(" "), 60)).replace(/[\s,;:.\-–]+$/, "") + "…";
}

function descrizione(v: VoceFeed) {
  const procedura = v.procedura.toLowerCase();
  const gara = v.modalita === "diretto" ? " (senza gara)" : v.modalita === "gara" ? " (con gara)" : "";
  const importo = v.aggiudicato !== null ? `importo assegnato ${euro(v.aggiudicato)}`
    : v.base !== null ? `importo a bando ${euro(v.base)}` : null;
  return [
    v.amministrazione && `Ufficio: ${nomeEnte(v.amministrazione)}`,
    v.ente && `Assegnato a: ${nomeEnte(v.ente)}`,
    importo && importo[0].toUpperCase() + importo.slice(1),
    `Procedura: ${procedura}${gara}`,
  ].filter(Boolean).map((t) => (t as string).replace(/\.$/, "")).join(". ") + ".";
}

export function rss(c: { titolo: string; descrizione: string; link: string; self: string; voci: VoceFeed[] }) {
  const items = c.voci.map((v) => {
    const link = v.provincia ? `${dominio}/provincia/${slug(v.provincia)}` : dominio;
    return `    <item>
      <title>${xml(titolo(v.oggetto, v.cig))}</title>
      <link>${xml(link)}</link>
      <description>${xml(descrizione(v))}</description>
      <guid isPermaLink="false">${xml(v.cig)}</guid>
      <pubDate>${rfc822(v.data)}</pubDate>
    </item>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(c.titolo)}</title>
    <link>${xml(c.link)}</link>
    <description>${xml(c.descrizione)}</description>
    <language>it-IT</language>
    <lastBuildDate>${rfc822(aggiornato)}</lastBuildDate>
    <atom:link href="${xml(c.self)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

export const rispostaRss = (corpo: string) =>
  new Response(corpo, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });

export const piuRecenti = <T extends { data: string; cig: string }>(voci: T[], n: number) =>
  [...voci].sort((a, b) => b.data.localeCompare(a.data) || b.cig.localeCompare(a.cig)).slice(0, n);
