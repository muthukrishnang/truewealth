import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <DashboardNav user={session.user} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
