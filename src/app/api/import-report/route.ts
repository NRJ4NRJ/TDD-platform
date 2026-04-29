import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ImportedReport } from "@/types/report";

const sheetNameToCategory: Record<string, string> = {
  "1. Permitting": "Permitting",
  "2. Design": "Design",
  "3. Raccordement": "Grid Connection",
  "4. AO CRE": "CRE / Auction",
  "5. FM": "Financial Model",
  "5. FM ": "Financial Model",
  "6. EYAr": "Yield Assessment",
  "7. Additional docs": "Additional Docs",
};

function normalizeStatus(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "development";
  }
  const text = String(value).toLowerCase();
  if (text.includes("rtb") || text.includes("operation") || text.includes("exploitation")) {
    return "operation";
  }
  if (text.includes("construct") || text.includes("construction")) {
    return "construction";
  }
  return "development";
}

function parseCapacity(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return null;
  const asNumber = parseFloat(String(value).replace(/,/g, "."));
  return Number.isFinite(asNumber) ? asNumber : null;
}

function buildLocation(metadata: Record<string, string | number>) {
  const parts = [
    metadata.commune,
    metadata.department,
    metadata.region,
    metadata.country,
  ]
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value).trim())
    .filter(Boolean);
  return parts.join(", ") || null;
}

function buildTitle(row: Record<string, string | number | null>) {
  const subject = row.Subject ?? row["Subject"];
  const subSubject = row["Sub-subject"] ?? row["sub-subject"];
  const comments = row["Comments / Risks / Mitigation strategy"] ?? row.Description;

  const pieces = [subject, subSubject]
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (pieces.length > 0) {
    return pieces.join(" – ");
  }

  if (comments && String(comments).trim().length > 0) {
    return String(comments).trim().slice(0, 160);
  }

  return "Point de due diligence";
}

function buildDescription(row: Record<string, string | number | null>) {
  const comments = row["Comments / Risks / Mitigation strategy"];
  const description = row.Description;
  if (comments && String(comments).trim().length > 0) {
    return String(comments).trim();
  }
  if (description && String(description).trim().length > 0) {
    return String(description).trim();
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const report = body?.report as ImportedReport | undefined;

  if (!report || !report.sections) {
    return NextResponse.json(
      { error: "Rapport invalide ou données manquantes." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return NextResponse.json(
      { error: "Utilisateur non authentifié." },
      { status: 401 }
    );
  }

  const metadata = report.project_metadata ?? {};
  const projectName = String(metadata.name ?? metadata.spv ?? "Projet Mimosa");
  const projectLocation = buildLocation(metadata);
  const projectStatus = normalizeStatus(metadata.project_status ?? metadata["Statut du projet"]);
  const projectCapacity = parseCapacity(metadata.capacity ?? metadata["Puissance totale"]);

  const {
    data: projectData,
    error: projectError,
  } = await supabase
    .from("projects")
    .insert({
      name: projectName,
      type: "wind",
      capacity_mw: projectCapacity,
      location: projectLocation,
      status: projectStatus,
      user_id: userData.user.id,
    })
    .select()
    .single();

  if (projectError || !projectData) {
    return NextResponse.json(
      { error: projectError?.message || "Impossible de créer le projet." },
      { status: 500 }
    );
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("risk_categories")
    .select("id, name");

  if (categoriesError || !categories) {
    return NextResponse.json(
      { error: categoriesError?.message || "Impossible de charger les catégories." },
      { status: 500 }
    );
  }

  const categoryByName = new Map(categories.map((category) => [category.name, category.id]));
  const insertedAssessments: { [key: string]: string } = {};

  for (const section of report.sections) {
    const sheetName = section.sheet_name.trim();
    const categoryName = sheetNameToCategory[sheetName];
    if (!categoryName) {
      continue;
    }
    const categoryId = categoryByName.get(categoryName);
    if (!categoryId) {
      continue;
    }
    const rows = section.rows.filter((row) => {
      const title = buildTitle(row);
      return title.length > 0;
    });

    if (rows.length === 0) {
      continue;
    }

    const {
      data: assessmentData,
      error: assessmentError,
    } = await supabase
      .from("risk_assessments")
      .insert({
        project_id: projectData.id,
        category_id: categoryId,
        rating: "yellow",
        summary: `Importé depuis la feuille ${sheetName}`,
      })
      .select()
      .single();

    if (assessmentError || !assessmentData) {
      return NextResponse.json(
        { error: assessmentError?.message || "Impossible de créer l'évaluation de risques." },
        { status: 500 }
      );
    }

    insertedAssessments[sheetName] = assessmentData.id;

    const items = rows.map((row) => ({
      assessment_id: assessmentData.id,
      title: buildTitle(row),
      description: buildDescription(row),
      rating: "yellow",
    }));

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("risk_items").insert(items);
      if (itemsError) {
        return NextResponse.json(
          { error: itemsError.message || "Impossible de créer les éléments de risque." },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ projectId: projectData.id });
}
