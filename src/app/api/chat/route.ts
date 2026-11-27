import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { answerGuest } from "@/lib/ai";

const requestSchema = z.object({
  hotelId: z.string().uuid(),
  question: z.string().trim().min(2).max(1000)
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  try {
    const { hotelId, question } = parsed.data;
    const supabase = await createClient();
    const { data: hotel, error: hotelError } = await supabase
      .from("hotels").select("id,name,language").eq("id", hotelId).eq("is_active", true).single();
    if (hotelError || !hotel) return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });

    const { data: facts, error: factsError } = await supabase
      .from("hotel_facts").select("category,question,answer").eq("hotel_id", hotelId).eq("is_public", true).limit(100);
    if (factsError) throw factsError;
    if (!facts?.length) {
      return NextResponse.json({ answer: "Je ne dispose pas encore des informations nécessaires. La réception pourra vous renseigner." });
    }

    const answer = await answerGuest(question, { name: hotel.name, language: hotel.language, facts });
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("HospitIA chat error", error);
    return NextResponse.json({ answer: "Je rencontre une difficulté technique. Merci de contacter la réception." });
  }
}
