import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/projects");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full border border-blue-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Gestion de portefeuille · Due diligence · Financement
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            TDD Platform
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Centralisez et visualisez l'analyse des risques de vos actifs
            renouvelables — éolien, solaire, stockage.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Permitting", color: "bg-green-500" },
            { label: "Design", color: "bg-blue-500" },
            { label: "Grid Connection", color: "bg-yellow-500" },
            { label: "CRE / Auction", color: "bg-orange-500" },
            { label: "Financial Model", color: "bg-green-500" },
            { label: "Yield Assessment", color: "bg-blue-500" },
          ].map((cat) => (
            <div
              key={cat.label}
              className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/10"
            >
              <div
                className={`w-3 h-3 rounded-full ${cat.color} mx-auto mb-1.5`}
              ></div>
              <span className="text-xs text-slate-300">{cat.label}</span>
            </div>
          ))}
        </div>

        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-lg"
        >
          Accéder à la plateforme →
        </Link>

        <p className="text-xs text-slate-500">
          Plateforme réservée aux utilisateurs autorisés.
        </p>
      </div>
    </main>
  );
}
