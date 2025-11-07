import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { BookingFormData } from '../types';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const Booking: React.FC = () => {
  const { state, addAppointment, getAvailableSlots } = useApp();
  const [currentStep, setCurrentStep] = useState<'service' | 'date' | 'time' | 'form'>('service');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState<Omit<BookingFormData, 'date' | 'time' | 'serviceId'>>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Solo servicios activos para reservas (ya vienen filtrados desde Supabase)
  const activeServices = state.services;
  const isLoadingServices = state.isLoadingServices;
  
  // Log para verificar servicios activos
  React.useEffect(() => {
    if (activeServices.length > 0) {
    }
  }, [activeServices]);

  // Log para verificar fechas no disponibles
  React.useEffect(() => {
    if (state.studioSettings.unavailableDates.length > 0) {
    }
  }, [state.studioSettings.unavailableDates]);

  const availableSlots = selectedDate && selectedService 
    ? getAvailableSlots(format(selectedDate, 'yyyy-MM-dd'), selectedService)
    : [];

  const selectedServiceData = activeServices.find(s => s.id === selectedService);

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setSelectedTime(''); // Reset time when date changes
      setCurrentStep('time'); // Move to time selection
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedDate(null); // Reset date when service changes
    setSelectedTime(''); // Reset time when service changes
    setCurrentStep('date'); // Move to date selection
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('form'); // Move to form
  };

  const goBackToStep = (step: 'service' | 'date' | 'time' | 'form') => {
    setCurrentStep(step);
    if (step === 'service') {
      setSelectedService('');
      setSelectedDate(null);
      setSelectedTime('');
    } else if (step === 'date') {
      setSelectedDate(null);
      setSelectedTime('');
    } else if (step === 'time') {
      setSelectedTime('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedService || !selectedTime) return;

    setIsSubmitting(true);
    
    try {
      await addAppointment({
        ...formData,
        serviceId: selectedService,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        status: 'pending'
      });
      
      setShowConfirmation(true);
      
      // Reset form
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        notes: ''
      });
      setSelectedDate(null);
      setSelectedService('');
      setSelectedTime('');
      
    } catch (error) {
      
      // Mostrar mensaje específico si es un error de conflicto
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      if (errorMessage.includes('Conflicto de horario')) {
        alert(`❌ ${errorMessage}\n\nPor favor, selecciona otro horario.`);
      } else {
        alert('Error al crear la cita. Por favor, inténtalo nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable weekends (optional - remove if studio works weekends)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    
    // Disable dates in unavailableDates
    const dateString = format(date, 'yyyy-MM-dd');
    const isUnavailable = state.studioSettings.unavailableDates.includes(dateString);
    
    // Log para verificar fechas bloqueadas
    if (isUnavailable) {
    }
    
    return isUnavailable;
  };

  if (showConfirmation) {
    return (
      <div>
        {/* Header */}
        <header className="header">
          <div className="container">
            <div className="header-content">
              <Link to="/" className="logo">
                [[MOVING TO CHASE]]
              </Link>
            </div>
          </div>
        </header>

        {/* Confirmation Section */}
        <section className="confirmation-section">
          <div className="container">
            <div className="confirmation-content">
              <div className="success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              
              <h1 className="text-display">BOOKING CONFIRMED</h1>
              <p className="confirmation-message text-large">
                Your session has been successfully scheduled. We'll contact you soon to confirm all the details and prepare for your recording session.
              </p>
              
              <div className="confirmation-actions">
                <Link to="/" className="btn btn-primary">
                  BACK TO HOME
                </Link>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="btn btn-secondary"
                >
                  NEW BOOKING
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              [[MOVING TO CHASE]]
            </Link>

            <nav className="nav">
              <Link to="/" className="nav-link">HOME</Link>
              <Link to="/reservar" className="nav-link active">BOOKING</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container" style={{paddingTop: '120px', paddingBottom: '120px'}}>

        <form onSubmit={handleSubmit} className="booking-form">
          {/* Step 1: Service Selection */}
          {currentStep === 'service' && (
            <div className="booking-step fade-in-up">
              <div className="step-header">
                <div className="step-indicator">
                  <span className="step-number">01</span>
                  <span className="step-title">SELECT SERVICE</span>
                </div>
                <p className="step-subtitle">
                  Choose the service that best fits your project needs
                </p>
              </div>
              
              <div className="services-grid">
                {isLoadingServices ? (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '200px',
                    color: 'var(--gray-400)',
                    fontSize: '1.1rem'
                  }}>
                    🔄 Cargando servicios...
                  </div>
                ) : activeServices.length === 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '200px',
                    color: 'var(--gray-400)',
                    fontSize: '1.1rem'
                  }}>
                    ❌ No hay servicios disponibles en este momento
                  </div>
                ) : (
                  activeServices.map((service) => (
                  <div 
                    key={service.id} 
                    className="service-card"
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <div className="service-label">
                      <div className="service-header">
                        <h3 className="service-name">{service.name}</h3>
                        <div 
                          className="service-indicator"
                          style={{ backgroundColor: service.color }}
                        ></div>
                      </div>
                      <p className="service-description">{service.description}</p>
                      <div className="service-details">
                        <span className="service-duration">{service.duration} MIN</span>
                        <span className="service-price">${service.price}</span>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Date Selection */}
          {currentStep === 'date' && selectedService && (
            <div className="booking-step fade-in-up">
              <div className="step-header">
                <div className="step-nav">
                  <button 
                    type="button" 
                    className="back-btn"
                    onClick={() => goBackToStep('service')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                    BACK
                  </button>
                  <div className="step-indicator">
                    <span className="step-number">02</span>
                    <span className="step-title">SELECT DATE</span>
                  </div>
                </div>
                <p className="step-subtitle">
                  Choose your preferred date for the session
                </p>
              </div>
              
              <div className="calendar-container">
                <div className="booking-calendar">
                  <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    tileDisabled={tileDisabled}
                    locale="es-ES"
                    minDate={new Date()}
                  />
                </div>
                
                {selectedServiceData && (
                  <div className="selected-service-info">
                    <h4>SELECTED SERVICE</h4>
                    <p>{selectedServiceData.name}</p>
                    <div className="service-meta">
                      <span>{selectedServiceData.duration} minutes</span>
                      <span>${selectedServiceData.price}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Time Selection */}
          {currentStep === 'time' && selectedDate && selectedService && (
            <div className="booking-step fade-in-up">
              <div className="step-header">
                <div className="step-nav">
                  <button 
                    type="button" 
                    className="back-btn"
                    onClick={() => goBackToStep('date')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                    BACK
                  </button>
                  <div className="step-indicator">
                    <span className="step-number">03</span>
                    <span className="step-title">SELECT TIME</span>
                  </div>
                </div>
                <p className="step-subtitle">
                  {format(selectedDate, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
                </p>
              </div>
              
              {availableSlots.length > 0 ? (
                <div className="time-slots">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleTimeSelect(slot)}
                      className="time-slot"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="no-slots">
                  <p>No available time slots for this date and service.</p>
                  <p>Please try selecting another date.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Form and Confirmation */}
          {currentStep === 'form' && selectedTime && (
            <div className="booking-step fade-in-up">
              <div className="step-header">
                <div className="step-nav">
                  <button 
                    type="button" 
                    className="back-btn"
                    onClick={() => goBackToStep('time')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                    BACK
                  </button>
                  <div className="step-indicator">
                    <span className="step-number">04</span>
                    <span className="step-title">COMPLETE BOOKING</span>
                  </div>
                </div>
                <p className="step-subtitle">
                  Tell us about yourself and confirm your session
                </p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="clientName" className="form-label">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="clientPhone" className="form-label">
                    PHONE *
                  </label>
                  <input
                    type="tel"
                    id="clientPhone"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="clientEmail" className="form-label">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    id="clientEmail"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="notes" className="form-label">
                    PROJECT NOTES (OPTIONAL)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="form-textarea"
                    placeholder="Tell us about your project, instruments you'll be recording, specific requirements, etc."
                  />
                </div>
              </div>

              {/* Summary */}
              {formData.clientName && formData.clientEmail && formData.clientPhone && (
                <>
                  <div className="booking-summary">
                    <h3 className="summary-title">SESSION SUMMARY</h3>
                    <div className="summary-details">
                      <div className="summary-row">
                        <span>Service:</span>
                        <span>{selectedServiceData?.name}</span>
                      </div>
                      <div className="summary-row">
                        <span>Date:</span>
                        <span>
                          {selectedDate && format(selectedDate, 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <div className="summary-row">
                        <span>Time:</span>
                        <span>{selectedTime}</span>
                      </div>
                      <div className="summary-row">
                        <span>Duration:</span>
                        <span>{selectedServiceData?.duration} minutes</span>
                      </div>
                      <div className="summary-row total">
                        <span>Price:</span>
                        <span>${selectedServiceData?.price}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-btn"
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'CONFIRM BOOKING'}
                  </button>
                  
                  <p className="booking-disclaimer">
                    By confirming, you'll receive an email confirmation and we'll contact you to finalize the details.
                  </p>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Booking;
