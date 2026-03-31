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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          admin_name: string | null
          body: string
          created_at: string
          id: string
          image_url: string | null
          target_group_id: string | null
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
        }
        Insert: {
          admin_name?: string | null
          body: string
          created_at?: string
          id?: string
          image_url?: string | null
          target_group_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["announcement_type"]
        }
        Update: {
          admin_name?: string | null
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          target_group_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"]
        }
        Relationships: [
          {
            foreignKeyName: "announcements_target_group_id_fkey"
            columns: ["target_group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          admin_name: string | null
          created_at: string
          details: string | null
          id: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          admin_name?: string | null
          created_at?: string
          details?: string | null
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          admin_name?: string | null
          created_at?: string
          details?: string | null
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          group_id: string
          id: string
          text: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          text: string
          user_id: string
          username?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          text?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_info: {
        Row: {
          call_number: string | null
          email: string | null
          facebook: string | null
          id: number
          sms_number: string | null
          whatsapp: string | null
        }
        Insert: {
          call_number?: string | null
          email?: string | null
          facebook?: string | null
          id?: number
          sms_number?: string | null
          whatsapp?: string | null
        }
        Update: {
          call_number?: string | null
          email?: string | null
          facebook?: string | null
          id?: number
          sms_number?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      disbursements: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          disbursed_at: string | null
          group_id: string
          group_name: string | null
          id: string
          proof_url: string | null
          seat_numbers: string | null
          slot_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          disbursed_at?: string | null
          group_id: string
          group_name?: string | null
          id?: string
          proof_url?: string | null
          seat_numbers?: string | null
          slot_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          disbursed_at?: string | null
          group_id?: string
          group_name?: string | null
          id?: string
          proof_url?: string | null
          seat_numbers?: string | null
          slot_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disbursements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disbursements_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      exit_requests: {
        Row: {
          created_at: string
          group_id: string
          id: string
          reason: string | null
          slot_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          reason?: string | null
          slot_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          reason?: string | null
          slot_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exit_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_requests_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          account_name: string | null
          account_number: string | null
          bank_name: string | null
          chat_locked: boolean
          contribution_amount: number
          created_at: string
          cycle_type: string
          description: string | null
          disbursement_days: number
          filled_slots: number
          id: string
          is_live: boolean
          is_locked: boolean
          live_at: string | null
          name: string
          payment_days: number
          payment_frequency: string
          payout_account: string | null
          payout_amount: number
          terms_text: string | null
          total_slots: number
          updated_at: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          chat_locked?: boolean
          contribution_amount?: number
          created_at?: string
          cycle_type?: string
          description?: string | null
          disbursement_days?: number
          filled_slots?: number
          id?: string
          is_live?: boolean
          is_locked?: boolean
          live_at?: string | null
          name: string
          payment_days?: number
          payment_frequency?: string
          payout_account?: string | null
          payout_amount?: number
          terms_text?: string | null
          total_slots?: number
          updated_at?: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          chat_locked?: boolean
          contribution_amount?: number
          created_at?: string
          cycle_type?: string
          description?: string | null
          disbursement_days?: number
          filled_slots?: number
          id?: string
          is_live?: boolean
          is_locked?: boolean
          live_at?: string | null
          name?: string
          payment_days?: number
          payment_frequency?: string
          payout_account?: string | null
          payout_amount?: number
          terms_text?: string | null
          total_slots?: number
          updated_at?: string
        }
        Relationships: []
      }
      guide_tips: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          bank_acc_name: string | null
          bank_acc_num: string | null
          bank_name: string | null
          bvn_nin: string | null
          created_at: string
          current_address: string | null
          current_state: string | null
          dob: string | null
          email: string
          first_name: string
          gender: string | null
          home_address: string | null
          id: string
          is_banned: boolean
          is_frozen: boolean
          is_restricted: boolean
          is_vip: boolean
          last_login_at: string | null
          last_name: string
          lga: string | null
          middle_name: string | null
          nickname: string | null
          phone: string | null
          profile_picture: string | null
          role: Database["public"]["Enums"]["app_role"]
          state_of_origin: string | null
          total_paid: number
          trust_score: number
          unread_notifications: number
          updated_at: string
          username: string
          whatsapp_number: string | null
        }
        Insert: {
          age?: number | null
          bank_acc_name?: string | null
          bank_acc_num?: string | null
          bank_name?: string | null
          bvn_nin?: string | null
          created_at?: string
          current_address?: string | null
          current_state?: string | null
          dob?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          home_address?: string | null
          id: string
          is_banned?: boolean
          is_frozen?: boolean
          is_restricted?: boolean
          is_vip?: boolean
          last_login_at?: string | null
          last_name?: string
          lga?: string | null
          middle_name?: string | null
          nickname?: string | null
          phone?: string | null
          profile_picture?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          state_of_origin?: string | null
          total_paid?: number
          trust_score?: number
          unread_notifications?: number
          updated_at?: string
          username: string
          whatsapp_number?: string | null
        }
        Update: {
          age?: number | null
          bank_acc_name?: string | null
          bank_acc_num?: string | null
          bank_name?: string | null
          bvn_nin?: string | null
          created_at?: string
          current_address?: string | null
          current_state?: string | null
          dob?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          home_address?: string | null
          id?: string
          is_banned?: boolean
          is_frozen?: boolean
          is_restricted?: boolean
          is_vip?: boolean
          last_login_at?: string | null
          last_name?: string
          lga?: string | null
          middle_name?: string | null
          nickname?: string | null
          phone?: string | null
          profile_picture?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          state_of_origin?: string | null
          total_paid?: number
          trust_score?: number
          unread_notifications?: number
          updated_at?: string
          username?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      seat_change_requests: {
        Row: {
          created_at: string
          current_seat: number | null
          group_id: string
          id: string
          reason: string | null
          requested_seat: number | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_seat?: number | null
          group_id: string
          id?: string
          reason?: string | null
          requested_seat?: number | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_seat?: number | null
          group_id?: string
          id?: string
          reason?: string | null
          requested_seat?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_change_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      slots: {
        Row: {
          created_at: string
          disbursed_at: string | null
          full_name: string | null
          group_id: string
          id: string
          is_disbursed: boolean
          is_vip: boolean | null
          joined_at: string | null
          nickname: string | null
          profile_picture: string | null
          seat_no: number
          status: Database["public"]["Enums"]["slot_status"]
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          disbursed_at?: string | null
          full_name?: string | null
          group_id: string
          id?: string
          is_disbursed?: boolean
          is_vip?: boolean | null
          joined_at?: string | null
          nickname?: string | null
          profile_picture?: string | null
          seat_no: number
          status?: Database["public"]["Enums"]["slot_status"]
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          disbursed_at?: string | null
          full_name?: string | null
          group_id?: string
          id?: string
          is_disbursed?: boolean
          is_vip?: boolean | null
          joined_at?: string | null
          nickname?: string | null
          profile_picture?: string | null
          seat_no?: number
          status?: Database["public"]["Enums"]["slot_status"]
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slots_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          admin_reply_attachment: string | null
          attachment_url: string | null
          created_at: string
          id: string
          message: string
          replied_at: string | null
          status: string
          subject: string
          user_id: string
          username: string | null
        }
        Insert: {
          admin_reply?: string | null
          admin_reply_attachment?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          message: string
          replied_at?: string | null
          status?: string
          subject: string
          user_id: string
          username?: string | null
        }
        Update: {
          admin_reply?: string | null
          admin_reply_attachment?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          message?: string
          replied_at?: string | null
          status?: string
          subject?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          is_admin: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          code: string
          created_at: string
          declined_reason: string | null
          group_id: string | null
          group_name: string
          id: string
          screenshot_url: string | null
          seat_numbers: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          code?: string
          created_at?: string
          declined_reason?: string | null
          group_id?: string | null
          group_name?: string
          id?: string
          screenshot_url?: string | null
          seat_numbers?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string
          declined_reason?: string | null
          group_id?: string | null
          group_name?: string
          id?: string
          screenshot_url?: string | null
          seat_numbers?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_debts: {
        Row: {
          amount: number
          created_at: string
          group_id: string
          id: string
          is_paid: boolean
          reason: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          group_id: string
          id?: string
          is_paid?: boolean
          reason?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          group_id?: string
          id?: string
          is_paid?: boolean
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_debts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      check_and_mark_defaulters: { Args: never; Returns: undefined }
      get_leaderboard: {
        Args: never
        Returns: {
          first_name: string
          groups_joined: number
          id: string
          is_vip: boolean
          last_name: string
          nickname: string
          profile_picture: string
          role: Database["public"]["Enums"]["app_role"]
          total_paid: number
          trust_score: number
        }[]
      }
      get_platform_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      send_notification_to_all: {
        Args: { p_message: string }
        Returns: undefined
      }
      send_notification_to_group: {
        Args: { p_group_id: string; p_message: string }
        Returns: undefined
      }
      send_notification_to_user: {
        Args: { p_message: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      announcement_type:
        | "announcement"
        | "promotion"
        | "server-update"
        | "group-message"
      app_role: "admin" | "moderator" | "user"
      slot_status: "available" | "reserved" | "claimed" | "locked"
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
      announcement_type: [
        "announcement",
        "promotion",
        "server-update",
        "group-message",
      ],
      app_role: ["admin", "moderator", "user"],
      slot_status: ["available", "reserved", "claimed", "locked"],
    },
  },
} as const
