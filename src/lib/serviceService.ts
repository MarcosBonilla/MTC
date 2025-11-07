import { supabase } from './supabase';
import type { DatabaseService } from './supabase';
import type { Service } from '../types';

// Convertir datos de la UI al formato de base de datos
const toDatabase = (service: Omit<Service, 'id'>): Omit<DatabaseService, 'id' | 'created_at'> => ({
  name: service.name,
  description: service.description,
  duration: service.duration,
  price: service.price,
  color: service.color,
  active: true
});

// Convertir datos de base de datos al formato de la UI
const fromDatabase = (dbService: DatabaseService): Service => ({
  id: dbService.id,
  name: dbService.name,
  description: dbService.description,
  duration: dbService.duration,
  price: dbService.price,
  color: dbService.color
});

export const serviceService = {
  // Obtener todos los servicios activos
  async getAll(): Promise<Service[]> {
    console.log('🔄 Obteniendo servicios activos desde Supabase...');
    
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo servicios:', error);
      throw new Error(`Error al obtener servicios: ${error.message}`);
    }

    const services = (data || []).map(fromDatabase);
    console.log(`✅ ${services.length} servicios activos obtenidos desde Supabase`);
    console.log('📋 Servicios activos:', services.map(s => `${s.name} (active)`));
    return services;
  },

  // Crear nuevo servicio
  async create(serviceData: Omit<Service, 'id'>): Promise<Service> {
    console.log('🔄 Creando servicio en Supabase...', serviceData);
    
    const dbServiceData = toDatabase(serviceData);

    const { data, error } = await supabase
      .from('services')
      .insert([dbServiceData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando servicio:', error);
      throw new Error(`Error al crear servicio: ${error.message}`);
    }

    if (!data) {
      throw new Error('No se recibieron datos del servicio creado');
    }

    console.log('✅ Servicio creado exitosamente:', data);
    return fromDatabase(data);
  },

  // Actualizar servicio
  async update(id: string, updates: Partial<Omit<Service, 'id'>>): Promise<Service> {
    console.log('🔄 Actualizando servicio:', id, updates);
    
    const dbUpdates: Partial<Omit<DatabaseService, 'id' | 'created_at'>> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.color !== undefined) dbUpdates.color = updates.color;

    const { data, error } = await supabase
      .from('services')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando servicio:', error);
      throw new Error(`Error al actualizar servicio: ${error.message}`);
    }

    if (!data) {
      throw new Error('No se recibieron datos del servicio actualizado');
    }

    console.log('✅ Servicio actualizado exitosamente:', data);
    return fromDatabase(data);
  },

  // Eliminar servicio (soft delete)
  async delete(id: string): Promise<void> {
    console.log('🔄 Eliminando servicio (soft delete):', id);
    
    const { error } = await supabase
      .from('services')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      console.error('❌ Error eliminando servicio:', error);
      throw new Error(`Error al eliminar servicio: ${error.message}`);
    }

    console.log('✅ Servicio eliminado exitosamente (soft delete)');
  },

  // Obtener un servicio por ID
  async getById(id: string): Promise<Service | null> {
    console.log('🔄 Obteniendo servicio por ID:', id);
    
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        console.log('ℹ️ Servicio no encontrado:', id);
        return null;
      }
      console.error('❌ Error obteniendo servicio:', error);
      throw new Error(`Error al obtener servicio: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    console.log('✅ Servicio obtenido:', data);
    return fromDatabase(data);
  },

  // Obtener TODOS los servicios (incluyendo inactivos) - solo para admin
  async getAllForAdmin(): Promise<(Service & { active: boolean })[]> {
    console.log('🔄 Obteniendo TODOS los servicios para admin...');
    
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo servicios para admin:', error);
      throw new Error(`Error al obtener servicios: ${error.message}`);
    }

    const services = (data || []).map(dbService => ({
      ...fromDatabase(dbService),
      active: dbService.active
    }));
    
    console.log(`✅ ${services.length} servicios totales obtenidos para admin`);
    console.log('📋 Servicios:', services.map(s => `${s.name} (${s.active ? 'activo' : 'inactivo'})`));
    return services;
  },

  // Reactivar servicio
  async reactivate(id: string): Promise<Service> {
    console.log('🔄 Reactivando servicio:', id);
    
    const { data, error } = await supabase
      .from('services')
      .update({ active: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error reactivando servicio:', error);
      throw new Error(`Error al reactivar servicio: ${error.message}`);
    }

    if (!data) {
      throw new Error('No se recibieron datos del servicio reactivado');
    }

    console.log('✅ Servicio reactivado exitosamente:', data);
    return fromDatabase(data);
  }
};