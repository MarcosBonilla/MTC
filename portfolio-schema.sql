-- Esquema de la tabla portfolio para MTC Studio
-- Ejecutar este SQL en el editor SQL de Supabase

CREATE TABLE portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  description TEXT,
  type VARCHAR(10) NOT NULL CHECK (type IN ('music', 'video')),
  image_url TEXT NOT NULL,
  audio_url TEXT,
  video_url TEXT,
  genre VARCHAR(100),
  duration VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Política de seguridad RLS
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública
CREATE POLICY "Portfolio is publicly readable" ON portfolio FOR SELECT USING (true);

-- Políticas para administración (por ahora públicas, en producción agregar autenticación)
CREATE POLICY "Anyone can manage portfolio" ON portfolio FOR ALL USING (true);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar performance
CREATE INDEX idx_portfolio_type ON portfolio(type);
CREATE INDEX idx_portfolio_created_at ON portfolio(created_at DESC);

-- Insertar algunos datos de ejemplo
INSERT INTO portfolio (title, artist, description, type, image_url, audio_url, genre, duration) VALUES
('Echoes of Tomorrow', 'Luna Martinez', 'Una composición ethereal que fusiona elementos electrónicos con instrumentos acústicos, creando paisajes sonoros que evocan esperanza y nostalgia.', 'music', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop', 'https://example.com/echoes-of-tomorrow.mp3', 'Electronic/Ambient', '4:23'),

('Midnight Groove', 'The Velvet Collective', 'Un track de jazz-funk moderno grabado en vivo en nuestro estudio. Groove irresistible con solos de saxophone que te transportan a los clubes de Nueva York.', 'music', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=800&fit=crop', 'https://example.com/midnight-groove.mp3', 'Jazz/Funk', '5:17'),

('Digital Dreams', 'Neon Pulse', 'Producción electrónica experimental que combina síntesis analógica vintage con técnicas de producción contemporáneas.', 'music', 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=800&h=800&fit=crop', 'https://example.com/digital-dreams.mp3', 'Electronic/Experimental', '3:45');

INSERT INTO portfolio (title, description, type, image_url, video_url, duration) VALUES
('Behind the Mix', 'Documental íntimo sobre el proceso creativo en MTC Studio. Seguimos a diferentes artistas durante sus sesiones de grabación.', 'video', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop', 'https://example.com/behind-the-mix.mp4', '8:42'),

('Luna Martinez - Echoes', 'Video musical oficial de "Echoes of Tomorrow" grabado en nuestro estudio con iluminación atmosférica y efectos visuales.', 'video', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop', 'https://example.com/echoes-music-video.mp4', '4:23'),

('Studio Sessions Vol.1', 'Compilación de momentos únicos capturados durante las sesiones de grabación. Música, emoción y creatividad en estado puro.', 'video', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', 'https://example.com/studio-sessions-v1.mp4', '6:15');