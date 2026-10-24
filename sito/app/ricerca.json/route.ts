import { province, slug, nomeProvincia } from "@/lib/dati";
import { enti } from "@/lib/enti";

export const dynamic = "force-static";

// Indice della ricerca: [nome, percorso]. Le province prima, poi gli enti per numero di contratti.
export function GET() {
  const voci = [
    ...province.map((p) => [nomeProvincia(p.provincia), `/provincia/${slug(p.provincia)}`]),
    ...enti.map((e) => [e.nome, `/ente/${e.slug}`]),
  ];
  return Response.json(voci);
}
