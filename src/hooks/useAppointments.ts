import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export const useAppointments = () => {
  const { state } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and search appointments
  const filteredAppointments = useMemo(() => {
    let appointments = state.appointments;
    
    // Filter by status
    if (filterStatus !== 'all') {
      appointments = appointments.filter(apt => apt.status === filterStatus);
    }
    
    // Filter by search term
    if (searchTerm) {
      appointments = appointments.filter(apt => 
        apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.clientPhone.includes(searchTerm)
      );
    }
    
    // Sort by date and time
    return appointments.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
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
    const validationErrors: string[] = [];
    
    if (!formData.clientName.trim()) {
      validationErrors.push('Name is required');
    }
    
    if (!formData.clientEmail.trim()) {
      validationErrors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      validationErrors.push('Email is invalid');
    }
    
    if (!formData.clientPhone.trim()) {
      validationErrors.push('Phone is required');
    }
    
    if (!formData.serviceId) {
      validationErrors.push('Service is required');
    }
    
    if (!formData.date) {
      validationErrors.push('Date is required');
    }
    
    if (!formData.time) {
      validationErrors.push('Time is required');
    }
    
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