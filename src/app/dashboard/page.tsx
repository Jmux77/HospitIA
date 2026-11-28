import Link from "next/link";
import { getUserAndHotel } from "@/lib/auth";

function Metric({ label, value, detail, icon }: { label: string; value: number | string; detail: string; icon: string }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><span className="grid h-9 w-9 place-items-center rounded-xl bg-teal/10 text-lg text-teal">{icon}</span></div>
    <p className="mt-4 text-3xl font-bold tracking-tight text-ink">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{detail}</p>
  </section>;
}

export default async function DashboardPage() {
  const { supabase, hotel, hotelId } = await getUserAndHotel();
  if (!hotel || !hotelId) return null;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [
    { count: factsCount },
    { count: publishedCount },
    { count: conversationsCount },
    { count: requestsOpen },
    { count: roomsCount },
    { count: occupiedCount },
    { data: recentRequests },
    { data: recentConversations }
  ] = await Promise.all([
    supabase.from("hotel_facts").select("id", { count: "exact", head: true }).eq("hotel_id", hotelId),
    supabase.from("hotel_facts").select("id", { count: "exact", head: true }).eq("hotel_id", hotelId).eq("is_public", true),
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("hotel_id", hotelId).gte("created_at", since),
    supabase.from("guest_requests").select("id", { count: "exact", head: true }).eq("hotel_id", hotelId).eq("status", "open"),
    supabase.from("hotel_rooms").select("id", { count: "exact", head: true }).eq("hotel_id", hotelId),
    supabase.from("hotel_rooms").select("id", { count: "exact", head: true }).eq("hotel_id", hotelId).eq("status", "occupied"),
    supabase.from("guest_requests").select("id,guest_name,room_number,category,message,status,created_at").eq("hotel_id", hotelId).order("created_at", { ascending: false }).limit(5),
    supabase.from("conversations").select("id,guest_question,assistant_answer,created_at").eq("hotel_id", hotelId).order("created_at", { ascending: false }).limit(5)
  ]);

  const occupancy = roomsCount ? Math.round(((occupiedCount || 0) / roomsCount) * 100) : null;

  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-sm font-medium text-teal">Espace établissement</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Bonjour, {hotel.name}</h1><p className="mt-2 text-sm text-slate-500">Voici l'activité réelle de votre établissement.</p></div>
      <Link href={`/guest/${hotel.id}`} target="_blank" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Voir le concierge ↗</Link>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Questions traitées · 7 jours" value={conversationsCount || 0} detail="Conversations enregistrées" icon="✧"/>
      <Metric label="Demandes à traiter" value={requestsOpen || 0} detail="En attente de votre équipe" icon="☷"/>
      <Metric label="Base de connaissances" value={factsCount || 0} detail={`${publishedCount || 0} informations publiées`} icon="▤"/>
      <Metric label="Occupation des chambres" value={occupancy === null ? "—" : `${occupancy}%`} detail={roomsCount ? `${occupiedCount || 0} sur ${roomsCount} chambres occupées` : "Ajoutez vos chambres pour suivre l'occupation"} icon="▦"/>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><div><h2 className="font-bold text-ink">Demandes récentes</h2><p className="mt-1 text-xs text-slate-500">Suivez les besoins signalés par vos clients.</p></div><Link href="/dashboard/requests" className="text-xs font-semibold text-teal">Tout voir →</Link></div>
        <div className="mt-5 divide-y divide-slate-100">
          {recentRequests?.length ? recentRequests.map((item) => <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#E8F4F1] text-teal">☷</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink">{item.category || "Demande client"}</p><p className="mt-1 truncate text-xs text-slate-500">{item.guest_name || "Client"}{item.room_number ? ` · Chambre ${item.room_number}` : ""} · {item.message}</p></div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.status === "closed" ? "bg-emerald-50 text-emerald-700" : item.status === "in_progress" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{item.status === "closed" ? "Terminée" : item.status === "in_progress" ? "En cours" : "À traiter"}</span>
          </div>) : <div className="py-10 text-center"><p className="text-sm font-semibold text-ink">Aucune demande pour le moment</p><p className="mt-1 text-xs text-slate-500">Les demandes envoyées par vos clients apparaîtront ici.</p></div>}
        </div>
      </section>

      <section className="rounded-2xl bg-ink p-5 text-white shadow-sm">
        <div className="flex items-center gap-2 text-[#7BDFC5]"><span className="text-xl">✧</span><p className="text-xs font-bold uppercase tracking-[0.16em]">Concierge HospitIA</p></div>
        <h2 className="mt-4 text-2xl font-bold">Votre accueil, disponible à toute heure.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Publiez les informations vérifiées de votre hôtel pour alimenter les réponses de l'assistant.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/dashboard/facts" className="rounded-xl bg-[#7BDFC5] px-4 py-2.5 text-sm font-bold text-ink">Compléter les informations</Link>
          <Link href="/dashboard/concierge" className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white">Voir les conversations</Link>
        </div>
      </section>
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><div><h2 className="font-bold text-ink">Dernières conversations</h2><p className="mt-1 text-xs text-slate-500">Questions envoyées au concierge public.</p></div><Link href="/dashboard/concierge" className="text-xs font-semibold text-teal">Historique →</Link></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {recentConversations?.length ? recentConversations.map((item) => <article key={item.id} className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold text-ink">{item.guest_question}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{item.assistant_answer}</p><p className="mt-3 text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString("fr-FR")}</p></article>) : <p className="py-5 text-sm text-slate-500">Les conversations s'afficheront dès les premiers échanges clients.</p>}
      </div>
    </section>
  </div>;
}
