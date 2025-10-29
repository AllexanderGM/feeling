# Infraestructura AWS · Terraform

Documentación abreviada para operar la infraestructura de Feeling en AWS usando Terraform y los scripts del repositorio.

## 1. Qué despliega

- **Red**: VPC / subredes públicas y privadas, security groups mínimos.
- **Compute**: EC2 `t3.micro` con Docker (backend) y clave generada automáticamente.
- **Base de datos**: RDS MySQL `db.t3.micro` cifrada, snapshots automáticos (7 días) y protección contra borrado.
- **Almacenamiento**: S3 privado para frontend estático y assets; opcional bucket de logs.
- **CDN/DNS (opcionales)**: CloudFront y Route 53 sólo si activas `USE_DOMAIN=true`.
- **WordPress**: se expone vía subdominio dedicado (`WORDPRESS_SUBDOMAIN`) apuntando a una instancia Lightsail existente.

## 2. Requisitos

- Terraform ≥ 1.5 y AWS CLI configurado con permisos administrativos.
- Docker y npm para construir imágenes/frontend.
- Cuenta en GitHub Container Registry (GHCR) para publicar imágenes `backend` y `frontend`.

## 3. Variables y archivos

### `.env` (desarrollo local)
Genera MinIO, MySQL y servicios Docker. No impacta producción.

### `.env.prod` (despliegue)
Completa antes de ejecutar `./deploy.sh`.

| Grupo | Claves clave |
| --- | --- |
| AWS | `AWS_PROFILE` **o** `AWS_ACCESS_KEY` + `AWS_SECRET_KEY`, `AWS_REGION` |
| Infraestructura | `USE_DOMAIN`, `DOMAIN_NAME`, `HOSTED_ZONE_ID`, `ENABLE_CLOUDFRONT` |
| Red | `SSH_ALLOWED_CIDRS`, `BACKEND_HTTP_CIDRS`, `LIGHTSAIL_WORDPRESS_IP`, `WORDPRESS_SUBDOMAIN` |
| DB / Secrets | `DB_PASSWORD`, `DB_ROOT_PASSWORD`, `SESSION_SECRET`, `JWT_SECRET` |
| Admin / OAuth / SMTP | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GOOGLE_CLIENT_*`, `MAIL`, `MAILPASS` |
| Pagos | Llaves de Wompi (sandbox o prod) |

Deja vacíos `PAYMENTS_REDIRECT_URL`, `WOMPI_REDIRECT_URL` y otras URLs: el script las completa con la URL final del frontend.

## 4. Flujo de `deploy.sh`

1. (Opcional) Ejecuta `./deploy.sh --verify` para generar `terraform.tfvars` y correr `terraform plan` sin aplicar cambios.
2. Valida dependencias y lee `.env.prod`.
3. Genera `infra/terraform.tfvars` con los valores necesarios (credenciales, subdominios, cidrs, etc.).
4. Ejecuta `terraform init && terraform apply -auto-approve` dentro de `infra/`.
5. Procesa *outputs* y genera:
   - `frontend/.env` y `backend/.env` con URLs reales (CloudFront/S3 o dominio).
   - Clave PEM para la EC2 (`infra/.<prefix>-ec2-key.pem` → `.ec2-key.pem`).
6. Construye y publica imágenes en GHCR (`backend:latest`, `frontend:latest`). 
7. Conecta por SSH a la instancia, descarga la imagen de backend y levanta el contenedor (modo `--restart unless-stopped`).
8. Compila React y sincroniza el `dist/` al bucket S3 del frontend.
9. Muestra resumen con endpoints (API, frontend, RDS, CloudFront, etc.).

> Nota: El script también limpia/crea archivos `.env` y no requiere intervención manual para las URLs de retorno de pagos.

## 5. Terraform

Comandos útiles (directorio `infra/`):

```bash
terraform fmt
terraform plan
terraform apply -auto-approve
terraform destroy -auto-approve   # sólo entornos de prueba
```

> Estado local: si necesitas compartirlo con el equipo, migra a backend remoto (S3 + DynamoDB).

## 6. Modos de despliegue

| Modo | Flags clave | Resultado |
| --- | --- | --- |
| **Pruebas sin dominio** | `USE_DOMAIN=false`, `ENABLE_CLOUDFRONT=false` | Accedes vía endpoint S3 (`bucket.s3-website-...`) o la IP de EC2. |
| **Pruebas con CDN** | `USE_DOMAIN=false`, `ENABLE_CLOUDFRONT=true` | Terraform crea CloudFront y `deploy.sh` usa el dominio `*.cloudfront.net`. |
| **Producción con dominio** | `USE_DOMAIN=true`, `DOMAIN_NAME`, `HOSTED_ZONE_ID` | Se crean registros Route 53, ACM en us-east-1 y CloudFront/EC2 usan los FQDN (`api/app/www`). |

Para WordPress en Lightsail debes definir `WORDPRESS_SUBDOMAIN` y `LIGHTSAIL_WORDPRESS_IP`; Terraform crea el registro A y restringe la API al CIDR indicado.

## 7. Buenas prácticas de costo y seguridad

- Mantén `ENABLE_CLOUDFRONT` desactivado hasta que tengas dominio/SSL.
- `ENABLE_S3_BACKUPS=false` por defecto: activa sólo cuando quieras subir dumps automáticos al bucket de assets.
- Define `SSH_ALLOWED_CIDRS` y `BACKEND_HTTP_CIDRS` con IPs específicas (Lightsail, tu oficina, etc.). Evita `0.0.0.0/0` en producción.
- Usa tamaños mínimos (`t3.micro`, `db.t3.micro`) y considera detener EC2/RDS fuera de horario laboral.
- Habilita logs en S3/CloudFront (`ENABLE_LOGS_BUCKET=true`) sólo si necesitas auditoría (añade costo).

## 8. Problemas frecuentes

| Síntoma | Posible causa | Solución |
| --- | --- | --- |
| `terraform apply` falla por credenciales | `AWS_PROFILE` o llaves no definidas | Revisa `.env.prod` y `aws configure list`. |
| Backend no responde en EC2 | SG restringe CIDR o contenedor no levantó | Verifica `BACKEND_HTTP_CIDRS`, revisa `docker ps` en la instancia. |
| Frontend muestra 403 desde CloudFront | Certificado ACM sin validar o dominio mal configurado | Confirma `HOSTED_ZONE_ID`, validación DNS y vuelve a ejecutar `deploy.sh`. |
| WordPress no puede llamar al backend | Falta IP en `BACKEND_HTTP_CIDRS` | Añade `LIGHTSAIL_WORDPRESS_IP/32` y re-ejecuta. |
| URLs incorrectas en Wompi | Intento de usar dominios sin ejecutar `deploy.sh` | Borra `frontend/.env` y vuelve a lanzar el script para regenerar URLs. |

---

Para cambios mayores (nuevos servicios, escalamiento, backend remoto de Terraform) crea un PR con la actualización y documenta la variación en este archivo. Mantén este README corto y accionable. ¡Buen despliegue! 🚀
