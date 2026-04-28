"use client";

import { useState } from "react";
import type { ImportedReport } from "@/types/report";
import { parseExcelReport } from "@/lib/excel";
import ImportReportPreview from "@/components/ImportReportPreview";

export default function ImportReportFileUploader() {
  const [report, setReport] = useState<ImportedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setIsParsing(true);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseExcelReport(buffer);
      setReport(parsed);
    } catch (err) {
      setError("Impossible de lire le fichier Excel. Vérifiez le fichier et réessayez.");
      setReport(null);
    } finally {
      setIsParsing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Importer un fichier Excel</h2>
        <p className="text-sm text-slate-600 mt-2">
          Choisissez un fichier `.xlsx` pour transformer le rapport en projet et évaluations de risques.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100">
            {isParsing ? "Lecture du fichier..." : "Choisir un fichier Excel"}
            <input
              type="file"
              accept=".xlsx"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
          {fileName && (
            <span className="text-sm text-slate-500">Fichier : {fileName}</span>
          )}
        </div>
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {report ? (
        <ImportReportPreview report={report} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          Sélectionnez un fichier Excel pour voir un aperçu et importer le rapport.
        </div>
      )}
    </div>
  );
}
