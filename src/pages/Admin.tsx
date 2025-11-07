import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../types';

const Admin: React.FC = () => {
  const { 
    state, 
    updateAppointment, 
    deleteAppointment, 
    updateStudioSettings,
    addUnavailableDate,
    removeUnavailableDate,
    addService,
    updateService,
    deleteService,
    addPortfolioItem,
    deletePortfolioItem
  } = useApp();
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'portfolio' | 'settings'>('appointments');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Service management states
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    color: '#f59e0b'
  });
  
  // Portfolio management states
  const [showPortfolioForm, setShowPortfolioForm] = useState<'music' | 'video' | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    artist: '',
    description: '',
    imageUrl: '',
    audioUrl: '',
    videoUrl: '',
    genre: '',
    duration: ''
  });

  // Simple password protection (in production, use proper authentication)
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('Incorrect password');
    }
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Control body scroll when modal is open
  useEffect(() => {
    if (showPortfolioForm) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = '';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPortfolioForm]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
    setPassword('');
  };

  const filteredAppointments = state.appointments.filter(apt => {
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    updateAppointment(appointmentId, { status: newStatus });
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      deleteAppointment(appointmentId);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment.id);
    setEditForm({
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      clientPhone: appointment.clientPhone,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingAppointment) {
      updateAppointment(editingAppointment, editForm);
      setEditingAppointment(null);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setEditingAppointment(null);
    setEditForm({});
  };

  // Service management functions
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addService(serviceForm);
      setServiceForm({
        name: '',
        description: '',
        duration: 60,
        price: 0,
        color: '#f59e0b'
      });
      alert('Servicio agregado exitosamente');
    } catch (error) {
      alert('Error al agregar servicio. Inténtalo de nuevo.');
    }
  };

  const handleUpdateService = async (id: string, updates: Partial<any>) => {
    try {
      await updateService(id, updates);
      alert('Servicio actualizado exitosamente');
    } catch (error) {
      alert('Error al actualizar servicio. Inténtalo de nuevo.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(id);
        alert('Servicio eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar servicio. Inténtalo de nuevo.');
      }
    }
  };

  // Portfolio management functions
  const handleAddPortfolioItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPortfolioForm) return;

    const itemData = {
      title: portfolioForm.title,
      description: portfolioForm.description,
      type: showPortfolioForm,
      imageUrl: portfolioForm.imageUrl,
      ...(showPortfolioForm === 'music' ? {
        artist: portfolioForm.artist,
        genre: portfolioForm.genre,
        audioUrl: portfolioForm.audioUrl
      } : {
        duration: portfolioForm.duration,
        videoUrl: portfolioForm.videoUrl
      })
    };

    addPortfolioItem(itemData);
    setPortfolioForm({
      title: '',
      artist: '',
      description: '',
      imageUrl: '',
      audioUrl: '',
      videoUrl: '',
      genre: '',
      duration: ''
    });
    setShowPortfolioForm(null);
  };

  const handleDeletePortfolioItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      deletePortfolioItem(id);
    }
  };

  const [unavailableDate, setUnavailableDate] = useState('');
  
  const handleStudioSettingsUpdate = async (updates: Partial<typeof state.studioSettings>) => {
    try {
      await updateStudioSettings(updates);
    } catch (error) {
    }
  };
  
  const handleAddUnavailableDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unavailableDate && !state.studioSettings.unavailableDates.includes(unavailableDate)) {
      try {
        await addUnavailableDate(unavailableDate);
        setUnavailableDate('');
      } catch (error) {
      }
    }
  };

  const handleRemoveUnavailableDate = async (dateToRemove: string) => {
    try {
      await removeUnavailableDate(dateToRemove);
    } catch (error) {
    }
  };

  if (!isAuthenticated) {
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

        {/* Auth Section */}
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '2rem',
          paddingTop: '120px',
          background: 'linear-gradient(135deg, rgb(13, 13, 13) 0%, rgb(23, 23, 23) 50%, rgb(18, 18, 18) 100%)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '450px',
            margin: '0 auto',
            padding: '0 1rem',
            position: 'relative',
            zIndex: 10
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '2.5rem'
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                color: 'white',
                marginBottom: '1rem',
                fontFamily: 'Manrope, sans-serif'
              }}>ADMIN ACCESS</h1>
              <p style={{
                color: '#a1a1aa',
                fontSize: '1rem',
                fontWeight: 300,
                letterSpacing: '-0.01em',
                lineHeight: 1.6
              }}>
                Enter the admin password to access the control panel
              </p>
            </div>
            
            <form onSubmit={handleAuth} style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="password" style={{
                  display: 'block',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  PASSWORD
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  background: 'linear-gradient(135deg, white 0%, rgb(240, 240, 240) 100%)',
                  color: 'rgb(15, 15, 15)',
                  border: 'none',
                  borderRadius: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  marginTop: '1rem',
                  boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1)';
                }}
              >
                ACCESS ADMIN PANEL
              </button>
            </form>
            
            <div style={{
              textAlign: 'center',
              marginTop: '2rem'
            }}>
              <Link to="/" style={{
                color: '#a1a1aa',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 400,
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                display: 'inline-block',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#a1a1aa';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                ← Back to main site
              </Link>
            </div>
          </div>
        </div>
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

            {/* Mobile Menu Button */}
            <button
              className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {/* Mobile Menu Overlay - moved inside header */}
            {isMobileMenuOpen && (
              <div 
                className="mobile-menu-overlay"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            <nav className={`admin-nav ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}>
              <button
                onClick={() => {
                  setActiveTab('appointments');
                  setIsMobileMenuOpen(false);
                }}
                className={`nav-btn ${activeTab === 'appointments' ? 'active' : ''}`}
              >
                APPOINTMENTS
              </button>
              <button
                onClick={() => {
                  setActiveTab('services');
                  setIsMobileMenuOpen(false);
                }}
                className={`nav-btn ${activeTab === 'services' ? 'active' : ''}`}
              >
                SERVICES
              </button>
              <button
                onClick={() => {
                  setActiveTab('portfolio');
                  setIsMobileMenuOpen(false);
                }}
                className={`nav-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
              >
                PORTFOLIO
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsMobileMenuOpen(false);
                }}
                className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              >
                SETTINGS
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="logout-btn"
              >
                LOGOUT
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="admin-content">
        <div className="container">
          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="admin-section">
              <div className="section-header">
                <h2 className="text-display">APPOINTMENTS</h2>
                <p className="section-subtitle text-large">
                  Manage all confirmed bookings and sessions
                </p>
              </div>

              <div className="appointments-filter">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Appointments</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Stats */}
              <div className="admin-stats">
                <div className="stat-card">
                  <div className="stat-indicator pending"></div>
                  <div className="stat-info">
                    <span className="stat-label">PENDING</span>
                    <span className="stat-value">
                      {state.appointments.filter(apt => apt.status === 'pending').length}
                    </span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-indicator confirmed"></div>
                  <div className="stat-info">
                    <span className="stat-label">CONFIRMED</span>
                    <span className="stat-value">
                      {state.appointments.filter(apt => apt.status === 'confirmed').length}
                    </span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-indicator completed"></div>
                  <div className="stat-info">
                    <span className="stat-label">COMPLETED</span>
                    <span className="stat-value">
                      {state.appointments.filter(apt => apt.status === 'completed').length}
                    </span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-indicator total"></div>
                  <div className="stat-info">
                    <span className="stat-label">TOTAL</span>
                    <span className="stat-value">
                      {state.appointments.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Appointments List */}
              <div className="appointments-list">
                {filteredAppointments.length === 0 ? (
                  <div className="no-appointments">
                    <p>No appointments to show</p>
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => {
                    const service = state.services.find(s => s.id === appointment.serviceId);
                    const isEditing = editingAppointment === appointment.id;
                    
                    return (
                      <div key={appointment.id} className="appointment-card">
                        <div className="appointment-header">
                          <div className="appointment-client">
                            <h3>{isEditing ? (
                              <input
                                type="text"
                                value={editForm.clientName}
                                onChange={(e) => setEditForm({...editForm, clientName: e.target.value})}
                                className="edit-input"
                              />
                            ) : appointment.clientName}</h3>
                            <p>{isEditing ? (
                              <input
                                type="email"
                                value={editForm.clientEmail}
                                onChange={(e) => setEditForm({...editForm, clientEmail: e.target.value})}
                                className="edit-input"
                              />
                            ) : appointment.clientEmail}</p>
                            <p>{isEditing ? (
                              <input
                                type="tel"
                                value={editForm.clientPhone}
                                onChange={(e) => setEditForm({...editForm, clientPhone: e.target.value})}
                                className="edit-input"
                              />
                            ) : appointment.clientPhone}</p>
                          </div>
                          
                          <div className="appointment-status">
                            <select
                              value={appointment.status}
                              onChange={(e) => handleStatusChange(appointment.id, e.target.value as Appointment['status'])}
                              className={`status-select ${appointment.status}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        <div className="appointment-details">
                          <div className="detail-group">
                            <span className="detail-label">SERVICE</span>
                            <span className="detail-value">{service?.name || 'Unknown Service'}</span>
                          </div>
                          
                          <div className="detail-group">
                            <span className="detail-label">DATE</span>
                            <span className="detail-value">
                              {isEditing ? (
                                <input
                                  type="date"
                                  value={editForm.date}
                                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                  className="edit-input small"
                                />
                              ) : format(new Date(appointment.date), 'dd/MM/yyyy')}
                            </span>
                          </div>
                          
                          <div className="detail-group">
                            <span className="detail-label">TIME</span>
                            <span className="detail-value">
                              {isEditing ? (
                                <input
                                  type="time"
                                  value={editForm.time}
                                  onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                                  className="edit-input small"
                                />
                              ) : appointment.time}
                            </span>
                          </div>
                          
                          <div className="detail-group">
                            <span className="detail-label">PRICE</span>
                            <span className="detail-value">${service?.price}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="appointment-notes">
                            <span className="detail-label">NOTES</span>
                            {isEditing ? (
                              <textarea
                                value={editForm.notes}
                                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                className="edit-textarea"
                                rows={3}
                              />
                            ) : (
                              <p>{appointment.notes}</p>
                            )}
                          </div>
                        )}

                        <div className="appointment-actions">
                          {isEditing ? (
                            <>
                              <button onClick={handleSaveEdit} className="save-btn">
                                SAVE
                              </button>
                              <button onClick={handleCancelEdit} className="cancel-btn">
                                CANCEL
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditAppointment(appointment)} className="edit-btn">
                                EDIT
                              </button>
                              <button onClick={() => handleDeleteAppointment(appointment.id)} className="delete-btn">
                                DELETE
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="admin-section">
              <div className="section-header">
                <h2 className="text-display">SERVICES MANAGEMENT</h2>
                <p className="section-subtitle text-large">
                  Add, edit, or remove studio services and pricing
                </p>
              </div>

              {/* Add New Service Form */}
              <div className="setting-card" style={{ marginBottom: '3rem' }}>
                <h3 className="setting-title">ADD NEW SERVICE</h3>
                <form onSubmit={handleAddService}>
                  <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">SERVICE NAME</label>
                      <input
                        type="text"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                        className="form-input"
                        placeholder="e.g., Audio Recording"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">DURATION (MINUTES)</label>
                      <input
                        type="number"
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm({...serviceForm, duration: parseInt(e.target.value)})}
                        className="form-input"
                        min="15"
                        max="480"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">PRICE ($)</label>
                      <input
                        type="number"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({...serviceForm, price: parseInt(e.target.value)})}
                        className="form-input"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">COLOR</label>
                      <input
                        type="color"
                        value={serviceForm.color}
                        onChange={(e) => setServiceForm({...serviceForm, color: e.target.value})}
                        className="form-input"
                        style={{ height: '50px' }}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">DESCRIPTION</label>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                      className="form-input"
                      rows={3}
                      placeholder="Describe the service..."
                      required
                    />
                  </div>
                  
                  <button type="submit" className="add-btn">
                    ADD SERVICE
                  </button>
                </form>
              </div>

              {/* Existing Services */}
              <div className="services-list">
                <h3 className="setting-title">CURRENT SERVICES</h3>
                <div className="services-overview">
                  {state.services.map((service) => (
                    <div key={service.id} className="service-overview-item">
                      <div className="service-overview-header">
                        <h4>{service.name}</h4>
                        <div 
                          className="service-color"
                          style={{ backgroundColor: service.color }}
                        ></div>
                      </div>
                      <p className="service-overview-description">{service.description}</p>
                      <div className="service-overview-details">
                        <span>{service.duration} minutes</span>
                        <span>${service.price}</span>
                      </div>
                      <div className="service-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            const newPrice = prompt('New price:', service.price.toString());
                            if (newPrice && !isNaN(Number(newPrice))) {
                              handleUpdateService(service.id, { price: Number(newPrice) });
                            }
                          }}
                          className="edit-btn"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          EDIT PRICE
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="delete-btn"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          DEACTIVATE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="admin-section">
              <div className="section-header">
                <h2 className="text-display">PORTFOLIO MANAGEMENT</h2>
                <p className="section-subtitle text-large">
                  Add new items to music and video portfolios
                </p>
              </div>

              <div className="portfolio-management">
                <div className="portfolio-section">
                  <h3 className="portfolio-title">MUSIC PORTFOLIO</h3>
                  <p className="portfolio-description">Add new tracks to the music slider</p>
                  <button onClick={() => setShowPortfolioForm('music')} className="add-portfolio-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    ADD MUSIC TRACK
                  </button>
                </div>

                <div className="portfolio-section">
                  <h3 className="portfolio-title">VIDEO PORTFOLIO</h3>
                  <p className="portfolio-description">Add new music videos to the video slider</p>
                  <button onClick={() => setShowPortfolioForm('video')} className="add-portfolio-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    ADD MUSIC VIDEO
                  </button>
                </div>
              </div>

              {/* Portfolio Form Modal */}
              {showPortfolioForm && (
                <div style={{ 
                  position: 'fixed', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  background: 'transparent', 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'center', 
                  zIndex: 99999,
                  padding: '2rem',
                  paddingTop: '10vh'
                }}>
                  <div style={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    padding: '3rem',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    position: 'relative',
                    zIndex: 100000,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h3 className="setting-title">ADD {showPortfolioForm.toUpperCase()} ITEM</h3>
                      <button 
                        onClick={() => setShowPortfolioForm(null)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'white', 
                          fontSize: '1.5rem', 
                          cursor: 'pointer' 
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    
                    <form onSubmit={handleAddPortfolioItem}>
                      <div className="form-group">
                        <label className="form-label">TITLE</label>
                        <input
                          type="text"
                          value={portfolioForm.title}
                          onChange={(e) => setPortfolioForm({...portfolioForm, title: e.target.value})}
                          className="form-input"
                          required
                        />
                      </div>
                      
                      {showPortfolioForm === 'music' && (
                        <>
                          <div className="form-group">
                            <label className="form-label">ARTIST</label>
                            <input
                              type="text"
                              value={portfolioForm.artist}
                              onChange={(e) => setPortfolioForm({...portfolioForm, artist: e.target.value})}
                              className="form-input"
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">GENRE</label>
                            <input
                              type="text"
                              value={portfolioForm.genre}
                              onChange={(e) => setPortfolioForm({...portfolioForm, genre: e.target.value})}
                              className="form-input"
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">AUDIO URL</label>
                            <input
                              type="url"
                              value={portfolioForm.audioUrl}
                              onChange={(e) => setPortfolioForm({...portfolioForm, audioUrl: e.target.value})}
                              className="form-input"
                              placeholder="https://..."
                            />
                          </div>
                        </>
                      )}
                      
                      {showPortfolioForm === 'video' && (
                        <>
                          <div className="form-group">
                            <label className="form-label">DURATION</label>
                            <input
                              type="text"
                              value={portfolioForm.duration}
                              onChange={(e) => setPortfolioForm({...portfolioForm, duration: e.target.value})}
                              className="form-input"
                              placeholder="e.g., 03:42"
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">VIDEO URL</label>
                            <input
                              type="url"
                              value={portfolioForm.videoUrl}
                              onChange={(e) => setPortfolioForm({...portfolioForm, videoUrl: e.target.value})}
                              className="form-input"
                              placeholder="https://www.youtube.com/embed/..."
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="form-group">
                        <label className="form-label">COVER IMAGE URL</label>
                        <input
                          type="url"
                          value={portfolioForm.imageUrl}
                          onChange={(e) => setPortfolioForm({...portfolioForm, imageUrl: e.target.value})}
                          className="form-input"
                          placeholder="https://..."
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">DESCRIPTION</label>
                        <textarea
                          value={portfolioForm.description}
                          onChange={(e) => setPortfolioForm({...portfolioForm, description: e.target.value})}
                          className="form-input"
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button 
                          type="button" 
                          onClick={() => setShowPortfolioForm(null)}
                          className="cancel-btn"
                        >
                          CANCEL
                        </button>
                        <button type="submit" className="add-btn">
                          ADD ITEM
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Existing Portfolio Items */}
              <div style={{ marginTop: '3rem' }}>
                <h3 className="setting-title">CURRENT PORTFOLIO</h3>
                <div className="services-overview">
                  {state.portfolio.map((item) => (
                    <div key={item.id} className="service-overview-item">
                      <div className="service-overview-header">
                        <h4>{item.title}</h4>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.7rem', 
                          textTransform: 'uppercase',
                          background: item.type === 'music' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                          color: item.type === 'music' ? 'rgb(251, 191, 36)' : 'rgb(99, 102, 241)'
                        }}>
                          {item.type}
                        </span>
                      </div>
                      {item.artist && <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', margin: '0.5rem 0' }}>{item.artist}</p>}
                      <p className="service-overview-description">{item.description}</p>
                      <div style={{ marginTop: '1rem' }}>
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          style={{ 
                            width: '100%', 
                            height: '150px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            marginBottom: '1rem'
                          }}
                        />
                      </div>
                      <div className="service-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleDeletePortfolioItem(item.id)}
                          className="delete-btn"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                  {state.portfolio.length === 0 && (
                    <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem' }}>
                      No portfolio items yet. Add some using the buttons above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="admin-section">
              <div className="section-header">
                <h2 className="text-display">STUDIO SETTINGS</h2>
                <p className="section-subtitle text-large">
                  Configure studio hours and availability
                </p>
              </div>

              <div className="settings-grid">
                {/* Business Hours */}
                <div className="setting-card">
                  <h3 className="setting-title">BUSINESS HOURS</h3>
                  <div className="hours-inputs">
                    <div className="input-group">
                      <label className="form-label">OPENING TIME</label>
                      <input
                        type="time"
                        value={state.studioSettings.businessHours.start}
                        onChange={(e) => handleStudioSettingsUpdate({
                          businessHours: {
                            ...state.studioSettings.businessHours,
                            start: e.target.value
                          }
                        })}
                        className="form-input"
                      />
                    </div>
                    <div className="input-group">
                      <label className="form-label">CLOSING TIME</label>
                      <input
                        type="time"
                        value={state.studioSettings.businessHours.end}
                        onChange={(e) => handleStudioSettingsUpdate({
                          businessHours: {
                            ...state.studioSettings.businessHours,
                            end: e.target.value
                          }
                        })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Unavailable Dates */}
                <div className="setting-card">
                  <h3 className="setting-title">UNAVAILABLE DATES</h3>
                  
                  <form onSubmit={handleAddUnavailableDate} className="add-date-form">
                    <input
                      type="date"
                      value={unavailableDate}
                      onChange={(e) => setUnavailableDate(e.target.value)}
                      className="form-input"
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                    <button type="submit" className="add-btn">
                      ADD DATE
                    </button>
                  </form>

                  <div className="unavailable-dates">
                    {state.studioSettings.unavailableDates.length === 0 ? (
                      <p className="no-dates">No blocked dates</p>
                    ) : (
                      state.studioSettings.unavailableDates.map((date) => (
                        <div key={date} className="date-item">
                          <span>{format(new Date(date), 'dd/MM/yyyy', { locale: es })}</span>
                          <button
                            onClick={() => handleRemoveUnavailableDate(date)}
                            className="remove-date-btn"
                          >
                            REMOVE
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Services Overview */}
                <div className="setting-card full-width">
                  <h3 className="setting-title">SERVICES OVERVIEW</h3>
                  <div className="services-overview">
                    {state.services.map((service) => (
                      <div key={service.id} className="service-overview-item">
                        <div className="service-overview-header">
                          <h4>{service.name}</h4>
                          <div 
                            className="service-color"
                            style={{ backgroundColor: service.color }}
                          ></div>
                        </div>
                        <p className="service-overview-description">{service.description}</p>
                        <div className="service-overview-details">
                          <span>{service.duration} minutes</span>
                          <span>${service.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
