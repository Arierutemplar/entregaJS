// Variables de estado de la aplicación
let menu = [];
let carrito = [];

// Nodos capturados del DOM
const contenedorProductos = document.getElementById('contenedor-productos');
const listaCarrito = document.getElementById('lista-carrito');
const txtUnidades = document.getElementById('total-unidades');
const txtSubtotal = document.getElementById('subtotal');
const contenedorDescuento = document.getElementById('descuento-contenedor');
const txtTotalFinal = document.getElementById('total-final');
const btnFinalizar = document.getElementById('btn-finalizar');

/**
 * 1. JSON ACCEDIENDO CON FETCH
 * Carga los productos desde el archivo local de forma asíncrona.
 */
async function cargarMenu() {
    try {
        const respuesta = await fetch('productos.json');
        if (!respuesta.ok) throw new Error('No se pudo mapear el archivo JSON');
        menu = await respuesta.json();
        renderizarMenu();
    } catch (error) {
        console.error("Error crítico de inicialización:", error);
        Swal.fire({
            icon: 'error',
            title: 'Fallo de conexión',
            text: 'Hubo un problema al obtener el catálogo de productos.'
        });
    }
}

/**
 * 2. CREACIÓN DE ELEMENTOS DINÁMICOS EN EL DOM
 * Dibuja las tarjetas de productos en la interfaz.
 */
function renderizarMenu() {
    contenedorProductos.innerHTML = ''; // Limpieza previa
    
    menu.forEach(item => {
        // Creación del nodo contenedor
        const card = document.createElement('div');
        card.className = 'producto-card';
        
        // Inyección de estructura semántica interna
        card.innerHTML = `
            <h3>${item.nombre}</h3>
            <p>$${item.precio}</p>
            <button class="btn-agregar" data-id="${item.id}">Agregar</button>
        `;
        contenedorProductos.appendChild(card);
    });
}

/**
 * LÓGICA INTERNA DEL CIRCUITO (Control del carrito)
 */
function agregarAlCarrito(id) {
    const producto = menu.find(p => p.id === id);
    if (!producto) return;

    const itemEnCarrito = carrito.find(p => p.id === id);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    // Alerta de promoción (Librería externa) - Se dispara exactamente al acumular 5 unidades en total
    const totalUnidades = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    if (totalUnidades === 5) {
        Swal.fire({
            icon: 'info',
            title: '¡Promoción Alcanzada!',
            text: 'Has sumado 5 productos. Se aplicará un 15% de descuento al finalizar.',
            confirmButtonColor: '#3498db'
        });
    }

    actualizarInterfazCarrito();
}

function eliminarDelCarrito(id) {
    const itemEnCarrito = carrito.find(p => p.id === id);
    if (!itemEnCarrito) return;

    if (itemEnCarrito.cantidad > 1) {
        itemEnCarrito.cantidad--;
    } else {
        carrito = carrito.filter(p => p.id !== id);
    }
    actualizarInterfazCarrito();
}

/**
 * 2. MANEJO DEL DOM (Actualizaciones de textos y nodos hijos)
 */
function actualizarInterfazCarrito() {
    listaCarrito.innerHTML = ''; // Reseteo visual del contenedor de lista
    
    carrito.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.cantidad}x ${item.nombre} - $${item.precio * item.cantidad}</span>
            <button class="btn-eliminar" data-id="${item.id}">Quitar</button>
        `;
        listaCarrito.appendChild(li);
    });

    // Cálculos matemáticos limpios descriptivos
    const subtotal = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    const totalUnidades = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    const descuento = totalUnidades >= 5 ? subtotal * 0.15 : 0;
    const totalFinal = subtotal - descuento;

    // Renderizar totales actualizados al DOM
    txtUnidades.textContent = `Unidades: ${totalUnidades}`;
    txtSubtotal.textContent = `Subtotal: $${subtotal}`;
    
    if (descuento > 0) {
        contenedorDescuento.innerHTML = `<p style="color: #2ecc71; font-weight: bold;">Descuento Promocional (15%): -$${descuento}</p>`;
    } else {
        contenedorDescuento.innerHTML = '';
    }
    
    txtTotalFinal.textContent = `Total: $${totalFinal}`;
}

/**
 * CIRCUITO COMPLETO: Procesamiento y simulación de la orden de compra final.
 */
function finalizarCompra() {
    if (carrito.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Carrito vacío',
            text: 'Por favor, añade productos antes de solicitar tu cuenta.'
        });
        return;
    }

    const subtotal = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    const totalUnidades = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    const descuento = totalUnidades >= 5 ? subtotal * 0.15 : 0;
    const totalFinal = subtotal - descuento;

    // Construcción de la plantilla del ticket para SweetAlert2
    let tablaTicketHtml = '<div style="text-align: left; font-family: monospace; font-size: 0.95rem; line-height: 1.4;">';
    carrito.forEach(item => {
        tablaTicketHtml += `<p>${item.cantidad}x ${item.nombre} <span style="float:right;">$${item.precio * item.cantidad}</span></p>`;
    });
    tablaTicketHtml += '<hr style="border: dashed 1px #ccc; margin: 10px 0;">';
    tablaTicketHtml += `<p><b>Subtotal:</b> <span style="float:right;">$${subtotal}</span></p>`;
    if (descuento > 0) {
        tablaTicketHtml += `<p style="color: #27ae60;"><b>Descuento (15%):</b> <span style="float:right;">-$${descuento}</span></p>`;
    }
    tablaTicketHtml += `<p style="font-size: 1.15rem; margin-top: 5px;"><b>TOTAL FINAL:</b> <span style="float:right; color:#e74c3c;">$${totalFinal}</span></p>`;
    tablaTicketHtml += '</div>';

    Swal.fire({
        title: '--- RESUMEN DE COMPRA ---',
        html: tablaTicketHtml,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Confirmar Pedido',
        cancelButtonText: 'Seguir Comprando',
        confirmButtonColor: '#2ecc71',
        cancelButtonColor: '#95a5a6'
    }).then((result) => {
        if (result.isConfirmed) {
            // Cierre del circuito completo: Se limpia el estado interno de la app
            carrito = [];
            actualizarInterfazCarrito();
            Swal.fire('¡Procesado!', 'Tu pedido ha sido enviado a la cocina con éxito. ¡Gracias por tu visita!', 'success');
        }
    });
}

/**
 * 3. EVENTOS (Escuchadores globales y delegación estructurada)
 */
// Delegación de eventos para la grilla de productos dinámicos
contenedorProductos.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-agregar')) {
        const idSeleccionado = parseInt(e.target.getAttribute('data-id'));
        agregarAlCarrito(idSeleccionado);
    }
});

// Delegación de eventos para los botones de eliminación dinámica del carrito
listaCarrito.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-eliminar')) {
        const idAEliminar = parseInt(e.target.getAttribute('data-id'));
        eliminarDelCarrito(idAEliminar);
    }
});

// Evento directo sobre el botón de checkout
btnFinalizar.addEventListener('click', finalizarCompra);

// Evento de ciclo de vida del DOM para inicializar de forma limpia la aplicación
document.addEventListener('DOMContentLoaded', cargarMenu);