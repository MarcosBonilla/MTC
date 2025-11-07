import { supabase } from './supabase';
import type { DatabaseAppointment } from './supabase';

export const cleanupDuplicateAppointments = async () => {
  try {
    console.log('🧹 Limpiando citas duplicadas...');
    
    // Obtener todas las citas
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo citas:', error);
      return;
    }

    if (!appointments || appointments.length === 0) {
      console.log('✅ No hay citas para limpiar');
      return;
    }

    // Agrupar citas por fecha y hora
    const groupedByDateTime = appointments.reduce((acc, apt) => {
      const key = `${apt.date}_${apt.time}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(apt);
      return acc;
    }, {} as Record<string, DatabaseAppointment[]>);

    // Encontrar duplicados y eliminar los más recientes
    const toDelete: string[] = [];
    
    for (const [dateTime, citas] of Object.entries(groupedByDateTime)) {
      const citasArray = citas as DatabaseAppointment[];
      if (citasArray.length > 1) {
        console.log(`🔍 Encontrados ${citasArray.length} duplicados para ${dateTime}:`);
        citasArray.forEach((cita: DatabaseAppointment, index: number) => {
          console.log(`   ${index + 1}. ${cita.client_name} (ID: ${cita.id}) - ${cita.created_at}`);
        });
        
        // Mantener solo la primera cita (más antigua) y marcar las demás para eliminación
        const citasToDelete = citasArray.slice(1);
        citasToDelete.forEach((cita: DatabaseAppointment) => {
          toDelete.push(cita.id);
          console.log(`   ❌ Marcando para eliminar: ${cita.client_name} (${cita.id})`);
        });
      }
    }

    if (toDelete.length === 0) {
      console.log('✅ No se encontraron duplicados');
      return;
    }

    // Eliminar citas duplicadas
    console.log(`🗑️ Eliminando ${toDelete.length} citas duplicadas...`);
    
    for (const id of toDelete) {
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error(`❌ Error eliminando cita ${id}:`, deleteError);
      } else {
        console.log(`✅ Cita eliminada: ${id}`);
      }
    }
    
    console.log('🎉 Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
  }
};