import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndHotel } from "@/lib/auth";

export default async function ConciergePage() {
  const { supabase, hotel, hotelId } = await getUserAndHotel();
  if (!hotel || !hotelId) redirect("/dashboard");
  const { data: conversations } = await supabase.from("conversations")
    .select("id,channel,guest_question,assistant_answer,created_at")
    .eq("hotel_id", hotelId).order("created_at", { ascending: false }).limit(50);
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/guest/${hotelId}`;

  return <div className="space-y-6">
    <div><p className="text-sm font-medium text-teal">Expérience voyageur</p><h1 className="text-3xl font-bold text-ink">Concierge IA</h1><p className="mt-2 text-sm text-slate-500">Consultez les conversations et partagez le concierge de {hotel.name}.</p></div>
    <section className="rounded-2xl bg-ink p-6 text-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7BDFC5]">Votre concierge client</p><h2 className="mt-2 text-2xl font-bold">Accessible par lien ou QR code</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Partagez cette adresse avec vos voyageurs, par e-mail ou via un QR code imprimé à la réception.</p></div><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-3xl text-[#7BDFC5]">✧</span></div>
      <div className="mt-5 flex flex-wrap gap-2"><Link href={`/guest/${hotelId}`} target="_blank" className="rounded-xl bg-[#7BDFC5] px-4 py-2.5 text-sm font-bold text-ink">Tester le concierge ↗</Link><span className="break-all rounded-xl border border-white/15 px-4 py-2.5 text-xs text-slate-200">/guest/{hotelId}</span></div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><div><h2 className="font-bold text-ink">Historique des conversations</h2><p className="mt-1 text-xs text-slate-500">{conversations?.length || 0} conversation(s) récentes</p></div><span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">Enregistrement activé</span></div>
      <div className="mt-4 space-y-3">
        {conversations?.map(item=><article key={item.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-ink">{item.guest_question}</p><span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString("fr-FR")}</span></div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.assistant_answer}</p>
        </article>)}
        {!conversations?.length && <div className="py-12 text-center"><p className="font-semibold text-ink">Aucune conversation</p><p className="mt-1 text-xs text-slate-500">Les questions clients apparaîtront ici après leur première utilisation.</p></div>}
      </div>
    </section>
    <p className="text-xs text-slate-400">Les conversations sont visibles uniquement par les membres autorisés de cet établissement. Évitez de saisir des données personnelles ou sensibles dans les échanges.</p>
  </div>;
}
