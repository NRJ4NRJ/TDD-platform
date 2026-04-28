import { notFound } from "next/navigation";
import Link from "next/link";
import report from "@/data/mimosa-report.json";
import type { ImportedReport } from "@/types/report";

function safeValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function buildKeyLabel(key: string) {
  return key.replace(/_/g, " ");
}

export function generateStaticParams() {
  const typedReport = report as ImportedReport;
  return typedReport.sheet_names.map((sheetName) => ({
    sheet: sheetName,
  }));
}

export default function ReportSheetPage(props: any) {
  const typedReport = report as ImportedReport;
  const sheetName = decodeURIComponent(props.params.sheet as string);
  const isKnownSheet = typedReport.sheet_names.includes(sheetName);

  if (!isKnownSheet) {
    notFound();
  }

  const section = typedReport.sections.find((section) => section.sheet_name === sheetName);
  const isExecutiveSummary = sheetName === "Executive summary";
  const isMetadataSheet = sheetName === "Page de garde" || sheetName === "Accueil" || sheetName === "Figures";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{sheetName}</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl">
            Affichage du contenu de l’onglet du classeur Excel. Cette page présente les données structurées ou le résumé disponibles pour cet onglet.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/report"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Retour aux onglets
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Portefeuille
          </Link>
        </div>
      </div>

      {section ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Données structurées</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {section.rows.length} ligne{section.rows.length > 1 ? "s" : ""} importée{section.rows.length > 1 ? "s" : ""}.
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Section structurée
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  {Object.keys(section.rows[0]).map((column) => (
                    <th
                      key={column}
                      className="border-b border-slate-200 px-3 py-2 text-left font-medium"
                    >
                      {buildKeyLabel(column)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    {Object.keys(row).map((column) => (
                      <td key={`${rowIndex}-${column}`} className="border-b border-slate-200 px-3 py-2 align-top text-slate-700">
                        {safeValue(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : isExecutiveSummary ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Résumé du projet</h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {Object.entries(typedReport.project_metadata).map(([key, value]) => (
              <div key={key} className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs uppercase tracking-[0.15em] text-slate-500">{key}</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">{safeValue(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : isMetadataSheet ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Contenu non structuré</h2>
          <p className="mt-3 text-sm text-slate-500">
            Cet onglet est reconnu comme faisant partie du classeur, mais son contenu n’est pas encore structuré dans l’import Excel actuel.
          </p>
          <p className="mt-4 text-sm text-slate-600">
            Vous pouvez ajouter une logique spécifique pour afficher le contenu de cette feuille si nécessaire.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Onglet non structuré</h2>
          <p className="mt-3 text-sm text-slate-500">
            Le contenu de cet onglet n’est pas disponible dans l’import structuré actuel.
          </p>
        </div>
      )}
    </div>
  );
}
