import { redirect } from "next/navigation";
import { getUserAndHotel } from "@/lib/auth";
import { FactManager } from "@/components/fact-manager";

export default async function FactsPage() {
  const { user, hotelId, supabase } = await getUserAndHotel();
  if (!user) redirect("/login");
  if (!hotelId) redirect("/dashboard");

  const { data: facts } = await supabase
    .from("hotel_facts")
    .select("id,category,question,answer,is_public")
    .eq("hotel_id", hotelId)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <a href="/dashboard" className="text-sm text-teal">← Tableau de bord</a>
      <h1 className="mt-5 text-3xl font-bold">Base de connaissances</h1>
      <p className="mt-2 text-slate-600">
        Les informations publiques peuvent être utilisées par le concierge client.
        Les informations privées restent réservées à l'équipe de l'hôtel.
      </p>
      <FactManager initialFacts={facts || []} />
    </main>
  );
}
