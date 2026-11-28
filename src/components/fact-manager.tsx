"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Fact = { id: string; category: string; question: string; answer: string; is_public: boolean; created_at?: string };

export function FactManager({ initialFacts, hotelId, canManage }: { initialFacts: Fact[]; hotelId: string; canManage: boolean }) {
  const [facts, setFacts] = useState(initialFacts);
  const [category, setCategory] = useState("Services");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!canManage || busy) return;
    setBusy(true); setNotice("");
    try {
      const { data, error } = await createClient().from("hotel_facts")
        .insert({ hotel_id: hotelId, category: category.trim(), question: question.trim(), answer: answer.trim(), is_public: isPublic })
        .select("id,category,question,answer,is_public,created_at").single();
      if (error || !data) throw new Error("save_failed");
      setFacts(old => [data, ...old]);
      setQuestion(""); setAnswer(""); setIsPublic(false); setNotice("Information enregistrée.");
    } catch {
      setNotice("Enregistrement impossible. Vérifiez votre connexion et vos droits, puis réessayez.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublication(fact: Fact) {
    if (!canManage || busy) return;
    setBusy(true); setNotice("");
    try {
      const { data, error } = await createClient().from("hotel_facts")
        .update({ is_public: !fact.is_public }).eq("id", fact.id)
        .select("id,category,question,answer,is_public,created_at").single();
      if (error || !data) throw new Error("update_failed");
      setFacts(old => old.map(item => item.id === fact.id ? data : item));
    } catch {
      setNotice("Modification impossible. Actualisez la page et vérifiez vos droits.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(fact: Fact) {
    if (!canManage || busy || !window.confirm("Supprimer définitivement cette information ?")) return;
    setBusy(true); setNotice("");
    try {
      const { data, error } = await createClient().from("hotel_facts")
        .delete().eq("id", fact.id).select("id").single();
      if (error || !data) throw new Error("delete_failed");
      setFacts(old => old.filter(item => item.id !== fact.id));
      setNotice("Information supprimée.");
    } catch {
      setNotice("Suppression impossible. Actualisez la page et réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="space-y-5">
    {canManage && <form onSubmit={add} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4"><h2 className="font-bold text-ink">Ajouter une information vérifiée</h2><p className="mt-1 text-xs text-slate-500">Renseignez uniquement des éléments exacts et validés par votre établissement.</p></div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">Catégorie
          <select value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal">
            {["Services","Petit-déjeuner","Réception","Chambres","Restaurant","Spa","Accès et transport","Règlement","Autre"].map(item=><option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">Question fréquente
          <input required value={question} onChange={e=>setQuestion(e.target.value)} maxLength={300} placeholder="Ex. Quels sont les horaires du petit-déjeuner ?" className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"/>
        </label>
      </div>
      <label className="mt-3 block text-xs font-semibold text-slate-600">Réponse officielle
        <textarea required value={answer} onChange={e=>setAnswer(e.target.value)} maxLength={3000} rows={3} placeholder="Rédigez la réponse validée par l'hôtel…" className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"/>
      </label>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} className="h-4 w-4 accent-teal"/> Publier pour les clients dans le concierge IA</label>
        <button disabled={busy || !question.trim() || !answer.trim()} className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Enregistrement…" : "Ajouter l'information"}</button>
      </div>
    </form>}

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold text-ink">Informations disponibles</h2><p className="mt-1 text-xs text-slate-500">{facts.length} entrée(s) · {facts.filter(f=>f.is_public).length} publiée(s)</p></div><span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">Données de votre hôtel</span></div>
      {notice && <p role="status" className="mt-3 rounded-lg bg-teal/5 p-3 text-xs text-teal">{notice}</p>}
      <div className="mt-4 space-y-3">
        {facts.map(fact=><article key={fact.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal">{fact.category}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${fact.is_public ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{fact.is_public ? "Publiée au concierge" : "Privée"}</span></div>
          <p className="mt-2 text-sm font-semibold text-ink">{fact.question}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{fact.answer}</p>
          {canManage && <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>togglePublication(fact)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-teal disabled:opacity-50">{fact.is_public ? "Dépublier" : "Publier"}</button><button type="button" disabled={busy} onClick={()=>remove(fact)} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Supprimer</button></div>}
        </article>)}
        {!facts.length && <div className="py-12 text-center"><div className="text-3xl text-slate-300">▤</div><p className="mt-2 font-semibold text-ink">Votre base est encore vide</p><p className="mt-1 text-xs text-slate-500">Ajoutez vos horaires, services, accès et réponses aux questions fréquentes.</p></div>}
      </div>
    </section>
  </div>;
}
