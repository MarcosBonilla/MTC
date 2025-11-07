import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { appointmentService } from '../lib/appointmentService';
import { serviceService } from '../lib/serviceService';
import { studioSettingsService } from '../lib/studioSettingsService';
import { unavailableDatesService } from '../lib/unavailableDatesService';
import { portfolioService } from '../lib/portfolioService';
import { populateInitialServices } from '../lib/populateServices';
import type { Appointment, Service, StudioSettings, DayAvailability, PortfolioItem, BookingFormData } from '../types';

interface AppState {
  appointments: Appointment[];
  services: Service[];
  studioSettings: StudioSettings;
  availability: DayAvailability[];
  portfolio: PortfolioItem[];
  isLoadingServices: boolean;
}

type AppAction =
  | { type: 'SET_APPOINTMENTS'; payload: Appointment[] }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: { id: string; updates: Partial<Appointment> } }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'SET_SERVICES'; payload: Service[] }
  | { type: 'SET_SERVICES_LOADING'; payload: boolean }
  | { type: 'ADD_SERVICE'; payload: Service }
  | { type: 'UPDATE_SERVICE'; payload: { id: string; updates: Partial<Service> } }
  | { type: 'DELETE_SERVICE'; payload: string }
  | { type: 'SET_PORTFOLIO'; payload: PortfolioItem[] }
  | { type: 'ADD_PORTFOLIO_ITEM'; payload: PortfolioItem }
  | { type: 'UPDATE_PORTFOLIO_ITEM'; payload: { id: string; updates: Partial<PortfolioItem> } }
  | { type: 'DELETE_PORTFOLIO_ITEM'; payload: string }
  | { type: 'UPDATE_STUDIO_SETTINGS'; payload: Partial<StudioSettings> }
  | { type: 'SET_AVAILABILITY'; payload: DayAvailability[] }
  | { type: 'UPDATE_DAY_AVAILABILITY'; payload: DayAvailability };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => Promise<void>;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;
  updateStudioSettings: (settings: Partial<StudioSettings>) => Promise<void>;
  addUnavailableDate: (date: string) => Promise<void>;
  removeUnavailableDate: (date: string) => Promise<void>;
  getAvailableSlots: (date: string, serviceId: string) => string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default services for the music studio
const defaultServices: Service[] = [
  {
    id: '1',
    name: 'Grabación de Audio',
    description: 'Sesiones de grabación profesional para instrumentos y voces',
    duration: 120,
    price: 2500,
    color: '#f59e0b'
  },
  {
    id: '2',
    name: 'Mezcla y Masterización',
    description: 'Procesamiento profesional de tu música grabada',
    duration: 90,
    price: 2000,
    color: '#10b981'
  },
  {
    id: '3',
    name: 'Producción Musical',
    description: 'Creación completa de tracks y arreglos musicales',
    duration: 180,
    price: 4000,
    color: '#3b82f6'
  },
  {
    id: '4',
    name: 'Clases de Producción',
    description: 'Aprende técnicas de producción musical personalizada',
    duration: 60,
    price: 1500,
    color: '#8b5cf6'
  }
];

const defaultStudioSettings: StudioSettings = {
  businessHours: {
    start: '09:00',
    end: '20:00'
  },
  unavailableDates: [],
  slotDuration: 30,
  services: defaultServices
};

const initialState: AppState = {
  appointments: [],
  services: [], // Vacío hasta que cargue desde Supabase
  studioSettings: defaultStudioSettings,
  availability: [],
  portfolio: [],
  isLoadingServices: true
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.id 
            ? { ...apt, ...action.payload.updates }
            : apt
        )
      };
    
    case 'DELETE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter(apt => apt.id !== action.payload)
      };
    
    case 'SET_SERVICES':
      return { ...state, services: action.payload, isLoadingServices: false };
    
    case 'SET_SERVICES_LOADING':
      return { ...state, isLoadingServices: action.payload };
    
    case 'ADD_SERVICE':
      return { ...state, services: [...state.services, action.payload] };
    
    case 'UPDATE_SERVICE':
      return {
        ...state,
        services: state.services.map(service =>
          service.id === action.payload.id 
            ? { ...service, ...action.payload.updates }
            : service
        )
      };
    
    case 'DELETE_SERVICE':
      return {
        ...state,
        services: state.services.filter(service => service.id !== action.payload)
      };
    
    case 'SET_PORTFOLIO':
      return { ...state, portfolio: action.payload };
    
    case 'ADD_PORTFOLIO_ITEM':
      return { ...state, portfolio: [...state.portfolio, action.payload] };
    
    case 'UPDATE_PORTFOLIO_ITEM':
      return {
        ...state,
        portfolio: state.portfolio.map(item =>
          item.id === action.payload.id 
            ? { ...item, ...action.payload.updates }
            : item
        )
      };
    
    case 'DELETE_PORTFOLIO_ITEM':
      return {
        ...state,
        portfolio: state.portfolio.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_STUDIO_SETTINGS':
      return {
        ...state,
        studioSettings: { ...state.studioSettings, ...action.payload }
      };
    
    case 'SET_AVAILABILITY':
      return { ...state, availability: action.payload };
    
    case 'UPDATE_DAY_AVAILABILITY':
      return {
        ...state,
        availability: state.availability.map(day =>
          day.date === action.payload.date ? action.payload : day
        )
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Función para cargar citas desde Supabase
  const loadAppointments = async () => {
    try {
      const appointments = await appointmentService.getAll();
      dispatch({ type: 'SET_APPOINTMENTS', payload: appointments });
    } catch (error) {
      // Fallback: cargar desde localStorage
      const savedAppointments = localStorage.getItem('musicStudio_appointments');
      if (savedAppointments) {
        try {
          const appointments = JSON.parse(savedAppointments);
          dispatch({ type: 'SET_APPOINTMENTS', payload: appointments });
        } catch (parseError) {
          // Error parseando appointments desde localStorage
        }
      }
    }
  };

  // Load data from Supabase and localStorage on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Cargar citas, servicios, configuración y portfolio
      await loadAppointments();
      await loadServices();
      await loadStudioSettings();
      await loadPortfolio();
      
      // TEMPORAL: Agregar fechas de prueba para testing (comentado después de la primera ejecución)
      // await addTestUnavailableDates();
      
      // TEMPORAL: Agregar citas de prueba para verificar bloqueo de slots (comentado para evitar duplicados)
      // await addTestAppointments();
    };

    const loadServices = async () => {
      dispatch({ type: 'SET_SERVICES_LOADING', payload: true });
      
      try {
        // Intentar cargar servicios existentes
        let services = await serviceService.getAll();
        
        // Si no hay servicios, poblar con servicios iniciales
        if (services.length === 0) {
          services = await populateInitialServices();
        }
        
        dispatch({ type: 'SET_SERVICES', payload: services });
      } catch (error) {
        console.error('❌ Error cargando servicios desde Supabase:', error);
        
        // Solo usar localStorage como último recurso y filtrar por activos
        const savedServices = localStorage.getItem('musicStudio_services');
        if (savedServices) {
          try {
            const allServices = JSON.parse(savedServices);
            // Filtrar solo servicios activos del localStorage
            const activeServices = allServices.filter((s: any) => s.active !== false);
            dispatch({ type: 'SET_SERVICES', payload: activeServices });
            console.log(`✅ ${activeServices.length} servicios activos cargados desde localStorage`);
          } catch (error) {
            console.error('Error loading services from localStorage:', error);
            // Como último recurso, usar servicios por defecto (todos activos)
            dispatch({ type: 'SET_SERVICES', payload: defaultServices });
            console.log('✅ Servicios por defecto cargados');
          }
        } else {
          // Como último recurso, usar servicios por defecto (todos activos)
          dispatch({ type: 'SET_SERVICES', payload: defaultServices });
          console.log('✅ Servicios por defecto cargados');
        }
      }
    };

    const loadStudioSettings = async () => {
      try {
        console.log('🔄 Cargando configuración del estudio desde Supabase...');
        
        // Cargar configuración del estudio
        const settings = await studioSettingsService.get();
        
        // Cargar fechas no disponibles
        const unavailableDates = await unavailableDatesService.getAll();
        
        // Combinar configuración con fechas no disponibles
        const completeSettings = {
          ...settings,
          unavailableDates
        };
        
        dispatch({ type: 'UPDATE_STUDIO_SETTINGS', payload: completeSettings });
        console.log('✅ Configuración del estudio cargada desde Supabase');
      } catch (error) {
        console.error('❌ Error cargando configuración desde Supabase, usando localStorage:', error);
        
        // Fallback: cargar desde localStorage
        const savedSettings = localStorage.getItem('musicStudio_settings');
        if (savedSettings) {
          try {
            const settings = JSON.parse(savedSettings);
            dispatch({ type: 'UPDATE_STUDIO_SETTINGS', payload: settings });
            console.log('✅ Configuración cargada desde localStorage');
          } catch (error) {
            console.error('Error loading settings from localStorage:', error);
          }
        }
      }
    };

    const loadPortfolio = async () => {
      try {
        console.log('🔄 Cargando portfolio desde Supabase...');
        const portfolio = await portfolioService.getAll();
        dispatch({ type: 'SET_PORTFOLIO', payload: portfolio });
        console.log(`✅ ${portfolio.length} items del portfolio cargados desde Supabase`);
      } catch (error) {
        console.error('❌ Error cargando portfolio desde Supabase, usando localStorage:', error);
        
        // Fallback: cargar desde localStorage
        const savedPortfolio = localStorage.getItem('musicStudio_portfolio');
        if (savedPortfolio) {
          try {
            const portfolio = JSON.parse(savedPortfolio);
            dispatch({ type: 'SET_PORTFOLIO', payload: portfolio });
            console.log('✅ Portfolio cargado desde localStorage');
          } catch (parseError) {
            console.error('❌ Error parseando portfolio de localStorage:', parseError);
          }
        }
      }
    };

    initializeApp();
    
    // Cargar configuraciones desde localStorage si no se cargaron desde Supabase
    const savedSettings = localStorage.getItem('musicStudio_settings');
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_STUDIO_SETTINGS', payload: settings });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('musicStudio_appointments', JSON.stringify(state.appointments));
  }, [state.appointments]);

  useEffect(() => {
    localStorage.setItem('musicStudio_settings', JSON.stringify(state.studioSettings));
  }, [state.studioSettings]);

  useEffect(() => {
    // Guardar servicios con metadatos adicionales para localStorage
    const servicesWithMeta = state.services.map(service => ({
      ...service,
      active: true // Los servicios en state ya están filtrados como activos
    }));
    localStorage.setItem('musicStudio_services', JSON.stringify(servicesWithMeta));
  }, [state.services]);

  useEffect(() => {
    localStorage.setItem('musicStudio_portfolio', JSON.stringify(state.portfolio));
  }, [state.portfolio]);

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    try {
      console.log('🔄 Creando cita con Supabase...', appointmentData);
      
      // Crear cita en Supabase
      await appointmentService.create(appointmentData as BookingFormData);
      
      // Recargar todas las citas desde Supabase para asegurar consistencia
      console.log('🔄 Recargando todas las citas desde Supabase...');
      await loadAppointments();
      
      console.log('✅ Cita creada y estado actualizado desde Supabase');
    } catch (error) {
      console.error('❌ Error creando cita:', error);
      
      // Fallback: crear cita solo localmente si Supabase falla
      const localAppointment: Appointment = {
        ...appointmentData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      dispatch({ type: 'ADD_APPOINTMENT', payload: localAppointment });
      
      throw error; // Re-throw para que el componente maneje el error
    }
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    dispatch({ type: 'UPDATE_APPOINTMENT', payload: { id, updates } });
  };

  const deleteAppointment = (id: string) => {
    dispatch({ type: 'DELETE_APPOINTMENT', payload: id });
  };

  const addService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      console.log('🔄 Creando servicio con Supabase...', serviceData);
      
      // Crear servicio en Supabase
      const newService = await serviceService.create(serviceData);
      
      // Actualizar estado local
      dispatch({ type: 'ADD_SERVICE', payload: newService });
      
      console.log('✅ Servicio creado y estado actualizado');
    } catch (error) {
      console.error('❌ Error creando servicio:', error);
      
      // Fallback: crear servicio solo localmente si Supabase falla
      const localService: Service = {
        ...serviceData,
        id: Math.random().toString(36).substr(2, 9)
      };
      dispatch({ type: 'ADD_SERVICE', payload: localService });
      
      throw error; // Re-throw para que el componente maneje el error
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      console.log('🔄 Actualizando servicio con Supabase...', id, updates);
      
      // Actualizar servicio en Supabase
      const updatedService = await serviceService.update(id, updates);
      
      // Actualizar estado local
      dispatch({ type: 'UPDATE_SERVICE', payload: { id, updates: updatedService } });
      
      console.log('✅ Servicio actualizado en Supabase y estado local');
    } catch (error) {
      console.error('❌ Error actualizando servicio:', error);
      
      // Fallback: actualizar solo localmente si Supabase falla
      dispatch({ type: 'UPDATE_SERVICE', payload: { id, updates } });
      
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    try {
      console.log('🔄 Eliminando servicio con Supabase...', id);
      
      // Eliminar servicio en Supabase (soft delete)
      await serviceService.delete(id);
      
      // Actualizar estado local
      dispatch({ type: 'DELETE_SERVICE', payload: id });
      
      console.log('✅ Servicio eliminado en Supabase y estado local');
    } catch (error) {
      console.error('❌ Error eliminando servicio:', error);
      
      // Fallback: eliminar solo localmente si Supabase falla
      dispatch({ type: 'DELETE_SERVICE', payload: id });
      
      throw error;
    }
  };

  const addPortfolioItem = async (itemData: Omit<PortfolioItem, 'id' | 'createdAt'>) => {
    try {
      const newItem = await portfolioService.create(itemData);
      
      dispatch({
        type: 'ADD_PORTFOLIO_ITEM',
        payload: newItem
      });

      // También actualizar localStorage como respaldo
      const updatedPortfolio = [...state.portfolio, newItem];
      localStorage.setItem('mtc-portfolio', JSON.stringify(updatedPortfolio));
    } catch (error) {
      console.error('Error al agregar item del portfolio:', error);
      
      // Fallback a localStorage si Supabase falla
      const newItem: PortfolioItem = {
        ...itemData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      
      dispatch({
        type: 'ADD_PORTFOLIO_ITEM',
        payload: newItem
      });

      const updatedPortfolio = [...state.portfolio, newItem];
      localStorage.setItem('mtc-portfolio', JSON.stringify(updatedPortfolio));
    }
  };

  const updatePortfolioItem = async (id: string, updates: Partial<PortfolioItem>) => {
    try {
      await portfolioService.update(id, updates);
      
      dispatch({ 
        type: 'UPDATE_PORTFOLIO_ITEM', 
        payload: { id, updates } 
      });

      // También actualizar localStorage como respaldo
      const updatedPortfolio = state.portfolio.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      localStorage.setItem('mtc-portfolio', JSON.stringify(updatedPortfolio));
    } catch (error) {
      console.error('Error al actualizar item del portfolio:', error);
      
      // Fallback a localStorage si Supabase falla
      dispatch({ 
        type: 'UPDATE_PORTFOLIO_ITEM', 
        payload: { id, updates } 
      });

      const updatedPortfolio = state.portfolio.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      localStorage.setItem('mtc-portfolio', JSON.stringify(updatedPortfolio));
    }
  };

  const deletePortfolioItem = async (id: string) => {
    try {
      await portfolioService.delete(id);
      
      dispatch({ 
        type: 'DELETE_PORTFOLIO_ITEM', 
        payload: id 
      });

      // También actualizar localStorage como respaldo
      const updatedPortfolio = state.portfolio.filter(item => item.id !== id);
      localStorage.setItem('mtc-portfolio', JSON.stringify(updatedPortfolio));
    } catch (error) {
      console.error('Error al eliminar item del portfolio:', error);
      
      // Fallback a localStorage si Supabase falla
      dispatch({ 
        type: 'DELETE_PORTFOLIO_ITEM', 
        payload: id 
      });

      const updatedPortfolio = state.portfolio.filter(item => item.id !== id);
      localStorage.setItem('mtc-portfolio', JSON.stringify(updatedPortfolio));
    }
  };

  const updateStudioSettings = async (settings: Partial<StudioSettings>) => {
    try {
      console.log('🔄 Actualizando configuración del estudio con Supabase...', settings);
      
      // Actualizar en Supabase
      const updatedSettings = await studioSettingsService.update(settings);
      
      // Actualizar estado local
      dispatch({ type: 'UPDATE_STUDIO_SETTINGS', payload: updatedSettings });
      
      console.log('✅ Configuración del estudio actualizada');
    } catch (error) {
      console.error('❌ Error actualizando configuración del estudio:', error);
      
      // Fallback: actualizar solo localmente
      dispatch({ type: 'UPDATE_STUDIO_SETTINGS', payload: settings });
      
      throw error;
    }
  };

  const addUnavailableDate = async (date: string) => {
    try {
      console.log('🔄 Añadiendo fecha no disponible...', date);
      
      // Añadir en Supabase
      await unavailableDatesService.add(date);
      
      // Actualizar estado local
      const currentDates = state.studioSettings.unavailableDates;
      if (!currentDates.includes(date)) {
        dispatch({ 
          type: 'UPDATE_STUDIO_SETTINGS', 
          payload: { 
            unavailableDates: [...currentDates, date] 
          }
        });
      }
      
      console.log('✅ Fecha no disponible añadida');
    } catch (error) {
      console.error('❌ Error añadiendo fecha no disponible:', error);
      throw error;
    }
  };

  const removeUnavailableDate = async (date: string) => {
    try {
      console.log('🔄 Eliminando fecha no disponible...', date);
      
      // Eliminar en Supabase
      await unavailableDatesService.remove(date);
      
      // Actualizar estado local
      const currentDates = state.studioSettings.unavailableDates;
      dispatch({ 
        type: 'UPDATE_STUDIO_SETTINGS', 
        payload: { 
          unavailableDates: currentDates.filter(d => d !== date) 
        }
      });
      
      console.log('✅ Fecha no disponible eliminada');
    } catch (error) {
      console.error('❌ Error eliminando fecha no disponible:', error);
      throw error;
    }
  };

  const getAvailableSlots = (date: string, serviceId: string): string[] => {
    const service = state.services.find(s => s.id === serviceId);
    if (!service) {
      return [];
    }

    const { businessHours, slotDuration } = state.studioSettings;
    
    
    const dayAppointments = state.appointments.filter(apt => 
      apt.date === date && apt.status !== 'cancelled'
    );
    
    // Generate all possible time slots

    console.log(`🕐 Verificando slots para ${date}, servicio: ${service.name} (duración: ${service.duration}min)`);
    console.log(`📊 Total de citas en el estado:`, state.appointments.length);
    console.log(` Citas existentes en ${date}:`, dayAppointments.map(apt => {
      const aptService = state.services.find(s => s.id === apt.serviceId);
      const duration = aptService ? aptService.duration : 60;
      
      // Normalizar formato de hora (remover segundos si existen)
      const timeNormalized = apt.time.slice(0, 5); // "12:00:00" -> "12:00"
      
      const endTime = new Date(`2000-01-01T${timeNormalized}:00`);
      endTime.setMinutes(endTime.getMinutes() + duration);
      return `${timeNormalized}-${endTime.toTimeString().slice(0, 5)} (${apt.clientName}) [${apt.status}]`;
    }));

    // Generate all possible time slots
    const slots: string[] = [];
    const startTime = new Date(`2000-01-01T${businessHours.start}:00`);
    const endTime = new Date(`2000-01-01T${businessHours.end}:00`);
    
    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      
      // Verificar si este slot tiene conflicto con alguna cita existente
      let hasConflict = false;
      
      for (const apt of dayAppointments) {
        const aptService = state.services.find(s => s.id === apt.serviceId);
        if (!aptService) {
          console.warn(`⚠️ Servicio no encontrado para cita ${apt.id}: ${apt.serviceId}`);
          continue;
        }
        
        // Normalizar formato de hora (remover segundos si existen)
        const aptTimeNormalized = apt.time.slice(0, 5); // "12:00:00" -> "12:00"
        
        // LÓGICA SIMPLE: Si el slot coincide EXACTAMENTE con el inicio de una cita, hay conflicto
        if (timeString === aptTimeNormalized) {
          hasConflict = true;
          break;
        }
        
        // También verificar si el slot cae dentro del rango de la cita existente
        const aptStartMinutes = parseInt(aptTimeNormalized.split(':')[0]) * 60 + parseInt(aptTimeNormalized.split(':')[1]);
        const aptEndMinutes = aptStartMinutes + aptService.duration;
        const slotStartMinutes = parseInt(timeString.split(':')[0]) * 60 + parseInt(timeString.split(':')[1]);
        const slotEndMinutes = slotStartMinutes + service.duration;
        
        // Hay conflicto si hay solapamiento
        if (slotStartMinutes < aptEndMinutes && slotEndMinutes > aptStartMinutes) {
          hasConflict = true;
          break;
        }
      }
      
      if (!hasConflict) {
        // Verificar que el servicio completo quepa en el horario de trabajo
        const slotEnd = new Date(currentTime.getTime() + service.duration * 60000);
        if (slotEnd <= endTime) {
          slots.push(timeString);
        }
      }
      
      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }
    
    return slots;
  };

  const value: AppContextType = {
    state,
    dispatch,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addService,
    updateService,
    deleteService,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    updateStudioSettings,
    addUnavailableDate,
    removeUnavailableDate,
    getAvailableSlots
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;