"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Fact = {
  id: string;
  category: string;
  question: string;
  answer: string;
  is_public: boolean;
};

export function FactManager({ initialFacts }: { initialFacts: Fact[] }) {
  const [facts, setFacts] = useState(initialFacts);
  const [category, setCategory] = useState("Services");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [notice, setNotice] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    const { data: member } = await db
      .from("hotel_members")
      .select("hotel_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      setNotice("Aucun établissement n'est associé à ce compte.");
      return;
    }

    const { data, error } = await db
      .from("hotel_facts")
      .insert({ hotel_id: member.hotel_id, category, question, answer, is_public: isPublic })
      .select("id,category,question,answer,is_public")
      .single();

    if (error) {
      setNotice("Enregistrement impossible. Vérifiez vos droits et réessayez.");
      return;
    }

    setFacts([data, ...facts]);
    setQuestion("");
    setAnswer("");
    setIsPublic(false);
    setNotice("Information enregistrée.");
  }

  async function togglePublication(fact: Fact) {
    setNotice("");
    const { data, error } = await createClient()
      .from("hotel_facts")
      .update({ is_public: !fact.is_public })
      .eq("id", fact.id)
      .select("id,category,question,answer,is_public")
      .single();

    if (error || !data) {
      setNotice("Modification impossible. Vérifiez vos droits.");
      return;
    }
    setFacts(facts.map(item => item.id === fact.id ? data : item));
  }

  async function remove(id: string) {
    const { error } = await createClient().from("hotel_facts").delete().eq("id", id);
    if (error) {
      setNotice("Suppression impossible. Vérifiez vos droits.");
      return;
    }
    setFacts(facts.filter(fact => fact.id !== id));
  }

  return (
    <div className="mt-8">
      <form onSubmit={add} className="space-y-3 rounded-2xl border bg-white p-5">
        <h2 className="font-bold">Ajouter une information vérifiée</h2>
        <input value={category} onChange={e => setCategory(e.target.value)}
          placeholder="Catégorie (ex. Petit-déjeuner)" className="w-full rounded-xl border p-3" />
        <input required value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="Question (ex. Quels sont les horaires ?)" className="w-full rounded-xl border p-3" />
        <textarea required value={answer} onChange={e => setAnswer(e.target.value)}
          placeholder="Réponse officielle de l'hôtel" rows={3} className="w-full rounded-xl border p-3" />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
          Publier cette information pour les clients dans le concierge IA
        </label>
        <button className="rounded-xl bg-ink px-5 py-3 font-semibold text-white">Enregistrer</button>
        {notice && <p role="status" className="text-sm text-teal">{notice}</p>}
      </form>

      <h2 className="mt-8 font-bold">Informations disponibles ({facts.length})</h2>
      <div className="mt-3 space-y-3">
        {facts.map(fact => (
          <div key={fact.id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase text-teal">{fact.category}</span>
              <div className="flex items-center gap-3">
                <span className={fact.is_public ? "text-xs text-emerald-700" : "text-xs text-slate-500"}>
                  {fact.is_public ? "Publié" : "Privé"}
                </span>
                <button type="button" onClick={() => togglePublication(fact)} className="text-xs text-teal underline">
                  {fact.is_public ? "Dépublier" : "Publier"}
                </button>
                <button type="button" onClick={() => remove(fact.id)} className="text-xs text-red-600">
                  Supprimer
                </button>
              </div>
            </div>
            <p className="mt-2 font-semibold">{fact.question}</p>
            <p className="mt-1 text-sm text-slate-600">{fact.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
