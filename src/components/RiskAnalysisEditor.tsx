"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getRiskTemplateForCategory } from "@/lib/risk-template";
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
  risk_items: RiskItem[];
};

type FieldState = {
  rating: RiskRating | "";
  description: string;
};

type CategoryState = {
  assessmentId?: string;
  rating: RiskRating | "";
  summary: string;
  fields: Record<string, FieldState>;
};

const ratingLabels: Record<RiskRating, string> = {
  green: "Concluant",
  blue: "Remarque mineure",
  yellow: "Réserve, statut à vérifier",
  orange: "Risque significatif",
  red: "Point bloquant",
};

const ratingDotClass: Record<RiskRating, string> = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

function makeInitialState(categories: Category[], assessments: Assessment[]) {
  return categories.reduce<Record<string, CategoryState>>((acc, category) => {
    const assessment = assessments.find((item) => item.category_id === category.id);
    const template = getRiskTemplateForCategory(category.name);

    acc[category.id] = {
      assessmentId: assessment?.id,
      rating: (assessment?.rating as RiskRating | undefined) ?? "",
      summary: assessment?.summary ?? "",
      fields: (template?.subcategories ?? []).reduce<Record<string, FieldState>>(
        (fieldAcc, subcategory) => {
          const savedItem = assessment?.risk_items.find((item) => item.title === subcategory.title);
          fieldAcc[subcategory.title] = {
            rating: (savedItem?.rating as RiskRating | undefined) ?? "",
            description: savedItem?.description ?? "",
          };
          return fieldAcc;
        },
        {}
      ),
    };

    return acc;
  }, {});
}

function hasCategoryContent(state: CategoryState) {
  return (
    state.rating !== "" ||
    state.summary.trim().length > 0 ||
    Object.values(state.fields).some(
      (field) => field.rating !== "" || field.description.trim().length > 0
    )
  );
}

export default function RiskAnalysisEditor({
  projectId,
  categories,
  assessments,
}: {
  projectId: string;
  categories: Category[];
  assessments: Assessment[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [formState, setFormState] = useState(() => makeInitialState(categories, assessments));
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() =>
    categories.reduce<Record<string, boolean>>((acc, category, index) => {
      acc[category.id] = index === 0;
      return acc;
    }, {})
  );
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateCategory(categoryId: string, patch: Partial<CategoryState>) {
    setFormState((current) => ({
      ...current,
      [categoryId]: {
        ...current[categoryId],
        ...patch,
      },
    }));
  }

  function updateField(categoryId: string, title: string, patch: Partial<FieldState>) {
    setFormState((current) => ({
      ...current,
      [categoryId]: {
        ...current[categoryId],
        fields: {
          ...current[categoryId].fields,
          [title]: {
            ...current[categoryId].fields[title],
            ...patch,
          },
        },
      },
    }));
  }

  async function saveCategory(category: Category) {
    const state = formState[category.id];
    setSavingCategoryId(category.id);
    setError(null);
    setMessage(null);

    if (!hasCategoryContent(state)) {
      if (state.assessmentId) {
        const { error: deleteError } = await supabase
          .from("risk_assessments")
          .delete()
          .eq("id", state.assessmentId);

        if (deleteError) {
          setError(deleteError.message);
          setSavingCategoryId(null);
          return;
        }
      }

      updateCategory(category.id, { assessmentId: undefined });
      setMessage(`${category.display_order}. ${category.name} remis à vide.`);
      router.refresh();
      setSavingCategoryId(null);
      return;
    }

    const rating = state.rating || "yellow";
    const { data: assessment, error: assessmentError } = await supabase
      .from("risk_assessments")
      .upsert(
        {
          id: state.assessmentId,
          project_id: projectId,
          category_id: category.id,
          rating,
          summary: state.summary.trim() || null,
        },
        { onConflict: "project_id,category_id" }
      )
      .select()
      .single();

    if (assessmentError || !assessment) {
      setError(assessmentError?.message || "Impossible d'enregistrer la catégorie.");
      setSavingCategoryId(null);
      return;
    }

    const { error: deleteItemsError } = await supabase
      .from("risk_items")
      .delete()
      .eq("assessment_id", assessment.id);

    if (deleteItemsError) {
      setError(deleteItemsError.message);
      setSavingCategoryId(null);
      return;
    }

    const items = Object.entries(state.fields)
      .filter(([, field]) => field.rating !== "" || field.description.trim().length > 0)
      .map(([title, field]) => ({
        assessment_id: assessment.id,
        title,
        description: field.description.trim() || null,
        rating: field.rating || "yellow",
      }));

    if (items.length > 0) {
      const { error: insertItemsError } = await supabase.from("risk_items").insert(items);
      if (insertItemsError) {
        setError(insertItemsError.message);
        setSavingCategoryId(null);
        return;
      }
    }

    updateCategory(category.id, { assessmentId: assessment.id });
    setMessage(`${category.display_order}. ${category.name} enregistré.`);
    router.refresh();
    setSavingCategoryId(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Analyse des risques</h2>
          <p className="text-sm text-slate-500">
            Les champs sont vides par défaut. Ouvrez une rubrique pour renseigner les éléments d'analyse.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="space-y-3">
        {categories.map((category) => {
          const template = getRiskTemplateForCategory(category.name);
          const state = formState[category.id];
          const isOpen = openCategories[category.id];

          return (
            <section
              key={category.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenCategories((current) => ({
                    ...current,
                    [category.id]: !current[category.id],
                  }))
                }
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50"
                aria-expanded={isOpen}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-900 px-2 text-sm font-semibold text-white">
                      {category.display_order}.
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="truncate text-xs text-slate-500">{category.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {state.rating ? (
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${ratingDotClass[state.rating]}`} />
                      {ratingLabels[state.rating]}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Non évalué</span>
                  )}
                  <span className="text-lg leading-none text-slate-400">{isOpen ? "-" : "+"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="space-y-5 border-t border-slate-100 px-5 py-5">
                  <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                    <label className="text-sm font-medium text-slate-700" htmlFor={`rating-${category.id}`}>
                      Niveau de risque
                    </label>
                    <select
                      id={`rating-${category.id}`}
                      value={state.rating}
                      onChange={(event) =>
                        updateCategory(category.id, {
                          rating: event.target.value as RiskRating | "",
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Non évalué</option>
                      {Object.entries(ratingLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                    <label className="text-sm font-medium text-slate-700" htmlFor={`summary-${category.id}`}>
                      Synthèse catégorie
                    </label>
                    <textarea
                      id={`summary-${category.id}`}
                      value={state.summary}
                      onChange={(event) =>
                        updateCategory(category.id, { summary: event.target.value })
                      }
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Saisir la synthèse de l'analyse..."
                    />
                  </div>

                  <div className="space-y-3">
                    {(template?.subcategories ?? []).map((subcategory, subIndex) => {
                      const number = `${category.display_order}.${subIndex + 1}.`;
                      const field = state.fields[subcategory.title];

                      return (
                        <details
                          key={subcategory.title}
                          className="rounded-lg border border-slate-200 bg-slate-50"
                        >
                          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-800">
                            <span className="mr-2 text-slate-500">{number}</span>
                            {subcategory.title}
                          </summary>
                          <div className="space-y-4 border-t border-slate-200 bg-white px-4 py-4">
                            <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
                              <label
                                className="text-sm font-medium text-slate-700"
                                htmlFor={`field-rating-${category.id}-${subIndex}`}
                              >
                                Evaluation
                              </label>
                              <select
                                id={`field-rating-${category.id}-${subIndex}`}
                                value={field.rating}
                                onChange={(event) =>
                                  updateField(category.id, subcategory.title, {
                                    rating: event.target.value as RiskRating | "",
                                  })
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Non évalué</option>
                                {Object.entries(ratingLabels).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
                              <label
                                className="text-sm font-medium text-slate-700"
                                htmlFor={`field-description-${category.id}-${subIndex}`}
                              >
                                Commentaires, risques, mitigation
                              </label>
                              <textarea
                                id={`field-description-${category.id}-${subIndex}`}
                                value={field.description}
                                onChange={(event) =>
                                  updateField(category.id, subcategory.title, {
                                    description: event.target.value,
                                  })
                                }
                                rows={4}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Renseigner les éléments d'analyse..."
                              />
                            </div>
                          </div>
                        </details>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => saveCategory(category)}
                      disabled={savingCategoryId === category.id}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingCategoryId === category.id ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
