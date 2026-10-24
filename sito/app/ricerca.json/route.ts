import { province, slug, nomeProvincia } from "@/lib/dati";
import { enti, caricaEnte } from "@/lib/enti";
import { nomeEnte } from "@/lib/nomi";

export const dynamic = "force-static";

// Indice della ricerca: [nome, percorso, province]. Le province prima, poi gli enti per numero di contratti;
// per gli enti il terzo elemento elenca le province in cui operano, così una query può combinare ente e luogo.
export async function GET() {
  const voci: string[][] = province.map((p) => [nomeProvincia(p.provincia), `/provincia/${slug(p.provincia)}`]);
  for (const e of enti) {
    const d = await caricaEnte(e.slug);
    voci.push([nomeEnte(e.nome), `/ente/${e.slug}`, d.province.map((p) => nomeProvincia(p.provincia)).join(" ")]);
  }
  return Response.json(voci);
}
