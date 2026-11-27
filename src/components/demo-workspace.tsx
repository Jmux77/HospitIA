"use client";

import Link from "next/link";
import { useState } from "react";
import { Brand } from "@/components/brand";

type Section = "overview" | "rooms" | "requests" | "knowledge" | "concierge";

const navigation: { id: Section; label: string; icon: string }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: "▦" },
  { id: "rooms", label: "Chambres", icon: "▥" },
  { id: "requests", label: "Demandes clients", icon: "☷" },
  { id: "knowledge", label: "Base de connaissances", icon: "▤" },
  { id: "concierge", label: "Concierge IA", icon: "✧" }
];

const sampleRooms = [
  { number: "101", type: "Classique", floor: "1", status: "available" },
  { number: "102", type: "Supérieure", floor: "1", status: "occupied" },
  { number: "103", type: "Classique", floor: "1", status: "to_clean" },
  { number: "201", type: "Suite", floor: "2", status: "occupied" },
  { number: "202", type: "Supérieure", floor: "2", status: "available" },
  { number: "203", type: "Classique", floor: "2", status: "out_of_service" }
];

const sampleRequests = [
  { title: "Oreiller supplémentaire", room: "102", guest: "Sophie M.", time: "Il y a 8 min", status: "open" },
  { title: "Réservation d'une table au restaurant", room: "201", guest: "Thomas B.", time: "Il y a 22 min", status: "in_progress" },
  { title: "Information sur le parking", room: "—", guest: "Client en pré-arrivée", time: "Il y a 45 min", status: "closed" }
];

const sampleFacts = [
  { category: "Petit-déjeuner", question: "Quels sont les horaires du petit-déjeuner ?", answer: "Tous les jours, de 7 h à 10 h 30.", public: true },
  { category: "Réception", question: "La réception est-elle ouverte la nuit ?", answer: "Notre équipe est disponible 24 h/24.", public: true },
  { category: "Services", question: "Les animaux sont-ils acceptés ?", answer: "Merci de contacter la réception pour connaître les conditions.", public: false }
];

const statusLabels: Record<string, string> = {
  available: "Disponible",
  occupied: "Occupée",
  to_clean: "À nettoyer",
  out_of_service: "Hors service",
  open: "À traiter",
  in_progress: "En cours",
  closed: "Terminée"
};

const statusClasses: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700",
  occupied: "bg-blue-50 text-blue-700",
  to_clean: "bg-amber-50 text-amber-700",
  out_of_service: "bg-slate-100 text-slate-600",
  open: "bg-amber-50 text-amber-700",
  in_progress: "bg-blue-50 text-blue-700",
  closed: "bg-emerald-50 text-emerald-700"
};

function Metric({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-slate-500">{label}</p><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E4F6F0] text-lg text-teal">{icon}</span></div>
    <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</p>
    <p className="mt-1 text-xs text-slate-400">{detail}</p>
  </article>;
}

function Status({ value }: { value: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClasses[value] || "bg-slate-100 text-slate-600"}`}>{statusLabels[value] || value}</span>;
}

export function DemoWorkspace() {
  const [active, setActive] = useState<Section>("overview");
  const [roomFilter, setRoomFilter] = useState("all");
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);
  const [question, setQuestion] = useState("");
  const [sent, setSent] = useState(false);

  const title = navigation.find(item => item.id === active)?.label || "Vue d'ensemble";
  const rooms = sampleRooms.filter(room => roomFilter === "all" || room.status === roomFilter);
  const facts = sampleFacts.filter(fact => !showOnlyPublic || fact.public);

  return <main className="min-h-screen bg-[#F3F6F8] text-ink">
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5 lg:flex">
        <Brand />
        <div className="mt-9 rounded-2xl bg-[#F0F6F6] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal">Établissement de démonstration</p>
          <p className="mt-2 font-bold text-ink">Hôtel Rivage</p>
          <p className="mt-1 text-xs text-slate-500">Annecy · France</p>
        </div>
        <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Espace hôtelier</p>
        <nav className="space-y-1">
          {navigation.map(item => <button key={item.id} onClick={() => setActive(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active === item.id ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100"}`}>
            <span className="text-lg">{item.icon}</span>{item.label}
          </button>)}
        </nav>
        <div className="mt-auto rounded-2xl bg-ink p-4 text-white">
          <p className="text-xs font-bold text-[#7BDFC5]">Une question ?</p>
          <p className="mt-2 text-xs leading-5 text-slate-300">Découvrez comment HospitIA peut accompagner votre établissement.</p>
          <Link href="/register" className="mt-3 inline-flex rounded-lg bg-[#7BDFC5] px-3 py-2 text-xs font-bold text-ink">Créer mon espace</Link>
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="lg:hidden"><Brand compact /></div>
            <div className="hidden lg:block"><p className="text-xs text-slate-400">Hôtel Rivage / Démonstration</p><h1 className="mt-1 text-xl font-bold">{title}</h1></div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Mode démo</span>
              <Link href="/" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Quitter la démo</Link>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navigation.map(item => <button key={item.id} onClick={() => setActive(item.id)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${active === item.id ? "bg-ink text-white" : "bg-slate-100 text-slate-600"}`}>{item.label}</button>)}
          </nav>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-7">
          <div className="rounded-2xl border border-teal/20 bg-[#EAF7F3] px-4 py-3 text-xs leading-5 text-teal sm:px-5">
            <strong>Maquette interactive :</strong> vous explorez un hôtel fictif. Aucune donnée client réelle n'est affichée et aucune action n'est enregistrée.
          </div>

          {active === "overview" && <div className="space-y-6">
            <div><p className="text-sm font-medium text-teal">Vendredi · Hôtel Rivage</p><h2 className="mt-1 text-2xl font-bold sm:text-3xl">Bonjour, bienvenue sur HospitIA.</h2><p className="mt-2 text-sm text-slate-500">Voici un aperçu de l'activité de votre établissement.</p></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Chambres disponibles" value="18 / 24" detail="75 % du parc" icon="▥" />
              <Metric label="Demandes à traiter" value="6" detail="2 nouvelles aujourd'hui" icon="☷" />
              <Metric label="Conversations IA" value="128" detail="Sur les 7 derniers jours" icon="✧" />
              <Metric label="Informations publiées" value="24" detail="Dans votre base de connaissances" icon="▤" />
            </div>
            <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between"><div><h3 className="font-bold">Activité du concierge</h3><p className="mt-1 text-xs text-slate-500">Conversations fictives sur la semaine</p></div><span className="text-xl text-teal">↗</span></div>
                <div className="mt-6 flex h-40 items-end gap-3 border-b border-slate-100 pb-2">{[{d:"Lun",v:46},{d:"Mar",v:68},{d:"Mer",v:54},{d:"Jeu",v:88},{d:"Ven",v:72},{d:"Sam",v:100},{d:"Dim",v:62}].map(item=><div key={item.d} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-10 rounded-t-lg bg-teal/80" style={{height:item.v+"%"}}/><span className="text-[10px] text-slate-400">{item.d}</span></div>)}</div>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold">À suivre aujourd'hui</h3><div className="mt-4 space-y-4">
                  {sampleRequests.map(item=><div key={item.title} className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-400">Chambre {item.room} · {item.time}</p></div><Status value={item.status}/></div>)}
                </div><button onClick={()=>setActive("requests")} className="mt-5 text-xs font-bold text-teal">Voir toutes les demandes →</button>
              </section>
            </div>
          </div>}

          {active === "rooms" && <div className="space-y-5">
            <div><h2 className="text-2xl font-bold">Gestion des chambres</h2><p className="mt-2 text-sm text-slate-500">Visualisez le statut des chambres et les priorités de l'équipe.</p></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[{s:"available",n:"18"},{s:"occupied",n:"4"},{s:"to_clean",n:"1"},{s:"out_of_service",n:"1"}].map(item=><div key={item.s} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{statusLabels[item.s]}</p><p className="mt-2 text-2xl font-bold">{item.n}</p></div>)}</div>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold">État du parc</h3><select value={roomFilter} onChange={e=>setRoomFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white p-2 text-xs"><option value="all">Toutes les chambres</option><option value="available">Disponibles</option><option value="occupied">Occupées</option><option value="to_clean">À nettoyer</option><option value="out_of_service">Hors service</option></select></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{rooms.map(room=><article key={room.number} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between"><p className="font-bold">Chambre {room.number}</p><Status value={room.status}/></div><p className="mt-2 text-xs text-slate-500">{room.type} · Étage {room.floor}</p></article>)}</div>
            </section>
          </div>}

          {active === "requests" && <div className="space-y-5">
            <div><h2 className="text-2xl font-bold">Demandes clients</h2><p className="mt-2 text-sm text-slate-500">Centralisez les besoins des voyageurs et suivez leur traitement.</p></div>
            <div className="grid grid-cols-3 gap-3">{[{label:"À traiter",value:"6",color:"text-amber-700"},{label:"En cours",value:"3",color:"text-blue-700"},{label:"Terminées",value:"19",color:"text-emerald-700"}].map(item=><div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{item.label}</p><p className={`mt-2 text-2xl font-bold ${item.color}`}>{item.value}</p></div>)}</div>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-bold">Dernières demandes</h3><div className="mt-4 space-y-3">{sampleRequests.map(item=><article key={item.title} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{item.title}</p><Status value={item.status}/></div><p className="mt-2 text-xs text-slate-500">{item.guest} · Chambre {item.room} · {item.time}</p></article>)}</div></section>
          </div>}

          {active === "knowledge" && <div className="space-y-5">
            <div><h2 className="text-2xl font-bold">Base de connaissances</h2><p className="mt-2 text-sm text-slate-500">Les réponses officielles alimentent le concierge et évitent les informations inventées.</p></div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm font-semibold">Informations de démonstration</p><label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={showOnlyPublic} onChange={e=>setShowOnlyPublic(e.target.checked)} className="accent-teal"/> Afficher uniquement les informations publiées</label></div>
            <div className="space-y-3">{facts.map(fact=><article key={fact.question} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-wide text-teal">{fact.category}</span><Status value={fact.public?"available":"out_of_service"}/></div><h3 className="mt-3 font-bold">{fact.question}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{fact.answer}</p><p className="mt-3 text-[10px] text-slate-400">{fact.public?"Visible par le concierge client":"Information privée pour l'équipe"}</p></article>)}</div>
          </div>}

          {active === "concierge" && <div className="space-y-5">
            <div><h2 className="text-2xl font-bold">Concierge IA</h2><p className="mt-2 text-sm text-slate-500">Un accueil multilingue disponible à tout moment, à partir des informations publiées par l'hôtel.</p></div>
            <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-ink px-6 py-5 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7BDFC5]">Concierge virtuel · Hôtel Rivage</p><h3 className="mt-2 text-xl font-bold">Bonjour et bienvenue !</h3><p className="mt-1 text-sm text-slate-300">Comment puis-je faciliter votre séjour ?</p></div>
              <div className="space-y-4 p-5 sm:p-6"><div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#F0F6F6] p-4 text-sm leading-6 text-slate-700">Bonjour ! Je suis le concierge virtuel de l'Hôtel Rivage. Posez-moi une question sur nos services.</div>{sent && <><div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-ink p-4 text-sm text-white">{question}</div><div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#F0F6F6] p-4 text-sm leading-6 text-slate-700">Merci pour votre question. Dans cette maquette, la réponse est simulée. Dans HospitIA, le concierge répond à partir des informations validées par l'établissement.</div></>}
                <form onSubmit={e=>{e.preventDefault();if(question.trim()){setSent(true);}}} className="flex gap-2"><input value={question} onChange={e=>{setQuestion(e.target.value);setSent(false);}} placeholder="Posez une question…" maxLength={300} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal"/><button disabled={!question.trim()} className="rounded-xl bg-teal px-4 text-sm font-semibold text-white disabled:opacity-40">Envoyer</button></form>
                <p className="text-center text-[10px] text-slate-400">Conversation simulée · Aucun message n'est envoyé à un service externe.</p>
              </div>
            </section>
          </div>}

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400"><span>HospitIA · Hospitality Intelligence</span><Link href="/register" className="font-bold text-teal">Créer votre espace hôtelier →</Link></footer>
        </div>
      </section>
    </div>
  </main>;
}
