import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";
import { Brand } from "@/components/brand";

export default async function OnboardingPage() {
  const supabase=await createClient();
  const {data,error}=await supabase.auth.getClaims();
  if(error||!data?.claims?.sub) redirect("/login");
  const userId=String(data.claims.sub);
  const {data:membership}=await supabase.from("hotel_members").select("hotel_id").eq("user_id",userId).limit(1).maybeSingle();
  if(membership) redirect("/dashboard");
  return <main className="grid min-h-screen place-items-center bg-mist px-5 py-10">
    <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
      <Brand/>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.17em] text-teal">Première configuration</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">Créons votre établissement</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Ces informations initiales pourront être modifiées ensuite dans les paramètres de votre espace.</p>
      <OnboardingForm/>
    </section>
  </main>;
}
