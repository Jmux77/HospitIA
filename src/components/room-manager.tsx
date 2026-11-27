"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Room = { id: string; room_number: string; room_type: string; floor: string | null; status: string };
const statusLabels: Record<string, string> = { available: "Disponible", occupied: "Occupée", to_clean: "À nettoyer", out_of_service: "Hors service" };
const statusStyles: Record<string, string> = { available: "bg-emerald-50 text-emerald-700", occupied: "bg-blue-50 text-blue-700", to_clean: "bg-amber-50 text-amber-700", out_of_service: "bg-slate-100 text-slate-600" };

export function RoomManager({ initialRooms, hotelId, canManage }: { initialRooms: Room[]; hotelId: string; canManage: boolean }) {
  const [rooms, setRooms] = useState(initialRooms);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [number, setNumber] = useState("");
  const [type, setType] = useState("Chambre classique");
  const [floor, setFloor] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const counts = useMemo(() => ({
    available: rooms.filter(r => r.status === "available").length,
    occupied: rooms.filter(r => r.status === "occupied").length,
    to_clean: rooms.filter(r => r.status === "to_clean").length,
    out_of_service: rooms.filter(r => r.status === "out_of_service").length
  }), [rooms]);
  const filtered = rooms.filter(r => filter === "all" || r.status === filter);

  async function addRoom(event: React.FormEvent) {
    event.preventDefault();
    if (!number.trim()) return;
    setBusy(true); setNotice("");
    const { data, error } = await createClient().from("hotel_rooms")
      .insert({ hotel_id: hotelId, room_number: number.trim(), room_type: type, floor: floor.trim() || null })
      .select("id,room_number,room_type,floor,status").single();
    setBusy(false);
    if (error || !data) { setNotice(error?.code === "23505" ? "Ce numéro de chambre existe déjà." : "Impossible d'ajouter la chambre. Vérifiez vos droits."); return; }
    setRooms(old => [...old, data].sort((a,b) => a.room_number.localeCompare(b.room_number, "fr", {numeric:true})));
    setNumber(""); setFloor(""); setShowForm(false); setNotice("Chambre ajoutée.");
  }

  async function updateStatus(room: Room, status: string) {
    setNotice("");
    const { error } = await createClient().from("hotel_rooms").update({ status }).eq("id", room.id);
    if (error) { setNotice("Modification refusée. Vérifiez les droits de votre compte."); return; }
    setRooms(old => old.map(item => item.id === room.id ? { ...item, status } : item));
  }

  async function removeRoom(room: Room) {
    if (!window.confirm(`Supprimer la chambre ${room.room_number} ?`)) return;
    const { error } = await createClient().from("hotel_rooms").delete().eq("id", room.id);
    if (error) { setNotice("Suppression impossible. Seule la direction peut supprimer une chambre."); return; }
    setRooms(old => old.filter(item => item.id !== room.id)); setNotice("Chambre supprimée.");
  }

  return <div className="space-y-5">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Object.entries(counts).map(([key,value]) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{statusLabels[key]}</p><p className="mt-2 text-2xl font-bold text-ink">{value}</p></div>)}
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-bold text-ink">Parc de chambres</h2><p className="mt-1 text-xs text-slate-500">{rooms.length} chambre(s) enregistrée(s)</p></div>
        {canManage && <button onClick={() => setShowForm(v=>!v)} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">{showForm ? "Fermer" : "+ Ajouter une chambre"}</button>}
      </div>
      {showForm && <form onSubmit={addRoom} className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">Numéro<input required value={number} onChange={e=>setNumber(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" placeholder="101"/></label>
        <label className="text-xs font-semibold text-slate-600">Type de chambre<input required value={type} onChange={e=>setType(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm"/></label>
        <label className="text-xs font-semibold text-slate-600">Étage<input value={floor} onChange={e=>setFloor(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" placeholder="1"/></label>
        <div className="flex items-end"><button disabled={busy} className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Enregistrement…" : "Enregistrer"}</button></div>
      </form>}
      <div className="mt-5 flex flex-wrap gap-2">
        {[["all","Toutes"],...Object.entries(statusLabels).map(([key,label])=>[key,label])].map(([key,label]) => <button key={key} onClick={()=>setFilter(key)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter===key?"bg-ink text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{label}</button>)}
      </div>
      {notice && <p role="status" className="mt-3 text-xs text-teal">{notice}</p>}
      <div className="mt-4 divide-y divide-slate-100">
        {filtered.map(room => <div key={room.id} className="flex flex-wrap items-center gap-3 py-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F1] text-lg text-teal">▦</div>
          <div className="min-w-[130px] flex-1"><p className="text-sm font-bold text-ink">Chambre {room.room_number}</p><p className="mt-0.5 text-xs text-slate-500">{room.room_type}{room.floor ? ` · Étage ${room.floor}` : ""}</p></div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[room.status] || statusStyles.available}`}>{statusLabels[room.status] || room.status}</span>
          <select aria-label={`Statut chambre ${room.room_number}`} value={room.status} onChange={e=>updateStatus(room,e.target.value)} className="rounded-lg border border-slate-200 bg-white p-2 text-xs">
            {Object.entries(statusLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}
          </select>
          {canManage && <button onClick={()=>removeRoom(room)} aria-label={`Supprimer chambre ${room.room_number}`} className="rounded-lg p-2 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600">✕</button>}
        </div>)}
        {!filtered.length && <div className="py-10 text-center"><p className="font-semibold text-ink">Aucune chambre dans cette catégorie</p><p className="mt-1 text-xs text-slate-500">Ajoutez vos chambres pour commencer le suivi.</p></div>}
      </div>
    </section>
  </div>;
}
