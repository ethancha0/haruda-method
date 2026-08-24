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
      charts: {
        Row: {
          user_id: string;
          id: string;
          goal: string;
          why: string | null;
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          id: string;
          goal: string;
          why?: string | null;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          id?: string;
          goal?: string;
          why?: string | null;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      themes: {
        Row: {
          id: string;
          user_id: string;
          position: number;
          title: string;
        };
        Insert: {
          id: string;
          user_id: string;
          position: number;
          title: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          position?: number;
          title?: string;
        };
        Relationships: [];
      };
      actions: {
        Row: {
          id: string;
          user_id: string;
          theme_id: string;
          title: string;
          target: number;
          sort_order: number;
        };
        Insert: {
          id: string;
          user_id: string;
          theme_id: string;
          title: string;
          target: number;
          sort_order?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme_id?: string;
          title?: string;
          target?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
      logs: {
        Row: {
          id: string;
          user_id: string;
          action_id: string;
          date: string;
          note: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          action_id: string;
          date: string;
          note?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_id?: string;
          date?: string;
          note?: string | null;
        };
        Relationships: [];
      };
      week_notes: {
        Row: {
          user_id: string;
          week_key: string;
          note: string;
        };
        Insert: {
          user_id: string;
          week_key: string;
          note?: string;
        };
        Update: {
          user_id?: string;
          week_key?: string;
          note?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      load_chart: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      save_chart: {
        Args: { payload: Json };
        Returns: undefined;
      };
      delete_chart: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
