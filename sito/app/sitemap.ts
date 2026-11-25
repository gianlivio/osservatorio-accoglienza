import type { MetadataRoute } from "next";
import { enti } from "@/lib/enti";
import { province, slug, aggiornato } from "@/lib/dati";
import { paesi, dati as datiPaesi } from "@/lib/paesi";

const dominio = "https://osservatorioaccoglienza.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const pagine = ["/", "/che-cose", "/minori", "/metodologia", "/quanto-costa", "/dieci-anni", "/paesi"].map((percorso) => ({
    url: `${dominio}${percorso}`,
    ...((percorso === "/" || percorso === "/dieci-anni") && { lastModified: aggiornato }),
  }));
  const province_ = province.map((p) => ({
    url: `${dominio}/provincia/${slug(p.provincia)}`,
    lastModified: aggiornato,
  }));
  const paesi_ = paesi.map((p) => ({ url: `${dominio}/paesi/${p.slug}`, lastModified: datiPaesi.estratto }));
  const enti_ = enti.filter((e) => e.affidamenti >= 2).map((e) => ({
    url: `${dominio}/ente/${e.slug}`,
    lastModified: aggiornato,
  }));
  return [...pagine, ...province_, ...paesi_, ...enti_];
}
