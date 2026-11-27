"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type GuestRequest = { id: string; guest_name: string | null; room_number: string | null; category: string | null; message: string; status: string; source: string; created_at: string };
const labels: Record<string,string> = { open:"À traiter", in_progress:"En cours", closed:"Terminée" };
const styles: Record<string,string> = { open:"bg-amber-50 text-amber-700", in_progress:"bg-blue-50 text-blue-700", closed:"bg-emerald-50 text-emerald-700" };

export function RequestManager({ initialRequests }: { initialRequests: GuestRequest[] }) {
  const [requests,setRequests] = useState(initialRequests);
  const [filter,setFilter] = useState("all");
  const [notice,setNotice] = useState("");
  const [busyId,setBusyId] = useState<string|null>(null);
  const counts = useMemo(()=>({open:requests.filter(r=>r.status==="open").length,in_progress:requests.filter(r=>r.status==="in_progress").length,closed:requests.filter(r=>r.status==="closed").length}),[requests]);
  const visible = requests.filter(r=>filter==="all"||r.status===filter);

  async function updateStatus(item: GuestRequest,status:string) {
    setBusyId(item.id);setNotice("");
    const {error}=await createClient().from("guest_requests").update({status}).eq("id",item.id);
    setBusyId(null);
    if(error){setNotice("Impossible de modifier cette demande. Vérifiez vos droits.");return;}
    setRequests(old=>old.map(r=>r.id===item.id?{...r,status}:r));
  }

  return <div className="space-y-5">
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">À traiter</p><p className="mt-2 text-2xl font-bold text-amber-700">{counts.open}</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">En cours</p><p className="mt-2 text-2xl font-bold text-blue-700">{counts.in_progress}</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Terminées</p><p className="mt-2 text-2xl font-bold text-emerald-700">{counts.closed}</p></div>
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-ink">Toutes les demandes</h2><p className="mt-1 text-xs text-slate-500">{requests.length} demande(s) enregistrée(s)</p></div>
        <div className="flex flex-wrap gap-2">{[["all","Toutes"],["open","À traiter"],["in_progress","En cours"],["closed","Terminées"]].map(([key,label])=><button key={key} onClick={()=>setFilter(key)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter===key?"bg-ink text-white":"bg-slate-100 text-slate-600"}`}>{label}</button>)}</div>
      </div>
      {notice&&<p role="alert" className="mt-3 text-xs text-red-600">{notice}</p>}
      <div className="mt-4 space-y-3">
        {visible.map(item=><article key={item.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-ink">{item.category || "Demande client"}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[item.status]||styles.open}`}>{labels[item.status]||item.status}</span></div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{item.message}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">{item.guest_name || "Client"}{item.room_number ? ` · Chambre ${item.room_number}` : ""} · {new Date(item.created_at).toLocaleString("fr-FR")} · {item.source==="guest"?"Portail client":"Équipe"}</p>
            <div className="flex gap-2">{item.status==="open"&&<button disabled={busyId===item.id} onClick={()=>updateStatus(item,"in_progress")} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">Prendre en charge</button>}{item.status!=="closed"&&<button disabled={busyId===item.id} onClick={()=>updateStatus(item,"closed")} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Clôturer</button>}{item.status==="closed"&&<button disabled={busyId===item.id} onClick={()=>updateStatus(item,"open")} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">Rouvrir</button>}</div>
          </div>
        </article>)}
        {!visible.length&&<div className="py-10 text-center"><p className="font-semibold text-ink">Aucune demande enregistrée</p><p className="mt-1 text-xs text-slate-500">Les messages envoyés par les voyageurs apparaîtront ici.</p></div>}
      </div>
    </section>
  </div>;
}
