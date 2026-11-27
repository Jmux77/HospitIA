import { redirect } from "next/navigation";
import { getUserAndHotel } from "@/lib/auth";
import { RequestManager } from "@/components/request-manager";

export default async function RequestsPage() {
  const { supabase, hotel, hotelId } = await getUserAndHotel();
  if (!hotel || !hotelId) redirect("/dashboard");
  const { data } = await supabase.from("guest_requests")
    .select("id,guest_name,room_number,category,message,status,source,created_at")
    .eq("hotel_id", hotelId).order("created_at", { ascending: false }).limit(100);
  return <div className="space-y-2">
    <p className="text-sm font-medium text-teal">Relation client</p>
    <h1 className="text-3xl font-bold text-ink">Demandes clients</h1>
    <p className="mb-6 text-sm text-slate-500">Retrouvez les demandes envoyées depuis le concierge et suivez leur prise en charge.</p>
    <RequestManager initialRequests={data || []}/>
  </div>;
}
