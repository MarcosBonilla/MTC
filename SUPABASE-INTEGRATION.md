# Guía de Integración con Supabase - MTC Studio

## 🔧 Configuración Inicial

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda la URL del proyecto y la clave anónima

### 2. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anónima
```

### 3. Actualizar configuración de Supabase
Edita `src/lib/supabase.ts`:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### 4. Ejecutar el schema SQL
Copia el contenido de `database-schema.sql` y ejecútalo en el SQL Editor de Supabase.

## 🔄 Cambios en el código

### 1. Actualizar App.tsx
Reemplaza el AppProvider existente con el nuevo SupabaseAppProvider:

```typescript
import { AppProvider } from './context/SupabaseAppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        {/* Tu contenido existente */}
      </Router>
    </AppProvider>
  );
}
```

### 2. Actualizar el contexto en componentes
Reemplaza en todos los archivos:

```typescript
// Antes
import { useApp } from '../context/AppContext';

// Después  
import { useSupabaseApp } from '../context/SupabaseAppContext';

// Cambiar el hook
const { state, ... } = useSupabaseApp();
```

## 📊 Base de datos creada

### Tablas principales:
- **services**: Servicios del estudio (Grabación, Mezcla, etc.)
- **appointments**: Reservas de los clientes
- **unavailable_dates**: Días no disponibles
- **studio_settings**: Configuración de horarios y parámetros

### Características implementadas:
- ✅ Validación de horarios ocupados
- ✅ Prevención de reservas duplicadas  
- ✅ Gestión de días no disponibles
- ✅ Actualización en tiempo real
- ✅ Manejo de errores
- ✅ Tipos TypeScript completos

## 🔧 Funcionalidades disponibles

### Para clientes (Booking page):
- ✅ Ver servicios disponibles desde la base de datos
- ✅ Seleccionar fecha (evita días no disponibles)
- ✅ Ver solo horarios libres
- ✅ Crear reserva con validación
- ✅ Manejo de errores (horario ocupado, etc.)

### Para admin:
- ✅ Ver todas las reservas desde la base de datos
- ✅ Actualizar status de reservas
- ✅ Agregar/quitar días no disponibles
- ✅ Gestionar servicios
- ✅ Configurar horarios del estudio

## 🚀 Próximos pasos

1. **Configurar Supabase** con tus credenciales
2. **Ejecutar el schema SQL** para crear las tablas
3. **Actualizar App.tsx** para usar el nuevo contexto
4. **Probar el sistema** de reservas
5. **Personalizar según necesidades**

## 🔒 Seguridad (Opcional)

Para mayor seguridad, puedes habilitar Row Level Security:

```sql
-- Habilitar RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE unavailable_dates ENABLE ROW LEVEL SECURITY;

-- Políticas ejemplo (personalizar según necesidades)
CREATE POLICY "Todos pueden crear reservas" ON appointments 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden ver fechas no disponibles" ON unavailable_dates 
FOR SELECT USING (true);
```

## 📱 Funcionalidades implementadas

- **Sistema de reservas completo** con Supabase
- **Validación en tiempo real** de disponibilidad
- **Admin panel** conectado a la base de datos
- **Gestión de días no disponibles**
- **Prevención de conflictos** de horarios
- **Manejo de errores** robusto
- **Tipos TypeScript** completos

¡Tu aplicación ahora está lista para usar Supabase como backend completo!