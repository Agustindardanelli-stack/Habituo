# 🚀 LifeSync AI

Tu asistente personal inteligente. Finanzas, hábitos, salud y más, todo en un lugar con el poder de la IA.

![LifeSync AI](https://via.placeholder.com/1200x630/0ea5e9/ffffff?text=LifeSync+AI)

## ✨ Características

- 💰 **Finanzas**: Categorización automática de gastos con IA
- 🎯 **Hábitos**: Tracker con rachas y recordatorios
- ❤️ **Salud**: Calendario menstrual y seguimiento de bienestar
- 📝 **Diario**: Journaling con análisis de sentimiento
- 🤖 **Chat IA**: Asistente que analiza tus datos y da insights

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **IA**: OpenAI / Claude API
- **Hosting**: Vercel

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/lifesync-ai.git
cd lifesync-ai
```

### 2. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 3. Configurar Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a **SQL Editor** y ejecutar el contenido de `supabase-schema.sql`
4. Copiar las credenciales de **Settings > API**

### 4. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
OPENAI_API_KEY=sk-...
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🗂️ Estructura del Proyecto

```
lifesync-ai/
├── app/                      # App Router de Next.js
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Layout principal
│   ├── globals.css          # Estilos globales
│   ├── auth/                # Páginas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # Dashboard principal
│   │   ├── layout.tsx       # Layout con sidebar
│   │   ├── page.tsx         # Home del dashboard
│   │   ├── finanzas/        # Módulo de finanzas
│   │   ├── habitos/         # Módulo de hábitos
│   │   ├── salud/           # Módulo de salud
│   │   ├── diario/          # Módulo de diario
│   │   └── chat/            # Chat con IA
│   └── api/                 # API Routes
│       ├── auth/
│       ├── ai/
│       └── ...
├── components/              # Componentes React
│   ├── ui/                  # Componentes base (buttons, inputs, etc)
│   ├── layout/              # Header, Sidebar, etc
│   └── modules/             # Componentes específicos de módulos
├── lib/                     # Utilidades y configuración
│   ├── supabase.ts          # Cliente de Supabase
│   └── utils.ts             # Funciones helper
├── hooks/                   # Custom hooks
├── types/                   # TypeScript types
├── public/                  # Assets estáticos
├── supabase-schema.sql      # Esquema de base de datos
└── package.json
```

## 🚀 Deploy a Producción

### Vercel (Recomendado)

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Agregar variables de entorno
3. Deploy automático ✨

### Variables de entorno en Vercel

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY
```

## 💰 Monetización

El proyecto está preparado para implementar:

- **Freemium**: Funciones básicas gratis, premium de pago
- **Stripe**: Para pagos internacionales
- **MercadoPago**: Para Argentina/LATAM

### Plan Gratuito
- 2 módulos
- 50 transacciones/mes
- Chat IA limitado

### Plan Premium ($5-10/mes)
- Todos los módulos
- Transacciones ilimitadas
- Chat IA ilimitado
- Exportación de datos
- Sin anuncios

## 🔮 Próximos Pasos

- [ ] Implementar autenticación completa
- [ ] Conectar con OpenAI API real
- [ ] Agregar módulo de Salud completo
- [ ] Implementar notificaciones push
- [ ] Agregar gráficos con Recharts
- [ ] Integración con MercadoPago
- [ ] PWA para móviles

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama (`git checkout -b feature/nueva-funcion`)
3. Commit cambios (`git commit -m 'Agregar nueva función'`)
4. Push a la rama (`git push origin feature/nueva-funcion`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE)

## 👨‍💻 Autor

Hecho con ❤️ por **Agustín** en Argentina 🇦🇷

---

⭐ Si te gusta el proyecto, dejá una estrella en GitHub!
