export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          role: string
          phone: string | null
          address: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          notification_settings: Json | null
          privacy_settings: Json | null
          company_id: string | null
          theme_preferences: Json | null
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          role?: string
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          notification_settings?: Json | null
          privacy_settings?: Json | null
          company_id?: string | null
          theme_preferences?: Json | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          role?: string
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          notification_settings?: Json | null
          privacy_settings?: Json | null
          company_id?: string | null
          theme_preferences?: Json | null
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          category: string | null
          image: string | null
          description: string | null
          specifications: Json | null
          daily_rate: number | null
          weekly_rate: number | null
          monthly_rate: number | null
          available: boolean | null
          user_id: string | null
          created_at: string
          updated_at: string
          average_rating: number | null
          total_reviews: number | null
          construction_phase_id: string | null
          technical_specs: Json | null
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          image?: string | null
          description?: string | null
          specifications?: Json | null
          daily_rate?: number | null
          weekly_rate?: number | null
          monthly_rate?: number | null
          available?: boolean | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
          average_rating?: number | null
          total_reviews?: number | null
          construction_phase_id?: string | null
          technical_specs?: Json | null
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          image?: string | null
          description?: string | null
          specifications?: Json | null
          daily_rate?: number | null
          weekly_rate?: number | null
          monthly_rate?: number | null
          available?: boolean | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
          average_rating?: number | null
          total_reviews?: number | null
          construction_phase_id?: string | null
          technical_specs?: Json | null
        }
      }
      // Definições adicionais de tabelas podem ser adicionadas conforme necessário
    }
    Views: {
      all_budget_requests: {
        Row: {
          id: string
          equipment_id: string
          client_id: string | null
          owner_id: string | null
          start_date: string
          end_date: string
          status: string
          total_amount: number | null
          special_requirements: string | null
          delivery_address: string | null
          created_at: string
          updated_at: string
          client_type: string | null
          display_name: string | null
          display_email: string | null
          display_phone: string | null
          equipment_name: string | null
          equipment_image: string | null
          equipment_category: string | null
          owner_name: string | null
        }
      }
    }
    Functions: {}
  }
} 