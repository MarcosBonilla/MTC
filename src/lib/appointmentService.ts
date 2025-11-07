import { supabase } from './supabase';
import type { DatabaseAppointment } from './supabase';
import type { BookingFormData } from '../types';

// Convertir datos de la UI al formato de base de datos
const toDatabase = (appointment: Omit<BookingFormData, 'id' | 'createdAt'> & { status: 'pending' | 'confirmed' | 'cancelled' | 'completed' }): Omit<DatabaseAppointment, 'id' | 'created_at' | 'updated_at'> => ({
  client_name: appointment.clientName,
  client_email: appointment.clientEmail,
  client_phone: appointment.clientPhone,
  service_id: appointment.serviceId,
  date: appointment.date,
  time: appointment.time,
  notes: appointment.notes || undefined,
  status: appointment.status
});

// Convertir datos de base de datos al formato de la UI
const fromDatabase = (dbAppointment: DatabaseAppointment): any => ({
  id: dbAppointment.id,
  clientName: dbAppointment.client_name,
  clientEmail: dbAppointment.client_email,
  clientPhone: dbAppointment.client_phone,
  serviceId: dbAppointment.service_id,
  date: dbAppointment.date,
  time: dbAppointment.time,
  notes: dbAppointment.notes || '',
  status: dbAppointment.status,
  createdAt: dbAppointment.created_at
});

export const appointmentService = {
  // Crear nueva cita
  async create(bookingData: BookingFormData): Promise<any> {
    console.log('🔄 Creando cita en Supabase...', bookingData);
    
    const appointmentData = toDatabase({
      ...bookingData,
      status: 'pending'
    });

    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando cita:', error);
      throw new Error(`Error al crear la cita: ${error.message}`);
    }

    if (!data) {
      throw new Error('No se recibieron datos de la cita creada');
    }

    console.log('✅ Cita creada exitosamente:', data);
    return fromDatabase(data);
  },

  // Obtener todas las citas
  async getAll(): Promise<any[]> {
    console.log('🔄 Obteniendo todas las citas...');
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo citas:', error);
      throw new Error(`Error al obtener citas: ${error.message}`);
    }

    const appointments = (data || []).map(fromDatabase);
    console.log(`✅ ${appointments.length} citas obtenidas`);
    return appointments;
  },

  // Actualizar cita
  async update(id: string, updates: Partial<any>): Promise<any> {
    console.log('🔄 Actualizando cita:', id, updates);
    
    const dbUpdates: Partial<Omit<DatabaseAppointment, 'id' | 'created_at' | 'updated_at'>> = {};
    
    if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
    if (updates.clientEmail !== undefined) dbUpdates.client_email = updates.clientEmail;
    if (updates.clientPhone !== undefined) dbUpdates.client_phone = updates.clientPhone;
    if (updates.serviceId !== undefined) dbUpdates.service_id = updates.serviceId;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.time !== undefined) dbUpdates.time = updates.time;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { data, error } = await supabase
      .from('appointments')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando cita:', error);
      throw new Error(`Error al actualizar cita: ${error.message}`);
    }

    if (!data) {
      throw new Error('No se recibieron datos de la cita actualizada');
    }

    console.log('✅ Cita actualizada exitosamente:', data);
    return fromDatabase(data);
  },

  // Eliminar cita
  async delete(id: string): Promise<void> {
    console.log('🔄 Eliminando cita:', id);
    
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error eliminando cita:', error);
      throw new Error(`Error al eliminar cita: ${error.message}`);
    }

    console.log('✅ Cita eliminada exitosamente');
  },

  // Obtener citas por fecha (para calcular disponibilidad)
  async getByDate(date: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', date)
      .neq('status', 'cancelled');

    if (error) {
      console.error('❌ Error obteniendo citas por fecha:', error);
      throw new Error(`Error al obtener citas: ${error.message}`);
    }

    return (data || []).map(fromDatabase);
  }
};