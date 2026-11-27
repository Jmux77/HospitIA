"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HotelSummary } from "@/lib/auth";

export function HotelSettings({hotel,canManage}:{hotel:HotelSummary;canManage:boolean}) {
  const [name,setName]=useState(hotel.name);
  const [city,setCity]=useState(hotel.city||"");
  const [country,setCountry]=useState(hotel.country);
  const [language,setLanguage]=useState(hotel.language||"fr");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  async function save(e:React.FormEvent) {
    e.preventDefault();setBusy(true);setNotice("");
    const {error}=await createClient().from("hotels").update({name:name.trim(),city:city.trim()||null,country,language}).eq("id",hotel.id);
    setBusy(false);
    if(error){setNotice("Impossible d'enregistrer. Seuls les propriétaires et responsables peuvent modifier ces paramètres.");return;}
    setNotice("Les informations de l'établissement ont été mises à jour.");
  }
  return <div className="max-w-3xl space-y-5">
    <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-ink">Identité de l'établissement</h2><p className="mt-1 text-xs text-slate-500">Ces informations sont utilisées dans l'accueil client et par le concierge IA.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">Nom de l'établissement<input disabled={!canManage} required value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal disabled:bg-slate-50"/></label>
        <label className="text-xs font-semibold text-slate-600">Ville<input disabled={!canManage} value={city} onChange={e=>setCity(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal disabled:bg-slate-50"/></label>
        <label className="text-xs font-semibold text-slate-600">Pays<select disabled={!canManage} value={country} onChange={e=>setCountry(e.target.value as "FR"|"CH")} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal disabled:bg-slate-50"><option value="FR">France</option><option value="CH">Suisse</option></select></label>
        <label className="text-xs font-semibold text-slate-600">Langue par défaut du concierge<select disabled={!canManage} value={language} onChange={e=>setLanguage(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal disabled:bg-slate-50"><option value="fr">Français</option><option value="en">English</option><option value="it">Italiano</option><option value="de">Deutsch</option><option value="es">Español</option></select></label>
      </div>
      {canManage ? <button disabled={busy} className="mt-5 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy?"Enregistrement…":"Enregistrer les modifications"}</button> : <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Votre rôle permet de consulter les paramètres, mais pas de les modifier.</p>}
      {notice&&<p role="status" className="mt-3 text-sm text-teal">{notice}</p>}
    </form>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-ink">Confidentialité et sécurité</h2><div className="mt-4 space-y-3 text-sm"><div className="flex items-center justify-between gap-3"><span className="text-slate-600">Isolation des établissements (RLS)</span><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Activée</span></div><div className="flex items-center justify-between gap-3"><span className="text-slate-600">Clés privées côté serveur</span><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Respecté</span></div><div className="flex items-center justify-between gap-3"><span className="text-slate-600">Limitation anti-abus distribuée</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">À renforcer</span></div></div></section>
  </div>;
}
