export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CandidateStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          organization_id: string;
          user_id: string;
          role: "owner" | "admin" | "recruiter";
          created_at: string;
        };
        Insert: {
          organization_id: string;
          user_id: string;
          role?: "owner" | "admin" | "recruiter";
          created_at?: string;
        };
        Update: {
          organization_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "recruiter";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      organization_settings: {
        Row: {
          organization_id: string;
          onboarding_demo_seen: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          onboarding_demo_seen?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          organization_id?: string;
          onboarding_demo_seen?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      candidates: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          stage: CandidateStage;
          salary_expectation: number | null;
          source: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          stage?: CandidateStage;
          salary_expectation?: number | null;
          source?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          stage?: CandidateStage;
          salary_expectation?: number | null;
          source?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "candidates_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      notes: {
        Row: {
          id: string;
          candidate_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_candidate_id_fkey";
            columns: ["candidate_id"];
            isOneToOne: false;
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          }
        ];
      };
      activity_logs: {
        Row: {
          id: string;
          candidate_id: string;
          action: string;
          performed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          action: string;
          performed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          action?: string;
          performed_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_candidate_id_fkey";
            columns: ["candidate_id"];
            isOneToOne: false;
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          }
        ];
      };
      files: {
        Row: {
          id: string;
          candidate_id: string;
          file_url: string;
          file_name: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          file_url: string;
          file_name: string;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          file_url?: string;
          file_name?: string;
          uploaded_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "files_candidate_id_fkey";
            columns: ["candidate_id"];
            isOneToOne: false;
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      bootstrap_organization: {
        Args: {
          org_name?: string;
        };
        Returns: Database["public"]["Tables"]["organizations"]["Row"];
      };
    };
    Enums: {
      candidate_stage: CandidateStage;
      organization_role: "owner" | "admin" | "recruiter";
    };
    CompositeTypes: Record<string, never>;
  };
};
