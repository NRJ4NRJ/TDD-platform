import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import RiskBadge from "@/components/RiskBadge";
import type { RiskRating } from "@/types/database";

type ProjectRow = {
  id: string;
  name: string;
  type: string;
  capacity_mw: number | null;
  location: string | null;
  status: string;
  created_at: string;
  risk_assessments: { rating: string }[];
};

const typeLabels: Record<string, string> = {
  wind: "Éolien",
  solar: "Solaire",
  hydro: "Hydraulique",
  storage: "Stockage",
  other: "Autre",
};

const statusLabels: Record<string, string> = {
  development: "Développement",
  construction: "Construction",
  operation: "Exploitation",
};

function worstRating(assessments: { rating: string }[]): RiskRating | null {
  const order: RiskRating[] = ["red", "orange", "yellow", "blue", "green"];
  for (const level of order) {
    if (assessments.some((a) => a.rating === level)) return level;
  }
  return null;
}

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: raw, error } = await supabase
    .from("projects")
    .select("id, name, type, capacity_mw, location, status, created_at, risk_assessments (rating)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Erreur de chargement : {error.message}
      </div>
    );
  }

  const projects = (raw ?? []) as ProjectRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Portefeuille</h1>
          <p className="text-sm text-slate-500 mt-1">
            {projects.length} projet{projects.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouveau projet
        </Link>
      </div>

      {projects.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg font-medium">Aucun projet</p>
          <p className="text-sm mt-1">
            Créez votre premier projet pour commencer l'analyse.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const worst = worstRating(project.risk_assessments);
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-900 group-hover:text-blue-700 truncate">
                    {project.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {typeLabels[project.type] ?? project.type}
                    {project.capacity_mw ? ` · ${project.capacity_mw} MW` : ""}
                    {project.location ? ` · ${project.location}` : ""}
                  </p>
                </div>
                {worst && <RiskBadge rating={worst} />}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {statusLabels[project.status] ?? project.status}
                </span>
                <span className="text-xs text-slate-400">
                  {project.risk_assessments.length} / 7 catégories
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
