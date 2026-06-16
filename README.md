# cofinder-web

Frontend de **CoFinder** — la plataforma tipo Tinder para encontrar cofounders en la comunidad PUCP. Construido con Next.js 15 App Router.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS v4 |
| Componentes | shadcn/ui (Radix + Nova preset) |
| Animaciones | Framer Motion |
| Estado servidor | TanStack Query v5 |
| Estado cliente | Zustand v5 (con `persist`) |
| HTTP | Axios |
| Package manager | pnpm 9 |

---

## Requisitos

- Node.js 20+
- pnpm 9+
- Backend `cofinder-api` corriendo en `http://localhost:3000`

---

## Instalación

```bash
pnpm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Desarrollo

```bash
pnpm dev
```

La app corre en `http://localhost:3001` (el puerto 3000 lo ocupa el backend en Docker).

---

## Estructura

```
src/
├── app/
│   ├── layout.tsx                  # Layout raíz con QueryProvider
│   ├── page.tsx                    # Home — redirige a /profile si hay sesión
│   └── auth/
│       ├── callback/page.tsx       # Recibe token OAuth, hidrata el store
│       └── onboarding/page.tsx     # Completar perfil tras primer login
│   └── profile/
│       ├── page.tsx                # Ver perfil propio
│       └── edit/page.tsx           # Editar perfil
├── components/
│   ├── auth/
│   │   └── login-button.tsx        # Botón "Continuar con Google"
│   ├── layout/
│   │   └── query-provider.tsx      # TanStack Query client provider
│   ├── onboarding/
│   │   └── onboarding-form.tsx     # Formulario de primer perfil
│   ├── profile/
│   │   ├── profile-view.tsx        # Vista de perfil
│   │   └── profile-edit-form.tsx   # Formulario de edición
│   └── ui/                         # Componentes shadcn/ui
├── hooks/
│   └── use-me.ts                   # Query del usuario autenticado (/users/me)
├── lib/
│   └── api.ts                      # Instancia de axios con interceptor de JWT
└── store/
    └── auth.store.ts               # Zustand store con persist (token + user)
```

---

## Flujo de autenticación

```
/ (home)
  └─ clic "Continuar con Google"
       └─ GET http://localhost:3000/auth/google
            └─ redirect → Google OAuth consent
                 └─ GET http://localhost:3000/auth/google/callback?code=...
                      └─ backend intercambia código, firma JWT
                           └─ redirect → /auth/callback?token=...
                                └─ guarda token en Zustand (persist → localStorage)
                                     ├─ si primer login → /auth/onboarding
                                     └─ si ya tiene perfil → /profile
```

El token se persiste en `localStorage` bajo la key `auth-storage` (Zustand persist). Al refrescar, el store se rehidrata automáticamente y el home redirige a `/profile` si hay sesión activa.

---

## User Stories implementadas

| US | Descripción | Ruta |
|----|-------------|------|
| US-01 | Pantalla de login con Google | `/` |
| US-02 | Callback OAuth, guarda token | `/auth/callback` |
| US-03 | Onboarding (primer perfil) | `/auth/onboarding` |
| US-04 | Ver perfil propio | `/profile` |
| US-05 | Editar perfil | `/profile/edit` |

---

## Comandos útiles

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm lint         # Lint con ESLint
```

### Agregar componentes shadcn

```bash
pnpm dlx shadcn@latest add <componente>
```

---

## Convenciones

- Todos los componentes con estado o hooks van con `'use client'` al inicio.
- El token **nunca** se lee de `localStorage` directamente en la app — siempre via `useAuthStore.getState().token`.
- Las llamadas al API van a través de `@/lib/api` (axios con interceptor de JWT automático), nunca con `fetch` directamente.
- Los componentes de página (`app/**/page.tsx`) son Server Components por defecto; solo agregar `'use client'` si el componente necesita estado o efectos.

---

## Deploy

El proyecto está configurado para desplegarse en **Vercel**. Solo conecta el repo y agrega la variable de entorno `NEXT_PUBLIC_API_URL` apuntando al backend en producción (Railway).
