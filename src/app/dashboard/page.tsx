import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">TDD Platform</h1>
          <p className="text-xs text-slate-500">Analyse des risques EnR</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tableau de bord</h2>
          <p className="text-sm text-slate-500 mt-1">
            Bienvenue sur la plateforme TDD — vue d&apos;ensemble de vos actifs renouvelables.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Projets</p>
            <p className="text-4xl font-bold text-slate-900">{projectCount ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Catégories de risque</p>
            <p className="text-4xl font-bold text-slate-900">7</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Statut</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Connecté
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
            Accès rapide
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/projects"
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-3">📁</div>
              <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                Portefeuille
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Consulter tous les projets
              </p>
            </Link>

            <Link
              href="/projects/new"
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-3">➕</div>
              <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                Nouveau projet
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Créer un actif renouvelable
              </p>
            </Link>

            <Link
              href="/projects/import"
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-3">📊</div>
              <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                Importer Excel
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Charger un rapport d&apos;analyse
              </p>
            </Link>

            <Link
              href="/report"
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-3">🔍</div>
              <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                Explorer rapport
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Parcourir les feuilles Excel
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
