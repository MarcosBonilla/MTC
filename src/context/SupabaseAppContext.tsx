import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { appointmentsAPI, servicesAPI, unavailableDatesAPI, studioSettingsAPI } from '../lib/database';
import type { DatabaseAppointment, DatabaseService, DatabaseUnavailableDate, DatabaseStudioSettings } from '../lib/supabase';

// Tipos para el estado
interface AppState {
  appointments: DatabaseAppointment[];
  services: DatabaseService[];
  unavailableDates: DatabaseUnavailableDate[];
  studioSettings: DatabaseStudioSettings | null;
  loading: boolean;
  error: string | null;
}

// Tipos para las acciones
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_APPOINTMENTS'; payload: DatabaseAppointment[] }
  | { type: 'ADD_APPOINTMENT'; payload: DatabaseAppointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: DatabaseAppointment }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'SET_SERVICES'; payload: DatabaseService[] }
  | { type: 'ADD_SERVICE'; payload: DatabaseService }
  | { type: 'UPDATE_SERVICE'; payload: DatabaseService }
  | { type: 'DELETE_SERVICE'; payload: string }
  | { type: 'SET_UNAVAILABLE_DATES'; payload: DatabaseUnavailableDate[] }
  | { type: 'ADD_UNAVAILABLE_DATE'; payload: DatabaseUnavailableDate }
  | { type: 'DELETE_UNAVAILABLE_DATE'; payload: string }
  | { type: 'SET_STUDIO_SETTINGS'; payload: DatabaseStudioSettings };

// Estado inicial
const initialState: AppState = {
  appointments: [],
  services: [],
  unavailableDates: [],
  studioSettings: null,
  loading: false,
  error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.id ? action.payload : apt
        ),
      };
    case 'DELETE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter(apt => apt.id !== action.payload),
      };
    case 'SET_SERVICES':
      return { ...state, services: action.payload };
    case 'ADD_SERVICE':
      return { ...state, services: [...state.services, action.payload] };
    case 'UPDATE_SERVICE':
      return {
        ...state,
        services: state.services.map(svc =>
          svc.id === action.payload.id ? action.payload : svc
        ),
      };
    case 'DELETE_SERVICE':
      return {
        ...state,
        services: state.services.filter(svc => svc.id !== action.payload),
      };
    case 'SET_UNAVAILABLE_DATES':
      return { ...state, unavailableDates: action.payload };
    case 'ADD_UNAVAILABLE_DATE':
      return { ...state, unavailableDates: [...state.unavailableDates, action.payload] };
    case 'DELETE_UNAVAILABLE_DATE':
      return {
        ...state,
        unavailableDates: state.unavailableDates.filter(date => date.id !== action.payload),
      };
    case 'SET_STUDIO_SETTINGS':
      return { ...state, studioSettings: action.payload };
    default:
      return state;
  }
}

// Contexto
interface AppContextType {
  state: AppState;
  // Appointments
  loadAppointments: () => Promise<void>;
  createAppointment: (appointment: Omit<DatabaseAppointment, 'id' | 'created_at' | 'updated_at'>) => Promise<DatabaseAppointment>;
  updateAppointment: (id: string, updates: Partial<DatabaseAppointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  // Services
  loadServices: () => Promise<void>;
  createService: (service: Omit<DatabaseService, 'id' | 'created_at'>) => Promise<DatabaseService>;
  updateService: (id: string, updates: Partial<DatabaseService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  // Unavailable dates
  loadUnavailableDates: () => Promise<void>;
  addUnavailableDate: (date: string, reason?: string) => Promise<void>;
  removeUnavailableDate: (id: string) => Promise<void>;
  // Studio settings
  loadStudioSettings: () => Promise<void>;
  updateStudioSettings: (settings: Partial<DatabaseStudioSettings>) => Promise<void>;
  // Utility functions
  getAvailableSlots: (date: string, serviceId: string) => string[];
  checkAvailability: (date: string, time: string, serviceId: string, excludeId?: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | null>(null);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await Promise.all([
          loadAppointments(),
          loadServices(),
          loadUnavailableDates(),
          loadStudioSettings(),
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Error loading data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadInitialData();
  }, []);

  // Appointments functions
  const loadAppointments = async () => {
    try {
      const appointments = await appointmentsAPI.getAll();
      dispatch({ type: 'SET_APPOINTMENTS', payload: appointments });
    } catch (error) {
      console.error('Error loading appointments:', error);
      throw error;
    }
  };

  const createAppointment = async (appointment: Omit<DatabaseAppointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Verificar disponibilidad antes de crear
      const isAvailable = await appointmentsAPI.checkAvailability(
        appointment.date,
        appointment.time,
        appointment.service_id
      );
      
      if (!isAvailable) {
        throw new Error('El horario seleccionado ya no está disponible');
      }

      const newAppointment = await appointmentsAPI.create(appointment);
      dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });
      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error creating appointment' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateAppointment = async (id: string, updates: Partial<DatabaseAppointment>) => {
    try {
      const updatedAppointment = await appointmentsAPI.update(id, updates);
      dispatch({ type: 'UPDATE_APPOINTMENT', payload: updatedAppointment });
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await appointmentsAPI.delete(id);
      dispatch({ type: 'DELETE_APPOINTMENT', payload: id });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  // Services functions
  const loadServices = async () => {
    try {
      const services = await servicesAPI.getAll();
      dispatch({ type: 'SET_SERVICES', payload: services });
    } catch (error) {
      console.error('Error loading services:', error);
      throw error;
    }
  };

  const createService = async (service: Omit<DatabaseService, 'id' | 'created_at'>) => {
    try {
      const newService = await servicesAPI.create(service);
      dispatch({ type: 'ADD_SERVICE', payload: newService });
      return newService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  };

  const updateService = async (id: string, updates: Partial<DatabaseService>) => {
    try {
      const updatedService = await servicesAPI.update(id, updates);
      dispatch({ type: 'UPDATE_SERVICE', payload: updatedService });
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    try {
      await servicesAPI.delete(id);
      dispatch({ type: 'DELETE_SERVICE', payload: id });
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  };

  // Unavailable dates functions
  const loadUnavailableDates = async () => {
    try {
      const dates = await unavailableDatesAPI.getAll();
      dispatch({ type: 'SET_UNAVAILABLE_DATES', payload: dates });
    } catch (error) {
      console.error('Error loading unavailable dates:', error);
      throw error;
    }
  };

  const addUnavailableDate = async (date: string, reason?: string) => {
    try {
      const newDate = await unavailableDatesAPI.create(date, reason);
      dispatch({ type: 'ADD_UNAVAILABLE_DATE', payload: newDate });
    } catch (error) {
      console.error('Error adding unavailable date:', error);
      throw error;
    }
  };

  const removeUnavailableDate = async (id: string) => {
    try {
      await unavailableDatesAPI.delete(id);
      dispatch({ type: 'DELETE_UNAVAILABLE_DATE', payload: id });
    } catch (error) {
      console.error('Error removing unavailable date:', error);
      throw error;
    }
  };

  // Studio settings functions
  const loadStudioSettings = async () => {
    try {
      const settings = await studioSettingsAPI.get();
      dispatch({ type: 'SET_STUDIO_SETTINGS', payload: settings });
    } catch (error) {
      console.error('Error loading studio settings:', error);
      throw error;
    }
  };

  const updateStudioSettings = async (settings: Partial<DatabaseStudioSettings>) => {
    try {
      const updatedSettings = await studioSettingsAPI.update(settings);
      dispatch({ type: 'SET_STUDIO_SETTINGS', payload: updatedSettings });
    } catch (error) {
      console.error('Error updating studio settings:', error);
      throw error;
    }
  };

  // Utility functions
  const getAvailableSlots = (date: string, serviceId: string): string[] => {
    if (!state.studioSettings) return [];

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = state.studioSettings.opening_hours[dayOfWeek];
    
    if (!daySchedule || !daySchedule.start || !daySchedule.end) {
      return [];
    }

    const service = state.services.find(s => s.id === serviceId);
    if (!service) return [];

    const slots: string[] = [];
    const startTime = new Date(`${date}T${daySchedule.start}`);
    const endTime = new Date(`${date}T${daySchedule.end}`);
    const serviceDuration = service.duration;
    const breakDuration = state.studioSettings.break_duration || 15;

    // Obtener citas existentes para este día
    const existingAppointments = state.appointments.filter(
      apt => apt.date === date && apt.status !== 'cancelled'
    );

    let current = new Date(startTime);
    
    while (current < endTime) {
      const currentTimeString = current.toTimeString().slice(0, 5);
      const slotEndTime = new Date(current.getTime() + serviceDuration * 60000);
      
      // Verificar que el slot completo quepa antes del cierre
      if (slotEndTime <= endTime) {
        // Verificar que no haya conflictos con citas existentes
        let hasConflict = false;
        
        for (const appointment of existingAppointments) {
          const appointmentStart = new Date(`${date}T${appointment.time}`);
          const appointmentService = state.services.find(s => s.id === appointment.service_id);
          const appointmentEnd = new Date(
            appointmentStart.getTime() + (appointmentService?.duration || 0) * 60000
          );
          
          if (
            (current >= appointmentStart && current < appointmentEnd) ||
            (slotEndTime > appointmentStart && slotEndTime <= appointmentEnd) ||
            (current <= appointmentStart && slotEndTime >= appointmentEnd)
          ) {
            hasConflict = true;
            break;
          }
        }
        
        if (!hasConflict) {
          slots.push(currentTimeString);
        }
      }
      
      // Avanzar al siguiente slot (duración del servicio + descanso)
      current = new Date(current.getTime() + (serviceDuration + breakDuration) * 60000);
    }
    
    return slots;
  };

  const checkAvailability = async (date: string, time: string, serviceId: string, excludeId?: string): Promise<boolean> => {
    try {
      return await appointmentsAPI.checkAvailability(date, time, serviceId, excludeId);
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const contextValue: AppContextType = {
    state,
    loadAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    loadServices,
    createService,
    updateService,
    deleteService,
    loadUnavailableDates,
    addUnavailableDate,
    removeUnavailableDate,
    loadStudioSettings,
    updateStudioSettings,
    getAvailableSlots,
    checkAvailability,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// Hook personalizado
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};