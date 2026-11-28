import { redirect } from "next/navigation";
import { getUserAndHotel } from "@/lib/auth";
import { RoomManager } from "@/components/room-manager";

export default async function RoomsPage() {
  const { supabase, hotel, hotelId, role } = await getUserAndHotel();
  if (!hotel || !hotelId) redirect("/dashboard");
  const { data } = await supabase.from("hotel_rooms").select("id,room_number,room_type,floor,status").eq("hotel_id", hotelId).order("room_number");
  return <div className="space-y-2">
    <p className="text-sm font-medium text-teal">Exploitation</p>
    <h1 className="text-3xl font-bold text-ink">Hébergement</h1>
    <p className="mb-6 text-sm text-slate-500">État du parc de chambres de {hotel.name}. Les modifications sont enregistrées dans votre base.</p>
    <RoomManager initialRooms={data || []} hotelId={hotelId} canManage={role === "owner" || role === "manager"}/>
  </div>;
}
