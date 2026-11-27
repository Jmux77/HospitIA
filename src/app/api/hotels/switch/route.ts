import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ hotelId: z.string().uuid() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Établissement invalide." }, { status: 400 });

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (error || typeof userId !== "string") {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from("hotel_members")
      .select("hotel_id")
      .eq("hotel_id", parsed.data.hotelId)
      .eq("user_id", userId)
      .maybeSingle();

    if (membershipError) {
      console.error("HospitIA hotel switch lookup failed:", membershipError.code || "database_error");
      return NextResponse.json({ error: "Vérification des accès impossible. Réessayez." }, { status: 503 });
    }
    if (!membership) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set("hospitia_active_hotel", parsed.data.hotelId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Impossible de changer d'établissement pour le moment." }, { status: 503 });
  }
}
