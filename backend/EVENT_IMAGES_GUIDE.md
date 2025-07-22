# 📸 Gestión de Imágenes de Eventos

## 🎯 Funcionalidades Implementadas

### ✅ **Almacenamiento Dual**
- **Desarrollo:** MinIO (local)
- **Producción:** AWS S3
- **Configuración:** Variable `STORAGE_TYPE` (minio/s3)

### ✅ **Validaciones de Seguridad**
- Formatos permitidos: JPG, JPEG, PNG, WEBP
- Tamaño máximo: 5MB por imagen
- Validación de tipo MIME
- Control de permisos (solo creador/admin)

### ✅ **Endpoints Disponibles**

#### 🔵 **Imagen Principal del Evento**

```bash
# Subir imagen principal
POST /api/events/{eventId}/images/main
Content-Type: multipart/form-data
Body: image (file)

# Actualizar imagen principal
PUT /api/events/{eventId}/images/main
Content-Type: multipart/form-data
Body: image (file)

# Eliminar imagen principal
DELETE /api/events/{eventId}/images/main

# Obtener URL de imagen principal
GET /api/events/{eventId}/images/main/url
```

#### 🔵 **Crear Evento con Imagen**

```bash
# Crear evento + imagen en una sola request
POST /api/events/with-image
Content-Type: multipart/form-data
Body: 
  - title: string
  - description: string
  - eventDate: datetime
  - price: decimal
  - maxCapacity: integer
  - category: EventCategory
  - mainImage: file (opcional)
```

#### 🔵 **Galería de Imágenes (Futuro)**

```bash
# Subir múltiples imágenes
POST /api/events/{eventId}/images/gallery
Content-Type: multipart/form-data
Body: images[] (hasta 5 archivos)
```

## 🔧 **Configuración Requerida**

### **Variables de Entorno**

```env
# Tipo de almacenamiento
STORAGE_TYPE=minio  # o 's3' para producción

# MinIO (Desarrollo)
MINIO_PORT=9000
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123
MINIO_BUCKET=feeling-files

# AWS S3 (Producción)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=feeling-production
```

### **Docker Compose (MinIO)**

```yaml
minio:
  image: minio/minio:latest
  ports:
    - "9000:9000"
    - "9001:9001"
  environment:
    MINIO_ROOT_USER: ${MINIO_ROOT_USER}
    MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
  volumes:
    - minio_data:/data
  command: server /data --console-address ":9001"
```

## 📝 **Ejemplos de Uso**

### **Frontend - Crear Evento con Imagen**

```javascript
const createEventWithImage = async (eventData, imageFile) => {
  const formData = new FormData();
  
  // Agregar datos del evento
  formData.append('title', eventData.title);
  formData.append('description', eventData.description);
  formData.append('eventDate', eventData.eventDate);
  formData.append('price', eventData.price);
  formData.append('maxCapacity', eventData.maxCapacity);
  formData.append('category', eventData.category);
  
  // Agregar imagen si existe
  if (imageFile) {
    formData.append('mainImage', imageFile);
  }
  
  const response = await fetch('/api/events/with-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  });
  
  return response.json();
};
```

### **Frontend - Subir Solo Imagen**

```javascript
const uploadEventImage = async (eventId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch(`/api/events/${eventId}/images/main`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  });
  
  return response.json();
};
```

### **cURL - Ejemplos**

```bash
# Crear evento con imagen
curl -X POST "http://localhost:8080/api/events/with-image" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Concierto de Rock" \
  -F "description=Gran concierto al aire libre" \
  -F "eventDate=2024-12-31T20:00:00" \
  -F "price=50.00" \
  -F "maxCapacity=100" \
  -F "category=MUSICAL" \
  -F "mainImage=@event-poster.jpg"

# Subir imagen a evento existente
curl -X POST "http://localhost:8080/api/events/123/images/main" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@event-image.jpg"
```

## 🔒 **Seguridad y Permisos**

### **Control de Acceso**
- Solo el **creador del evento** puede gestionar sus imágenes
- Los **administradores** pueden gestionar cualquier imagen
- **Usuarios no autenticados** no pueden subir imágenes

### **Validaciones**
- Formato de archivo validado en servidor
- Tamaño máximo controlado (5MB)
- Tipo MIME verificado
- Nombres de archivo únicos (UUID)

## 🗂️ **Estructura de Archivos**

```
Almacenamiento/
├── events/
│   ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
│   ├── b2c3d4e5-f6a7-8901-bcde-f23456789012.png
│   └── ...
```

## ⚠️ **Consideraciones Importantes**

1. **Limpieza de Archivos:** Las imágenes se eliminan automáticamente cuando se elimina el evento
2. **Caché:** Los eventos se cachean, el cache se invalida al actualizar imágenes
3. **Transacciones:** Las operaciones de imagen están dentro de transacciones
4. **Error Handling:** Los errores de imagen no fallan la creación del evento
5. **Performance:** Use CDN en producción para servir imágenes estáticas

## 🚀 **Próximas Mejoras**

- [ ] Redimensionamiento automático de imágenes
- [ ] Múltiples formatos de imagen (thumbnails)
- [ ] Galería completa de imágenes por evento
- [ ] Compresión automática
- [ ] CDN integration
- [ ] Watermarks automáticos