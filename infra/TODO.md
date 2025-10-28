✅ GUÍA UNIFICADA PARA TU DESPLIEGUE AWS + TERRAFORM
🧩 1. ¿Qué debes tener preparado ANTES de empezar Terraform?
Ítem Estado ¿Quién lo gestiona?
✅ Cuenta AWS con permisos admin Necesario Ya
✅ AWS CLI configurado Necesario Tú
✅ Terraform instalado Necesario Tú
✅ WordPress funcionando en Lightsail Ya existe AWS
✅ Dominio comprado en Route 53 Pendiente Tú
✅ Zona hospedada en Route 53 (se crea al comprar dominio) Pendiente AWS
✅ Acceso a IP pública o endpoint de Lightsail Necesario Tú
✅ Versión final del JAR de Spring Boot o imagen Docker Pendiente Tú
✅ Build del frontend React listo para deploy Pendiente Tú
✅ Define nombres de subdominios A confirmar Tú
📍 Subdominios tentativos:
Servicio Subdominio
WordPress www.midominio.com
Frontend React app.midominio.com
API Spring Boot api.midominio.com
Imágenes u otros archivos cdn.midominio.com (opcional)
🛠️ 2. ¿Qué creará y gestionará Terraform?
Recurso Descripción Estado
📡 Entrada DNS para www.midominio.com Apunta al WordPress en Lightsail ✅ (Terraform SOLO crea el registro DNS y SSL)
📦 Bucket S3 para React + Política pública o detrás de CloudFront 🟡
🌍 Distribución CloudFront para React Opcional pero recomendado 🟡
🖥️ EC2 o ECS para backend Spring Boot Con SG, role IAM, user_data 🟡
🛡️ Security Groups Para backend 🟡
📤 Bucket S3 para uploads o assets backend Opcional 🟡
📡 Entrada DNS para app.midominio.com Apunta a CloudFront 🟡
📡 Entrada DNS para api.midominio.com Apunta a EC2 o ALB 🟡
🔐 Certificado ACM wildcard (\*.midominio.com) Para SSL 🟡
📜 Outputs Terraform Endpoints generados 🟡
📂 3. Estructura de carpetas recomendada para Terraform
infra/
├─ main.tf (Invoca los módulos)
├─ variables.tf (Variables globales)
├─ outputs.tf (Resultados finales)
├─ networking.tf (VPC, subredes, SG)
├─ compute.tf (EC2 backend)
├─ storage.tf (S3 buckets frontend/CDN)
├─ dns.tf (Subdominios y records)
├─ cloudfront.tf (Frontend CDN)
├─ acm.tf (Certificados SSL)
└─ terraform.tfvars (Valores reales)

📜 4. Archivo terraform.tfvars sugerido
domain_name = "midominio.com"
api_subdomain = "api"
react_subdomain = "app"
wordpress_subdomain = "www"
cdn_subdomain = "cdn"

backend_instance_type = "t3.micro" # cambia a "t4g.micro" si tus imágenes soportan ARM
aws_region = "us-east-1"
environment = "prod"
project_name = "myapp"
lightsail_wordpress_ip = "34.123.45.67" # cambiarlo

📡 5. DNS para WordPress (www.midominio.com)

Terraform deberá hacer sólo esto:

resource "aws_route53_record" "wordpress" {
zone_id = aws_route53_zone.main.zone_id
name = "${var.wordpress_subdomain}.${var.domain_name}"
type = "A"
ttl = 300
records = [var.lightsail_wordpress_ip]
}

✅ De esta manera el sitio WordPress queda integrado al dominio y bajo SSL usando certificado wildcard desde ACM.

🔜 6. Próximos pasos que haré contigo (siguiente respuesta)

Con esta base lista te prepararé:
✅ Mapa completo del flujo Terraform
✅ Qué módulos empezar
✅ Código inicial base (primero DNS + ACM + S3)
✅ Orden de despliegue paso a paso

📣 Confírmame rápido esto para continuar:

✅ ¿Quieres que la API Spring Boot vaya en EC2 con un .jar y user_data?
✅ ¿Quieres que el frontend vaya en S3 + CloudFront?
✅ ¿Quieres certificado SSL wildcard?
✅ ¿Quieres que empecemos construyendo DNS + ACM primero?

Me confirmas eso y empezamos a construir bloque por bloque. ¿Vamos? 🚀
