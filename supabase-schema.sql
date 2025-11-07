-- Esquema de base de datos para MTC Studio
-- Ejecutar este SQL en el editor SQL de Supabase

-- 1. Tabla de servicios
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- duración en minutos
  price DECIMAL(10,2) NOT NULL,
  color VARCHAR(7) NOT NULL, -- código hexadecimal
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de citas/reservas
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name VARCHAR(100) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20),
  service_id UUID NOT NULL REFERENCES services(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de fechas no disponibles
CREATE TABLE unavailable_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Configuración del estudio
CREATE TABLE studio_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opening_hours JSONB NOT NULL DEFAULT '{
    "monday": {"start": "09:00", "end": "18:00"},
    "tuesday": {"start": "09:00", "end": "18:00"}, 
    "wednesday": {"start": "09:00", "end": "18:00"},
    "thursday": {"start": "09:00", "end": "18:00"},
    "friday": {"start": "09:00", "end": "18:00"},
    "saturday": {"start": "10:00", "end": "16:00"},
    "sunday": {"start": "10:00", "end": "16:00"}
  }',
  break_duration INTEGER DEFAULT 15, -- minutos entre citas
  advance_booking_days INTEGER DEFAULT 30, -- días de anticipación máxima para reservar
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar servicios iniciales
INSERT INTO services (name, description, duration, price, color) VALUES
('Grabación', 'Sesión de grabación en estudio profesional', 120, 2500.00, '#ff4444'),
('Mezcla y Masterización', 'Mezcla y masterización de tus tracks', 90, 1800.00, '#44ff44'),
('Producción Musical', 'Producción completa de tu música', 180, 3500.00, '#4444ff'),
('Clases de Música', 'Clases personalizadas de instrumentos', 60, 1200.00, '#ffaa00');

-- Insertar configuración inicial del estudio
INSERT INTO studio_settings (opening_hours, break_duration, advance_booking_days) VALUES (
  '{
    "monday": {"start": "09:00", "end": "18:00"},
    "tuesday": {"start": "09:00", "end": "18:00"}, 
    "wednesday": {"start": "09:00", "end": "18:00"},
    "thursday": {"start": "09:00", "end": "18:00"},
    "friday": {"start": "09:00", "end": "18:00"},
    "saturday": {"start": "10:00", "end": "16:00"},
    "sunday": {"start": "10:00", "end": "16:00"}
  }',
  15,
  30
);

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE unavailable_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública (sin autenticación)
CREATE POLICY "Services are publicly readable" ON services FOR SELECT USING (true);
CREATE POLICY "Studio settings are publicly readable" ON studio_settings FOR SELECT USING (true);
CREATE POLICY "Unavailable dates are publicly readable" ON unavailable_dates FOR SELECT USING (true);

-- Políticas para appointments (lectura y escritura pública para demo)
CREATE POLICY "Appointments are publicly readable" ON appointments FOR SELECT USING (true);
CREATE POLICY "Anyone can create appointments" ON appointments FOR INSERT WITH CHECK (true);

-- Políticas para administración (por ahora públicas, en producción agregar autenticación)
CREATE POLICY "Anyone can manage services" ON services FOR ALL USING (true);
CREATE POLICY "Anyone can manage appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Anyone can manage unavailable dates" ON unavailable_dates FOR ALL USING (true);
CREATE POLICY "Anyone can manage studio settings" ON studio_settings FOR ALL USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studio_settings_updated_at BEFORE UPDATE ON studio_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar performance
CREATE INDEX idx_appointments_date_time ON appointments(date, time);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_unavailable_dates_date ON unavailable_dates(date);