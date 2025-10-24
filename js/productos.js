import { supabase } from './supabaseClient.js';
import { agregarListenersCatalogo } from './carrito.js';
import { Producto } from './models/Producto.js';

function marcarCategoriaActiva(categoriaNombre) {
    const enlacesMenu = document.querySelectorAll('.menu1 a');

    enlacesMenu.forEach(enlace => {
        enlace.classList.remove('active');

        const url = new URL(enlace.href);
        const categoriaEnEnlace = url.searchParams.get('categoria');

        if (categoriaEnEnlace === categoriaNombre) {
            enlace.classList.add('active');
        }
    });
}

async function cargarProductosPorCategoria() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaNombre = urlParams.get('categoria');

    const productosContainer = document.getElementById('productos-listado');

    if (!productosContainer) {
        console.error("Error: El contenedor 'productos-listado' no se encontró en el DOM.");
        return;
    }

    if (!categoriaNombre) {
        productosContainer.innerHTML = '<h2>Selecciona una categoría.</h2>';
        return;
    }

    marcarCategoriaActiva(categoriaNombre);

    const tituloCategoria = document.getElementById('titulo-categoria');
    if (tituloCategoria) {
        tituloCategoria.textContent = categoriaNombre;
        tituloCategoria.classList.add('titulo-categoria');
    }

    const breadcrumbActivo = document.getElementById('breadcrumb-activo');
    if (breadcrumbActivo) {
        breadcrumbActivo.textContent = categoriaNombre;
    }

    const breadcrumbLink = document.getElementById('breadcrumb-categoria-link');
    if (breadcrumbLink) {
        breadcrumbLink.setAttribute('href', 'productos.html');
    }

    let { data: categoria, error: catError } = await supabase
        .from('categoria')
        .select('id')
        .eq('nombre', categoriaNombre)
        .single();

    if (catError || !categoria) {
        console.error('Error al obtener la categoría:', catError);
        productosContainer.innerHTML = '<h2>Categoría no encontrada.</h2>';
        return;
    }

    const categoriaId = categoria.id;

    let { data: productos, error: prodError } = await supabase
        .from('producto')
        .select('*')
        .eq('id_categoria', categoriaId)
        .eq('visible', true)
        .order('id', { ascending: true });

    if (prodError) {
        console.error('Error al cargar productos:', prodError);
        productosContainer.innerHTML = '<h2>Error al cargar los productos.</h2>';
        return;
    }

    productosContainer.innerHTML = '';

    if (productos.length === 0) {
        productosContainer.innerHTML = `<p>No hay productos disponibles en ${categoriaNombre}.</p>`;
        return;
    }

    const productosMapeados = productos.map(data => new Producto(data));

    productosMapeados.forEach((producto) => {
        try {
            const productoId = producto.id;
            const precioFormateado = producto.getPrecioFormateado();
            const estaAgotado = producto.estaAgotado();

            const deshabilitado = estaAgotado ? 'disabled' : '';
            const valorCantidad = estaAgotado ? '0' : '1';
            const textoBoton = estaAgotado ? 'AGOTADO' : 'AGREGAR';

            const linkHref = `detalle_producto.html?id=${productoId}`;


            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto');

            if (estaAgotado) {
                productoDiv.classList.add('agotado');
            }

            productoDiv.setAttribute('data-categoria', categoriaNombre);
            productoDiv.setAttribute('data-precio', producto.precio.toFixed(2));

            productoDiv.innerHTML = `
                <a href="${linkHref}" class="producto-link">
                    <img src="${producto.imagen_url}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>Bs. ${precioFormateado}</p>
                    ${estaAgotado ? '<div class="agotado-tag">AGOTADO</div>' : ''} </a>
                <div class="cantidad">
                    <button class="decrementar" data-id="${productoId}" ${deshabilitado}>-</button>
                    <input type="text" class="cantidad-input" data-id="${productoId}" value="${valorCantidad}" readonly ${deshabilitado}>
                    <button class="incrementar" data-id="${productoId}" ${deshabilitado}>+</button>
                </div>
                <button class="agregar" data-id="${productoId}" ${deshabilitado}>${textoBoton}</button>
            `;
            productosContainer.appendChild(productoDiv);

        } catch (error) {
            console.error("Error al renderizar un producto (datos no válidos):", producto, error);
        }
    });

    agregarListenersCatalogo();
}

cargarProductosPorCategoria();