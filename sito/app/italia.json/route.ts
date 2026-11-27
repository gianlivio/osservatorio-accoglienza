import { datiItalia } from "@/lib/italiaDati";

export const dynamic = "force-static";

// Dati della figura 3D della home, scaricati dal browser dopo il primo rendering.
export function GET() {
  return Response.json(datiItalia);
}
