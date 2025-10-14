import { supabase } from './supabaseClient.js';
import { Producto } from './models/Producto.js'; 
// import { CarritoItem } from './models/CarritoItem.js'; // Descomenta si la creaste

/**
 * Función que carga los detalles de un producto y los renderiza en la página.
 */
async function cargarDetalleProducto() {
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = urlParams.get('id');

    const container = document.getElementById('detalle-producto-container');

    if (!productoId) {
        container.innerHTML = '<h2>Producto no especificado.</h2>';
        actualizarBreadcrumb('Error', null);
        return;
    }

    try {
        // 1. Obtener el producto y su categoría (mediante un join o select completo)
        let { data: productoData, error: prodError } = await supabase
            .from('producto')
            .select(`
                *,
                categoria (nombre) 
            `)
            .eq('id', productoId)
            .single();

        if (prodError || !productoData) {
            console.error('Error al cargar el producto:', prodError);
            container.innerHTML = '<h2>Producto no encontrado o error de conexión.</h2>';
            actualizarBreadcrumb('Error', null);
            return;
        }

        // Mapear los datos de Supabase a nuestra clase Producto
        const producto = new Producto(productoData);
        
        // CORRECCIÓN DE MAYÚSCULAS/MINÚSCULAS
        const categoriaNombre = productoData.categoria?.nombre || 'Categoría Desconocida'; 

        // 2. Actualizar el Breadcrumb
        actualizarBreadcrumb(categoriaNombre, producto.nombre);

        // 3. Renderizar el detalle del producto
        renderizarDetalle(producto, categoriaNombre, container);
        
        // 🛑 Ejecutar los listeners del modal y zoom DESPUÉS de renderizar el HTML
        agregarListenersModalZoom();

    } catch (error) {
        console.error("Error general al cargar los detalles:", error);
        container.innerHTML = '<h2>Ocurrió un error inesperado al cargar el producto.</h2>';
    }
}

// =========================================================
// FUNCIONES DE SOPORTE
// =========================================================

function actualizarBreadcrumb(categoriaNombre, productoNombre) {
    const categoriaLink = document.getElementById('breadcrumb-categoria-link');
    const productoSpan = document.getElementById('breadcrumb-producto-nombre');

    if (categoriaLink) {
        categoriaLink.textContent = categoriaNombre;
        categoriaLink.href = `productos.html?categoria=${encodeURIComponent(categoriaNombre)}`;
    }

    if (productoSpan) {
        productoSpan.textContent = productoNombre || 'Producto';
    }
}

function renderizarDetalle(producto, categoriaNombre, container) {
    const precioFormateado = producto.getPrecioFormateado();
    const estaAgotado = producto.estaAgotado();

    const deshabilitado = estaAgotado ? 'disabled' : '';
    const valorInicial = estaAgotado ? '0' : '1';
    const textoBoton = estaAgotado ? 'AGOTADO' : 'AGREGAR';
    const claseAgotado = estaAgotado ? 'agotado' : '';
    const stockIndicador = estaAgotado 
        ? '<p class="info-pro-stock agotado-stock">Stock: Agotado</p>'
        : `<p class="info-pro-stock">Stock: ${producto.stock} unidades</p>`;

    container.innerHTML = `
        <div class="info-pro-contenedor ${claseAgotado}">
            <div class="info-pro-imagen">
                <img src="${producto.imagen_url}" alt="${producto.nombre}" class="zoom-imagen">
                ${estaAgotado ? '<div class="agotado-tag">AGOTADO</div>' : ''}
            </div>
            
            <div id="modal" class="modal">
                <span class="cerrar" id="cerrar-modal">&times;</span>
                <div class="modal-contenido">
                    <img class="modal-imagen" id="modalImagen" src="" alt="Zoom del producto">
                </div>
            </div> 

            <div class="info-pro-informacion">
                <h2 class="info-pro-nombre">${producto.nombre}</h2>
                <p class="info-pro-precio" data-precio="${producto.precio.toFixed(2)}">Bs. ${precioFormateado}</p>
                ${stockIndicador}

                <div class="info-pro-acciones">
                    <button class="info-pro-decrementar" data-id="${producto.id}" ${deshabilitado}>-</button>
                    <span class="info-pro-valor" data-id="${producto.id}">${valorInicial}</span>
                    <button class="info-pro-incrementar" data-id="${producto.id}" ${deshabilitado}>+</button>
                </div>
                <button class="info-pro-agregar" data-id="${producto.id}" ${deshabilitado}>${textoBoton}</button>
            </div>
            <div class="info-pro-descripcion">
                <h3 class="titulo-descripcion">Descripción</h3>
                <p class="texto-descripcion">${producto.descripcion}</p>
            </div>
        </div>
    `;
}

// =========================================================
// 🛑 LÓGICA DE LISTENERS DE MODAL Y ZOOM (MOVIDA AQUÍ)
// =========================================================

function agregarListenersModalZoom() {
    const imagenes = document.querySelectorAll(".zoom-imagen");
    const modal = document.getElementById("modal");
    const modalImagen = document.getElementById("modalImagen");
    const cerrarModal = document.getElementById("cerrar-modal");

    // Verificar si los elementos existen (deberían existir ahora)
    if (!modal || !modalImagen || !cerrarModal || imagenes.length === 0) {
        console.warn("Faltan elementos HTML para inicializar el modal/zoom.");
        return;
    }

    let tiempoSalida;
    // Uso de media query para detección de pantalla (más robusto)
    const esPantallaPequena = window.matchMedia("(max-width: 768px)").matches; 

    // Zoom dinámico en imágenes normales (Solo en pantallas grandes)
    if (!esPantallaPequena) {
        imagenes.forEach(img => {
            img.addEventListener("mousemove", (event) => {
                clearTimeout(tiempoSalida);
                const { left, top, width, height } = img.getBoundingClientRect();
                const margen = 20;

                if (
                    event.clientX > left + margen &&
                    event.clientX < left + width - margen &&
                    event.clientY > top + margen &&
                    event.clientY < top + height - margen
                ) {
                    const x = ((event.clientX - left) / width) * 100;
                    const y = ((event.clientY - top) / height) * 100;

                    img.style.transform = "scale(1.5)";
                    img.style.transformOrigin = `${x}% ${y}%`;
                }
            });

            img.addEventListener("mouseleave", () => {
                tiempoSalida = setTimeout(() => {
                    img.style.transform = "scale(1)";
                    img.style.transformOrigin = "center";
                }, 100);
            });
        });
    }

    // Abrir modal (funciona en todas las pantallas)
    imagenes.forEach(img => {
        img.addEventListener("click", () => {
            modal.classList.add("activo");
            modalImagen.src = img.src;
            modalImagen.style.transform = "scale(1)";
        });
    });

    // Cerrar modal
    cerrarModal.addEventListener("click", () => {
        modal.classList.remove("activo");
    });

    // Cerrar clickeando fuera de la imagen
    modal.addEventListener("click", (event) => {
        // Asegúrate de que solo se cierre si el click es en el fondo del modal, no en la imagen.
        if (event.target === modal) { 
            modal.classList.remove("activo");
        }
    });

    // Cerrar con Escape
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("activo")) {
            modal.classList.remove("activo");
        }
    });

    // Zoom dinámico en imagen dentro del modal (Solo en pantallas grandes)
    if (!esPantallaPequena) {
        modalImagen.addEventListener("mousemove", (event) => {
            const { left, top, width, height } = modalImagen.getBoundingClientRect();
            
            // Si la imagen dentro del modal tiene `object-fit: cover` (como en tu CSS),
            // el cálculo de origen es más directo:
            const x = ((event.clientX - left) / width) * 100;
            const y = ((event.clientY - top) / height) * 100;

            modalImagen.style.transform = "scale(2)";
            modalImagen.style.transformOrigin = `${x}% ${y}%`;
        });

        modalImagen.addEventListener("mouseleave", () => {
            tiempoSalida = setTimeout(() => {
                modalImagen.style.transform = "scale(1)";
                modalImagen.style.transformOrigin = "center";
            }, 100);
        });
    }
}

// =========================================================

// Inicia el proceso de carga
cargarDetalleProducto();