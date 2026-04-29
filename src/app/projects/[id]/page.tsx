import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import RiskAnalysisEditor from "@/components/RiskAnalysisEditor";
import type { RiskRating } from "@/types/database";

type Category = {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
};

type RiskItem = {
  id: string;
  title: string;
  rating: string;
  description: string | null;
};

type Assessment = {
  id: string;
  rating: string;
  summary: string | null;
  category_id: string;
  risk_categories: { name: string; display_order: number } | null;
  risk_items: RiskItem[];
};

const ratingDotClass: Record<RiskRating, string> = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

const typeLabels: Record<string, string> = {
  wind: "Éolien",
  solar: "Solaire PV",
  hydro: "Hydraulique",
  storage: "Stockage",
  other: "Autre",
};

const statusLabels: Record<string, string> = {
  development: "Développement",
  construction: "Construction",
  operation: "Exploitation",
};

export default async function ProjectDetailPage(props: any) {
  const { id } = props.params as { id: string };
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: rawAssessments } = await supabase
    .from("risk_assessments")
    .select(
      `id, rating, summary, category_id,
       risk_categories (name, display_order),
       risk_items (id, title, rating, description)`
    )
    .eq("project_id", id)
    .order("display_order", { referencedTable: "risk_categories" });

  const assessments = (rawAssessments ?? []) as unknown as Assessment[];

  const { data: rawCategories } = await supabase
    .from("risk_categories")
    .select("*")
    .order("display_order");

  const categories = (rawCategories ?? []) as Category[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/projects"
            className="text-sm text-slate-500 hover:text-blue-600"
          >
            ← Portefeuille
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">
            {project.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {typeLabels[project.type] ?? project.type}
            {project.capacity_mw ? ` · ${project.capacity_mw} MW` : ""}
            {project.location ? ` · ${project.location}` : ""}
            {" · "}
            {statusLabels[project.status] ?? project.status}
          </p>
        </div>
      </div>

      {/* Risk matrix summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Matrice des risques
        </h2>
        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const assessment = assessments.find(
                (a) => a.category_id === cat.id
              );
              const rating = assessment?.rating as RiskRating | undefined;
              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      rating ? ratingDotClass[rating] : "bg-slate-300"
                    }`}
                  />
                  <span className="text-xs font-medium text-slate-700 truncate">
                    {cat.display_order}. {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Chargement des catégories…</p>
        )}
      </div>

      <RiskAnalysisEditor
        projectId={project.id}
        categories={categories}
        assessments={assessments.map((assessment) => ({
          id: assessment.id,
          rating: assessment.rating,
          summary: assessment.summary,
          category_id: assessment.category_id,
          risk_items: assessment.risk_items,
        }))}
      />
    </div>
  );
}
