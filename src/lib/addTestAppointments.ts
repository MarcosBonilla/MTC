import { appointmentService } from './appointmentService';

export const addTestAppointments = async () => {
  try {
    console.log('🧪 Agregando citas de prueba para verificar bloqueo de slots...');
    
    // Citas de prueba para mañana - diferentes servicios pero horarios que se solapan
    const testAppointments = [
      {
        date: '2025-11-08', // Mañana
        time: '10:00',
        serviceId: 'grabacion', // Grabación (120 min): 10:00-12:00
        clientName: 'Juan Pérez',
        clientEmail: 'juan@test.com',
        clientPhone: '099123456',
        notes: 'Cita de prueba - Grabación 10:00-12:00',
        status: 'confirmed' as const
      },
      {
        date: '2025-11-08',
        time: '14:00',
        serviceId: 'clases', // Clases (60 min): 14:00-15:00
        clientName: 'María García',
        clientEmail: 'maria@test.com',
        clientPhone: '099654321',
        notes: 'Cita de prueba - Clases 14:00-15:00',
        status: 'confirmed' as const
      },
      {
        date: '2025-11-08',
        time: '16:00',
        serviceId: 'mezcla', // Mezcla (90 min): 16:00-17:30
        clientName: 'Carlos López',
        clientEmail: 'carlos@test.com',
        clientPhone: '099789012',
        notes: 'Cita de prueba - Mezcla 16:00-17:30',
        status: 'pending' as const
      }
    ];
    
    for (const appointment of testAppointments) {
      try {
        await appointmentService.create(appointment);
        console.log(`✅ Cita creada: ${appointment.date} ${appointment.time} - ${appointment.clientName}`);
      } catch (error) {
        console.error(`❌ Error creando cita ${appointment.date} ${appointment.time}:`, error);
      }
    }
    
    console.log('🎉 Citas de prueba agregadas para el 8 de noviembre:');
    console.log('   • 10:00-12:00: Grabación (Juan Pérez)');
    console.log('   • 14:00-15:00: Clases (María García)');
    console.log('   • 16:00-17:30: Mezcla (Carlos López)');
    console.log('');
    console.log('🧪 PRUEBA: Ve al calendario y verifica que:');
    console.log('   • Si seleccionas CUALQUIER servicio para el 8 de noviembre');
    console.log('   • NO deberían aparecer estos slots: 10:00, 10:30, 11:00, 11:30, 14:00, 16:00, 16:30, 17:00');
    console.log('   • Porque el estudio está ocupado en esos rangos horarios');
    
  } catch (error) {
    console.error('❌ Error agregando citas de prueba:', error);
  }
};