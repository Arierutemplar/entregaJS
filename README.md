# Sistema de Turnos y Reservas - API REST (Backend con ESM)

Proyecto backend desarrollado en **Node.js** utilizando módulos de ECMAScript (**ESM**), Express y una arquitectura modular para la gestión de servicios mediante una API REST.

## **Estructura del Proyecto**

src/  
 config/env.config.js  
 managers/ServiceManager.js  
 routes/services.router.js  
 data/services.json  
 app.js  
server.js  
package.json  
.env.example  
.gitignore  
README.md

## **Descripción del Recurso (services)**

Cada objeto de servicio almacenado en el sistema cuenta con la siguiente estructura:

{  
 "id": 1,  
 "name": "Corte de Cabello Clásico",  
 "description": "Corte de cabello para caballero con estilo tradicional.",  
 "duration": 30,  
 "price": 250,  
 "category": "Barbería",  
 "available": true  
}

## **Endpoints de la API REST**

La API expone los siguientes endpoints bajo la ruta base `/api/services`:

- **`GET /api/services`**: Devuelve todos los servicios. Acepta filtros opcionales por query params (ej. `?category=Barbería` o `?available=true`).
- **`GET /api/services/:sid`**: Devuelve un servicio específico según su ID (`200` si existe, `404` si no se encuentra).
- **`POST /api/services`**: Crea un nuevo servicio a partir del JSON enviado en el `body`. El ID se genera automáticamente. Devuelve `201` si se crea con éxito o `400` si faltan campos obligatorios.
- **`PUT /api/services/:sid`**: Actualiza un servicio existente por su ID (no permite modificar el ID). Devuelve `200` si se actualiza o `404` si no existe.
- **`DELETE /api/services/:sid`**: Elimina un servicio por su ID. Devuelve `200` si se elimina o `404` si no existe.

## **Requisitos Previos**

- Node.js instalado en tu equipo.

## **Cómo Instalar**

1. Clona el repositorio.
2. Instala las dependencias necesarias ejecutando:
   ```bash
   npm install
   ```
