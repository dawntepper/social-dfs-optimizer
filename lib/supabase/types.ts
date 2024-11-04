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
      players: {
        Row: {
          id: string
          name: string
          position: string
          team: string
          salary: number
          projection: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          position: string
          team: string
          salary: number
          projection: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: string
          team?: string
          salary?: number
          projection?: number
          created_at?: string
          updated_at?: string
        }
      }
      projections: {
        Row: {
          id: string
          player_id: string
          value: number
          source: string
          created_at: string
        }
        Insert: {
          id: string
          player_id: string
          value: number
          source: string
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          value?: number
          source?: string
          created_at?: string
        }
      }
      social_sentiment: {
        Row: {
          id: string
          player_id: string
          sentiment: number
          source: string
          created_at: string
        }
        Insert: {
          id: string
          player_id: string
          sentiment: number
          source: string
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          sentiment?: number
          source?: string
          created_at?: string
        }
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
  }
}