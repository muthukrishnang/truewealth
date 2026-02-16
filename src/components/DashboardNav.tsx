"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Wallet,
  Target,
  Receipt,
  Calculator,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/assets", label: "Assets", icon: Wallet },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { href: "/dashboard/inflation", label: "Inflation", icon: Calculator },
];

export function DashboardNav({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-lg font-semibold text-white">
          TrueWealth
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                pathname === href
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-400 md:inline">{user.email}</span>
          {user.image && (
            <img
              src={user.image}
              alt=""
              className="h-8 w-8 rounded-full border border-slate-600"
            />
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign out</span>
          </button>
          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800"
            onClick={() => setOpen((o) => !o)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-700/50 bg-slate-900 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  pathname === href ? "bg-slate-700 text-white" : "text-slate-400"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
