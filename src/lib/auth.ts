import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type HotelSummary = {
  id: string;
  name: string;
  city: string | null;
  country: "FR" | "CH";
  language: string;
  plan: string;
};

export async function getUserAndHotel() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as Record<string, unknown> | undefined;
  const userId = !error && typeof claims?.sub === "string" ? claims.sub : null;
  const email = typeof claims?.email === "string" ? claims.email : null;

  if (!userId) {
    return { supabase, user: null, hotels: [] as HotelSummary[], hotel: null, hotelId: null, role: null };
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("hotel_members")
    .select("hotel_id, role")
    .eq("user_id", userId);

  if (membershipError || !memberships?.length) {
    return { supabase, user: { id: userId, email }, hotels: [] as HotelSummary[], hotel: null, hotelId: null, role: null };
  }

  const hotelIds = memberships.map((membership) => membership.hotel_id);
  const { data: hotels } = await supabase
    .from("hotels")
    .select("id,name,city,country,language,plan")
    .in("id", hotelIds)
    .order("name");

  const availableHotels = (hotels || []) as HotelSummary[];
  const cookieStore = await cookies();
  const requestedHotelId = cookieStore.get("hospitia_active_hotel")?.value;
  const hotel = availableHotels.find((item) => item.id === requestedHotelId) || availableHotels[0] || null;
  const membership = memberships.find((item) => item.hotel_id === hotel?.id);

  return {
    supabase,
    user: { id: userId, email },
    hotels: availableHotels,
    hotel,
    hotelId: hotel?.id ?? null,
    role: membership?.role ?? null
  };
}
