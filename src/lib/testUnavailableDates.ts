import { unavailableDatesService } from './unavailableDatesService';

export const addTestUnavailableDates = async () => {
  try {
    console.log('🧪 Agregando fechas de prueba no disponibles...');
    
    // Fechas de ejemplo para bloquear
    const testDates = [
      '2025-11-15', // Próximo viernes
      '2025-11-20', // Próximo miércoles
      '2025-11-25', // Próximo lunes
      '2025-12-01', // Próximo lunes de diciembre
    ];
    
    for (const date of testDates) {
      await unavailableDatesService.add(date);
      console.log(`✅ Fecha bloqueada: ${date}`);
    }
    
    console.log('🎉 Fechas de prueba agregadas exitosamente');
  } catch (error) {
    console.error('❌ Error agregando fechas de prueba:', error);
  }
};