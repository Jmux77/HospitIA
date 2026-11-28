"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router=useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent) {
    event.preventDefault();setBusy(true);setNotice("");
    const {data,error}=await createClient().auth.signUp({
      email:email.trim().toLowerCase(),
      password,
      options:{emailRedirectTo:`${window.location.origin}/auth/callback?next=/onboarding`}
    });
    setBusy(false);
    if(error){setNotice(error.message.includes("already registered")?"Cette adresse est déjà utilisée. Connectez-vous.":"Inscription impossible. Vérifiez l'adresse e-mail et le mot de passe.");return;}
    if(data.session){router.push("/onboarding");router.refresh();return;}
    setNotice("Un e-mail de confirmation vient de vous être envoyé. Ouvrez-le pour activer votre compte et créer votre établissement.");
  }
  return <main className="grid min-h-screen place-items-center bg-mist px-5 py-10">
    <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
      <Brand/>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.17em] text-teal">Créer votre espace hôtelier</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">Bienvenue sur HospitIA</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Créez votre accès professionnel, puis configurez votre premier établissement.</p>
      <label className="mt-6 block text-xs font-semibold text-slate-600">Adresse e-mail professionnelle<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"/></label>
      <label className="mt-4 block text-xs font-semibold text-slate-600">Mot de passe<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" placeholder="8 caractères minimum"/></label>
      <button disabled={busy} className="mt-6 w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white disabled:opacity-50">{busy?"Création du compte…":"Créer mon compte"}</button>
      {notice&&<p role="status" className="mt-4 rounded-xl bg-teal/5 p-3 text-sm leading-6 text-teal">{notice}</p>}
      <p className="mt-6 text-center text-sm text-slate-500">Vous avez déjà un compte ? <Link href="/login" className="font-semibold text-teal">Se connecter</Link></p>
      <p className="mt-4 text-center text-[10px] leading-5 text-slate-400">En créant un compte, vous acceptez les conditions d'utilisation et la politique de confidentialité à publier avant l'ouverture commerciale.</p>
    </form>
  </main>;
}
