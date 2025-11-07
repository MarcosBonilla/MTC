# Videos del Hero Section

Esta carpeta contiene los videos que se muestran en la sección hero de la página principal.

## Archivos necesarios:

### Para móviles (formato vertical):
- **Archivo**: `hero-mobile.mp4`
- **Formato**: Video vertical (9:16 o similar)
- **Duración**: Recomendado 15-30 segundos (loop automático)
- **Resolución**: 1080x1920 o superior
- **Formato**: MP4 (H.264)
- **Tamaño**: Máximo 10MB para optimizar carga en móviles

### Para escritorio:
- Actualmente usa YouTube iframe como fallback
- Si quieres usar video local para desktop, créa `hero-desktop.mp4`
- **Formato**: Video horizontal (16:9)
- **Resolución**: 1920x1080 o superior

## Optimización recomendada:

```bash
# Para comprimir video móvil (requiere FFmpeg):
ffmpeg -i input-mobile.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k hero-mobile.mp4

# Para comprimir video desktop:
ffmpeg -i input-desktop.mp4 -c:v libx264 -crf 25 -preset medium -c:a aac -b:a 128k hero-desktop.mp4
```

## Detección automática:

El sistema detecta automáticamente:
- **Móviles**: User agent + pantalla ≤ 768px → `hero-mobile.mp4`
- **Desktop**: Resto de dispositivos → YouTube iframe actual

## Notas técnicas:

- Los videos se reproducen automáticamente (autoplay, muted, loop)
- En móviles se usa `playsInline` para evitar pantalla completa
- Fallback a YouTube si el video local no está disponible
- Filtros CSS aplicados: brightness(0.4), contrast(1.2), saturate(0.8)