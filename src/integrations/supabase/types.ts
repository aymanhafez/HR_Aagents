export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      agent_approvals: {
        Row: {
          alternatives: string
          approver_role: string
          created_at: string
          decided_at: string | null
          id: string
          note: string
          reason: string
          risk: string
          run_id: string
          status: string
          step_id: string | null
        }
        Insert: {
          alternatives?: string
          approver_role?: string
          created_at?: string
          decided_at?: string | null
          id?: string
          note?: string
          reason?: string
          risk?: string
          run_id: string
          status?: string
          step_id?: string | null
        }
        Update: {
          alternatives?: string
          approver_role?: string
          created_at?: string
          decided_at?: string | null
          id?: string
          note?: string
          reason?: string
          risk?: string
          run_id?: string
          status?: string
          step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_approvals_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_approvals_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "agent_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_events: {
        Row: {
          created_at: string
          id: string
          message: string
          run_id: string
          step_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          run_id: string
          step_id?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          run_id?: string
          step_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_runs: {
        Row: {
          agent: string
          blocker: string
          created_at: string
          data_source: string
          deadline: string | null
          id: string
          objective: string
          plan_summary: string
          priority: string
          progress: number
          report: Json | null
          requested_by_role: string
          status: string
          updated_at: string
        }
        Insert: {
          agent: string
          blocker?: string
          created_at?: string
          data_source?: string
          deadline?: string | null
          id?: string
          objective: string
          plan_summary?: string
          priority?: string
          progress?: number
          report?: Json | null
          requested_by_role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent?: string
          blocker?: string
          created_at?: string
          data_source?: string
          deadline?: string | null
          id?: string
          objective?: string
          plan_summary?: string
          priority?: string
          progress?: number
          report?: Json | null
          requested_by_role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_steps: {
        Row: {
          attempts: number
          created_at: string
          error: string
          evidence: string
          finished_at: string | null
          id: string
          idx: number
          input: Json
          output: Json | null
          risk: string
          run_id: string
          started_at: string | null
          status: string
          title: string
          tool: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error?: string
          evidence?: string
          finished_at?: string | null
          id?: string
          idx: number
          input?: Json
          output?: Json | null
          risk?: string
          run_id: string
          started_at?: string | null
          status?: string
          title: string
          tool?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error?: string
          evidence?: string
          finished_at?: string | null
          id?: string
          idx?: number
          input?: Json
          output?: Json | null
          risk?: string
          run_id?: string
          started_at?: string | null
          status?: string
          title?: string
          tool?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_steps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_tasks: {
        Row: {
          assignee_department: string
          assignee_name: string
          created_at: string
          created_by_role: string
          data_source: string
          description: string
          due_date: string | null
          id: string
          priority: string
          run_id: string | null
          source_question: string
          status: string
          title: string
        }
        Insert: {
          assignee_department?: string
          assignee_name: string
          created_at?: string
          created_by_role?: string
          data_source?: string
          description?: string
          due_date?: string | null
          id?: string
          priority?: string
          run_id?: string | null
          source_question?: string
          status?: string
          title: string
        }
        Update: {
          assignee_department?: string
          assignee_name?: string
          created_at?: string
          created_by_role?: string
          data_source?: string
          description?: string
          due_date?: string | null
          id?: string
          priority?: string
          run_id?: string | null
          source_question?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      employee_changes: {
        Row: {
          approval_id: string | null
          approved_by: string
          created_at: string
          data_source: string
          employee_key: string
          employee_name: string
          field: string
          id: string
          new_value: string
          old_value: string
          reason: string
          run_id: string | null
        }
        Insert: {
          approval_id?: string | null
          approved_by?: string
          created_at?: string
          data_source?: string
          employee_key: string
          employee_name: string
          field: string
          id?: string
          new_value: string
          old_value?: string
          reason?: string
          run_id?: string | null
        }
        Update: {
          approval_id?: string | null
          approved_by?: string
          created_at?: string
          data_source?: string
          employee_key?: string
          employee_name?: string
          field?: string
          id?: string
          new_value?: string
          old_value?: string
          reason?: string
          run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_changes_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "agent_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_changes_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_employees: {
        Row: {
          created_at: string
          department: string
          employment_type: string
          extra: Json
          goal_achievement: number | null
          grade: string
          id: string
          joined: string
          location: string
          manager: string
          name: string
          risk_flag: string
          salary: number | null
          status: string
          title: string
          utilization: number | null
        }
        Insert: {
          created_at?: string
          department?: string
          employment_type?: string
          extra?: Json
          goal_achievement?: number | null
          grade?: string
          id?: string
          joined?: string
          location?: string
          manager?: string
          name: string
          risk_flag?: string
          salary?: number | null
          status?: string
          title?: string
          utilization?: number | null
        }
        Update: {
          created_at?: string
          department?: string
          employment_type?: string
          extra?: Json
          goal_achievement?: number | null
          grade?: string
          id?: string
          joined?: string
          location?: string
          manager?: string
          name?: string
          risk_flag?: string
          salary?: number | null
          status?: string
          title?: string
          utilization?: number | null
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
