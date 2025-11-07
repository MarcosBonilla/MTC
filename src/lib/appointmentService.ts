import { supabase } from './supabase';
import type { DatabaseAppointment } from './supabase';
import type { Appointment, BookingFormData } from '../types';

// Convertir datos de la UI al formato de base de datos
const toDatabase = (appointment: Omit<Appointment, 'id' | 'createdAt'>): Omit<DatabaseAppointment, 'id' | 'created_at' | 'updated_at'> => ({
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
const fromDatabase = (dbAppointment: DatabaseAppointment): Appointment => ({
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

// Validar que no haya conflictos de horario
const validateTimeSlot = async (date: string, time: string, serviceId: string): Promise<void> => {
  console.log(`🔍 Validando slot: ${date} ${time} para servicio ${serviceId}`);
  
  // Obtener todas las citas del día (usando la función del service)
  const { data: dayAppointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', date)
    .neq('status', 'cancelled');

  if (appointmentsError) {
    console.error('❌ Error obteniendo citas para validación:', appointmentsError);
    throw new Error(`Error al validar horario: ${appointmentsError.message}`);
  }

  const existingAppointments = (dayAppointments || []).map(fromDatabase);
  
  if (existingAppointments.length === 0) {
    console.log('✅ No hay citas en este día, slot disponible');
    return;
  }
  
  // Obtener información del servicio que se quiere reservar
  const { data: serviceData, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .eq('active', true)
    .single();
  
  if (serviceError || !serviceData) {
    throw new Error(`Servicio no encontrado o inactivo: ${serviceId}`);
  }
  
  const currentService = {
    id: serviceData.id,
    name: serviceData.name,
    duration: serviceData.duration_minutes,
    price: serviceData.price,
    description: serviceData.description,
    active: serviceData.active
  };
  
  console.log(`📋 Validando ${currentService.name} (${currentService.duration}min) contra ${existingAppointments.length} citas existentes`);
  
  // Verificar conflictos con citas existentes
  for (const appointment of existingAppointments) {
    // Obtener información del servicio de la cita existente
    const { data: existingServiceData, error: existingServiceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', appointment.serviceId)
      .single();
    
    if (existingServiceError || !existingServiceData) {
      console.warn(`⚠️ No se pudo obtener servicio para cita ${appointment.id}, asumiendo 60min`);
      // Asumir 60 minutos si no se puede obtener el servicio
      var existingDuration: number = 60;
    } else {
      var existingDuration: number = existingServiceData.duration_minutes;
    }
    
    // Calcular rangos de tiempo
    const newStart = new Date(`2000-01-01T${time}:00`);
    const newEnd = new Date(newStart.getTime() + currentService.duration * 60000);
    
    const existingStart = new Date(`2000-01-01T${appointment.time}:00`);
    const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);
    
    // Verificar solapamiento
    if (newStart < existingEnd && newEnd > existingStart) {
      const conflictMsg = `Conflicto de horario: El slot ${time}-${newEnd.toTimeString().slice(0, 5)} se solapa con la cita existente ${appointment.time}-${existingEnd.toTimeString().slice(0, 5)} (${appointment.clientName})`;
      console.error(`❌ ${conflictMsg}`);
      throw new Error(conflictMsg);
    }
  }
  
  console.log('✅ Slot validado, no hay conflictos');
};

export const appointmentService = {
  // Crear nueva cita
  async create(bookingData: BookingFormData): Promise<Appointment> {
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
  async getAll(): Promise<Appointment[]> {
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
  async update(id: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt'>>): Promise<Appointment> {
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
  async getByDate(date: string): Promise<Appointment[]> {
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