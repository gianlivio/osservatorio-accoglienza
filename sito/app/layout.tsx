import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { anni } from "@/lib/dati";

export const metadata: Metadata = {
  title: "Osservatorio Accoglienza",
  description:
    "Come lo Stato italiano compra l'accoglienza dei migranti: affidamenti, importi ed enti gestori, provincia per provincia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="guscio">
          <header className="testata">
            <Link href="/" className="marchio">Osservatorio Accoglienza</Link>
            <span className="meta"><Link href="/metodologia">Metodologia e limiti</Link> · dati {anni[0]}–{anni[anni.length - 1]} · fonte ANAC</span>
          </header>
          {children}
          <footer className="pie">
            Dati aperti dell&apos;Autorità Nazionale Anticorruzione, Banca Dati Nazionale
            dei Contratti Pubblici.<br />
            Il perimetro è ricostruito per filtro testuale e codice CPV: è approssimato
            e viene corretto nel tempo. Gli importi non vanno sommati, perché gli accordi
            quadro riportano il tetto pluriennale di spesa.<br />
            Codice e metodo su github.com/gianlivio/osservatorio-accoglienza
          </footer>
        </div>
      </body>
    </html>
  );
}
