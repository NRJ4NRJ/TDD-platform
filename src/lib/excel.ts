import * as XLSX from "xlsx";
import type { ImportedReport, ImportedReportRow } from "@/types/report";

const metadataLabelMap: Record<string, string> = {
  "Nom du projet": "name",
  SPV: "spv",
  Commune: "commune",
  Département: "department",
  Région: "region",
  Pays: "country",
  "Statut du projet": "project_status",
  Equipement: "equipment",
  "Puissance totale ": "capacity",
};

const sectionNames = [
  "1. Permitting",
  "2. Design",
  "3. Raccordement",
  "4. AO CRE",
  "5. FM ",
  "6. EYAr",
  "7. Additional docs",
];

function normalizeCell(value: unknown): string | number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "" || trimmed === "\xa0") {
      return null;
    }
    return trimmed;
  }

  if (typeof value === "number") {
    return value;
  }

  return String(value).trim();
}

function parseSectionRows(rows: Array<Array<unknown>>): ImportedReportRow[] {
  const normalizedRows = rows.map((row) => row.map(normalizeCell));
  const headerRowIndex = normalizedRows.findIndex((row) =>
    row.some((cell) => typeof cell === "string" && cell.trim() === "Ref")
  );

  if (headerRowIndex === -1) {
    return [];
  }

  const headerRow = normalizedRows[headerRowIndex] as Array<string | null>;
  const rowsAfterHeader = normalizedRows.slice(headerRowIndex + 1);

  return rowsAfterHeader
    .map((row) => {
      const entry: ImportedReportRow = {};
      headerRow.forEach((header, index) => {
        if (!header) return;
        entry[header] = row[index] ?? null;
      });
      return entry;
    })
    .filter((entry) =>
      Object.entries(entry).some(([, value]) => value !== null && value !== "")
    );
}

export function parseExcelReport(arrayBuffer: ArrayBuffer): ImportedReport {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const project_metadata: Record<string, string | number> = {};
  const sections: ImportedReport["sections"] = [];

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      raw: false,
      defval: null,
    });

    if (sheetName === "Executive summary") {
      rows.forEach((row) => {
        if (row.length >= 5 && row[0] === null && row[1] && row[4]) {
          const label = String(row[1]).trim();
          const value = normalizeCell(row[4]);
          if (value !== null) {
            project_metadata[metadataLabelMap[label] ?? label] = value;
          }
        }
      });
      return;
    }

    if (!sectionNames.includes(sheetName)) {
      return;
    }

    const normalizedRows = rows.map((row) =>
      Array.isArray(row) ? row : [row]
    );

    const parsedRows = parseSectionRows(normalizedRows);
    if (parsedRows.length > 0) {
      sections.push({ sheet_name: sheetName, rows: parsedRows });
    }
  });

  return {
    source_file: "Excel importé",
    sheet_names: workbook.SheetNames,
    project_metadata,
    sections,
  };
}
