"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function GuestChat({ hotelId, hotelName, language = "fr" }: { hotelId: string; hotelName: string; language?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Bonjour et bienvenue à ${hotelName} ! Je suis votre concierge virtuel. Comment puis-je faciliter votre séjour ?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [category, setCategory] = useState("Service en chambre");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestNotice, setRequestNotice] = useState("");
  const [requestBusy, setRequestBusy] = useState(false);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    setMessages(old => [...old, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId, question })
      });
      const data = await response.json();
      setMessages(old => [...old, {
        role: "assistant",
        content: data.answer || data.error || "La réception pourra vous renseigner."
      }]);
    } catch {
      setMessages(old => [...old, { role: "assistant", content: "Une erreur est survenue. Merci de contacter la réception." }]);
    } finally {
      setLoading(false);
    }
  }

  async function submitRequest(event: React.FormEvent) {
    event.preventDefault();
    setRequestBusy(true); setRequestNotice("");
    try {
      const response = await fetch("/api/guest-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId, guestName, roomNumber, category, message: requestMessage })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Votre demande n'a pas pu être transmise.");
      setRequestNotice(data.message);
      setRequestMessage("");
    } catch (error) {
      setRequestNotice(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setRequestBusy(false);
    }
  }

  return <div className="mt-6">
    <div aria-live="polite" className="flex min-h-64 flex-col gap-3">
      {messages.map((message, index) => <div key={index} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl p-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-ink text-white" : "bg-mist text-ink"}`}>
        <p className={`mb-1 text-[10px] font-bold uppercase tracking-[0.12em] ${message.role === "user" ? "text-white/60" : "text-teal"}`}>{message.role === "user" ? "Vous" : "HospitIA"}</p>
        {message.content}
      </div>)}
      {loading && <p className="text-xs text-slate-400">HospitIA prépare une réponse…</p>}
    </div>

    <div className="mt-5 flex flex-wrap gap-2">
      {["Quels sont les horaires du petit-déjeuner ?", "Quel est le code Wi-Fi ?", "À quelle heure est le check-out ?"].map(question => <button key={question} type="button" onClick={()=>setInput(question)} className="rounded-full border border-slate-200 px-3 py-1.5 text-left text-[11px] text-slate-600 hover:border-teal hover:text-teal">{question}</button>)}
    </div>
    <form onSubmit={send} className="mt-4 flex gap-2">
      <input aria-label="Votre question" value={input} onChange={event=>setInput(event.target.value)} placeholder="Posez votre question…" maxLength={1000} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/10"/>
      <button disabled={loading || !input.trim()} className="rounded-xl bg-teal px-4 text-sm font-semibold text-white disabled:opacity-40">Envoyer</button>
    </form>

    <div className="mt-5 border-t border-slate-100 pt-4">
      <button type="button" onClick={()=>setShowRequest(value=>!value)} className="text-sm font-semibold text-teal">{showRequest ? "Fermer le formulaire" : "Besoin d'une intervention de la réception ? →"}</button>
      {showRequest && <form onSubmit={submitRequest} className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-ink">Transmettre une demande à la réception</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Votre nom (facultatif)<input value={guestName} onChange={e=>setGuestName(e.target.value)} maxLength={100} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-normal"/></label>
          <label className="text-xs font-semibold text-slate-600">Numéro de chambre (facultatif)<input value={roomNumber} onChange={e=>setRoomNumber(e.target.value)} maxLength={30} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-normal"/></label>
        </div>
        <label className="block text-xs font-semibold text-slate-600">Type de demande<select value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-normal"><option>Service en chambre</option><option>Housekeeping</option><option>Maintenance</option><option>Restaurant</option><option>Réservation</option><option>Autre demande</option></select></label>
        <label className="block text-xs font-semibold text-slate-600">Votre demande<textarea required minLength={5} maxLength={1500} rows={3} value={requestMessage} onChange={e=>setRequestMessage(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-normal" placeholder="Décrivez brièvement votre besoin…"/></label>
        <button disabled={requestBusy || requestMessage.trim().length<5} className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{requestBusy ? "Transmission…" : "Envoyer à la réception"}</button>
        {requestNotice && <p role="status" className="text-xs text-teal">{requestNotice}</p>}
      </form>}
    </div>
    <p className="mt-5 text-center text-[10px] leading-5 text-slate-400">Assistant virtuel. Ne transmettez pas de données bancaires, de documents d'identité ou d'informations sensibles. En cas d'urgence, contactez directement la réception.</p>
  </div>;
}
