import Link from "next/link";
import { Brand } from "@/components/brand";

const features=[
  {icon:"✧",title:"Concierge intelligent",text:"Répondez aux questions récurrentes et orientez vos voyageurs à toute heure."},
  {icon:"文",title:"Accueil multilingue",text:"Accompagnez les clients internationaux dans leur langue, avec des réponses vérifiées."},
  {icon:"☷",title:"Demandes centralisées",text:"Transmettez les besoins clients à la réception et suivez leur prise en charge."},
  {icon:"▦",title:"Outils hôteliers",text:"Gérez vos chambres, vos informations et l'activité de votre établissement."}
];

export default function Home() {
  return <main className="min-h-screen overflow-hidden bg-white">
    <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <Brand/>
      <nav className="flex items-center gap-3"><Link href="/login" className="hidden text-sm font-semibold text-slate-600 hover:text-ink sm:inline">Connexion</Link><Link href="/register" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700">Créer mon espace</Link></nav>
    </header>
    <section className="relative bg-[#102B38] px-5 py-20 text-white sm:px-8 sm:py-28">
      <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-teal/20 blur-3xl"/>
      <div className="absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-[#7BDFC5]/10 blur-3xl"/>
      <div className="relative mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-[#9CE8D5]"><span>✧</span> LE CONCIERGE DES HÔTELS INDÉPENDANTS</div>
          <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">L'hospitalité humaine, <span className="text-[#7BDFC5]">augmentée par l'intelligence.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Un concierge IA qui informe vos voyageurs, facilite le travail de vos équipes et valorise chaque moment du séjour.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/register" className="rounded-xl bg-[#7BDFC5] px-6 py-3.5 text-sm font-bold text-ink hover:bg-[#A4ECD9]">Découvrir HospitIA</Link><Link href="/login" className="rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10">Accéder à mon espace</Link></div>
          <p className="mt-6 text-xs text-slate-400">Pensé pour les hôtels et résidences en France et en Suisse.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
          <div className="rounded-2xl bg-white p-5 text-ink sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E4F6F0] text-xl text-teal">✧</span><div><p className="font-bold">Concierge HospitIA</p><p className="text-xs text-slate-500">Assistant virtuel de l'hôtel</p></div></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">En ligne</span></div>
            <div className="space-y-4 py-6 text-sm"><div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-ink p-4 text-white">Bonjour, à quelle heure est servi le petit-déjeuner ?</div><div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-[#F0F6F6] p-4 leading-6 text-slate-700">Bonjour et bienvenue ! Le petit-déjeuner est servi de 7h00 à 10h30 dans notre salle de restaurant. Excellent séjour !</div><div className="flex items-center gap-2 text-[10px] text-slate-400"><span className="h-2 w-2 rounded-full bg-teal"/> Réponse fondée sur les informations publiées par l'hôtel</div></div>
            <div className="flex gap-2 rounded-xl border border-slate-200 p-2"><span className="flex-1 px-2 py-2 text-xs text-slate-400">Posez votre question…</span><span className="rounded-lg bg-teal px-3 py-2 text-xs font-bold text-white">Envoyer</span></div>
          </div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Une plateforme pensée pour l'hôtellerie</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Plus de disponibilité pour l'accueil. Moins de répétition pour les équipes.</h2><p className="mt-4 leading-7 text-slate-600">HospitIA rassemble le concierge digital, les informations de l'établissement et le suivi des demandes au même endroit.</p></div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(feature=><article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E4F6F0] text-xl text-teal">{feature.icon}</span><h3 className="mt-5 font-bold text-ink">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{feature.text}</p></article>)}</div>
    </section>
    <section className="bg-[#F0F6F6] px-5 py-16 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Prêt à commencer ?</p><h2 className="mt-2 text-3xl font-bold text-ink">Offrez à vos clients un accueil toujours disponible.</h2><p className="mt-2 text-sm text-slate-500">Créez votre établissement et configurez vos premières informations.</p></div><Link href="/register" className="rounded-xl bg-ink px-6 py-3.5 text-sm font-bold text-white">Créer un compte HospitIA →</Link></div></section>
    <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-7 text-xs text-slate-500 sm:px-8"><Brand compact/><span>© {new Date().getFullYear()} HospitIA · Hospitality Intelligence</span><Link href="/login" className="font-semibold text-teal">Espace hôtelier</Link></footer>
  </main>;
}
