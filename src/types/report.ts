export type ImportedReportRow = Record<string, string | number | null>;

export type ImportedReportSection = {
  sheet_name: string;
  rows: ImportedReportRow[];
};

export type ImportedReport = {
  source_file: string;
  sheet_names: string[];
  project_metadata: Record<string, string | number>;
  sections: ImportedReportSection[];
};
