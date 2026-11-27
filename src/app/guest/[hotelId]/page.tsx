import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuestChat } from "@/components/guest-chat";

export default async function GuestPage({params}:{params:Promise<{hotelId:string}>}) {
  const {hotelId}=await params;
  const supabase=await createClient();
  const {data:hotel,error}=await supabase.from("hotels")
    .select("id,name,city,language").eq("id",hotelId).eq("is_active",true).single();
  if(error||!hotel) notFound();

  return <main className="min-h-screen bg-[#F0F5F5] px-4 py-8">
    <div className="mx-auto max-w-xl">
      <div className="mb-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">Hospitality Intelligence</p><p className="mt-1 text-[10px] text-slate-400">Powered by HospitIA</p></div>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="bg-ink px-6 py-6 text-white">
          <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7BDFC5]">Concierge virtuel</p><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-semibold text-emerald-200">● En ligne</span></div>
          <h1 className="mt-3 text-2xl font-bold">{hotel.name}</h1>
          {hotel.city&&<p className="mt-1 text-sm text-slate-300">{hotel.city}</p>}
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">Bonjour ! Comment pouvons-nous rendre votre séjour plus agréable ?</p>
        </div>
        <div className="p-5 sm:p-6"><GuestChat hotelId={hotel.id} hotelName={hotel.name} language={hotel.language}/></div>
      </section>
      <p className="mt-5 text-center text-xs text-slate-400">Votre séjour, notre attention. · {hotel.name}</p>
    </div>
  </main>;
}
