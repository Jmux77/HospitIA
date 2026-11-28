import { redirect } from "next/navigation";
import { getUserAndHotel } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, hotels, hotel, role } = await getUserAndHotel();
  if (!user) redirect("/login");

  // A signed-in user without a membership must complete (or resume) self-service onboarding.
  if (!hotel) redirect("/onboarding");

  return (
    <DashboardShell hotels={hotels} activeHotel={hotel} role={role || "staff"} email={user.email || ""}>
      {children}
    </DashboardShell>
  );
}
