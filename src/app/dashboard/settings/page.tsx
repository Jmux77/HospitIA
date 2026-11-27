import { redirect } from "next/navigation";
import { getUserAndHotel } from "@/lib/auth";
import { HotelSettings } from "@/components/hotel-settings";

export default async function SettingsPage() {
  const {hotel,hotelId,role}=await getUserAndHotel();
  if(!hotel||!hotelId) redirect("/dashboard");
  return <div className="space-y-2">
    <p className="text-sm font-medium text-teal">Configuration</p><h1 className="text-3xl font-bold text-ink">Paramètres</h1>
    <p className="mb-6 text-sm text-slate-500">Personnalisez les informations de votre établissement et la langue du concierge.</p>
    <HotelSettings hotel={hotel} canManage={role==="owner"||role==="manager"}/>
  </div>;
}
