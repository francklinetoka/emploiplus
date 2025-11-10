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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      company_profiles: {
        Row: {
          address: string
          company_name: string
          company_size: string | null
          company_type: string | null
          created_at: string
          description: string | null
          email: string
          id: string
          is_verified: boolean | null
          logo: string | null
          representative_name: string
          sector: string | null
          updated_at: string
          visibility: string | null
          website: string | null
        }
        Insert: {
          address: string
          company_name: string
          company_size?: string | null
          company_type?: string | null
          created_at?: string
          description?: string | null
          email: string
          id: string
          is_verified?: boolean | null
          logo?: string | null
          representative_name: string
          sector?: string | null
          updated_at?: string
          visibility?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          company_name?: string
          company_size?: string | null
          company_type?: string | null
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          is_verified?: boolean | null
          logo?: string | null
          representative_name?: string
          sector?: string | null
          updated_at?: string
          visibility?: string | null
          website?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          document_type: string
          file_name: string
          file_url: string
          id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          document_type: string
          file_name: string
          file_url: string
          id?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      formations: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string
          duration: string | null
          id: string
          image_url: string | null
          instructor: string | null
          is_active: boolean | null
          level: string | null
          price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          description: string
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          is_active?: boolean | null
          level?: string | null
          price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          is_active?: boolean | null
          level?: string | null
          price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_offers: {
        Row: {
          company_id: string | null
          contact_email: string | null
          contact_phone: string | null
          contract_type: string
          created_at: string
          created_by: string
          description: string
          external_link: string | null
          id: string
          is_active: boolean | null
          location: string
          required_skills: string[]
          title: string
          updated_at: string
          visibility: string | null
        }
        Insert: {
          company_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contract_type: string
          created_at?: string
          created_by: string
          description: string
          external_link?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          required_skills: string[]
          title: string
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          company_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contract_type?: string
          created_at?: string
          created_by?: string
          description?: string
          external_link?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          required_skills?: string[]
          title?: string
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          location: string | null
          professional_title: string | null
          profile_picture: string | null
          sector: string | null
          skills: string[] | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          country: string
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          location?: string | null
          professional_title?: string | null
          profile_picture?: string | null
          sector?: string | null
          skills?: string[] | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          location?: string | null
          professional_title?: string | null
          profile_picture?: string | null
          sector?: string | null
          skills?: string[] | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      publications: {
        Row: {
          author_id: string
          content: string
          created_at: string
          hashtags: string[] | null
          id: string
          is_active: boolean | null
          media_urls: string[] | null
          reactions: Json | null
          shares_count: number | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          is_active?: boolean | null
          media_urls?: string[] | null
          reactions?: Json | null
          shares_count?: number | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          is_active?: boolean | null
          media_urls?: string[] | null
          reactions?: Json | null
          shares_count?: number | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin_offers"
        | "admin_users"
        | "company"
        | "candidate"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin_offers",
        "admin_users",
        "company",
        "candidate",
      ],
    },
  },
} as const
