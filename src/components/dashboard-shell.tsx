"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Brand } from "@/components/brand";
import type { HotelSummary } from "@/lib/auth";

const navigation = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: "⌂" },
  { href: "/dashboard/concierge", label: "Concierge IA", icon: "✧" },
  { href: "/dashboard/facts", label: "Base de connaissances", icon: "▤" },
  { href: "/dashboard/rooms", label: "Hébergement", icon: "▦" },
  { href: "/dashboard/requests", label: "Demandes clients", icon: "☷" },
  { href: "/dashboard/stats", label: "Statistiques", icon: "▥" },
  { href: "/dashboard/settings", label: "Paramètres", icon: "⚙" }
];

export function DashboardShell({
  children,
  hotels,
  activeHotel,
  role,
  email
}: {
  children: React.ReactNode;
  hotels: HotelSummary[];
  activeHotel: HotelSummary;
  role: string;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const [notice, setNotice] = useState("");

  async function switchHotel(hotelId: string) {
    setSwitching(true);
    setNotice("");
    try {
      const response = await fetch("/api/hotels/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId })
      });
      if (!response.ok) throw new Error("switch_failed");
      router.refresh();
    } catch {
      setNotice("Impossible de changer d'établissement. Réessayez.");
    } finally {
      setSwitching(false);
    }
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const roleLabel = role === "owner" ? "Propriétaire" : role === "manager" ? "Direction" : "Équipe";

  return (
    <div className="min-h-screen bg-mist text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[268px] flex-col border-r border-slate-200 bg-white px-5 py-6 md:flex">
        <Brand />
        <div className="mt-9 rounded-2xl bg-[#F0F6F6] p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Établissement actif</p>
          <p className="mt-1 truncate text-sm font-bold text-ink">{activeHotel.name}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{activeHotel.city || "Votre établissement"} · {activeHotel.country}</p>
          {hotels.length > 1 && (
            <select
              aria-label="Changer d'établissement"
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs"
              value={activeHotel.id}
              onChange={(event) => switchHotel(event.target.value)}
              disabled={switching}
            >
              {hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
            </select>
          )}
        </div>
        <nav className="mt-7 flex-1 space-y-1">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">GESTION HÔTELIÈRE</p>
          {navigation.map((item) => {
            const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-ink text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-ink"}`}
              >
                <span className={`grid h-6 w-6 place-items-center text-lg ${active ? "text-[#7BDFC5]" : "text-teal"}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <Link href={`/guest/${activeHotel.id}`} target="_blank" className="mt-5 flex items-center gap-3 rounded-xl border border-teal/20 bg-teal/5 px-3 py-3 text-sm font-semibold text-teal hover:bg-teal/10">
            <span className="grid h-6 w-6 place-items-center text-lg">↗</span>
            Ouvrir la vue client
          </Link>
        </nav>
        <div className="border-t border-slate-100 pt-4">
          <p className="truncate text-xs font-semibold text-ink">{email || "Compte connecté"}</p>
          <p className="mt-1 text-[11px] text-slate-500">{roleLabel} · Offre {activeHotel.plan}</p>
          <button onClick={signOut} className="mt-3 text-xs font-semibold text-slate-500 hover:text-red-600">Se déconnecter</button>
        </div>
      </aside>

      <div className="md:pl-[268px]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="md:hidden"><Brand /></div>
            <div className="hidden md:block">
              <p className="text-xs text-slate-500">Espace professionnel</p>
              <p className="text-sm font-semibold">{activeHotel.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {hotels.length > 1 && (
                <select
                  aria-label="Établissement"
                  className="max-w-[170px] rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs md:hidden"
                  value={activeHotel.id}
                  onChange={(event) => switchHotel(event.target.value)}
                  disabled={switching}
                >
                  {hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
                </select>
              )}
              <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">● Établissement actif</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#DDF2ED] text-xs font-bold text-teal">HI</span>
            </div>
          </div>
          <nav className="mt-3 flex gap-1 overflow-x-auto pb-1 md:hidden">
            {navigation.map((item) => {
              const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
              return <Link key={item.href} href={item.href} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${active ? "bg-ink text-white" : "bg-slate-100 text-slate-600"}`}>{item.label}</Link>;
            })}
            <Link href={`/guest/${activeHotel.id}`} target="_blank" className="shrink-0 rounded-lg bg-teal/10 px-3 py-2 text-xs font-semibold text-teal">Vue client ↗</Link>
          </nav>
        </header>
        {notice && <p role="alert" className="mx-auto mt-4 max-w-7xl px-6 text-sm text-red-600">{notice}</p>}
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-9">{children}</main>
      </div>
    </div>
  );
}
