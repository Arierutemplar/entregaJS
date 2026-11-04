# Backend del Sistema de Turnos y Reservas

Backend para administrar un catálogo de servicios y las reservas de sus
clientes. Expone una API REST y vistas Handlebars con actualizaciones en tiempo
real mediante Socket.io. Está desarrollado con Node.js y Express, utiliza
MongoDB Atlas como base de datos en la nube y Mongoose como ODM.

La aplicación aplica una arquitectura por capas con separación de
responsabilidades:

`routes → controllers → services → repositories → DAO → models/MongoDB`

Esta organización permite mantener desacoplada la capa HTTP de la lógica de
negocio y de la persistencia, facilitando el mantenimiento, las pruebas y una
futura evolución del proyecto.

## Características principales

- API RESTful para la gestión de servicios.
- Creación y consulta de reservas.
- Asociación de servicios a reservas.
- Incremento automático de la cantidad cuando se agrega nuevamente un servicio
  a una reserva.
- Persistencia en MongoDB Atlas mediante Mongoose.
- Modelos Mongoose para servicios, reservas y mensajes.
- Referencias entre reservas y servicios mediante `ObjectId`.
- Uso de `populate('services.service')` para devolver la información relacionada
  de los servicios incluidos en una reserva.
- Validación de campos obligatorios y tipos de datos.
- Validación de estados de reserva:
  `pendiente`, `confirmada`, `cancelada` y `completada`.
- Filtros de servicios por categoría y disponibilidad.
- Manejo centralizado de errores HTTP.
- Configuración mediante variables de entorno usando `dotenv`.
- Soporte para desarrollo con reinicio automático mediante `node --watch`.
- Separación entre controladores, servicios, repositorios y objetos de acceso a
  datos.

## Tecnologías utilizadas

- Node.js
- Express
- Mongoose
- MongoDB Atlas
- Socket.io
- Handlebars (express-handlebars)
- Zod
- dotenv
- ECMAScript Modules (ESM)

## Requisitos previos

Antes de ejecutar el proyecto se necesita:

- Node.js v18 o superior.
- NPM, incluido normalmente con Node.js.
- Una cuenta de MongoDB Atlas.
- Un cluster de MongoDB Atlas activo.
- Un usuario de base de datos con permisos de lectura y escritura.
- Acceso a internet para conectarse al cluster.
- La dirección IP del equipo autorizada en **Network Access** de MongoDB Atlas.

## Instalación

### 1. Clonar o descargar el repositorio

Con Git:

```bash
git clone <URL_DEL_REPOSITORIO>
cd backend1
```

También es posible descargar el repositorio como archivo ZIP, extraerlo y
abrir una terminal en la carpeta raíz del proyecto.

### 2. Instalar dependencias

```bash
npm install
```

Este comando instala Express, Mongoose, dotenv y las demás dependencias
definidas en `package.json`.

## Configuración de variables de entorno

Crear un archivo llamado `.env` en la raíz del proyecto. No se debe subir este
archivo al repositorio, ya que puede contener credenciales privadas.

Ejemplo:

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<base_de_datos>?retryWrites=true&w=majority
DNS_SERVERS=1.1.1.1,8.8.8.8
```

### Descripción de las variables

| Variable | Descripción |
|---|---|
| `PORT` | Puerto HTTP en el que se inicia el servidor. |
| `NODE_ENV` | Entorno de ejecución, por ejemplo `development` o `production`. |
| `MONGO_URI` | Cadena de conexión al cluster de MongoDB Atlas. |
| `DNS_SERVERS` | Servidores DNS utilizados por Node.js para resolver el registro SRV de MongoDB Atlas. |

`DNS_SERVERS` es especialmente útil en redes donde el resolvedor DNS local
rechaza consultas SRV. Si la red utiliza servidores DNS corporativos, se deben
reemplazar esos valores por los servidores autorizados en dicha red.

Si la contraseña de MongoDB contiene caracteres especiales, debe codificarse
para utilizarla dentro de una URI. Por ejemplo:

```text
@ → %40
: → %3A
/ → %2F
? → %3F
# → %23
% → %25
```

El archivo `.env.example` contiene una plantilla sin credenciales reales.

## Ejecución

### Modo desarrollo

Inicia el servidor con reinicio automático cuando se detectan cambios:

```bash
npm run dev
```

### Modo normal o producción

```bash
npm start
```

El proceso carga la configuración, establece la conexión con MongoDB Atlas y
recién después inicia el servidor HTTP. Por defecto, la API queda disponible
en:

```text
http://localhost:8080
```

El puerto puede cambiarse mediante la variable `PORT`.

## Arquitectura del proyecto

La aplicación se divide en las siguientes responsabilidades:

- **Routes:** definen los endpoints y los parámetros de las solicitudes.
- **Controllers:** reciben `req` y `res`, invocan la lógica de negocio y
  construyen las respuestas HTTP.
- **Services:** contienen las validaciones y reglas de negocio, sin depender
  directamente de Express.
- **Repositories:** exponen operaciones de persistencia a los servicios.
- **DAO:** ejecutan consultas Mongoose sobre los modelos.
- **Models:** definen los esquemas y las relaciones de MongoDB.
- **Middlewares:** validan con Zod los datos de entrada antes de llegar al
  controlador (`src/middlewares/validate.middleware.js`).
- **Validations:** esquemas Zod de servicios y reservas (`src/validations`).
- **Sockets / Utils:** manejadores de eventos Socket.io (`src/sockets`) y el
  módulo `src/utils/socket.js`.
- **Config:** carga las variables de entorno y administra la conexión con la
  base de datos.

Los errores se propagan con `next(error)` hacia el middleware centralizado de
errores definido en `src/app.js`.

Los modelos principales son:

- `Service`: nombre, descripción, duración, precio, categoría y disponibilidad.
- `Booking`: cliente, correo, fecha, hora, estado y servicios asociados.
- `Message`: usuario, contenido del mensaje y fecha de creación.

MongoDB genera automáticamente los identificadores `_id` de tipo `ObjectId`.

## Endpoints de la API

Todas las rutas utilizan el prefijo correspondiente:

- Servicios: `/api/services`
- Reservas: `/api/bookings`

### Servicios

#### Obtener todos los servicios

```http
GET /api/services
```

Parámetros opcionales (validados con Zod):

| Parámetro   | Descripción                                              |
|-------------|----------------------------------------------------------|
| `category`  | Filtra por categoría                                     |
| `available` | `true` o `false`                                         |
| `page`      | Número de página                                         |
| `limit`     | Resultados por página                                    |
| `sortBy`    | Campo de orden (`name`, `price`, `duration`, `createdAt`…) |
| `order`     | `asc` o `desc`                                           |

```http
GET /api/services?category=Peluquería&available=true&page=1&limit=5&sortBy=price&order=desc
```

La respuesta incluye `payload` junto con los datos de paginación (`page`,
`limit`, `hasPrevPage`, `hasNextPage`, `prevLink`, `nextLink`).

#### Obtener un servicio por ID

```http
GET /api/services/:sid
```

Ejemplo:

```http
GET /api/services/66f123456789abcdef012345
```

#### Crear un servicio

```http
POST /api/services
Content-Type: application/json
```

Body:

```json
{
  "name": "Corte de cabello",
  "description": "Corte clásico o moderno",
  "duration": 30,
  "price": 150,
  "category": "Peluquería",
  "available": true
}
```

Reglas principales:

- `name`, `description` y `category` son obligatorios.
- `duration` debe ser un número mayor que cero.
- `price` debe ser un número mayor o igual que cero.
- `available` debe ser booleano.

#### Actualizar un servicio

```http
PUT /api/services/:sid
Content-Type: application/json
```

Ejemplo:

```json
{
  "price": 180,
  "available": false
}
```

El identificador no puede modificarse desde el body de la solicitud.

#### Eliminar un servicio

```http
DELETE /api/services/:sid
```

### Reservas

#### Crear una reserva

```http
POST /api/bookings
Content-Type: application/json
```

Body:

```json
{
  "clientName": "Carlos Mendoza",
  "clientEmail": "carlos@example.com",
  "date": "2026-10-28",
  "time": "15:30",
  "status": "pendiente",
  "services": [
    {
      "service": "66f123456789abcdef012345",
      "quantity": 1
    }
  ]
}
```

Los campos obligatorios son `clientName`, `clientEmail`, `date` y `time`.
Cada servicio incluido debe existir en la colección de servicios. Si la
cantidad no es válida, se utiliza `1`.

El campo `status` acepta únicamente:

- `pendiente`
- `confirmada`
- `cancelada`
- `completada`

Si no se especifica, el estado predeterminado es `pendiente`.

#### Obtener una reserva por ID

```http
GET /api/bookings/:bid
```

El DAO consulta la reserva con `populate('services.service')`, por lo que cada
elemento de `services` devuelve el documento completo del servicio (nombre,
precio, duración, etc.) junto con su `quantity`, en lugar de solo su `ObjectId`.

```json
{
  "status": "success",
  "payload": {
    "_id": "…",
    "clientName": "Ana",
    "status": "pendiente",
    "services": [
      { "service": { "_id": "…", "name": "Corte", "price": 20 }, "quantity": 1 }
    ]
  }
}
```

#### Agregar un servicio a una reserva

```http
POST /api/bookings/:bid/services/:sid
```

Si el servicio ya existe dentro de la reserva, su campo `quantity` aumenta en
uno. Si todavía no existe, se agrega con cantidad `1`.

### Evaluación automática

```http
POST /api/evaluate
```

Devuelve `200` con:

```json
{ "status": "success", "message": "Evaluación recibida correctamente" }
```

## Validaciones

Los datos de entrada (`body` y `query`) se validan con
[Zod](https://zod.dev) mediante el middleware `validate(schema, source)`,
aplicado en las rutas antes de los controladores. Si la validación falla, se
responde `400` con `status: "error"`, un `message` y la lista `errors`.

## Formato de respuestas

Respuesta exitosa:

```json
{
  "status": "success",
  "payload": {}
}
```

Respuesta de error:

```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

Los códigos HTTP utilizados incluyen:

- `200`: operación exitosa.
- `201`: recurso creado correctamente.
- `400`: datos inválidos o campos obligatorios ausentes.
- `404`: recurso o ruta no encontrada.
- `500`: error interno del servidor.

## Persistencia y conexión a MongoDB

La conexión a MongoDB se centraliza en `src/config/database.js`. El servidor
no comienza a aceptar solicitudes hasta que la conexión con MongoDB Atlas se
establece correctamente.

Los DAOs utilizan operaciones nativas de Mongoose, entre ellas:

- `find`
- `findById`
- `create`
- `findByIdAndUpdate`
- `findByIdAndDelete`
- `lean`
- `populate`

Los documentos de reservas mantienen referencias a documentos de servicios
mediante `ObjectId`, evitando duplicar la información completa del servicio
dentro de cada reserva.

## Scripts disponibles

Los scripts definidos en `package.json` son:

```bash
npm run dev   # Ejecuta el servidor en modo desarrollo
npm start     # Ejecuta el servidor normalmente
npm run bundle # Genera el resumen auxiliar del proyecto
```

## Vistas web y comunicación en tiempo real

Además de la API REST, el proyecto ofrece vistas renderizadas del lado del
servidor con Handlebars:

- `GET /views/services`: muestra los servicios reales obtenidos desde MongoDB.
- `GET /views/bookings`: muestra las reservas reales y sus servicios asociados.

Las plantillas se encuentran en `src/views`, el layout común está en
`src/views/layouts/main.handlebars` y los recursos estáticos se sirven desde
`src/public`.

## WebSocket y tiempo real

Socket.io se integra sobre el mismo servidor HTTP de Node.js. La instancia se
gestiona de forma centralizada en `src/utils/socket.js`, que exporta
`setSocketServer(io)` (llamada en `src/app.js`) y `emitToAll(event, data)`.
Los controladores usan `emitToAll` sin depender de `req.app`.

**Servidor → clientes** (cliente en `src/public/js/socket.js`):

- `service:created`: agrega dinámicamente un nuevo servicio al catálogo.
- `booking:updated`: agrega o actualiza una reserva en pantalla.

**Cliente → servidor** (manejador en `src/sockets/bookings.socket.js`):

1. En `/views/bookings`, el botón "Confirmar reserva" emite
   `client:confirm-booking` con `{ bookingId }`.
2. El servidor cambia el estado a `confirmada` mediante
   `BookingsService.confirmBooking`.
3. Reemite `booking:updated` a todos los clientes, que actualizan la tarjeta
   en vivo. Si ocurre un error, responde al emisor con `booking:error`.

Los eventos de servidor también se emiten tras crear un servicio, crear una
reserva o agregar un servicio a una reserva desde la API REST.

## Seguridad y buenas prácticas

- No publicar el archivo `.env`.
- No incluir credenciales de MongoDB en el código fuente.
- Utilizar usuarios de MongoDB con los permisos mínimos necesarios.
- Autorizar únicamente las IP necesarias en MongoDB Atlas.
- Rotar las credenciales si fueron expuestas.
- Utilizar variables de entorno diferentes para desarrollo y producción.
- No utilizar `0.0.0.0/0` en MongoDB Atlas salvo que exista una justificación
  concreta y controlada.

## Estado del proyecto

El proyecto implementa una API funcional de servicios y reservas con una
arquitectura desacoplada y persistencia en MongoDB Atlas. La estructura permite
incorporar posteriormente autenticación, validación avanzada de fechas y
correos, paginación, pruebas automatizadas y nuevos módulos sin mezclar la
lógica HTTP con el acceso a datos.

## Autoría

Proyecto desarrollado como entrega backend para Coderhouse y como pieza de
portafolio profesional.
