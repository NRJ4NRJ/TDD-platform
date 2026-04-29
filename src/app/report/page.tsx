import Link from "next/link";
import report from "@/data/mimosa-report.json";
import type { ImportedReport } from "@/types/report";

const sectionLabelMap: Record<string, string> = {
  "1. Permitting": "Permitting",
  "2. Design": "Design",
  "3. Raccordement": "Grid Connection",
  "4. AO CRE": "CRE / Auction",
  "5. FM ": "Financial Model",
  "6. EYAr": "Yield Assessment",
  "7. Additional docs": "Additional Docs",
};

function getSheetSummary(sheetName: string, report: ImportedReport) {
  const section = report.sections.find((section) => section.sheet_name === sheetName);
  if (section) {
    return `${section.rows.length} élément${section.rows.length > 1 ? "s" : ""}`;
  }
  if (sheetName === "Executive summary") {
    return "Résumé projet";
  }
  if (sheetName === "Page de garde" || sheetName === "Accueil" || sheetName === "Figures") {
    return "Données générales";
  }
  return "Feuille non structurée";
}

export default function ReportIndexPage() {
  const typedReport = report as ImportedReport;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rapport Excel</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl">
            Navigation par onglet du classeur Excel. Cette vue expose les onglets disponibles et permet de consulter chaque feuille comme une page de la plateforme.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Tableau de bord
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Portefeuille
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {typedReport.sheet_names.map((sheetName) => (
          <Link
            key={sheetName}
            href={`/report/${encodeURIComponent(sheetName)}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
          >
            <div className="text-sm font-semibold text-slate-900 truncate">{sheetName}</div>
            <div className="mt-3 text-sm text-slate-500">{getSheetSummary(sheetName, typedReport)}</div>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-blue-600">
              Voir l’onglet
              <span aria-hidden="true">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
