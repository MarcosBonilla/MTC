import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Hook para detectar dispositivos móviles
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isSmallScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(mobileRegex.test(userAgent) || (isSmallScreen && isTouchDevice));
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const Home: React.FC = () => {
  const { state } = useApp();
  const isMobile = useIsMobile();
  const [videoError, setVideoError] = useState(false);

  // Filtrar portfolio por tipo
  const musicPortfolio = state.portfolio.filter(item => item.type === 'music').map(item => ({
    id: parseInt(item.id) || Math.random(),
    title: item.title.toUpperCase(),
    artist: item.artist?.toUpperCase() || 'UNKNOWN ARTIST',
    genre: item.genre?.toUpperCase() || 'MUSIC',
    audioUrl: item.audioUrl || '/audio/sample1.mp3',
    coverImage: item.imageUrl,
    description: item.description
  }));

  const videoPortfolio = state.portfolio.filter(item => item.type === 'video').map(item => ({
    id: parseInt(item.id) || Math.random(),
    title: item.title.toUpperCase(),
    description: item.description,
    thumbnail: item.imageUrl,
    videoUrl: item.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: item.duration || '03:00'
  }));

  // Fallback data si no hay datos en Supabase
  const fallbackMusicPortfolio = [
    {
      id: 1,
      title: "SAMPLE TRACK",
      artist: "DEMO ARTIST",
      genre: "DEMO",
      audioUrl: "/audio/sample1.mp3",
      coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      description: "Demo track while loading from Supabase"
    }
  ];

  const fallbackVideoPortfolio = [
    {
      id: 1,
      title: "SAMPLE VIDEO",
      description: "Demo video while loading from Supabase",
      thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "03:00"
    }
  ];

  // Usar datos de Supabase si existen, sino usar fallback
  const finalMusicPortfolio = musicPortfolio.length > 0 ? musicPortfolio : fallbackMusicPortfolio;
  const finalVideoPortfolio = videoPortfolio.length > 0 ? videoPortfolio : fallbackVideoPortfolio;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentVideoSlide, setCurrentVideoSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [showContactSuccess, setShowContactSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % finalMusicPortfolio.length);
    }, 6000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const videoTimer = setInterval(() => {
      setCurrentVideoSlide((prev) => (prev + 1) % finalVideoPortfolio.length);
    }, 7000); // Slightly different timing to avoid sync
    
    return () => clearInterval(videoTimer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % finalMusicPortfolio.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + finalMusicPortfolio.length) % finalMusicPortfolio.length);
  };

  const currentTrack = finalMusicPortfolio[currentSlide];

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmittingContact(false);
    setShowContactSuccess(true);
    setContactForm({ name: '', email: '', message: '' });
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowContactSuccess(false);
      setShowContactForm(false);
    }, 3000);
  };

  return (
    <div>
      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              [[MOVING TO CHASE]]
            </Link>

            <nav className="nav">
              <a href="#home" className="nav-link active">Inicio</a>
              <a href="#portfolio" className="nav-link">Musica</a>
              <a href="#videos" className="nav-link">Videos</a>
              <a href="#contact" className="nav-link">Acerca de nosotros</a>
              <Link to="/reservar" className="btn btn-primary">
                Reservar sesión
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-video">
          {isMobile && !videoError ? (
            // Video vertical para móviles
            <video
              className="hero-video-element"
              src="/videos/hero-mobile.mp4"
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            // Video horizontal para desktop o iframe de YouTube como fallback
            <iframe
              className="hero-video-element"
              src="https://www.youtube.com/embed/6MWFqxOquHE?autoplay=1&mute=1&loop=1&playlist=6MWFqxOquHE&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&start=0&preload=auto"
              title="MTC Studio Video"
              allow="autoplay; encrypted-media"
              allowFullScreen
              loading="eager"
            />
          )}
        </div>
        <div className="hero-overlay"></div>
        
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="text-huge">
                SOUND<br/>
                DESIGN
              </h1>
              <p className="hero-subtitle text-large">
                Professional music production studio in Uruguay. We transform your musical ideas 
                into world-class productions with over a decade of industry experience.
              </p>
              <div className="hero-buttons">
                <Link to="/reservar" className="btn btn-primary">
                  BOOK SESSION
                </Link>
                <a href="#portfolio" className="btn btn-secondary">
                  VIEW WORK
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Music Portfolio */}
      <section id="portfolio" className="section portfolio-section">
        <div className="container">
          <div className="section-header fade-in-up">
            <h2 className="text-display">Musica</h2>
            <p className="section-subtitle text-large">
              Selected tracks from our latest recording sessions
            </p>
          </div>

          <div className="music-slider fade-in-up">
            <div className="current-track">
              <div className="track-info">
                <div className="track-header">
                  <img 
                    src={currentTrack.coverImage} 
                    alt={currentTrack.title}
                    className="track-cover"
                  />
                  <div className="track-details">
                    <h3>{currentTrack.title}</h3>
                    <p>{currentTrack.artist}</p>
                    <span className="track-genre">{currentTrack.genre}</span>
                  </div>
                </div>
                
                <p className="track-description">
                  {currentTrack.description}
                </p>

                <div className="audio-player">
                  <div className="player-controls">
                    <button 
                      className="play-btn"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                    <div className="progress-bar">
                      <div className="progress-track">
                        <div className="progress-fill" style={{width: '42%'}}></div>
                      </div>
                      <div className="time-display">
                        <span>2:14</span>
                        <span>5:08</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="album-art-container">
                <img 
                  src={currentTrack.coverImage} 
                  alt={currentTrack.title}
                  className="album-art"
                />
              </div>
            </div>

            <div className="slider-controls">
              <button onClick={prevSlide} className="slider-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              
              <div className="slide-indicators">
                {musicPortfolio.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`slide-indicator ${index === currentSlide ? 'active' : ''}`}
                  />
                ))}
              </div>
              
              <button onClick={nextSlide} className="slider-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Portfolio */}
      <section id="videos" className="section">
        <div className="container">
          <div className="section-header fade-in-up">
            <h2 className="text-display">Videos</h2>
            <p className="section-subtitle text-large">
              Creative videoclips produced for our artists - Full production service
            </p>
          </div>

          <div className="video-slider fade-in-up">
            <div className="current-video">
              <div className="video-info">
                <div className="video-header">
                  <img 
                    src={finalVideoPortfolio[currentVideoSlide].thumbnail} 
                    alt={finalVideoPortfolio[currentVideoSlide].title}
                    className="video-cover"
                  />
                  <div className="video-details">
                    <h3>{finalVideoPortfolio[currentVideoSlide].title}</h3>
                    <p>Music Video</p>
                    <span className="video-duration">{finalVideoPortfolio[currentVideoSlide].duration}</span>
                  </div>
                </div>
                
                <p className="video-description">
                  {finalVideoPortfolio[currentVideoSlide].description}
                </p>

                <div className="video-player">
                  <button 
                    className="watch-btn"
                    onClick={() => setSelectedVideo(finalVideoPortfolio[currentVideoSlide].id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    WATCH VIDEO
                  </button>
                </div>
              </div>

              <div className="video-art-container">
                <div className="video-thumbnail-wrapper">
                  <img 
                    src={finalVideoPortfolio[currentVideoSlide].thumbnail} 
                    alt={finalVideoPortfolio[currentVideoSlide].title}
                    className="video-art"
                  />
                  <div 
                    className="video-overlay"
                    onClick={() => setSelectedVideo(finalVideoPortfolio[currentVideoSlide].id)}
                  >
                    <div className="play-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="slider-controls">
              <button onClick={() => setCurrentVideoSlide((prev) => (prev - 1 + finalVideoPortfolio.length) % finalVideoPortfolio.length)} className="slider-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              
              <div className="slide-indicators">
                {videoPortfolio.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentVideoSlide(index)}
                    className={`slide-indicator ${index === currentVideoSlide ? 'active' : ''}`}
                  />
                ))}
              </div>
              
              <button onClick={() => setCurrentVideoSlide((prev) => (prev + 1) % finalVideoPortfolio.length)} className="slider-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section portfolio-section">
        <div className="container">
          <div className="section-header fade-in-up">
            <h2 className="text-display">Contacto</h2>
            <p className="section-subtitle text-large">
              ¿Tienes alguna duda? Puedes contactarnos por aquí
            </p>
            <div style={{marginTop: '3rem'}}>
              <button 
                onClick={() => setShowContactForm(true)}
                className="btn btn-primary" 
                style={{fontSize: '1.1rem', padding: '18px 36px'}}
              >
                Contáctanos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="modal-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedVideo(null)}
            >
              ✕
            </button>
            <iframe
              src={videoPortfolio.find(v => v.id === selectedVideo)?.videoUrl}
              className="modal-iframe"
              allowFullScreen
              title="Studio Video"
            />
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="modal-overlay" onClick={() => setShowContactForm(false)}>
          <div className="modal-content contact-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowContactForm(false)}
            >
              ✕
            </button>
            
            {showContactSuccess ? (
              <div className="contact-success">
                <div className="success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h3>¡Mensaje enviado!</h3>
                <p>Gracias por contactarnos. Te responderemos pronto.</p>
              </div>
            ) : (
              <div className="contact-form-content">
                <h3>Contáctanos</h3>
                <p>Cuéntanos tu proyecto o consulta y te responderemos pronto</p>
                
                <form onSubmit={handleContactSubmit} className="contact-form">
                  <div className="form-group">
                    <label htmlFor="name">Nombre completo</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Mensaje</label>
                    <textarea
                      id="message"
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactFormChange}
                      required
                      rows={4}
                      className="form-textarea"
                      placeholder="Cuéntanos sobre tu proyecto, dudas o consultas..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="btn btn-primary"
                    style={{width: '100%'}}
                  >
                    {isSubmittingContact ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;