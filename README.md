# Sistema de Turnos y Reservas - API REST (Arquitectura por Capas)

Proyecto backend desarrollado en **Node.js** utilizando módulos de ECMAScript (**ESM**), Express, persistencia en archivos JSON (`FileSystem`) y una arquitectura organizada en capas (**Routers -> Controllers -> Managers**).

## **Estructura del Proyecto**

src/  
 config/env.config.js  
 controllers/  
 services.controller.js  
 bookings.controller.js  
 managers/  
 ServiceManager.js  
 BookingManager.js  
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

## **Configuración del Entorno**

1. Copia el archivo `.env.example` y renómbralo a `.env` en la raíz del proyecto.
2. Configura las variables requeridas:

```env
PORT=8080
NODE_ENV=development
Requisitos Previos
Node.js instalado en tu equipo.

Cómo Instalar
Clona el repositorio.

Instala las dependencias necesarias ejecutando:

Bash
npm install
Cómo Ejecutar
Modo Desarrollo (con auto-recarga):

Bash
npm run dev
Modo Producción:

Bash
npm start
```
