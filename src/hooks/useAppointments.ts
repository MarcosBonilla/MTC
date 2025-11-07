import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { appointmentService } from '../services/appointmentService';
import type { Appointment } from '../types';

export const useAppointments = () => {
  const { state } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and search appointments
  const filteredAppointments = useMemo(() => {
    let appointments = appointmentService.filterByStatus(state.appointments, filterStatus);
    
    if (searchTerm) {
      appointments = appointments.filter(apt => 
        apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.clientPhone.includes(searchTerm)
      );
    }
    
    return appointmentService.sortAppointments(appointments);
  }, [state.appointments, filterStatus, searchTerm]);

  // Get appointment statistics
  const stats = useMemo(() => {
    const total = state.appointments.length;
    const pending = state.appointments.filter(apt => apt.status === 'pending').length;
    const confirmed = state.appointments.filter(apt => apt.status === 'confirmed').length;
    const completed = state.appointments.filter(apt => apt.status === 'completed').length;
    const cancelled = state.appointments.filter(apt => apt.status === 'cancelled').length;

    return { total, pending, confirmed, completed, cancelled };
  }, [state.appointments]);

  return {
    appointments: filteredAppointments,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    stats
  };
};

export const useAppointmentForm = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = appointmentService.validateAppointment(formData);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      serviceId: '',
      date: '',
      time: '',
      notes: ''
    });
    setErrors([]);
  };

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    isValid: errors.length === 0 && formData.clientName && formData.clientEmail
  };
};