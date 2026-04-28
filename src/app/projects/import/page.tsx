"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import ImportReportPreview from "@/components/ImportReportPreview";
import type { ImportedReport } from "@/types/report";
import report from "@/data/mimosa-report.json";

const ImportReportFileUploader = dynamic(
  () => import("@/components/ImportReportFileUploader"),
  { ssr: false }
);

export default function ImportProjectPage() {
  const typedReport = report as ImportedReport;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/projects"
            className="text-sm text-slate-500 hover:text-blue-600"
          >
            ← Portefeuille
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-3">
            Importer le rapport Excel
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Ce rapport est transformé en structure de projet et d’analyses de risques.
            Vous pouvez utiliser l’exemple généré depuis le fichier Excel ou charger un nouveau fichier `.xlsx`.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <ImportReportFileUploader />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Utiliser l’exemple du fichier local</h2>
            <p className="text-sm text-slate-500 mt-2">
              Cet exemple est basé sur le rapport Excel local déjà analysé et transformé.
            </p>
            <div className="mt-6">
              <ImportReportPreview report={typedReport} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
