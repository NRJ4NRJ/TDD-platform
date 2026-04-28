"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ImportedReport, ImportedReportRow } from "@/types/report";

const sectionLabelMap: Record<string, string> = {
  "1. Permitting": "Permitting",
  "2. Design": "Design",
  "3. Raccordement": "Grid Connection",
  "4. AO CRE": "CRE / Auction",
  "5. FM": "Financial Model",
  "5. FM ": "Financial Model",
  "6. EYAr": "Yield Assessment",
  "7. Additional docs": "Additional Docs",
};

function safeString(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function buildRowTitle(row: ImportedReportRow) {
  const subject = safeString(row.Subject).trim();
  const sub = safeString(row["Sub-subject"]).trim();
  const description = safeString(row.Description || row["Comments / Risks / Mitigation strategy"]).trim();

  const parts = [subject, sub].filter(Boolean);
  if (parts.length === 0 && description) {
    parts.push(description);
  }

  return parts.join(" – ") || "Point de due diligence";
}

function formatMetadata(report: ImportedReport) {
  return Object.entries(report.project_metadata)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim().length > 0)
    .sort(([a], [b]) => a.localeCompare(b));
}

export default function ImportReportPreview({ report }: { report: ImportedReport }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validSections = report.sections.filter((section) =>
    Object.prototype.hasOwnProperty.call(sectionLabelMap, section.sheet_name.trim())
  );

  async function importReport() {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/import-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ report }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Échec de l'importation du rapport.");
        setIsLoading(false);
        return;
      }

      setMessage("Importation terminée. Redirection vers le projet...");
      router.push(`/projects/${result.projectId}`);
    } catch (err) {
      setError("Impossible de contacter le serveur. Veuillez réessayer.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-sm text-slate-600">
          Fichier source : <span className="font-semibold">{report.source_file}</span>
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Feuilles disponibles : <span className="font-semibold">{report.sheet_names.join(", ")}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Métadonnées du projet</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {formatMetadata(report).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="text-slate-500">{key}</p>
                  <p className="font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Sections importées</h2>
            <div className="mt-4 space-y-2">
              {validSections.map((section) => (
                <div key={section.sheet_name} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">{section.sheet_name}</p>
                  <p className="text-xs text-slate-500">{section.rows.length} éléments</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Aperçu rapide</h2>
          <div className="mt-4 space-y-4">
            {validSections.slice(0, 3).map((section) => (
              <div key={section.sheet_name}>
                <p className="text-sm font-semibold text-slate-700">{section.sheet_name}</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {section.rows.slice(0, 3).map((row, index) => (
                    <li key={`${section.sheet_name}-${index}`} className="rounded-lg bg-slate-50 p-3">
                      {buildRowTitle(row)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}
            <button
              type="button"
              onClick={importReport}
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Importation..." : "Importer le rapport dans la plateforme"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
