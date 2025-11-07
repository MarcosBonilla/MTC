import type { Appointment } from '../types';

export const appointmentService = {
  // Validations
  validateAppointment: (appointment: Partial<Appointment>): string[] => {
    const errors: string[] = [];
    
    if (!appointment.clientName || appointment.clientName.trim().length < 2) {
      errors.push('Client name must be at least 2 characters long');
    }
    
    if (!appointment.clientEmail || !isValidEmail(appointment.clientEmail)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!appointment.clientPhone || appointment.clientPhone.trim().length < 10) {
      errors.push('Please enter a valid phone number');
    }
    
    if (!appointment.serviceId) {
      errors.push('Please select a service');
    }
    
    if (!appointment.date) {
      errors.push('Please select a date');
    }
    
    if (!appointment.time) {
      errors.push('Please select a time');
    }
    
    return errors;
  },

  // Generate time slots for a given day
  generateTimeSlots: (
    startTime: string = '09:00',
    endTime: string = '20:00',
    slotDuration: number = 30,
    unavailableSlots: string[] = []
  ): { time: string; available: boolean }[] => {
    const slots: { time: string; available: boolean }[] = [];
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    
    for (let current = start; current < end; current += slotDuration) {
      const timeString = minutesToTime(current);
      slots.push({
        time: timeString,
        available: !unavailableSlots.includes(timeString)
      });
    }
    
    return slots;
  },

  // Check if appointment conflicts with existing ones
  hasConflict: (
    newAppointment: { date: string; time: string; duration: number },
    existingAppointments: Appointment[]
  ): boolean => {
    const conflictingAppointments = existingAppointments.filter(
      apt => apt.date === newAppointment.date && apt.status !== 'cancelled'
    );
    
    const newStart = timeToMinutes(newAppointment.time);
    const newEnd = newStart + newAppointment.duration;
    
    return conflictingAppointments.some(apt => {
      const existingStart = timeToMinutes(apt.time);
      const existingEnd = existingStart + 60; // Default duration
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
  },

  // Filter appointments by status
  filterByStatus: (appointments: Appointment[], status: string): Appointment[] => {
    if (status === 'all') return appointments;
    return appointments.filter(apt => apt.status === status);
  },

  // Sort appointments by date and time
  sortAppointments: (appointments: Appointment[]): Appointment[] => {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }
};

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}