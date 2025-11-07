# MTC Studio - Sitio Web y Sistema de Reservas

![MTC Studio](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.2.1-green.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.16-blue.svg)

Sitio web completo para un estudio de música en Uruguay con sistema de reservas de citas y panel de administración.

## 🎵 Características

### Para Clientes
- **Landing Page Atractiva**: Información completa del estudio, servicios y contacto
- **Sistema de Reservas**: Calendario interactivo para seleccionar fecha y hora
- **4 Servicios Disponibles**:
  - Grabación de Audio (2h - $2.500)
  - Mezcla y Masterización (1.5h - $2.000)
  - Producción Musical (3h - $4.000)
  - Clases de Producción (1h - $1.500)
- **Interfaz Intuitiva**: Proceso paso a paso para agendar citas
- **Responsive Design**: Funciona perfectamente en móviles y desktop

### Para Administradores
- **Panel de Administración**: Gestión completa de citas y configuración
- **Gestión de Citas**: Ver, confirmar, completar o cancelar reservas
- **Configuración de Horarios**: Establecer horarios de trabajo del estudio
- **Fechas No Disponibles**: Bloquear días específicos cuando el estudio no opere
- **Estadísticas**: Vista general del estado de las reservas
- **Protección por Contraseña**: Acceso seguro al panel administrativo

## 🚀 Tecnologías Utilizadas

- **React 18** con TypeScript para una aplicación robusta y tipada
- **Vite** para desarrollo rápido y builds optimizados  
- **React Router** para navegación entre páginas
- **Tailwind CSS** para estilos modernos y responsive
- **React Calendar** para selección de fechas
- **date-fns** para manejo de fechas y localización en español
- **Context API** para manejo de estado global
- **LocalStorage** para persistencia de datos (fácil migrar a backend)

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── context/            # Context API para estado global
│   └── AppContext.tsx  # Provider principal de la aplicación
├── pages/              # Páginas principales
│   ├── Home.tsx        # Landing page del estudio
│   ├── Booking.tsx     # Sistema de reservas
│   └── Admin.tsx       # Panel de administración
├── types/              # Definiciones de TypeScript
│   └── index.ts        # Interfaces y tipos
├── App.tsx             # Componente principal con router
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales y Tailwind
```

## 🛠️ Instalación y Configuración

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**
   - El sitio estará disponible en `http://localhost:5173`
   - Landing page: `http://localhost:5173/`
   - Sistema de reservas: `http://localhost:5173/reservar`
   - Panel admin: `http://localhost:5173/admin` (contraseña: `admin123`)

### Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build para producción
npm run preview    # Vista previa del build
npm run lint       # Linting con ESLint
```

## 📋 Guía de Uso

### Para Clientes (Sistema de Reservas)

1. **Acceder al sistema**: Desde la landing page, hacer clic en "Reservar Cita"
2. **Seleccionar servicio**: Elegir entre los 4 servicios disponibles
3. **Seleccionar fecha**: Usar el calendario (solo días laborables y disponibles)
4. **Seleccionar hora**: Elegir entre los horarios disponibles para esa fecha
5. **Datos de contacto**: Completar nombre, email, teléfono y notas opcionales
6. **Confirmar**: Revisar el resumen y confirmar la reserva

### Para Administradores (Panel Admin)

1. **Acceso**: Ir a `/admin` e ingresar contraseña (`admin123`)
2. **Gestión de Citas**:
   - Ver todas las citas con filtros por estado
   - Cambiar estado: pendiente → confirmada → completada
   - Eliminar citas si es necesario
3. **Configuración**:
   - Modificar horarios de atención (apertura y cierre)
   - Agregar/quitar fechas no disponibles
   - Ver información de servicios

## 🎨 Personalización

### Cambiar Colores del Theme
Editar `tailwind.config.js`:
```javascript
colors: {
  primary: {
    // Cambiar estos valores por los colores deseados
    600: '#ed661a', // Color principal
    700: '#df4e10', // Color hover
  }
}
```

### Modificar Servicios
Editar `src/context/AppContext.tsx` en `defaultServices`:
```typescript
const defaultServices: Service[] = [
  {
    id: '1',
    name: 'Nuevo Servicio',
    description: 'Descripción del servicio',
    duration: 60, // minutos
    price: 1000, // precio
    color: '#color-hex'
  }
];
```

### Cambiar Horarios por Defecto
En `src/context/AppContext.tsx`, modificar `defaultStudioSettings`:
```typescript
businessHours: {
  start: '09:00',
  end: '18:00'
}
```

## 🔒 Seguridad

- **Panel Admin**: Protegido por contraseña (cambiar en `src/pages/Admin.tsx`)
- **Datos**: Almacenados localmente (considerar backend para producción)
- **Validación**: Forms validados en frontend

## 🚀 Despliegue

### Build para Producción
```bash
npm run build
```
Los archivos optimizados estarán en la carpeta `dist/`

### Opciones de Despliegue
- **Netlify**: Conectar repositorio y deploy automático
- **Vercel**: Ideal para proyectos React/Vite
- **GitHub Pages**: Para sitios estáticos
- **Servidor propio**: Subir contenido de `dist/` a servidor web

## 📱 Características Responsive

- ✅ **Mobile First**: Diseñado primero para móviles
- ✅ **Tablet**: Adaptado para tablets y pantallas medianas  
- ✅ **Desktop**: Optimizado para pantallas grandes
- ✅ **Touch Friendly**: Botones y elementos táctiles apropiados

## 🛠️ Mantenimiento

### Actualizar Dependencias
```bash
npm update
```

### Backup de Datos
Los datos están en LocalStorage del navegador. Para backup:
1. Abrir DevTools → Application → LocalStorage
2. Copiar keys: `musicStudio_appointments` y `musicStudio_settings`

## 🎯 Roadmap / Futuras Mejoras

- [ ] Backend con base de datos real
- [ ] Autenticación de usuarios
- [ ] Notificaciones por email
- [ ] Integración con calendarios (Google Calendar)
- [ ] Sistema de pagos online
- [ ] Chat en vivo
- [ ] Multi-idioma (español/inglés)
- [ ] PWA (Progressive Web App)
- [ ] Analytics y métricas

---

**MTC Studio** - Creado con ❤️ para músicos uruguayos
