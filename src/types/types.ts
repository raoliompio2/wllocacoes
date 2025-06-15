import { Database } from './supabase';

interface BookingWithEquipment {
  id: string;
  equipment_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: string | null;
  status: string;
  special_requirements: string | null;
  delivery_address: string | null;
  created_at: string | null;
  updated_at: string | null;
  equipment: {
    id: string;
    name: string;
    image: string | null;
    daily_rate: string | null;
    category?: string;
    average_rating?: number;
  } | null;
  clientName?: string | null;
  clientContact?: string | null;
  ownerName?: string | null;
  ownerContact?: string | null;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  image: string | null;
  description: string | null;
  specifications: any;
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  available: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  average_rating: number;
  total_reviews: number;
  construction_phase_id?: string | null;
  technical_specs?: any;
  categories?: {
    id: string;
    name: string;
  };
  equipment_images?: Array<{
    id: string;
    url: string;
    is_primary: boolean;
  }>;
}

interface DashboardSummary {
  total_revenue: number;
  active_bookings: number;
  total_customers: number;
  equipment_count: number;
  maintenance_pending: number;
}

interface MaintenanceItem {
  id: string;
  equipment_id: string;
  description: string;
  maintenance_date: string;
  cost: number | null;
  status: 'agendada' | 'em_andamento' | 'concluída';
  created_at: string;
  updated_at: string;
}

interface BudgetRequest {
  id: string;
  equipment_id: string;
  client_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number | null;
  special_requirements: string | null;
  delivery_address: string | null;
  created_at: string;
  updated_at: string;
  equipment?: Equipment | any;
  client?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url?: string | null;
    phone?: string | null;
  } | null;
  ownerName?: string | null;
  ownerWhatsapp?: string | null;
  ownerAddress?: string | null;
}

interface BudgetMessage {
  id: string;
  budget_request_id: string;
  sender_id: string;
  message: string;
  attachment_url: string | null;
  created_at: string;
  sender?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
  status?: 'sending' | 'sent' | 'failed';
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  booking_reminders: boolean;
  maintenance_alerts: boolean;
}

interface PrivacySettings {
  show_profile: boolean;
  show_contact: boolean;
  show_reviews: boolean;
}

export type {
  BookingWithEquipment,
  Equipment,
  DashboardSummary,
  MaintenanceItem,
  NotificationSettings,
  PrivacySettings,
  BudgetRequest,
  BudgetMessage,
};