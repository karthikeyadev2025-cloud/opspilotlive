export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Permissive row type used for tables without full type definitions
type AnyRow = { [key: string]: Json | undefined }
type AnyTable = { Row: AnyRow; Insert: AnyRow; Update: AnyRow; Relationships: [] }

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12.2.3'
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          id: string
          tenant_id: string | null
          email: string
          full_name: string
          role: string
          phone: string | null
          is_active: boolean
          profile_photo_url: string | null
          custom_role_id: string | null
          employee_code: string | null
          department: string | null
          designation: string | null
          date_of_joining: string | null
          date_of_birth: string | null
          salary_basic: number
          salary_hra: number
          salary_allowances: number
          salary_deductions: number
          bank_account: string | null
          bank_ifsc: string | null
          pan_number: string | null
          aadhar_number: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          address: string | null
          employment_status: string
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          email: string
          full_name: string
          role?: string
          phone?: string | null
          is_active?: boolean
          profile_photo_url?: string | null
          custom_role_id?: string | null
          employee_code?: string | null
          department?: string | null
          designation?: string | null
          date_of_joining?: string | null
          date_of_birth?: string | null
          salary_basic?: number
          salary_hra?: number
          salary_allowances?: number
          salary_deductions?: number
          bank_account?: string | null
          bank_ifsc?: string | null
          pan_number?: string | null
          aadhar_number?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          address?: string | null
          employment_status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string | null
          email?: string
          full_name?: string
          role?: string
          phone?: string | null
          is_active?: boolean
          profile_photo_url?: string | null
          custom_role_id?: string | null
          employee_code?: string | null
          department?: string | null
          designation?: string | null
          date_of_joining?: string | null
          date_of_birth?: string | null
          salary_basic?: number
          salary_hra?: number
          salary_allowances?: number
          salary_deductions?: number
          bank_account?: string | null
          bank_ifsc?: string | null
          pan_number?: string | null
          aadhar_number?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          address?: string | null
          employment_status?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      attendance_records: {
        Row: {
          id: string
          tenant_id: string | null
          staff_user_id: string
          attendance_date: string
          check_in_time: string | null
          check_in_selfie_url: string | null
          check_in_lat: number | null
          check_in_lng: number | null
          check_in_address: string | null
          check_out_time: string | null
          check_out_selfie_url: string | null
          check_out_lat: number | null
          check_out_lng: number | null
          check_out_address: string | null
          status: string
          work_hours: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          staff_user_id: string
          attendance_date: string
          check_in_time?: string | null
          check_in_selfie_url?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_address?: string | null
          check_out_time?: string | null
          check_out_selfie_url?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_address?: string | null
          status?: string
          work_hours?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          check_in_time?: string | null
          check_in_selfie_url?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_address?: string | null
          check_out_time?: string | null
          check_out_selfie_url?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_address?: string | null
          status?: string
          work_hours?: number
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
      attendance_logs: {
        Row: {
          id: string
          tenant_id: string | null
          attendance_record_id: string | null
          staff_user_id: string
          attendance_date: string
          punch_type: string
          punch_time: string
          selfie_url: string | null
          lat: number | null
          lng: number | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          attendance_record_id?: string | null
          staff_user_id: string
          attendance_date: string
          punch_type: string
          punch_time: string
          selfie_url?: string | null
          lat?: number | null
          lng?: number | null
          address?: string | null
          created_at?: string
        }
        Update: AnyRow
        Relationships: [
          {
            foreignKeyName: "attendance_logs_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
      leave_requests: {
        Row: {
          id: string
          tenant_id: string | null
          app_user_id: string | null
          requester_name: string | null
          leave_type: string
          from_date: string
          to_date: string
          days_count: number
          reason: string
          status: string
          approved_by: string | null
          remarks: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          app_user_id?: string | null
          requester_name?: string | null
          leave_type: string
          from_date: string
          to_date: string
          days_count: number
          reason: string
          status?: string
          approved_by?: string | null
          remarks?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          status?: string
          approved_by?: string | null
          remarks?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
      leave_balances: {
        Row: {
          id: string
          tenant_id: string | null
          app_user_id: string
          year: number
          casual_total: number
          casual_used: number
          sick_total: number
          sick_used: number
          earned_total: number
          earned_used: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          app_user_id: string
          year?: number
          casual_total?: number
          casual_used?: number
          sick_total?: number
          sick_used?: number
          earned_total?: number
          earned_used?: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          casual_total?: number
          casual_used?: number
          sick_total?: number
          sick_used?: number
          earned_total?: number
          earned_used?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
      salary_advance_requests: {
        Row: {
          id: string
          tenant_id: string | null
          app_user_id: string
          amount_requested: number
          amount_approved: number
          reason: string
          purpose: string | null
          status: string
          approved_by: string | null
          disbursal_date: string | null
          repayment_month: number | null
          repayment_year: number | null
          remarks: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          app_user_id: string
          amount_requested: number
          amount_approved?: number
          reason: string
          purpose?: string | null
          status?: string
          approved_by?: string | null
          disbursal_date?: string | null
          repayment_month?: number | null
          repayment_year?: number | null
          remarks?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          status?: string
          amount_approved?: number
          approved_by?: string | null
          disbursal_date?: string | null
          repayment_month?: number | null
          repayment_year?: number | null
          remarks?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_advance_requests_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
      marketing_leads: {
        Row: {
          id: string
          tenant_id: string | null
          full_name: string
          contact_number: string
          alternate_number: string | null
          email: string | null
          location: string
          address: string | null
          requirement: string
          requirement_details: string | null
          status: string
          priority: string
          assigned_to: string | null
          assigned_at: string | null
          callback_date: string | null
          remarks: string | null
          follow_up_count: number
          last_called_at: string | null
          collected_by: string | null
          executive_user_id: string | null
          invoice_number: string | null
          invoice_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          full_name: string
          contact_number: string
          alternate_number?: string | null
          email?: string | null
          location: string
          address?: string | null
          requirement: string
          requirement_details?: string | null
          status?: string
          priority?: string
          assigned_to?: string | null
          assigned_at?: string | null
          callback_date?: string | null
          remarks?: string | null
          follow_up_count?: number
          last_called_at?: string | null
          collected_by?: string | null
          executive_user_id?: string | null
          invoice_number?: string | null
          invoice_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: AnyRow
        Relationships: [
          {
            foreignKeyName: "marketing_leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_leads_executive_user_id_fkey"
            columns: ["executive_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_remarks: {
        Row: {
          id: string
          tenant_id: string | null
          lead_id: string
          user_id: string | null
          user_name: string
          user_role: string
          remark: string
          call_type: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          lead_id: string
          user_id?: string | null
          user_name: string
          user_role: string
          remark: string
          call_type?: string
          created_at?: string
        }
        Update: AnyRow
        Relationships: [
          {
            foreignKeyName: "lead_remarks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "marketing_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_remarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          tenant_id: string | null
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
      payroll_records: {
        Row: {
          id: string
          tenant_id: string | null
          app_user_id: string
          month: number
          year: number
          basic_pay: number
          hra: number
          allowances: number
          gross_pay: number
          pf_deduction: number
          tds_deduction: number
          other_deductions: number
          total_deductions: number
          net_pay: number
          payment_date: string | null
          payment_mode: string
          payment_status: string
          remarks: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          app_user_id: string
          month: number
          year: number
          basic_pay?: number
          hra?: number
          allowances?: number
          pf_deduction?: number
          tds_deduction?: number
          other_deductions?: number
          payment_date?: string | null
          payment_mode?: string
          payment_status?: string
          remarks?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          basic_pay?: number
          hra?: number
          allowances?: number
          pf_deduction?: number
          tds_deduction?: number
          other_deductions?: number
          payment_date?: string | null
          payment_mode?: string
          payment_status?: string
          remarks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
      tenants: {
        Row: {
          id: string
          company_name: string
          company_email: string
          company_phone: string
          industry: string
          owner_name: string
          owner_email: string
          owner_phone: string
          slug: string
          status: string
          plan_id: string | null
          trial_ends_at: string
          subscription_starts_at: string | null
          subscription_ends_at: string | null
          auth_user_id: string | null
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          company_email: string
          company_phone?: string
          industry?: string
          owner_name: string
          owner_email: string
          owner_phone?: string
          slug: string
          status?: string
          plan_id?: string | null
          trial_ends_at?: string
          subscription_starts_at?: string | null
          subscription_ends_at?: string | null
          auth_user_id?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          company_email?: string
          company_phone?: string
          industry?: string
          owner_name?: string
          owner_phone?: string
          status?: string
          plan_id?: string | null
          trial_ends_at?: string
          subscription_starts_at?: string | null
          subscription_ends_at?: string | null
          notes?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "saas_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      saas_plans: {
        Row: {
          id: string
          name: string
          slug: string
          price_monthly: number
          max_users: number
          features: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          price_monthly?: number
          max_users?: number
          features?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          price_monthly?: number
          max_users?: number
          features?: Json
          is_active?: boolean
        }
        Relationships: []
      }
      razorpay_payments: {
        Row: {
          id: string
          tenant_id: string
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
          plan_id: string | null
          amount: number
          currency: string
          months: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
          plan_id?: string | null
          amount: number
          currency?: string
          months?: number
          status?: string
          created_at?: string
        }
        Update: {
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "razorpay_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "razorpay_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "saas_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      support_tickets: {
        Row: {
          id: string
          tenant_id: string
          subject: string
          message: string
          status: string
          priority: string
          admin_notes: string
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          subject: string
          message: string
          status?: string
          priority?: string
          admin_notes?: string
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          priority?: string
          admin_notes?: string
          resolved_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      platform_theme: {
        Row: {
          id: string
          color_primary: string
          color_primary_hover: string
          color_accent: string
          color_bg_base: string
          color_bg_surface: string
          color_bg_elevated: string
          color_text_primary: string
          color_text_secondary: string
          color_text_muted: string
          color_border: string
          color_border_strong: string
          color_success: string
          color_warning: string
          color_error: string
          font_family: string
          font_size_base: string
          border_radius_sm: string
          border_radius_md: string
          border_radius_lg: string
          border_radius_xl: string
          custom_css: string
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          id?: string
          color_primary?: string
          color_primary_hover?: string
          color_accent?: string
          color_bg_base?: string
          color_bg_surface?: string
          color_bg_elevated?: string
          color_text_primary?: string
          color_text_secondary?: string
          color_text_muted?: string
          color_border?: string
          color_border_strong?: string
          color_success?: string
          color_warning?: string
          color_error?: string
          font_family?: string
          font_size_base?: string
          border_radius_sm?: string
          border_radius_md?: string
          border_radius_lg?: string
          border_radius_xl?: string
          custom_css?: string
          updated_at?: string | null
          updated_by?: string
        }
        Update: {
          color_primary?: string
          color_primary_hover?: string
          color_accent?: string
          color_bg_base?: string
          color_bg_surface?: string
          color_bg_elevated?: string
          color_text_primary?: string
          color_text_secondary?: string
          color_text_muted?: string
          color_border?: string
          color_border_strong?: string
          color_success?: string
          color_warning?: string
          color_error?: string
          font_family?: string
          font_size_base?: string
          border_radius_sm?: string
          border_radius_md?: string
          border_radius_lg?: string
          border_radius_xl?: string
          custom_css?: string
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: []
      }
      super_admins: AnyTable
      tenant_subscriptions: AnyTable
      tenant_users: AnyTable
      razorpay_orders: AnyTable
      role_permissions: {
        Row: {
          id: string
          role_name: string
          description: string
          color: string
          permissions: Json
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role_name: string
          description?: string
          color?: string
          permissions?: Json
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          role_name?: string
          description?: string
          color?: string
          permissions?: Json
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
      login_logs: {
        Row: {
          id: string
          tenant_id: string | null
          user_id: string | null
          email: string
          full_name: string
          role: string
          event_type: string
          ip_address: string
          user_agent: string
          device_info: string
          location_hint: string
          failure_reason: string
          session_id: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          user_id?: string | null
          email?: string
          full_name?: string
          role?: string
          event_type: string
          ip_address?: string
          user_agent?: string
          device_info?: string
          location_hint?: string
          failure_reason?: string
          session_id?: string
          created_at?: string
        }
        Update: AnyRow
        Relationships: [
          {
            foreignKeyName: "login_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
      data_access_logs: {
        Row: {
          id: string
          tenant_id: string | null
          user_id: string | null
          user_email: string
          user_role: string
          action: string
          table_name: string
          record_count: number
          filters_applied: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          user_id?: string | null
          user_email?: string
          user_role?: string
          action?: string
          table_name?: string
          record_count?: number
          filters_applied?: string
          notes?: string
          created_at?: string
        }
        Update: AnyRow
        Relationships: [
          {
            foreignKeyName: "data_access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
