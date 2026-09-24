# **Sistema de Turnos y Reservas \- Base Inicial (Backend con ESM)**

Proyecto backend desarrollado en **Node.js** utilizando módulos de ECMAScript (**ESM**) y una arquitectura modular para la gestión de servicios en un sistema de turnos y reservas.

## **Estructura del Proyecto**

src/  
 config/env.config.js  
 managers/ServiceManager.js  
 data/services.json  
 app.js  
package.json  
.env.example  
.gitignore  
README.md

## **Descripción del Recurso (services)**

Cada objeto de servicio almacenado en el sistema cuenta con la siguiente estructura:

{  
 "id": "1",  
 "name": "Corte de Cabello Clásico",  
 "description": "Corte de cabello para caballero con estilo tradicional.",  
 "duration": 30,  
 "price": 250,  
 "category": "Barbería",  
 "available": true  
}

## **Requisitos Previos**

- Node.js instalado en tu equipo.

## **Cómo Instalar**

1. Clona el repositorio.
2. Instala las dependencias necesarias ejecutando:  
   npm install

## **Configuración del Entorno**

Crea un archivo .env en la raíz del proyecto basándote en el archivo de ejemplo .env.example:

PORT=8080  
NODE_ENV=development

_(Nota: El archivo .env y la carpeta node_modules están excluidos del control de versiones por seguridad)._

## **Cómo Ejecutar**

Inicia la aplicación de prueba con el siguiente comando:

npm start

## **Ejemplos de Uso del ServiceManager**

import ServiceManager from './managers/ServiceManager.js';

const manager \= new ServiceManager();

// 1\. Obtener todos los servicios  
const services \= await manager.getServices();

// 2\. Agregar un nuevo servicio (el ID se genera automáticamente)  
const newService \= await manager.addService({  
 name: 'Masaje relajante',  
 description: 'Sesión antiestrés de 45 minutos',  
 duration: 45,  
 price: 600,  
 category: 'Spa',  
 available: true  
});

// 3\. Buscar servicio por ID  
const service \= await manager.getServiceById(newService.id);

// 4\. Actualizar un servicio (no permite modificar el ID)  
const updated \= await manager.updateService(newService.id, { price: 650 });

// 5\. Eliminar un servicio  
const deleted \= await manager.deleteService(newService.id);
