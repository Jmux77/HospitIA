import Link from "next/link";
export default function DemoPage() {
  return <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
    <Link href="/" className="text-sm text-teal">← Retour à HospitIA</Link>
    <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-teal">Démonstration statique</p>
      <h1 className="mt-2 text-3xl font-bold">Concierge HospitIA</h1>
      <p className="mt-2 text-slate-500">Aperçu de l'expérience client. Les horaires et informations ci-dessous sont fictifs.</p>
      <div className="mt-8 space-y-4 text-sm">
        <div className="ml-auto max-w-[85%] rounded-2xl bg-ink p-4 text-white">À quelle heure est servi le petit-déjeuner ?</div>
        <div className="max-w-[85%] rounded-2xl bg-mist p-4">Dans cet hôtel de démonstration, le petit-déjeuner est indiqué de 7h00 à 10h00. Pour un établissement réel, la réponse sera basée sur ses informations validées.</div>
        <div className="ml-auto max-w-[85%] rounded-2xl bg-ink p-4 text-white">Puis-je demander un départ tardif ?</div>
        <div className="max-w-[85%] rounded-2xl bg-mist p-4">Je peux transmettre votre demande à la réception, qui confirmera la disponibilité et le tarif.</div>
      </div>
      <Link href="/login" className="mt-8 inline-flex rounded-xl bg-ink px-5 py-3 font-semibold text-white">Accéder à l'espace hôtelier</Link>
    </div>
  </main>;
}
