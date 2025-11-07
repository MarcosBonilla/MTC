# MTC Studio - Sitio Web Completo para Estudio de Música

Este es un proyecto de sitio web completo para un estudio de música en Uruguay, desarrollado con React y TypeScript.

## 🎵 Características del Proyecto

### Funcionalidades Principales:
- **Landing Page**: Página principal con información del estudio, servicios y contacto
- **Sistema de Reservas**: Calendario interactivo para agendar citas con servicios específicos
- **Panel de Administración**: Gestión completa de citas y configuración del estudio
- **4 Servicios**: Grabación, Mezcla/Masterización, Producción Musical y Clases

### Stack Tecnológico:
- **Frontend**: React 18 con TypeScript
- **Styling**: Tailwind CSS con diseño responsive
- **Routing**: React Router DOM
- **Estado**: Context API con useReducer
- **Calendario**: React Calendar con localización en español
- **Fechas**: date-fns para formateo y manejo de fechas
- **Build**: Vite para desarrollo rápido
- **Persistencia**: LocalStorage (preparado para backend)

## 📁 Arquitectura del Proyecto

```
src/
├── types/index.ts          # Interfaces TypeScript
├── context/AppContext.tsx  # Estado global y lógica de negocio
├── pages/
│   ├── Home.tsx           # Landing page
│   ├── Booking.tsx        # Sistema de reservas
│   └── Admin.tsx          # Panel de administración
├── App.tsx                # Router principal
└── index.css             # Estilos Tailwind personalizados
```

## 🎯 Características Clave del Código

### Tipado TypeScript Completo:
- Interfaces definidas para todos los tipos de datos
- Context tipado con hooks personalizados
- Props components completamente tipados

### Gestión de Estado Avanzada:
- Context API con useReducer para estado complejo
- LocalStorage para persistencia automática
- Hooks personalizados para lógica de negocio

### UI/UX Moderna:
- Diseño dark theme con gradientes
- Animaciones y transiciones suaves
- Responsive design mobile-first
- Componentes reutilizables

### Funcionalidades de Negocio:
- Validación automática de disponibilidad de horarios
- Cálculo inteligente de slots disponibles según duración del servicio
- Sistema de estados de citas (pendiente → confirmada → completada)
- Configuración flexible de horarios y días no disponibles

## 🔧 Desarrollo y Mantenimiento

### Comandos Principales:
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build

### Patrones de Código:
- Componentes funcionales con hooks
- Custom hooks para lógica reutilizable
- TypeScript strict mode habilitado
- Nombres descriptivos en español para el dominio de negocio
- Separación clara de responsabilidades

### Configuración:
- Tailwind configurado con colores personalizados del estudio
- Vite optimizado para React y TypeScript
- ESLint configurado para mejores prácticas

Este proyecto está listo para producción y puede ser fácilmente extendido con backend, autenticación, pagos, etc.