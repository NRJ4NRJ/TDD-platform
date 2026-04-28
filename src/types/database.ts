export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          organization: string | null;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          organization?: string | null;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          organization?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          capacity_mw: number | null;
          created_at: string;
          id: string;
          location: string | null;
          name: string;
          status: Database["public"]["Enums"]["project_status"];
          type: Database["public"]["Enums"]["project_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          capacity_mw?: number | null;
          created_at?: string;
          id?: string;
          location?: string | null;
          name: string;
          status?: Database["public"]["Enums"]["project_status"];
          type: Database["public"]["Enums"]["project_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          capacity_mw?: number | null;
          created_at?: string;
          id?: string;
          location?: string | null;
          name?: string;
          status?: Database["public"]["Enums"]["project_status"];
          type?: Database["public"]["Enums"]["project_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      risk_assessments: {
        Row: {
          category_id: string;
          created_at: string;
          id: string;
          project_id: string;
          rating: Database["public"]["Enums"]["risk_rating"];
          summary: string | null;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          id?: string;
          project_id: string;
          rating?: Database["public"]["Enums"]["risk_rating"];
          summary?: string | null;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          id?: string;
          project_id?: string;
          rating?: Database["public"]["Enums"]["risk_rating"];
          summary?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "risk_assessments_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "risk_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "risk_assessments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      risk_categories: {
        Row: {
          description: string | null;
          display_order: number;
          id: string;
          name: string;
        };
        Insert: {
          description?: string | null;
          display_order: number;
          id?: string;
          name: string;
        };
        Update: {
          description?: string | null;
          display_order?: number;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      risk_items: {
        Row: {
          assessment_id: string;
          created_at: string;
          description: string | null;
          id: string;
          rating: Database["public"]["Enums"]["risk_rating"];
          title: string;
          updated_at: string;
        };
        Insert: {
          assessment_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          rating?: Database["public"]["Enums"]["risk_rating"];
          title: string;
          updated_at?: string;
        };
        Update: {
          assessment_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          rating?: Database["public"]["Enums"]["risk_rating"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "risk_items_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "risk_assessments";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      project_status: "development" | "construction" | "operation";
      project_type: "wind" | "solar" | "hydro" | "storage" | "other";
      risk_rating: "green" | "blue" | "yellow" | "orange" | "red";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience aliases
export type RiskRating = Database["public"]["Enums"]["risk_rating"];
export type ProjectType = Database["public"]["Enums"]["project_type"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
