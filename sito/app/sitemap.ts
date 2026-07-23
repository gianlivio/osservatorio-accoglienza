import type { MetadataRoute } from "next";
import { province, slug } from "@/lib/dati";

const dominio = "https://osservatorioaccoglienza.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const pagine = ["/", "/che-cose", "/minori", "/metodologia"].map((percorso) => ({
    url: `${dominio}${percorso}`,
  }));
  const province_ = province.map((p) => ({
    url: `${dominio}/provincia/${slug(p.provincia)}`,
  }));
  return [...pagine, ...province_];
}
