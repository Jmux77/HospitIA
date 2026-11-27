import { redirect } from "next/navigation";
import { getUserAndHotel } from "@/lib/auth";

function Stat({title,value,sub}: {title:string;value:number|string;sub:string}) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold text-ink">{value}</p><p className="mt-1 text-xs text-slate-400">{sub}</p></div>;
}

export default async function StatsPage() {
  const {supabase,hotel,hotelId}=await getUserAndHotel();
  if(!hotel||!hotelId) redirect("/dashboard");
  const now=new Date();
  const dayStart=new Date(now.getFullYear(),now.getMonth(),now.getDate()).toISOString();
  const weekStart=new Date(Date.now()-7*86400000).toISOString();
  const monthStart=new Date(now.getFullYear(),now.getMonth(),1).toISOString();
  const [{count:today},{count:week},{count:month},{count:openRequests},{count:published},{count:allFacts},{data:recent}] = await Promise.all([
    supabase.from("conversations").select("id",{count:"exact",head:true}).eq("hotel_id",hotelId).gte("created_at",dayStart),
    supabase.from("conversations").select("id",{count:"exact",head:true}).eq("hotel_id",hotelId).gte("created_at",weekStart),
    supabase.from("conversations").select("id",{count:"exact",head:true}).eq("hotel_id",hotelId).gte("created_at",monthStart),
    supabase.from("guest_requests").select("id",{count:"exact",head:true}).eq("hotel_id",hotelId).eq("status","open"),
    supabase.from("hotel_facts").select("id",{count:"exact",head:true}).eq("hotel_id",hotelId).eq("is_public",true),
    supabase.from("hotel_facts").select("id",{count:"exact",head:true}).eq("hotel_id",hotelId),
    supabase.from("conversations").select("created_at").eq("hotel_id",hotelId).gte("created_at",weekStart)
  ]);
  const days=Array.from({length:7},(_,i)=>{const d=new Date(Date.now()-(6-i)*86400000);return {label:d.toLocaleDateString("fr-FR",{weekday:"short"}),key:d.toISOString().slice(0,10)};});
  const daily=days.map(day=>({ ...day, value:(recent||[]).filter(row=>row.created_at.slice(0,10)===day.key).length }));
  const max=Math.max(1,...daily.map(d=>d.value));
  return <div className="space-y-6">
    <div><p className="text-sm font-medium text-teal">Performance</p><h1 className="text-3xl font-bold text-ink">Statistiques</h1><p className="mt-2 text-sm text-slate-500">Indicateurs calculés à partir des activités enregistrées pour {hotel.name}.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat title="Conversations aujourd'hui" value={today||0} sub="Échanges clients enregistrés"/>
      <Stat title="7 derniers jours" value={week||0} sub="Conversations sur la semaine"/>
      <Stat title="Ce mois-ci" value={month||0} sub="Depuis le premier du mois"/>
      <Stat title="Demandes à traiter" value={openRequests||0} sub="En attente d'une réponse"/>
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-ink">Activité quotidienne</h2><p className="mt-1 text-xs text-slate-500">Nombre de conversations par jour · 7 derniers jours</p>
      <div className="mt-7 flex h-52 items-end gap-3 border-b border-slate-100 pb-2">
        {daily.map(d=><div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-semibold text-slate-500">{d.value}</span><div className="flex w-full max-w-12 items-end rounded-t-lg bg-teal/10" style={{height:`${Math.max(4,d.value/max*78)}%`}}><div className="w-full rounded-t-lg bg-teal" style={{height:"100%"}}/></div><span className="text-[10px] capitalize text-slate-500">{d.label}</span></div>)}
      </div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-ink">Qualité de la base de connaissances</h2>
      <p className="mt-1 text-xs text-slate-500">La couverture de votre concierge dépend des informations publiées et maintenues à jour.</p>
      <div className="mt-5 flex items-center justify-between text-sm"><span className="text-slate-600">Informations publiées</span><strong className="text-ink">{published||0} / {allFacts||0}</strong></div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal" style={{width:`${allFacts ? Math.round((published||0)/allFacts*100) : 0}%`}}/></div>
      <p className="mt-2 text-xs text-slate-500">{allFacts ? Math.round((published||0)/allFacts*100) : 0}% de vos informations sont publiées.</p>
    </section>
    <p className="text-xs text-slate-400">Les taux d'occupation et la satisfaction client seront ajoutés lorsque les réservations et avis seront intégrés. HospitIA n'affiche pas de chiffres estimés en tant que données réelles.</p>
  </div>;
}
