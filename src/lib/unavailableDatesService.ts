import { supabase } from './supabase';

export const unavailableDatesService = {
  // Obtener todas las fechas no disponibles
  async getAll(): Promise<string[]> {
    console.log('🔄 Obteniendo fechas no disponibles desde Supabase...');
    
    const { data, error } = await supabase
      .from('unavailable_dates')
      .select('date')
      .order('date', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo fechas no disponibles:', error);
      throw new Error(`Error al obtener fechas no disponibles: ${error.message}`);
    }

    const dates = (data || []).map(item => item.date);
    console.log(`✅ ${dates.length} fechas no disponibles obtenidas`);
    return dates;
  },

  // Añadir fecha no disponible
  async add(date: string, reason?: string): Promise<void> {
    console.log('🔄 Añadiendo fecha no disponible:', date);
    
    const { error } = await supabase
      .from('unavailable_dates')
      .insert([{ date, reason }]);

    if (error) {
      // Si el error es de duplicado, ignorarlo
      if (error.code === '23505') {
        console.log('ℹ️ La fecha ya existe como no disponible');
        return;
      }
      console.error('❌ Error añadiendo fecha no disponible:', error);
      throw new Error(`Error al añadir fecha no disponible: ${error.message}`);
    }

    console.log('✅ Fecha no disponible añadida exitosamente');
  },

  // Eliminar fecha no disponible
  async remove(date: string): Promise<void> {
    console.log('🔄 Eliminando fecha no disponible:', date);
    
    const { error } = await supabase
      .from('unavailable_dates')
      .delete()
      .eq('date', date);

    if (error) {
      console.error('❌ Error eliminando fecha no disponible:', error);
      throw new Error(`Error al eliminar fecha no disponible: ${error.message}`);
    }

    console.log('✅ Fecha no disponible eliminada exitosamente');
  }
};