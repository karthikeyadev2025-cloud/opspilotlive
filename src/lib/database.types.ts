export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Permissive row type used for tables without full type definitions
type AnyRow = { [key: string]: Json | undefined }
type AnyTable = { Row: AnyRow; Insert: AnyRow; Update: AnyRow }

export interface Database {
  public: {
    Tables: {
      app_users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          phone: string | null
          is_active: boolean
          profile_photo_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: string
          phone?: string | null
          is_active?: boolean
          profile_photo_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          phone?: string | null
          is_active?: boolean
          profile_photo_url?: string | null
          updated_at?: string | null
        }
      }
      attendance_records: {
        Row: {
          id: string
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
          created_at: string
        }
        Insert: {
          id?: string
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
        }
      }
      attendance_logs: {
        Row: {
          id: string
          attendance_record_id: string
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
          attendance_record_id: string
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
      }
      leave_requests: {
        Row: {
          id: string
          staff_id: string | null
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
          staff_id?: string | null
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
      }
      salary_advance_requests: {
        Row: {
          id: string
          app_user_id: string
          staff_record_id: string | null
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
          app_user_id: string
          staff_record_id?: string | null
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
      }
      payroll_records: {
        Row: {
          id: string
          staff_id: string
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
          staff_id: string
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
          gross_pay?: number
          pf_deduction?: number
          tds_deduction?: number
          other_deductions?: number
          total_deductions?: number
          net_pay?: number
          payment_date?: string | null
          payment_mode?: string
          payment_status?: string
          remarks?: string | null
        }
      }
      staff_records: {
        Row: {
          id: string
          user_id: string | null
          employee_code: string | null
          full_name: string
          email: string | null
          phone: string | null
          department: string
          designation: string
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
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          employee_code?: string | null
          full_name: string
          email?: string | null
          phone?: string | null
          department?: string
          designation?: string
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
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: AnyRow
      }
      marketing_leads: {
        Row: {
          id: string
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
      }
      lead_remarks: {
        Row: {
          id: string
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
          lead_id: string
          user_id?: string | null
          user_name: string
          user_role: string
          remark: string
          call_type?: string
          created_at?: string
        }
        Update: AnyRow
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }
      leave_balances: {
        Row: {
          id: string
          app_user_id: string
          year: number
          casual_total: number
          casual_used: number
          sick_total: number
          sick_used: number
          earned_total: number
          earned_used: number
        }
        Insert: AnyRow
        Update: AnyRow
      }
      tenants: AnyTable
      saas_plans: AnyTable
      super_admins: AnyTable
      tenant_subscriptions: AnyTable
      tenant_users: AnyTable
      razorpay_orders: AnyTable
      razorpay_payments: AnyTable
      support_tickets: AnyTable
      platform_theme: AnyTable
      role_permissions: AnyTable
      login_logs: AnyTable
      data_access_logs: AnyTable
      office_crm_contacts: AnyTable
      office_tasks: AnyTable
      career_applications: AnyTable
      investment_inquiries: AnyTable
      gallery: AnyTable
      technicians: AnyTable
      testimonials: AnyTable
      services: AnyTable
      site_content: AnyTable
      solar_types: AnyTable
      solar_benefits: AnyTable
      solar_best_practices: AnyTable
      cctv_brands: AnyTable
      cctv_packages: AnyTable
      company_benefits: AnyTable
      managing_director: AnyTable
      why_choose_us: AnyTable
      lead_activities: AnyTable
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
