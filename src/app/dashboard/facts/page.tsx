import { redirect } from "next/navigation";
import { getUserAndHotel } from "@/lib/auth";
import { FactManager } from "@/components/fact-manager";

export default async function FactsPage() {
  const { user, hotel, hotelId, supabase, role } = await getUserAndHotel();
  if (!user) redirect("/login");
  if (!hotel || !hotelId) redirect("/dashboard");
  const { data: facts, error } = await supabase.from("hotel_facts")
    .select("id,category,question,answer,is_public,created_at")
    .eq("hotel_id", hotelId).order("created_at", { ascending: false });

  return <div className="space-y-2">
    <p className="text-sm font-medium text-teal">Contenu & informations</p>
    <h1 className="text-3xl font-bold text-ink">Base de connaissances</h1>
    <p className="mb-6 text-sm text-slate-500">Les réponses publiées peuvent être utilisées par le concierge. Les informations privées restent réservées à l'équipe.</p>
    {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">La base de connaissances n'a pas pu être chargée.</p>}
    <FactManager initialFacts={facts || []} hotelId={hotelId} canManage={role === "owner" || role === "manager"}/>
  </div>;
}
