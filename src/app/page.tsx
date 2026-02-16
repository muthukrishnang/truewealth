import Link from "next/link";
import { ArrowRight, Shield, PieChart, Target, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-xl font-semibold text-white">TrueWealth</span>
          <Link
            href="/login"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            Sign in with Google
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Know your true wealth at a glance
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Track net worth across assets, currencies, and goals. No broker logins. No third-party tracking. Just you and your data.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-medium text-white hover:bg-sky-600"
            >
              Continue with Google
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex rounded-xl border border-slate-600 px-6 py-3 font-medium text-slate-300 hover:bg-slate-800"
            >
              See how it works
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-8 md:grid-cols-3">
          {[
            { icon: PieChart, title: "All asset classes", desc: "Stocks, funds, real estate, gold, crypto, EPF, bonds, and more in one view." },
            { icon: Target, title: "Goals & tagging", desc: "Tag every investment to a goal. Retirement, home, emergency fund—track real progress." },
            { icon: TrendingUp, title: "Inflation & growth", desc: "Project growth with inflation. Track expenses and net worth over time." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
              <Icon className="h-10 w-10 text-sky-400" />
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-slate-400">{desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-24 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8 md:p-12">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Privacy first</h2>
          </div>
          <p className="mt-4 max-w-2xl text-slate-400">
            We never connect to your bank or brokerage. You control what gets entered. Your data is never sold. Export or delete anytime.
          </p>
        </section>

        <section className="mt-16 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-medium text-white hover:bg-sky-600"
          >
            Get started for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
