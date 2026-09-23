# Habituo

**Finanzas, hábitos y diario personal en una sola app, con un coach de IA que usa tus datos para darte consejos concretos.**

SaaS full-stack con suscripción mensual vía MercadoPago, pensado para usuarios de Argentina y LATAM.

<!-- Reemplazá con tus capturas: docs/screenshots/*.png -->
<!-- ![Dashboard](docs/screenshots/dashboard.png) -->

🔗 **Demo:** _próximamente_ · 👤 **Autor:** [Agustín Dardanelli](https://github.com/Agustindardanelli-stack)

---

## Funcionalidades

| Módulo | Qué hace |
|---|---|
| 💰 **Finanzas** | Registro de gastos e ingresos, categorización automática por palabras clave (ej. "farmacity" → Salud), resumen mensual y gastos por categoría. |
| 🎯 **Hábitos** | Hábitos con ícono, color y frecuencia; check diario, rachas e historial de los últimos 7 días. |
| 📓 **Diario** | Entradas con estado de ánimo, energía y tags; prompts de reflexión, favoritos, búsqueda, vista por calendario y racha de escritura. |
| 🤖 **Coach IA** | Chat con Google Gemini que recibe un resumen de tus finanzas, hábitos y diario para responder con contexto real. Fallback entre modelos si uno está saturado. |
| ⭐ **Premium** | Suscripción mensual con MercadoPago (Preapproval). El plan se activa desde el webhook, nunca desde el cliente. |
| ⚙️ **Cuenta** | Perfil con avatar (Supabase Storage), zona horaria, moneda y eliminación de cuenta (cancela la suscripción activa). |

## Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, lucide-react
- **Backend:** Route Handlers de Next.js, Supabase (Postgres + Auth + Storage + RLS)
- **IA:** Google Gemini (`@google/genai`)
- **Pagos:** MercadoPago Suscripciones + webhooks con firma HMAC
- **Deploy:** Vercel

## Arquitectura

```
Navegador (React)
   │  supabase-js + RLS ──────────────► Postgres (Supabase)
   │                                      ├─ RLS: cada usuario ve solo sus filas
   │                                      ├─ Triggers: límites del plan Free
   │                                      └─ Trigger: el plan solo lo cambia el backend
   │
   └─► /api/chat ──► consume_ai_message() (cuota diaria) ──► Gemini
   └─► /api/mercadopago/checkout ──► MercadoPago (crea la suscripción)

MercadoPago ──► /api/mercadopago/webhook
                  ├─ valida firma x-signature (HMAC-SHA256)
                  ├─ consulta el estado real a la API de MP
                  └─ actualiza el plan con service_role
```

### Decisiones de seguridad

- **Row Level Security** en todas las tablas: cada usuario solo lee y escribe sus datos.
- **El plan no se puede tocar desde el cliente.** Un trigger bloquea cambios a `plan` y `mp_subscription_id` si el request viene de un usuario; solo el webhook (service role) puede actualizarlos.
- **Límites del plan Free en la base de datos**, no solo en la UI: 3 hábitos activos, 20 movimientos y 10 entradas de diario por mes. Se cuentan por `created_at` para que no se puedan esquivar cargando fechas viejas.
- **Cuota diaria del coach IA** (10 mensajes en Free, 100 en Premium) con una función `SECURITY DEFINER` atómica, para controlar costos de la API.
- **Webhook verificado:** firma HMAC de MercadoPago + consulta del estado real a la API (nunca se confía en el body).
- Middleware con `getUser()` (valida el JWT) y redirects internos protegidos contra open redirect.

## Estructura

```
app/
  api/chat/                 Coach IA (Gemini + contexto del usuario)
  api/mercadopago/          checkout y webhook de suscripciones
  api/user/delete/          borrado de cuenta
  auth/                     login, registro y callback OAuth
  dashboard/                finanzas, hábitos, diario, configuración
components/                 ChatAI, UpgradeModal
hooks/                      useHabits, useJournal, useTransactions, useProfile...
lib/
  data/                     acceso a datos por módulo (supabase-js)
  plans.ts                  límites y precios de los planes
  supabase.ts               cliente del navegador
  supabase-server.ts        cliente con sesión (server) y cliente admin
supabase/
  schema.sql                esquema base
  migrations/               migraciones incrementales
```

## Correrlo en local

```bash
git clone https://github.com/Agustindardanelli-stack/habituo.git
cd habituo
npm install
cp .env.example .env.local   # completar las variables
npm run dev
```

### Base de datos

1. Crear un proyecto en [Supabase](https://supabase.com).
2. En **SQL Editor**, correr `supabase/schema.sql`.
3. Correr `supabase/migrations/001_security_and_limits.sql`.
4. En **Storage**, crear el bucket `avatars` (público) para las fotos de perfil.

### MercadoPago

1. Crear una aplicación en el [panel de developers](https://www.mercadopago.com.ar/developers/panel) y usar las credenciales de prueba.
2. Configurar el webhook apuntando a `https://TU_DOMINIO/api/mercadopago/webhook` con el evento **Planes y suscripciones**.
3. Copiar la **clave secreta** del webhook en `MP_WEBHOOK_SECRET`.
4. Para probar en local, exponé el puerto 3000 con un túnel (ngrok / localtunnel) y usá esa URL.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Chequeo de tipos con TypeScript |

## Roadmap

- [ ] App mobile (React Native / Expo)
- [ ] Recordatorios de hábitos por notificación
- [ ] Exportar datos a CSV
- [ ] Presupuestos mensuales por categoría

---

Hecho por **Agustín Dardanelli** desde Río Cuarto, Córdoba 🇦🇷
