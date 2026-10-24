import type { MetadataRoute } from "next";
import { enti } from "@/lib/enti";
import { province, slug, aggiornato } from "@/lib/dati";

const dominio = "https://osservatorioaccoglienza.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const pagine = ["/", "/che-cose", "/minori", "/metodologia"].map((percorso) => ({
    url: `${dominio}${percorso}`,
    ...(percorso === "/" && { lastModified: aggiornato }),
  }));
  const province_ = province.map((p) => ({
    url: `${dominio}/provincia/${slug(p.provincia)}`,
    lastModified: aggiornato,
  }));
  const enti_ = enti.filter((e) => e.affidamenti >= 2).map((e) => ({
    url: `${dominio}/ente/${e.slug}`,
    lastModified: aggiornato,
  }));
  return [...pagine, ...province_, ...enti_];
}
