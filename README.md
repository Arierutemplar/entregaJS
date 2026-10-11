# Sistema de Turnos y Reservas - API REST (Arquitectura en Capas, DAO y Repository)

Proyecto backend desarrollado en **Node.js** utilizando módulos de ECMAScript (**ESM**), Express, persistencia en archivos JSON (`FileSystem`) y una arquitectura profesional organizada en capas.

## **Explicación de la Arquitectura en Capas**

El proyecto está diseñado bajo una estricta separación de responsabilidades para garantizar mantenibilidad y escalabilidad:

- **Router**: Define los endpoints de la API y los conecta directamente con los controladores.
- **Controller**: Recibe los objetos `req` y `res`, invoca a los servicios correspondientes y gestiona las respuestas HTTP.
- **Service**: Contiene la lógica de negocio pura y validaciones de datos (como el manejo de cantidades y existencias en reservas). No maneja peticiones ni respuestas HTTP.
- **Repository**: Capa intermedia que estandariza y expone métodos de acceso a datos hacia los servicios.
- **DAO (Data Access Object)**: Capa encargada exclusivamente de la lectura y escritura directa sobre los archivos JSON (`FileSystem`).

## **Estruc...** [Estructura del Proyecto]

```text
src/
  config/env.config.js
  controllers/
    services.controller.js
    bookings.controller.js
  services/
    services.service.js
    bookings.service.js
  repositories/
    services.repository.js
    bookings.repository.js
  dao/
    services.dao.js
    bookings.dao.js
  routes/
    services.router.js
    bookings.router.js
  data/
    services.json
    bookings.json
  app.js
server.js
package.json
.env.example
.gitignore
README.md
```

## **Configuración del Entorno**

1. Copia el archivo `.env.example` y renómbralo a `.env` en la raíz del proyecto.
2. Configura las variables requeridas:

```env
PORT=8080
NODE_ENV=development
```

## **Requisitos Previos**

- Node.js instalado en tu equipo (versión recomendada 18+).

## **Cómo Instalar**

1. Clona el repositorio.
2. Instala las dependencias necesarias ejecutando:

```bash
npm install
```

## **Cómo Ejecutar**

- **Modo Desarrollo (con auto-recarga):**
  ```bash
  npm run dev
  ```
- **Modo Producción:**
  ```bash
  npm start
  ```

## **Endpoints de la API**

### 1. Servicios (`/api/services`)

- `GET /`: Devuelve todos los servicios (soporta query params como `?category=...` o `?available=true`).
- `GET /:sid`: Devuelve un servicio específico por su ID.
- `POST /`: Crea un nuevo servicio validando sus tipos de datos.
- `PUT /:sid`: Actualiza un servicio existente protegiendo su ID.
- `DELETE /:sid`: Elimina un servicio por su ID.

### 2. Reservas (`/api/bookings`)

- `POST /`: Crea una nueva reserva validando que los servicios asignados existan.
- `GET /:bid`: Devuelve una reserva específica por su ID.
- `POST /:bid/services/:sid`: Agrega o incrementa la cantidad (`quantity`) de un servicio a una reserva existente.
