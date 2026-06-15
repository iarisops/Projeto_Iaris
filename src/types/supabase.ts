export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      action_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          initiatives: Json
          notes: string | null
          okr_id: string | null
          owner_id: string | null
          quarter: string
          startup_id: string
          status: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          initiatives?: Json
          notes?: string | null
          okr_id?: string | null
          owner_id?: string | null
          quarter: string
          startup_id: string
          status?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          initiatives?: Json
          notes?: string | null
          okr_id?: string | null
          owner_id?: string | null
          quarter?: string
          startup_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_okr_id_fkey"
            columns: ["okr_id"]
            isOneToOne: false
            referencedRelation: "okrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "portfolio_startups"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          model: string | null
          prompt_version: string | null
          requester_id: string | null
          started_at: string | null
          startup_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          model?: string | null
          prompt_version?: string | null
          requester_id?: string | null
          started_at?: string | null
          startup_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          model?: string | null
          prompt_version?: string | null
          requester_id?: string | null
          started_at?: string | null
          startup_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_jobs_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "portfolio_startups"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_criteria: {
        Row: {
          category: string
          criterion: string
          green_description: string | null
          id: string
          orange_description: string | null
          red_description: string | null
          suggested_evidence: string | null
          what_to_observe: string | null
          yellow_description: string | null
        }
        Insert: {
          category: string
          criterion: string
          green_description?: string | null
          id?: string
          orange_description?: string | null
          red_description?: string | null
          suggested_evidence?: string | null
          what_to_observe?: string | null
          yellow_description?: string | null
        }
        Update: {
          category?: string
          criterion?: string
          green_description?: string | null
          id?: string
          orange_description?: string | null
          red_description?: string | null
          suggested_evidence?: string | null
          what_to_observe?: string | null
          yellow_description?: string | null
        }
        Relationships: []
      }
      assessment_items: {
        Row: {
          assessment_id: string
          category: string
          created_at: string | null
          deadline: string | null
          id: string
          next_focus: string | null
          observed_evidence: string | null
          responsible: string | null
          risk_interpretation: string | null
          signal: string
          updated_at: string | null
        }
        Insert: {
          assessment_id: string
          category: string
          created_at?: string | null
          deadline?: string | null
          id?: string
          next_focus?: string | null
          observed_evidence?: string | null
          responsible?: string | null
          risk_interpretation?: string | null
          signal: string
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string
          category?: string
          created_at?: string | null
          deadline?: string | null
          id?: string
          next_focus?: string | null
          observed_evidence?: string | null
          responsible?: string | null
          risk_interpretation?: string | null
          signal?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_items_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "operational_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      context_versions: {
        Row: {
          ai_job_id: string | null
          content: string
          generated_at: string | null
          id: string
          last_edited_at: string | null
          last_edited_by: string | null
          model: string | null
          prompt_version: string | null
          startup_id: string
          was_manually_edited: boolean
        }
        Insert: {
          ai_job_id?: string | null
          content: string
          generated_at?: string | null
          id?: string
          last_edited_at?: string | null
          last_edited_by?: string | null
          model?: string | null
          prompt_version?: string | null
          startup_id: string
          was_manually_edited?: boolean
        }
        Update: {
          ai_job_id?: string | null
          content?: string
          generated_at?: string | null
          id?: string
          last_edited_at?: string | null
          last_edited_by?: string | null
          model?: string | null
          prompt_version?: string | null
          startup_id?: string
          was_manually_edited?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "context_versions_ai_job_id_fkey"
            columns: ["ai_job_id"]
            isOneToOne: false
            referencedRelation: "ai_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "context_versions_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "portfolio_startups"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          external_link: string | null
          id: string
          note: string | null
          responsible_id: string | null
          startup_candidate_id: string
          status: string
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          external_link?: string | null
          id?: string
          note?: string | null
          responsible_id?: string | null
          startup_candidate_id: string
          status?: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          external_link?: string | null
          id?: string
          note?: string | null
          responsible_id?: string | null
          startup_candidate_id?: string
          status?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_startup_candidate_id_fkey"
            columns: ["startup_candidate_id"]
            isOneToOne: false
            referencedRelation: "startup_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          kanban_task_id: string | null
          name: string
          startup_id: string
          storage_path: string | null
          type: string | null
          updated_at: string | null
          updated_by: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          kanban_task_id?: string | null
          name: string
          startup_id: string
          storage_path?: string | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          kanban_task_id?: string | null
          name?: string
          startup_id?: string
          storage_path?: string | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_kanban_task_id_fkey"
            columns: ["kanban_task_id"]
            isOneToOne: false
            referencedRelation: "kanban_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "portfolio_startups"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_stages: {
        Row: {
          created_at: string | null
          funnel_id: string
          id: string
          is_archived: boolean
          is_default: boolean
          is_final: boolean
          name: string
          position: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          funnel_id: string
          id?: string
          is_archived?: boolean
          is_default?: boolean
          is_final?: boolean
          name: string
          position: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          funnel_id?: string
          id?: string
          is_archived?: boolean
          is_default?: boolean
          is_final?: boolean
          name?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_stages_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnels: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          edition: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          edition?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          edition?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      kanban_tasks: {
        Row: {
          comments: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          links: Json
          phase: string
          quarter: string
          responsible_id: string | null
          startup_id: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          links?: Json
          phase?: string
          quarter: string
          responsible_id?: string | null
          startup_id: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          links?: Json
          phase?: string
          quarter?: string
          responsible_id?: string | null
          startup_id?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_tasks_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "portfolio_startups"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_value: number | null
          id: string
          notes: string | null
          period: string | null
          previous_value: number | null
          quarter: string
          startup_id: string
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          id?: string
          notes?: string | null
          period?: string | null
          previous_value?: number | null
          quarter: string
          startup_id: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          id?: string
          notes?: string | null
          period?: string | null
          previous_value?: number | null
          quarter?: string
          startup_id?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "portfolio_startups"
            referencedColumns: ["id"]
          },
        ]
      }
      okrs: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          key_results: Json
          notes: string | null
          objective: string
          owner_id: string | null
          progress: number | null
          quarter: string
          startup_id: string
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          key_results?: Json
          notes?: string | null
          objective: string
          owner_id?: string | null
          progress?: number | null
          quarter: string
          startup_id: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          key_results?: Json
          notes?: string | null
          objective?: string
          owner_id?: string | null
          progress?: number | null
          quarter?: string
          startup_id?: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "okrs_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "portfolio_startups"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_assessments: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          quarter: string
          responsible_id: string | null
          startup_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          quarter: string
          responsible_id?: string | null
          startup_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          quarter?: string
          responsible_id?: string | null
          startup_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operational_assessments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "portfolio_startups"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_evaluation_forms: {
        Row: {
          created_at: string | null
          created_by: string | null
          criteria: Json
          funnel_id: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          criteria?: Json
          funnel_id: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          criteria?: Json
          funnel_id?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_evaluation_forms_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_evaluations: {
        Row: {
          approved: boolean | null
          created_at: string | null
          created_by: string | null
          criteria_scores: Json
          evaluation_date: string | null
          evaluator_email: string | null
          evaluator_name: string | null
          final_score: number | null
          form_id: string | null
          general_comments: string | null
          id: string
          startup_candidate_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          created_by?: string | null
          criteria_scores?: Json
          evaluation_date?: string | null
          evaluator_email?: string | null
          evaluator_name?: string | null
          final_score?: number | null
          form_id?: string | null
          general_comments?: string | null
          id?: string
          startup_candidate_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          created_by?: string | null
          criteria_scores?: Json
          evaluation_date?: string | null
          evaluator_email?: string | null
          evaluator_name?: string | null
          final_score?: number | null
          form_id?: string | null
          general_comments?: string | null
          id?: string
          startup_candidate_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_evaluations_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "panel_evaluation_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_evaluations_startup_candidate_id_fkey"
            columns: ["startup_candidate_id"]
            isOneToOne: false
            referencedRelation: "startup_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_activities: {
        Row: {
          channel: string | null
          created_at: string | null
          created_by: string | null
          date: string
          external_link: string | null
          id: string
          notes: string | null
          participants: Json
          responsible_id: string | null
          startup_id: string
          status: string
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          external_link?: string | null
          id?: string
          notes?: string | null
          participants?: Json
          responsible_id?: string | null
          startup_id: string
          status?: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          external_link?: string | null
          id?: string
          notes?: string | null
          participants?: Json
          responsible_id?: string | null
          startup_id?: string
          status?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_activities_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "portfolio_startups"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_startups: {
        Row: {
          business_model: string | null
          captable_summary: string | null
          created_at: string | null
          created_by: string | null
          engagement: string | null
          entry_date: string | null
          founders: Json
          funding_round: string | null
          funding_target: number | null
          funding_use: string | null
          iaris_stake: number | null
          icp: string | null
          id: string
          journey_status: string | null
          last_update_at: string | null
          linkedin: string | null
          logo_url: string | null
          name: string
          problem: string | null
          revenue_model: string | null
          segment: string | null
          short_description: string | null
          site: string | null
          solution: string | null
          source_candidate_id: string | null
          stage: string | null
          tier: number | null
          updated_at: string | null
          updated_by: string | null
          valuation_instrument: string | null
          vertical: string | null
        }
        Insert: {
          business_model?: string | null
          captable_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          engagement?: string | null
          entry_date?: string | null
          founders?: Json
          funding_round?: string | null
          funding_target?: number | null
          funding_use?: string | null
          iaris_stake?: number | null
          icp?: string | null
          id?: string
          journey_status?: string | null
          last_update_at?: string | null
          linkedin?: string | null
          logo_url?: string | null
          name: string
          problem?: string | null
          revenue_model?: string | null
          segment?: string | null
          short_description?: string | null
          site?: string | null
          solution?: string | null
          source_candidate_id?: string | null
          stage?: string | null
          tier?: number | null
          updated_at?: string | null
          updated_by?: string | null
          valuation_instrument?: string | null
          vertical?: string | null
        }
        Update: {
          business_model?: string | null
          captable_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          engagement?: string | null
          entry_date?: string | null
          founders?: Json
          funding_round?: string | null
          funding_target?: number | null
          funding_use?: string | null
          iaris_stake?: number | null
          icp?: string | null
          id?: string
          journey_status?: string | null
          last_update_at?: string | null
          linkedin?: string | null
          logo_url?: string | null
          name?: string
          problem?: string | null
          revenue_model?: string | null
          segment?: string | null
          short_description?: string | null
          site?: string | null
          solution?: string | null
          source_candidate_id?: string | null
          stage?: string | null
          tier?: number | null
          updated_at?: string | null
          updated_by?: string | null
          valuation_instrument?: string | null
          vertical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_source_candidate"
            columns: ["source_candidate_id"]
            isOneToOne: false
            referencedRelation: "startup_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      qualitative_assessments: {
        Row: {
          created_at: string | null
          created_by: string | null
          criteria_signals: Json
          id: string
          notes: string | null
          recommendation: string | null
          startup_candidate_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          criteria_signals?: Json
          id?: string
          notes?: string | null
          recommendation?: string | null
          startup_candidate_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          criteria_signals?: Json
          id?: string
          notes?: string | null
          recommendation?: string | null
          startup_candidate_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualitative_assessments_startup_candidate_id_fkey"
            columns: ["startup_candidate_id"]
            isOneToOne: false
            referencedRelation: "startup_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      rituals: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          external_link: string | null
          id: string
          notes: string | null
          participants: Json
          startup_id: string
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          external_link?: string | null
          id?: string
          notes?: string | null
          participants?: Json
          startup_id: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          external_link?: string | null
          id?: string
          notes?: string | null
          participants?: Json
          startup_id?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rituals_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "portfolio_startups"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_candidates: {
        Row: {
          captable: string | null
          converted_portfolio_startup_id: string | null
          created_at: string | null
          created_by: string | null
          customers: string | null
          email: string | null
          equity: string | null
          funnel_id: string
          general_note: string | null
          history_evolution: string | null
          id: string
          import_note: string | null
          internal_owner_id: string | null
          last_update_at: string | null
          mrr: number | null
          name: string
          next_action: string | null
          phase: string | null
          pitch_deck_url: string | null
          reminder_note: string | null
          result: string
          score: number | null
          site: string | null
          stage_id: string | null
          team: string | null
          updated_at: string | null
          updated_by: string | null
          vertical: string | null
          what_seeks: string | null
          whatsapp: string | null
        }
        Insert: {
          captable?: string | null
          converted_portfolio_startup_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customers?: string | null
          email?: string | null
          equity?: string | null
          funnel_id: string
          general_note?: string | null
          history_evolution?: string | null
          id?: string
          import_note?: string | null
          internal_owner_id?: string | null
          last_update_at?: string | null
          mrr?: number | null
          name: string
          next_action?: string | null
          phase?: string | null
          pitch_deck_url?: string | null
          reminder_note?: string | null
          result?: string
          score?: number | null
          site?: string | null
          stage_id?: string | null
          team?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vertical?: string | null
          what_seeks?: string | null
          whatsapp?: string | null
        }
        Update: {
          captable?: string | null
          converted_portfolio_startup_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customers?: string | null
          email?: string | null
          equity?: string | null
          funnel_id?: string
          general_note?: string | null
          history_evolution?: string | null
          id?: string
          import_note?: string | null
          internal_owner_id?: string | null
          last_update_at?: string | null
          mrr?: number | null
          name?: string
          next_action?: string | null
          phase?: string | null
          pitch_deck_url?: string | null
          reminder_note?: string | null
          result?: string
          score?: number | null
          site?: string | null
          stage_id?: string | null
          team?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vertical?: string | null
          what_seeks?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_candidates_converted_portfolio_startup_id_fkey"
            columns: ["converted_portfolio_startup_id"]
            isOneToOne: false
            referencedRelation: "portfolio_startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_candidates_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_candidates_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "funnel_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          must_change_password: boolean
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          must_change_password?: boolean
          name: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          must_change_password?: boolean
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
