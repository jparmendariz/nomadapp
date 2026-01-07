# Nomada Newsletter System - Guía de Configuración

Sistema para obtener ofertas REALES de viajes a través de newsletters de aerolíneas y agencias.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE DATOS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Aerolíneas  │    │   Agencias   │    │  Agregadores │  │
│  │  - Volaris   │    │  - Despegar  │    │ - Scott's CF │  │
│  │  - Vivaaero  │    │  - BestDay   │    │ - SecretFly  │  │
│  │  - Aeromex   │    │  - Kayak     │    │ - Fly4Free   │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │           │
│         └───────────────────┼───────────────────┘           │
│                             ▼                               │
│                   ┌─────────────────┐                       │
│                   │  📧 Email Box   │                       │
│                   │ ofertas@nomada  │                       │
│                   └────────┬────────┘                       │
│                            │                                │
│                            ▼                                │
│         ┌─────────────────────────────────┐                │
│         │     🔄 Vercel Cron (15 min)     │                │
│         │     POST /api/newsletter        │                │
│         └────────────────┬────────────────┘                │
│                          │                                  │
│         ┌────────────────┼────────────────┐                │
│         ▼                ▼                ▼                │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ IMAP Fetch │→ │   Parser    │→ │  Supabase   │         │
│  │  (emails)  │  │ (extractor) │  │    (DB)     │         │
│  └────────────┘  └─────────────┘  └─────────────┘         │
│                                          │                  │
│                                          ▼                  │
│                               ┌─────────────────┐          │
│                               │  GET /api/news  │          │
│                               │  → Frontend     │          │
│                               └─────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Paso 1: Crear el Correo

### Opción A: Gmail (Recomendado para empezar)

1. Crea una cuenta: `ofertas.nomada@gmail.com`
2. Activa la verificación en 2 pasos
3. Genera una "App Password":
   - Ve a https://myaccount.google.com/apppasswords
   - Selecciona "Mail" y "Other (Nomada)"
   - Copia la contraseña de 16 caracteres

### Opción B: Email con dominio propio (Zoho)

1. Ve a https://www.zoho.com/mail/zohomail-pricing.html
2. Plan gratuito: 5 usuarios, dominio propio
3. Configura: `ofertas@nomada.travel` o similar

## Paso 2: Suscribirse a Newsletters

Suscribe el correo a estas fuentes de ofertas:

### Aerolíneas Mexicanas
- [ ] Volaris: https://www.volaris.com/newsletter
- [ ] VivaAerobus: https://www.vivaaerobus.com/mx/ofertas
- [ ] Aeromexico: https://aeromexico.com/es-mx/promociones

### Aerolíneas Internacionales
- [ ] Spirit: https://www.spirit.com/deals
- [ ] JetBlue: https://www.jetblue.com/deals
- [ ] Southwest: https://www.southwest.com/html/air/special-offers.html

### Agregadores de Ofertas (Los mejores)
- [ ] Scott's Cheap Flights: https://scottscheapflights.com (tiene versión gratis)
- [ ] Secret Flying: https://www.secretflying.com/alerts/
- [ ] The Flight Deal: https://www.theflightdeal.com/
- [ ] Fly4Free: https://www.fly4free.com/

### Agencias de Viajes
- [ ] Despegar: https://www.despegar.com.mx/
- [ ] Best Day: https://www.bestday.com.mx/
- [ ] Kayak: https://www.kayak.com.mx/alerts

### Hoteles
- [ ] Booking.com: Activa alertas de ofertas
- [ ] Hotels.com: Newsletter de ofertas

### Cruceros
- [ ] Royal Caribbean: https://www.royalcaribbean.com/cruise-deals
- [ ] Carnival: https://www.carnival.com/deals

## Paso 3: Configurar Supabase

1. Crea un proyecto en https://supabase.com
2. Ve a SQL Editor
3. Ejecuta el script: `api/newsletter/supabase-schema.sql`
4. Copia las credenciales de Settings > API:
   - Project URL
   - Service Role Key (¡no la anon key!)

## Paso 4: Variables de Entorno

Agrega estas variables en Vercel (Settings > Environment Variables):

```env
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Email Newsletter
NEWSLETTER_EMAIL=ofertas.nomada@gmail.com
NEWSLETTER_PASSWORD=xxxx xxxx xxxx xxxx  # App Password de 16 chars
NEWSLETTER_IMAP_HOST=imap.gmail.com
NEWSLETTER_IMAP_PORT=993

# Seguridad del Cron
CRON_SECRET=genera_un_string_aleatorio_largo_aqui
```

## Paso 5: Deploy

```bash
cd frontend
npm install
vercel --prod
```

El cron job se activará automáticamente cada 15 minutos.

## Verificar que Funciona

### 1. Probar manualmente el procesamiento

```bash
curl -X POST https://tu-app.vercel.app/api/newsletter \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

### 2. Ver deals en la base de datos

Ve a Supabase > Table Editor > newsletter_deals

### 3. Ver en la app

La página de Ofertas ahora mostrará deals reales cuando los haya.

## Troubleshooting

### "No new newsletters to process"
- Normal si no hay emails nuevos sin leer
- Espera a que lleguen newsletters o envía un email de prueba

### "IMAP connection failed"
- Verifica las credenciales del email
- Asegúrate de usar App Password, no la contraseña normal
- Verifica que IMAP esté habilitado en Gmail

### "Supabase credentials not configured"
- Verifica SUPABASE_URL y SUPABASE_SERVICE_KEY en Vercel
- Usa el Service Role Key, no el anon key

### Deals no aparecen en el frontend
- Verifica que haya deals en Supabase con `is_active = true`
- Revisa la consola del navegador por errores
- El endpoint GET /api/newsletter debe retornar deals

## Newsletters que Funcionan Mejor

Por experiencia, estos newsletters tienen el formato más fácil de parsear:

1. **Scott's Cheap Flights** - Excelente estructura, precios claros
2. **Secret Flying** - Buenos deals internacionales
3. **Volaris** - Promociones frecuentes con precios USD
4. **Kayak Alerts** - Alertas personalizadas por ruta

## Mejorar el Parser

Si encuentras newsletters que no se parsean bien:

1. Revisa el email en `processed_emails`
2. Guarda el HTML del email problemático
3. Ajusta los patrones en `parser.js`:
   - `extractRoute()` - para detectar origen/destino
   - `extractDealFromText()` - para extraer precios
   - Agrega el dominio a `NEWSLETTER_SENDERS` en `imap.js`

## Costos

| Servicio | Costo | Notas |
|----------|-------|-------|
| Gmail | Gratis | Límite de conexiones IMAP |
| Supabase | Gratis | Hasta 500MB, suficiente |
| Vercel Cron | Gratis | Plan Hobby: 1 ejecución/día. Pro: ilimitado |

**Nota sobre Vercel Cron:** El plan gratuito solo permite 1 ejecución diaria. Para cada 15 minutos necesitas el plan Pro ($20/mes) o usar un servicio externo como cron-job.org para hacer el POST.

## Alternativa: Cron Externo Gratis

Si no quieres Vercel Pro, usa https://cron-job.org:

1. Crea cuenta gratis
2. Nuevo cron job:
   - URL: `https://tu-app.vercel.app/api/newsletter`
   - Method: POST
   - Header: `Authorization: Bearer TU_CRON_SECRET`
   - Schedule: Every 15 minutes
