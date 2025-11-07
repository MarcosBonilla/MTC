import { createClient } from '@supabase/supabase-js'

// Credenciales del proyecto Supabase desde variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://katjtoifoeqsvhcqhvtq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdGp0b2lmb2Vxc3ZoY3FodnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTU0MTQsImV4cCI6MjA3ODAzMTQxNH0.XSw2BzwXjImr7kewKf_IaZIVMOMd0hOG9pvo3_L9JS4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript
export interface DatabaseAppointment {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  service_id: string
  date: string
  time: string
  notes?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface DatabaseService {
  id: string
  name: string
  description: string
  duration: number
  price: number
  color: string
  active: boolean
  created_at: string
}

export interface DatabaseUnavailableDate {
  id: string
  date: string
  reason?: string
  created_at: string
}

export interface DatabaseStudioSettings {
  id: string
  opening_hours: {
    [key: string]: { start: string; end: string }
  }
  break_duration: number
  advance_booking_days: number
  updated_at: string
}

export interface DatabasePortfolioItem {
  id: string
  title: string
  artist: string | null
  description: string
  type: 'music' | 'video'
  image_url: string
  audio_url: string | null
  video_url: string | null
  genre: string | null
  duration: string | null
  created_at: string
  updated_at: string
}