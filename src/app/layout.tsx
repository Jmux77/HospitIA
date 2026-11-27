import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HospitIA — L'hospitalité augmentée",
  description: "Concierge IA multilingue et plateforme de gestion pour hôtels indépendants en France et en Suisse.",
  applicationName: "HospitIA"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
