# Eventos API

API REST para la **Plataforma de Eventos e Inscripciones**.

Proyecto de **Programación Backend II: Diseño y Arquitectura Backend** (Coderhouse) — **Pre-entrega 1: Refactor arquitectónico inicial**.

---

## Temática

Plataforma donde organizadores publican eventos (charlas, talleres, meetups) y usuarios se inscriben. En entregas posteriores se sumarán roles, autenticación (JWT/cookies/Passport), CRUD completo de eventos, tickets/inscripciones y notificaciones.

---

## Tecnologías

- **Node.js** con ES Modules (`"type": "module"`)
- **Express** 5
- **MongoDB** + **Mongoose**
- **bcrypt** (hash de contraseñas en el flujo de sesiones base)
- **dotenv** (variables de entorno)

---

## Instalación

```bash
npm install
```

---

## Variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env
# Windows (CMD): copy .env.example .env
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto HTTP (default `3000`) |
| `NODE_ENV` | Entorno (`development`, `production`, …) |
| `MONGO_URL` | Connection string de MongoDB (opcional en esta pre-entrega; vacío = no conecta) |
| `JWT_SECRET` | Reserva para JWT (se usará en entregas siguientes) |

---

## Cómo ejecutar

```bash
npm run dev    # desarrollo con recarga (--watch)
npm start      # producción / arranque normal
```

El servidor escucha en `http://localhost:3000` (o el `PORT` definido en `.env`).

Si `MONGO_URL` está vacío o MongoDB no está disponible, el servidor **igual arranca** para poder probar health y stubs.

---

## Estructura de carpetas

```
eventos-api/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── app.js                 # Express: middlewares y montaje de routers
    ├── server.js              # Entrada: dotenv/config, DB y listen
    ├── config/
    │   ├── config.js
    │   └── database.js
    ├── routes/
    │   ├── health.router.js
    │   ├── events.router.js
    │   └── sessions.router.js
    ├── controllers/
    │   ├── health.controller.js
    │   ├── events.controller.js
    │   └── sessions.controller.js
    ├── services/
    │   ├── events.service.js
    │   └── sessions.service.js
    ├── repositories/
    │   ├── event.repository.js
    │   └── session.repository.js
    ├── dao/
    │   ├── event.dao.js
    │   └── session.dao.js
    ├── models/
    │   ├── User.js
    │   └── Event.js
    ├── middlewares/
    │   └── error.middlewares.js
    └── utils/
        └── password.js
```

Separación intencional: `app.js` solo configura Express; `server.js` conecta MongoDB y hace `listen`.

Flujo por capas (sesiones / futuro eventos):

```
Cliente → Route → Controller → Service → Repository → DAO → Model → MongoDB
```

---

## Rutas disponibles (Pre-entrega 1)

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| `GET` | `/api/health` | Healthcheck | `{ "status": "ok", "message": "Servidor activo" }` |
| `GET` | `/api/events` | Listado de eventos (stub) | `{ "status": "success", "payload": [] }` |
| `POST` | `/api/sessions/register` | Alta de usuario (base) | `201` + usuario sin password |
| `POST` | `/api/sessions/login` | Login base (sin JWT aún) | `200` + usuario sin password |

`/api/sessions` queda montado y preparado para JWT/cookies/Passport en las próximas entregas.

---

## Verificación rápida

```bash
npm run dev
curl http://localhost:3000/api/health
curl http://localhost:3000/api/events
```

---

## Próximas entregas (fuera de alcance de esta pre-entrega)

- JWT, cookies y Passport
- Roles (`user` / `organizer` / `admin`) y middlewares de autorización
- CRUD completo de eventos e inscripciones/tickets
- Notificaciones (Nodemailer)
- Tests
