-- Supabase SQL Schema para MTC Studio
-- Ejecuta este código en el SQL Editor de tu proyecto Supabase

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- en minutos
  price DECIMAL(10,2) NOT NULL,
  color VARCHAR(7) DEFAULT '#f59e0b',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de citas/reservas
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de fechas no disponibles
CREATE TABLE IF NOT EXISTS unavailable_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración del estudio
CREATE TABLE IF NOT EXISTS studio_settings (
  id VARCHAR(10) DEFAULT '1' PRIMARY KEY,
  opening_hours JSONB DEFAULT '{
    "monday": {"start": "09:00", "end": "18:00"},
    "tuesday": {"start": "09:00", "end": "18:00"},
    "wednesday": {"start": "09:00", "end": "18:00"},
    "thursday": {"start": "09:00", "end": "18:00"},
    "friday": {"start": "09:00", "end": "18:00"},
    "saturday": {"start": "10:00", "end": "16:00"},
    "sunday": {"start": "", "end": ""}
  }',
  break_duration INTEGER DEFAULT 15, -- minutos entre citas
  advance_booking_days INTEGER DEFAULT 30, -- días de anticipación máxima
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar servicios por defecto
INSERT INTO services (name, description, duration, price, color) VALUES
('Grabación', 'Sesión de grabación profesional en estudio', 120, 100.00, '#f59e0b'),
('Mezcla/Masterización', 'Mezcla y masterización de pistas', 180, 150.00, '#3b82f6'),
('Producción Musical', 'Producción musical completa', 240, 200.00, '#ef4444'),
('Clases', 'Clases de música e instrumentos', 60, 50.00, '#10b981')
ON CONFLICT DO NOTHING;

-- Insertar configuración por defecto
INSERT INTO studio_settings (id) VALUES ('1') ON CONFLICT DO NOTHING;

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_unavailable_dates_date ON unavailable_dates(date);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para appointments
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para studio_settings
CREATE TRIGGER update_studio_settings_updated_at 
    BEFORE UPDATE ON studio_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security) - Opcional, para mayor seguridad
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE unavailable_dates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE studio_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso público de lectura (ajusta según tus necesidades)
-- CREATE POLICY "Public can read services" ON services FOR SELECT USING (active = true);
-- CREATE POLICY "Public can create appointments" ON appointments FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public can read unavailable_dates" ON unavailable_dates FOR SELECT USING (true);
-- CREATE POLICY "Public can read studio_settings" ON studio_settings FOR SELECT USING (true);