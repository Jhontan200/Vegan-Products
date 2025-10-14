// Asegúrate de inicializar tu cliente Supabase
import { supabase } from './supabaseClient.js';
// 🛑 Importar la función que añade los listeners desde 'carrito.js'
import { agregarListenersCatalogo } from './carrito.js'; 
// 🛑 CAMBIO CLAVE: Importar la clase Producto desde su nuevo archivo
import { Producto } from './models/Producto.js';

// =========================================================
// FUNCIÓN PARA MARCAR EL ENLACE ACTIVO
// =========================================================
function marcarCategoriaActiva(categoriaNombre) {
    // 1. Obtener todos los elementos <a> dentro de la clase 'menu1'
    const enlacesMenu = document.querySelectorAll('.menu1 a');
    
    // 2. Recorrer los enlaces
    enlacesMenu.forEach(enlace => {
        // Primero, eliminar la clase 'active' de todos (por si acaso)
        enlace.classList.remove('active');
        
        // 3. Obtener el valor del parámetro 'categoria' de cada enlace
        const url = new URL(enlace.href);
        const categoriaEnEnlace = url.searchParams.get('categoria');
        
        // 4. Comparar el nombre de la categoría actual con el nombre de la categoría en el enlace
        if (categoriaEnEnlace === categoriaNombre) {
            // Si coinciden, añadir la clase 'active' al enlace
            enlace.classList.add('active');
        }
    });
}

// =========================================================

async function cargarProductosPorCategoria() {
    // 1. Obtener la categoría de la URL
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

    // LLAMAR A LA NUEVA FUNCIÓN AQUÍ
    marcarCategoriaActiva(categoriaNombre); 
    
    // Opcional: Mostrar el nombre de la categoría en el título principal
    const tituloCategoria = document.getElementById('titulo-categoria');
    if (tituloCategoria) {
        tituloCategoria.textContent = categoriaNombre;
        tituloCategoria.classList.add('titulo-categoria');
    }

    // Actualizar el Breadcrumb
    const breadcrumbActivo = document.getElementById('breadcrumb-activo');
    if (breadcrumbActivo) {
        breadcrumbActivo.textContent = categoriaNombre;
    }
    
    const breadcrumbLink = document.getElementById('breadcrumb-categoria-link');
    if (breadcrumbLink) {
        breadcrumbLink.setAttribute('href', 'productos.html');
    }
    
    // 2. Consultar Supabase (código ya corregido)
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
    
    // CAMBIO CLAVE: Mapeamos los datos crudos a una lista de objetos Producto
    const productosMapeados = productos.map(data => new Producto(data));

    productosMapeados.forEach((producto) => {
        try {
            // Ahora usamos los métodos y propiedades robustas de la clase Producto
            const productoId = producto.id; 
            const precioFormateado = producto.getPrecioFormateado(); 
            const estaAgotado = producto.estaAgotado(); 
            
            // Definir atributos y contenido condicional
            const deshabilitado = estaAgotado ? 'disabled' : '';
            const valorCantidad = estaAgotado ? '0' : '1';
            const textoBoton = estaAgotado ? 'AGOTADO' : 'AGREGAR';
            
            // 🛑 CORRECCIÓN: El enlace SIEMPRE debe ir a la página de detalle
            const linkHref = `detalle_producto.html?id=${productoId}`; 


            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto');
            
            // CORRECCIÓN: Solo añade la clase si el producto está agotado.
            if (estaAgotado) {
                productoDiv.classList.add('agotado');
            }
            
            productoDiv.setAttribute('data-categoria', categoriaNombre);
            // Usamos la propiedad 'precio' limpia de la clase Producto
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
    
    // Llamar a la función para añadir los listeners aquí, después de renderizar
    agregarListenersCatalogo(); 
}

cargarProductosPorCategoria();