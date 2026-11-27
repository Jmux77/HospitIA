import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clientAddress } from "@/lib/rate-limit";

const schema = z.object({
  hotelId: z.string().uuid(),
  guestName: z.string().trim().max(100).optional().default(""),
  roomNumber: z.string().trim().max(30).optional().default(""),
  category: z.string().trim().max(80).optional().default("Demande client"),
  message: z.string().trim().min(5).max(1500)
});

export async function POST(request: Request) {
  const address = clientAddress(request);
  const limit = checkRateLimit(`guest-request:${address}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Trop de demandes. Réessayez dans quelques instants." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifiez les informations de votre demande." }, { status: 400 });
  const value = parsed.data;
  const supabase = await createClient();

  const { data: hotel } = await supabase.from("hotels").select("id").eq("id", value.hotelId).eq("is_active", true).maybeSingle();
  if (!hotel) return NextResponse.json({ error: "Cet établissement n'est pas disponible." }, { status: 404 });

  const { error } = await supabase.from("guest_requests").insert({
    hotel_id: value.hotelId,
    guest_name: value.guestName || null,
    room_number: value.roomNumber || null,
    category: value.category || "Demande client",
    message: value.message
  });

  if (error) {
    console.error("HospitIA guest request save failed:", error.code || "database_error");
    return NextResponse.json({ error: "Votre demande n'a pas pu être transmise. Merci de contacter la réception." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Votre demande a bien été transmise à la réception." });
}
