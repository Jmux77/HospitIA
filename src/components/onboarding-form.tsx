"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm() {
  const router=useRouter();
  const [name,setName]=useState("");
  const [city,setCity]=useState("");
  const [country,setCountry]=useState("FR");
  const [language,setLanguage]=useState("fr");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent) {
    event.preventDefault();setBusy(true);setNotice("");
    try {
      const response=await fetch("/api/hotels/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,city,country,language})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"La création de votre établissement a échoué.");
      router.replace("/dashboard");router.refresh();
    } catch(error) {
      setNotice(error instanceof Error?error.message:"Une erreur est survenue.");
    } finally {setBusy(false);}
  }
  return <form onSubmit={submit} className="mt-6 space-y-4">
    <label className="block text-xs font-semibold text-slate-600">Nom commercial de l'hôtel ou de la résidence<input required maxLength={150} value={name} onChange={e=>setName(e.target.value)} placeholder="Ex. Hôtel Belle Rive" className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"/></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-xs font-semibold text-slate-600">Ville<input maxLength={100} value={city} onChange={e=>setCity(e.target.value)} placeholder="Ex. Annecy" className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"/></label>
      <label className="block text-xs font-semibold text-slate-600">Pays<select value={country} onChange={e=>setCountry(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal"><option value="FR">France</option><option value="CH">Suisse</option></select></label>
    </div>
    <label className="block text-xs font-semibold text-slate-600">Langue principale du concierge<select value={language} onChange={e=>setLanguage(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal"><option value="fr">Français</option><option value="en">English</option><option value="it">Italiano</option><option value="de">Deutsch</option><option value="es">Español</option></select></label>
    <div className="rounded-xl bg-[#F0F6F6] p-4 text-xs leading-5 text-slate-600">Votre compte sera créé avec le rôle Propriétaire. Les autres collaborateurs pourront être ajoutés au fur et à mesure de l'évolution de la plateforme.</div>
    <button disabled={busy||!name.trim()} className="w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white disabled:opacity-50">{busy?"Configuration…":"Créer mon établissement"}</button>
    {notice&&<p role="alert" className="text-sm text-red-600">{notice}</p>}
  </form>;
}
