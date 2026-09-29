# Sistema de Turnos y Reservas - API REST con FileSystem (Backend con ESM)

Proyecto backend desarrollado en **Node.js** utilizando módulos de ECMAScript (**ESM**), Express, y persistencia en archivos JSON (`FileSystem`) para la gestión modular de servicios y reservas.

## **Estructura del Proyecto**

src/  
 config/env.config.js  
 managers/ServiceManager.js  
 managers/BookingManager.js  
 routes/services.router.js  
 routes/bookings.router.js  
 data/services.json  
 data/bookings.json  
 app.js  
server.js  
package.json  
.env.example  
.gitignore  
README.md

## **Recursos de la API**

### 1. Servicios (`services`)

Cada servicio registrado cuenta con la siguiente estructura:

- `id`: Identificador único (generado automáticamente).
- `name`: Nombre del servicio.
- `description`: Descripción detallada.
- `duration`: Duración en minutos.
- `price`: Costo del servicio.
- `category`: Categoría asignada.
- `available`: Disponibilidad (booleano).

**Endpoints de Servicios (`/api/services`):**

- **`GET /`**: Devuelve todos los servicios. Acepta filtros por query params (ej. `?category=barberia`, `?available=true`).
- **`GET /:sid`**: Devuelve un servicio específico por su ID (`200` si existe, `404` si no).
- **`POST /`**: Crea un nuevo servicio (el ID se genera automáticamente, valida campos obligatorios). Devuelve `201` o `400`.
- **`PUT /:sid`**: Actualiza un servicio existente sin modificar su ID. Devuelve `200` o `404`.
- **`DELETE /:sid`**: Elimina un servicio por su ID. Devuelve `200` o `404`.

---

### 2. Reservas (`bookings`)

Cada reserva registrada cuenta con la siguiente estructura:

- `id`: Identificador único (generado automáticamente).
- `clientName`: Nombre del cliente.
- `clientEmail`: Correo electrónico del cliente.
- `date`: Fecha de la reserva.
- `time`: Hora de la reserva.
- `status`: Estado de la reserva (ej. pendiente, confirmada).
- `services`: Arreglo de servicios asociados en el formato `{ service: idDelServicio, quantity: 1 }` (si se vuelve a agregar el mismo servicio, se incrementa su `quantity`).

**Endpoints de Reservas (`/api/bookings`):**

- **`POST /`**: Crea una nueva reserva (puede iniciarse con un arreglo de servicios vacío). Devuelve `201` o `400`.
- **`GET /:bid`**: Devuelve una reserva específica por su ID (`200` si existe, `404` si no).
- **`POST /:bid/services/:sid`**: Agrega un servicio a una reserva existente, validando que tanto la reserva como el servicio existan.

---

## **Requisitos Previos**

- Node.js instalado en tu equipo.

## **Cómo Instalar**

1. Clona el repositorio.
2. Instala las dependencias necesarias ejecutando:
   ```bash
   npm install
   ```
