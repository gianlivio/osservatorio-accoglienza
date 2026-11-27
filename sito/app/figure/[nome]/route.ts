import { figure, type NomeFigura } from "@/lib/figure";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(figure).map((nome) => ({ nome }));
}

// Dati delle figure in rilievo, scaricati dal browser dopo il primo rendering.
export async function GET(_: Request, { params }: { params: Promise<{ nome: string }> }) {
  const { nome } = await params;
  return Response.json(figure[nome as NomeFigura]());
}
