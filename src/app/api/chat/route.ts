import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { answerGuest } from "@/lib/ai";
import { checkRateLimit, clientAddress } from "@/lib/rate-limit";

const requestSchema = z.object({
  hotelId: z.string().uuid(),
  question: z.string().trim().min(2).max(1000)
});

export async function POST(request: Request) {
  const address = clientAddress(request);
  const limit = checkRateLimit(`chat:${address}`, 15, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Trop de messages. Réessayez dans quelques instants." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Votre message n'est pas valide." }, { status: 400 });

  const { hotelId, question } = parsed.data;
  const supabase = await createClient();

  try {
    const { data: hotel, error: hotelError } = await supabase
      .from("hotels").select("id,name,language").eq("id", hotelId).eq("is_active", true).single();
    if (hotelError || !hotel) return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });

    const { data: facts, error: factsError } = await supabase
      .from("hotel_facts").select("category,question,answer")
      .eq("hotel_id", hotelId).eq("is_public", true).limit(100);
    if (factsError) throw factsError;

    if (!facts?.length) {
      return NextResponse.json({
        answer: "Je ne dispose pas encore des informations nécessaires pour répondre avec certitude. La réception pourra vous renseigner.",
        persisted: false
      });
    }

    const answer = await answerGuest(question, { name: hotel.name, language: hotel.language, facts });
    const { error: saveError } = await supabase.from("conversations").insert({
      hotel_id: hotelId,
      channel: "web",
      guest_question: question,
      assistant_answer: answer
    });
    if (saveError) console.error("HospitIA conversation persistence failed:", saveError.code || "database_error");

    return NextResponse.json({ answer, persisted: !saveError });
  } catch (error) {
    const missingKey = error instanceof Error && error.message === "OPENAI_API_KEY_MISSING";
    if (!missingKey) console.error("HospitIA chat error:", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({
      error: missingKey
        ? "Le concierge IA n'est pas encore activé. La réception pourra vous aider."
        : "Je rencontre une difficulté technique. Merci de contacter la réception."
    }, { status: missingKey ? 503 : 502 });
  }
}
