export type RiskRating = "green" | "blue" | "yellow" | "orange" | "red";
export type ProjectType = "wind" | "solar" | "hydro" | "storage" | "other";
export type ProjectStatus = "development" | "construction" | "operation";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          organization: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          organization?: string | null;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          organization?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          type: ProjectType;
          capacity_mw: number | null;
          location: string | null;
          status: ProjectStatus;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: ProjectType;
          capacity_mw?: number | null;
          location?: string | null;
          status?: ProjectStatus;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: ProjectType;
          capacity_mw?: number | null;
          location?: string | null;
          status?: ProjectStatus;
          updated_at?: string;
        };
      };
      risk_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          display_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          display_order: number;
        };
        Update: {
          name?: string;
          description?: string | null;
          display_order?: number;
        };
      };
      risk_assessments: {
        Row: {
          id: string;
          project_id: string;
          category_id: string;
          rating: RiskRating;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          category_id: string;
          rating: RiskRating;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: RiskRating;
          summary?: string | null;
          updated_at?: string;
        };
      };
      risk_items: {
        Row: {
          id: string;
          assessment_id: string;
          title: string;
          description: string | null;
          rating: RiskRating;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          title: string;
          description?: string | null;
          rating: RiskRating;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          rating?: RiskRating;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      risk_rating: RiskRating;
      project_type: ProjectType;
      project_status: ProjectStatus;
    };
  };
}
