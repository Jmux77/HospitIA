"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router=useRouter();
  const search=useSearchParams();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState(search.get("error")==="callback"?"Le lien de confirmation est invalide ou a expiré. Réessayez.":"");
  const [busy,setBusy]=useState(false);
  const [resetBusy,setResetBusy]=useState(false);

  async function submit(event:React.FormEvent) {
    event.preventDefault();setBusy(true);setMessage("");
    const {error}=await createClient().auth.signInWithPassword({email:email.trim(),password});
    setBusy(false);
    if(error){setMessage("Connexion impossible : vérifiez votre adresse e-mail et votre mot de passe.");return;}
    router.replace("/dashboard");router.refresh();
  }

  async function resetPassword() {
    if(!email.trim()){setMessage("Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.");return;}
    setResetBusy(true);setMessage("");
    const {error}=await createClient().auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/auth/callback?next=/login`});
    setResetBusy(false);
    setMessage(error?"Impossible d'envoyer le lien de réinitialisation. Réessayez.":"Si ce compte existe, un e-mail de réinitialisation vient d'être envoyé.");
  }

  return <main className="grid min-h-screen place-items-center bg-mist px-5 py-10">
    <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
      <Brand/>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.17em] text-teal">Espace hôtelier</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">Ravi de vous retrouver</h1>
      <p className="mt-2 text-sm text-slate-500">Connectez-vous à l'espace de gestion de votre établissement.</p>
      <label className="mt-6 block text-xs font-semibold text-slate-600">Adresse e-mail<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"/></label>
      <label className="mt-4 block text-xs font-semibold text-slate-600">Mot de passe<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"/></label>
      <div className="mt-2 text-right"><button type="button" onClick={resetPassword} disabled={resetBusy} className="text-xs font-semibold text-teal">{resetBusy?"Envoi…":"Mot de passe oublié ?"}</button></div>
      <button disabled={busy} className="mt-5 w-full rounded-xl bg-ink p-3 font-semibold text-white disabled:opacity-50">{busy?"Connexion…":"Se connecter"}</button>
      {message&&<p role="status" className="mt-4 rounded-xl bg-teal/5 p-3 text-sm leading-6 text-teal">{message}</p>}
      <p className="mt-6 text-center text-sm text-slate-500">Pas encore de compte ? <Link href="/register" className="font-semibold text-teal">Créer mon espace</Link></p>
    </form>
  </main>;
}
