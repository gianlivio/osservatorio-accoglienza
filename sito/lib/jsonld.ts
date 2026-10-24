export const dominio = "https://osservatorioaccoglienza.org";

export const creatore = {
  "@type": "Person",
  name: "Gianlivio Iemolo",
  url: "https://portfoliooo-main.vercel.app/it",
};
export const licenza = "https://creativecommons.org/licenses/by-sa/4.0/";
export const fonteAnac = "https://dati.anticorruzione.it";
export const fonteCentri = "https://centriditalia.it";

export const breadcrumb = (voci: { nome: string; percorso: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ nome: "Osservatorio Accoglienza", percorso: "/" }, ...voci].map((v, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: v.nome,
    item: `${dominio}${v.percorso === "/" ? "" : v.percorso}`,
  })),
});

export const distribuzioneCsv = (percorso: string) => ({
  "@type": "DataDownload",
  encodingFormat: "text/csv",
  contentUrl: `${dominio}${percorso}`,
});
