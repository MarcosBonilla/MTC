import { serviceService } from './serviceService';

// Servicios iniciales para poblar la base de datos
const initialServices = [
  {
    name: 'Grabación de Audio',
    description: 'Sesión profesional de grabación en estudio con equipos de alta gama',
    duration: 120,
    price: 2500,
    color: '#ff4444'
  },
  {
    name: 'Mezcla y Masterización',
    description: 'Proceso completo de mezcla y masterización para darle el toque final a tus tracks',
    duration: 90,
    price: 1800,
    color: '#44ff44'
  },
  {
    name: 'Producción Musical',
    description: 'Producción musical completa desde la composición hasta la masterización',
    duration: 180,
    price: 3500,
    color: '#4444ff'
  },
  {
    name: 'Clases de Música',
    description: 'Clases personalizadas de instrumentos y teoría musical',
    duration: 60,
    price: 1200,
    color: '#ffaa00'
  }
];

// Función para poblar los servicios iniciales
export const populateInitialServices = async () => {
  try {
    console.log('🔄 Poblando servicios iniciales en Supabase...');
    
    // Verificar si ya existen servicios
    const existingServices = await serviceService.getAll();
    
    if (existingServices.length > 0) {
      console.log(`ℹ️ Ya existen ${existingServices.length} servicios, saltando población inicial`);
      return existingServices;
    }
    
    console.log('📝 No hay servicios, creando servicios iniciales...');
    const createdServices = [];
    
    for (const service of initialServices) {
      try {
        const createdService = await serviceService.create(service);
        createdServices.push(createdService);
        console.log(`✅ Servicio creado: ${createdService.name}`);
      } catch (error) {
        console.error(`❌ Error creando servicio ${service.name}:`, error);
      }
    }
    
    console.log(`🎉 ${createdServices.length} servicios iniciales creados exitosamente`);
    return createdServices;
    
  } catch (error) {
    console.error('❌ Error poblando servicios iniciales:', error);
    throw error;
  }
};