import { supabase } from './supabase';
import type { DatabaseStudioSettings } from './supabase';
import type { StudioSettings } from '../types';

// Convertir datos de la UI al formato de base de datos
const toDatabase = (settings: StudioSettings): Omit<DatabaseStudioSettings, 'id' | 'updated_at'> => ({
  opening_hours: {
    monday: { start: settings.businessHours.start, end: settings.businessHours.end },
    tuesday: { start: settings.businessHours.start, end: settings.businessHours.end },
    wednesday: { start: settings.businessHours.start, end: settings.businessHours.end },
    thursday: { start: settings.businessHours.start, end: settings.businessHours.end },
    friday: { start: settings.businessHours.start, end: settings.businessHours.end },
    saturday: { start: settings.businessHours.start, end: settings.businessHours.end },
    sunday: { start: settings.businessHours.start, end: settings.businessHours.end }
  },
  break_duration: settings.slotDuration,
  advance_booking_days: 30 // Valor por defecto fijo por ahora
});

// Convertir datos de base de datos al formato de la UI
const fromDatabase = (dbSettings: DatabaseStudioSettings): StudioSettings => ({
  businessHours: {
    start: dbSettings.opening_hours.monday?.start || '09:00',
    end: dbSettings.opening_hours.monday?.end || '18:00'
  },
  slotDuration: dbSettings.break_duration,
  unavailableDates: [], // Las fechas no disponibles se manejan por separado
  services: [] // Los servicios se manejan por separado
});

export const studioSettingsService = {
  // Obtener configuración del estudio
  async get(): Promise<StudioSettings> {
    console.log('🔄 Obteniendo configuración del estudio desde Supabase...');
    
    const { data, error } = await supabase
      .from('studio_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No hay configuración, crear una por defecto
        console.log('ℹ️ No hay configuración del estudio, creando configuración por defecto...');
        return await this.createDefault();
      }
      console.error('❌ Error obteniendo configuración del estudio:', error);
      throw new Error(`Error al obtener configuración: ${error.message}`);
    }

    if (!data) {
      console.log('ℹ️ No hay configuración del estudio, creando configuración por defecto...');
      return await this.createDefault();
    }

    console.log('✅ Configuración del estudio obtenida:', data);
    return fromDatabase(data);
  },

  // Crear configuración por defecto
  async createDefault(): Promise<StudioSettings> {
    console.log('🔄 Creando configuración por defecto del estudio...');
    
    const defaultSettings: StudioSettings = {
      businessHours: {
        start: '09:00',
        end: '18:00'
      },
      slotDuration: 15,
      unavailableDates: [],
      services: [] // Los servicios se manejan por separado
    };

    const dbSettingsData = toDatabase(defaultSettings);

    const { data, error } = await supabase
      .from('studio_settings')
      .insert([dbSettingsData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando configuración por defecto:', error);
      throw new Error(`Error al crear configuración: ${error.message}`);
    }

    if (!data) {
      throw new Error('No se recibieron datos de la configuración creada');
    }

    console.log('✅ Configuración por defecto creada exitosamente:', data);
    return fromDatabase(data);
  },

  // Actualizar configuración del estudio
  async update(updates: Partial<StudioSettings>): Promise<StudioSettings> {
    console.log('🔄 Actualizando configuración del estudio...', updates);
    
    // Primero obtener la configuración actual
    let currentSettings: StudioSettings;
    try {
      currentSettings = await this.get();
    } catch (error) {
      console.log('ℹ️ No hay configuración actual, creando una nueva...');
      currentSettings = await this.createDefault();
    }

    // Combinar configuración actual con updates
    const updatedSettings: StudioSettings = {
      ...currentSettings,
      ...updates
    };

    const dbUpdates = toDatabase(updatedSettings);

    // Obtener el ID de la configuración actual
    const { data: currentData, error: getCurrentError } = await supabase
      .from('studio_settings')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (getCurrentError && getCurrentError.code !== 'PGRST116') {
      console.error('❌ Error obteniendo ID de configuración actual:', getCurrentError);
      throw new Error(`Error al obtener configuración: ${getCurrentError.message}`);
    }

    let result;
    if (currentData) {
      // Actualizar configuración existente
      const { data, error } = await supabase
        .from('studio_settings')
        .update(dbUpdates)
        .eq('id', currentData.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando configuración:', error);
        throw new Error(`Error al actualizar configuración: ${error.message}`);
      }
      result = data;
    } else {
      // Crear nueva configuración
      const { data, error } = await supabase
        .from('studio_settings')
        .insert([dbUpdates])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando nueva configuración:', error);
        throw new Error(`Error al crear configuración: ${error.message}`);
      }
      result = data;
    }

    if (!result) {
      throw new Error('No se recibieron datos de la configuración actualizada');
    }

    console.log('✅ Configuración actualizada exitosamente:', result);
    return fromDatabase(result);
  }
};