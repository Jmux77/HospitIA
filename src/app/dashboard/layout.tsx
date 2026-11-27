import { redirect } from "next/navigation";
import { getUserAndHotel } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, hotels, hotel, role } = await getUserAndHotel();
  if (!user) redirect("/login");

  if (!hotel) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-12">
        <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal">HospitIA</p>
          <h1 className="mt-4 text-2xl font-bold text-ink">Votre établissement n'est pas encore associé</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Votre compte est bien connecté, mais aucun établissement ne lui est rattaché.
            L'administrateur HospitIA doit vous ajouter dans l'équipe de votre hôtel.
          </p>
          <form action="/auth/signout" method="post" className="mt-6">
            <button className="rounded-xl bg-ink px-5 py-3 font-semibold text-white">Se déconnecter</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <DashboardShell hotels={hotels} activeHotel={hotel} role={role || "staff"} email={user.email || ""}>
      {children}
    </DashboardShell>
  );
}
