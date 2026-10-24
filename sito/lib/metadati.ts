export function metadatiPagina(title: string, description: string) {
  return {
    title,
    description,
    openGraph: {
      title, description, type: "website", locale: "it_IT",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Osservatorio Accoglienza" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}
