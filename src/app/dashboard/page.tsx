import Link from "next/link";
import {redirect} from "next/navigation";
import {getUserAndHotel} from "@/lib/auth";
import {Brand} from "@/components/brand";
export default async function Dashboard(){
 const {user,hotelId,supabase}=await getUserAndHotel();if(!user)redirect("/login");
 if(!hotelId)return <main className="mx-auto max-w-3xl p-8"><Brand/><h1 className="mt-10 text-2xl font-bold">Établissement non configuré</h1><p className="mt-3 text-slate-600">Contactez l'équipe HospitIA pour rattacher votre compte.</p></main>;
 const [{data:hotel},{count:facts},{count:conversations},{count:requests}]=await Promise.all([
  supabase.from("hotels").select("name,city,plan").eq("id",hotelId).single(),
  supabase.from("hotel_facts").select("*",{count:"exact",head:true}).eq("hotel_id",hotelId),
  supabase.from("conversations").select("*",{count:"exact",head:true}).eq("hotel_id",hotelId),
  supabase.from("guest_requests").select("*",{count:"exact",head:true}).eq("hotel_id",hotelId).eq("status","open")
 ]);
 return <main className="mx-auto min-h-screen max-w-6xl px-6 py-8"><header className="flex items-center justify-between"><Brand/><form action="/auth/signout" method="post"><button className="text-sm text-slate-500">Déconnexion</button></form></header><div className="mt-10"><p className="text-sm text-slate-500">Espace établissement</p><h1 className="mt-1 text-3xl font-bold">{hotel?.name||"Mon hôtel"}</h1><p className="mt-1 text-slate-500">{hotel?.city||""} · Offre {hotel?.plan||"Starter"}</p></div><div className="mt-8 grid gap-4 md:grid-cols-3">{[["Informations validées",facts??0],["Conversations",conversations??0],["Demandes ouvertes",requests??0]].map(([label,value])=><div key={label} className="rounded-2xl border bg-white p-6"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div><div className="mt-8 grid gap-4 md:grid-cols-2"><Link href="/dashboard/facts" className="rounded-2xl border bg-white p-6 hover:border-teal"><h2 className="font-bold">Base de connaissances →</h2><p className="mt-2 text-sm text-slate-500">Gérez les réponses officielles de votre établissement.</p></Link><Link href={`/guest/${hotelId}`} className="rounded-2xl border bg-white p-6 hover:border-teal"><h2 className="font-bold">Ouvrir le concierge →</h2><p className="mt-2 text-sm text-slate-500">Voir le parcours client.</p></Link></div></main>;
}