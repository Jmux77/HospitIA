import { createClient } from "@/lib/supabase/server";

export async function getUserAndHotel() {
  const supabase = await createClient();
  // Verify JWT claims before using the subject to scope tenant queries.
  const { data: { claims }, error } = await supabase.auth.getClaims();
  const userId = !error && typeof claims?.sub === "string" ? claims.sub : null;
  if (!userId) return { supabase, user: null, hotelId: null };

  const { data: membership } = await supabase
    .from("hotel_members")
    .select("hotel_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    supabase,
    user: { id: userId },
    hotelId: membership?.hotel_id ?? null
  };
}
