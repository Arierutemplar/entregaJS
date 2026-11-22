# Plataforma de Eventos e Inscripciones

Base arquitectónica de una API REST para una **Plataforma de Eventos e Inscripciones**. Esta pre-entrega deja armado el servidor Express, las variables de entorno y la separación por capas, con estructura inicial para los recursos `events` y `sessions`.

## Temática

Gestión de eventos e inscripciones. En esta etapa se entrega la base: servidor, carpetas por capas, modelos mínimos y endpoints iniciales.

## Tecnologías

- Node.js
- Express
- MongoDB / Mongoose
- dotenv
- Helmet
- ECMAScript Modules (ESM)

## Instalación

```bash
git clone https://github.com/Arierutemplar/entregaJS.git
cd entregaJS
npm install
```

## Configuración de variables de entorno

```bash
cp .env.example .env
```

Completar `.env` con:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<base_de_datos>?retryWrites=true&w=majority
JWT_SECRET=cambia-esta-clave-larga-y-aleatoria
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto HTTP del servidor |
| `NODE_ENV` | Entorno de ejecución |
| `MONGO_URL` | Cadena de conexión a MongoDB Atlas |
| `JWT_SECRET` | Clave para firmar JWT en entregas posteriores |

No subir el archivo `.env` al repositorio.

## Cómo ejecutar

```bash
npm run dev
npm start
```

Por defecto: `http://localhost:8080`

## Estructura de carpetas

```text
proyecto-eventos/
├── src/
│   ├── app.js                 # configura Express (no levanta el server)
│   ├── server.js              # levanta el servidor
│   ├── config/
│   ├── routes/
│   │   ├── events.router.js
│   │   └── sessions.router.js
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── dao/
│   ├── models/
│   │   ├── User.js
│   │   └── Event.js
│   ├── middlewares/
│   └── utils/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Flujo de capas:

`routes → controllers → services → repositories → DAO → models`

## Rutas disponibles

### Health

```http
GET /api/health
```

```json
{ "status": "ok", "message": "Servidor activo" }
```

### Events

```http
GET /api/events
```

```json
{ "status": "success", "payload": [] }
```

### Sessions (estructura inicial, sin lógica de auth)

```http
POST /api/sessions/register
POST /api/sessions/login
GET  /api/sessions/current
```

La autenticación real (JWT, cookies, Passport, roles) se implementará en entregas siguientes.
