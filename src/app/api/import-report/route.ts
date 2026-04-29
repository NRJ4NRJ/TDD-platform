import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ImportedReport } from "@/types/report";

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

  return NextResponse.json({ projectId: projectData.id });
}
