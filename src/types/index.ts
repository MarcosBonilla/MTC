export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  color: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  date: string; // YYYY-MM-DD format
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD format
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface StudioSettings {
  businessHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  unavailableDates: string[]; // Array of dates in YYYY-MM-DD format
  slotDuration: number; // Duration of each time slot in minutes
  services: Service[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  artist?: string;
  description: string;
  type: 'music' | 'video';
  imageUrl: string;
  audioUrl?: string; // For music items
  videoUrl?: string; // For video items
  genre?: string; // For music items
  duration?: string; // For video items
  createdAt: string;
}

export interface BookingFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}