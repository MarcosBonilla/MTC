import { supabase } from './supabase'
import type { DatabaseAppointment, DatabaseService, DatabaseUnavailableDate, DatabaseStudioSettings } from './supabase'

// APPOINTMENTS
export const appointmentsAPI = {
  // Obtener todas las citas
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services (
          name,
          duration,
          price,
          color
        )
      `)
      .order('date', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Obtener citas por fecha
  async getByDate(date: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', date)
      .neq('status', 'cancelled')
    
    if (error) throw error
    return data
  },

  // Crear nueva cita
  async create(appointment: Omit<DatabaseAppointment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar cita
  async update(id: string, updates: Partial<DatabaseAppointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar cita
  async delete(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Verificar disponibilidad de horario
  async checkAvailability(date: string, time: string, serviceId: string, excludeId?: string) {
    let query = supabase
      .from('appointments')
      .select('time, services(duration)')
      .eq('date', date)
      .neq('status', 'cancelled')

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data: existingAppointments, error } = await query
    
    if (error) throw error

    // Obtener duración del servicio actual
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single()

    if (serviceError) throw serviceError

    const newStartTime = new Date(`${date}T${time}`)
    const newEndTime = new Date(newStartTime.getTime() + service.duration * 60000)

    // Verificar conflictos con citas existentes
    for (const appointment of existingAppointments) {
      const existingStartTime = new Date(`${date}T${appointment.time}`)
      const existingEndTime = new Date(existingStartTime.getTime() + (appointment.services as any)?.duration * 60000)

      // Verificar si hay solapamiento
      if (
        (newStartTime >= existingStartTime && newStartTime < existingEndTime) ||
        (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
        (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
      ) {
        return false // No disponible
      }
    }

    return true // Disponible
  }
}

// SERVICES
export const servicesAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  async create(service: Omit<DatabaseService, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<DatabaseService>) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('services')
      .update({ active: false })
      .eq('id', id)
    
    if (error) throw error
  }
}

// UNAVAILABLE DATES
export const unavailableDatesAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('unavailable_dates')
      .select('*')
      .order('date')
    
    if (error) throw error
    return data
  },

  async create(date: string, reason?: string) {
    const { data, error } = await supabase
      .from('unavailable_dates')
      .insert([{ date, reason }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('unavailable_dates')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// STUDIO SETTINGS
export const studioSettingsAPI = {
  async get() {
    const { data, error } = await supabase
      .from('studio_settings')
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  async update(settings: Partial<DatabaseStudioSettings>) {
    const { data, error } = await supabase
      .from('studio_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', '1') // Asumiendo que solo hay un registro de configuración
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}