const ACCENTI: Record<string, string> = { a: "à", e: "è", i: "ì", o: "ò", u: "ù" };
const SIGLE = new Set(["srl", "spa", "onlus", "aps", "odv", "scs", "rti", "ati", "ets", "arl", "sas", "arci"]);
const MINUSCOLE = new Set(["e", "di", "del", "della", "dei", "per", "in", "a"]);
const ROMANO = /^(x{0,3})(ix|iv|v?i{0,3})$/;

export function nomeEnte(nome: string) {
  return nome.trim().split(/\s+/).map((w, i) => {
    const x = w.toLowerCase().replace(/([aeiou])'(?=$|[^\p{L}])/gu, (_, v: string) => ACCENTI[v]);
    const lettere = x.replace(/[^\p{L}]/gu, "");
    if (!/[aeiouàèìòù]/.test(lettere) || SIGLE.has(lettere) || (lettere.length > 1 && ROMANO.test(lettere)))
      return w.toUpperCase();
    if (i > 0 && MINUSCOLE.has(x)) return x;
    return x.replace(/(^|[^\p{L}'])(\p{L})|(')(\p{L})(?=\p{L})/gu,
      (m, p?: string, c?: string, a?: string, d?: string) => (c ? p + c.toUpperCase() : a! + d!.toUpperCase()));
  }).join(" ");
}
