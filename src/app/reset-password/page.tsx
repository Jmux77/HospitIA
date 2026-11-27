"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router=useRouter();
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent) {
    event.preventDefault();
    if(password!==confirm){setNotice("Les deux mots de passe ne correspondent pas.");return;}
    setBusy(true);setNotice("");
    const {error}=await createClient().auth.updateUser({password});
    setBusy(false);
    if(error){setNotice("Le lien est invalide ou expiré. Demandez une nouvelle réinitialisation.");return;}
    setNotice("Votre mot de passe a été modifié. Vous allez être redirigé vers la connexion.");
    window.setTimeout(()=>router.replace("/login"),1200);
  }
  return <main className="grid min-h-screen place-items-center bg-mist px-5 py-10"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5"><Brand/><h1 className="mt-8 text-2xl font-bold text-ink">Nouveau mot de passe</h1><p className="mt-2 text-sm text-slate-500">Choisissez un nouveau mot de passe pour votre compte HospitIA.</p><label className="mt-6 block text-xs font-semibold text-slate-600">Nouveau mot de passe<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"/></label><label className="mt-4 block text-xs font-semibold text-slate-600">Confirmer le mot de passe<input required minLength={8} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"/></label><button disabled={busy} className="mt-6 w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white disabled:opacity-50">{busy?"Mise à jour…":"Enregistrer le mot de passe"}</button>{notice&&<p role="status" className="mt-4 text-sm text-teal">{notice}</p>}</form></main>;
}
