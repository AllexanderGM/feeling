### Checklist para cuando la plataforma tenga dominio propio y HTTPS

Este documento resume los ajustes que hay que revertir o completar cuando movamos la aplicación a un dominio con certificado TLS (CloudFront/ALB + ACM).

1. Cookie policy del frontend  
   - Archivo: `frontend/src/constants/cookieKeys.js`.  
   - Acción: establecer `VITE_FORCE_SECURE_COOKIES=true` (o eliminar la variable para dejar que el runtime HTTPS use el modo auto).  
   - Objetivo: volver a marcar `access_token` y `refresh_token` como `secure` para evitar que el navegador las envíe sobre HTTP.

2. Políticas públicas del bucket de assets  
   - Archivo Terraform: `infra/storage.tf` (módulo `assets_bucket`).  
   - Acción: revertir el ACL a `private` y reactivar los bloqueos de acceso público (`block_public_acls = true`, etc.).  
   - Opcional: crear distribución CloudFront con origin access control y anclar los assets allí.  
   - Objetivo: evitar exposición directa del bucket cuando las imágenes se sirvan por CDN/HTTPS.

3. URLs de frontend/backend  
   - Variables: `frontend/.env*`, `.env.prod`, `backend/.env` y `terraform.tfvars`.  
   - Acción: actualizar `URL_FRONT`, `URL_BACK`, `VITE_URL_BACK`, dominios en Terraform (`use_domain = true`, hosts de CloudFront/Route53).  
   - Objetivo: apuntar todo el tráfico a los nuevos subdominios seguros.

4. Certificados y CloudFront  
   - Terraform: activar `enable_cloudfront = true`, proporcionar dominios y certificados (`acm.tf`, `cloudfront.tf`).  
   - Objetivo: que tanto el SPA como el backend se sirvan por HTTPS terminando en la CDN/Load Balancer.

5. Seguridad de S3 en los servicios  
   - `S3Configuration` ya valida con `headBucket`; no se requiere ajuste adicional.  
   - Verificar que las IAM policies sigan permitiendo `PutObject/DeleteObject` después de cambiar a OAC/privado.

6. Revisión de cookies existentes  
   - Tras el despliegue HTTPS, limpiar cookies viejas en los navegadores (o forzar re-login) para que se reescriban con el nuevo atributo `secure`.

7. Configuración de CORS y redirects  
   - Backend: revisar `cors.allowed.origins` para incluir el dominio definitivo (`backend/src/main/resources/application*.properties`).  
   - Frontend: confirmar que `strict-origin-when-cross-origin` funciona con HTTPS y que cualquier redirect a HTTP se elimina.

Ejecutar estos pasos en el orden indicado durante la migración asegurará que la plataforma use HTTPS de extremo a extremo sin dejar configuraciones temporales de la etapa de pruebas.
