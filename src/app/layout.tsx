import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "HospitIA — Concierge hôtelier intelligent", description: "Concierge IA multilingue pour hôtels indépendants en France et en Suisse." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="fr"><body>{children}</body></html>;
}