// =========================================================
// LÓGICA DE APERTURA Y CIERRE DEL CARRITO
// =========================================================
document.querySelector(".cart img").addEventListener("click", () => {
    document.querySelector(".cart-container").classList.toggle("active");
});

document.querySelector(".close-cart").addEventListener("click", () => {
    document.querySelector(".cart-container").classList.remove("active");
});

let carrito = [];

// 🚀 Cargar carrito desde `localStorage` al abrir cualquier página
function cargarCarritoDesdeLocalStorage() {
    let carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        try {
            carrito = JSON.parse(carritoGuardado);
        } catch (error) {
            console.error("Error al cargar el carrito:", error);
            carrito = [];
        }
    } else {
        carrito = [];
    }
    actualizarCarrito();
}

// Guardar carrito en `localStorage`
function guardarCarritoEnLocalStorage() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// =========================================================
// LÓGICA DE PRODUCTOS DE CATÁLOGO (USANDO .producto)
// =========================================================

// 🔹 Detectar clic en los botones "AGREGAR" de los productos de catálogo
// NOTA: Esta función debe ser llamada después de que los productos se renderizan
// 🛑 MODIFICACIÓN CLAVE: EXPORTAR la función para que 'productos.js' pueda llamarla
export function agregarListenersCatalogo() {
    document.querySelectorAll(".agregar").forEach((boton) => {
        boton.addEventListener("click", () => {
            // Buscamos el contenedor padre con la clase '.producto'
            let producto = boton.closest(".producto"); 
            
            // Si por alguna razón no lo encuentra, salimos
            if (!producto) return;

            // Extraemos los datos del DOM
            let nombre = producto.querySelector("h3").textContent;
            let precio = parseFloat(producto.getAttribute("data-precio"));
            
            // Usamos el input de cantidad asociado al producto
            let cantidadInput = producto.querySelector(".cantidad-input");
            let cantidad = parseInt(cantidadInput.value);
            
            let imagen = producto.querySelector("img").src;
            let id = producto.querySelector(".agregar").getAttribute("data-id"); // Obtener el ID para referencia única

            agregarAlCarrito(id, nombre, precio, cantidad, imagen);
            
            // Reiniciar la cantidad en el input del catálogo a 1 después de agregar
            cantidadInput.value = 1; 
        });
    });

    // Añadir listeners para los botones de incrementar/decrementar del catálogo
    document.querySelectorAll(".incrementar").forEach(boton => {
        boton.addEventListener("click", () => {
            const input = boton.closest(".cantidad").querySelector(".cantidad-input");
            input.value = parseInt(input.value) + 1;
        });
    });

    document.querySelectorAll(".decrementar").forEach(boton => {
        boton.addEventListener("click", () => {
            const input = boton.closest(".cantidad").querySelector(".cantidad-input");
            let cantidad = parseInt(input.value);
            if (cantidad > 1) {
                input.value = cantidad - 1;
            }
        });
    });
}

// Mantenemos la función de agregarAlCarrito con un ID para mejor manejo
// 🛑 MODIFICACIÓN CLAVE: EXPORTAR la función
export function agregarAlCarrito(id, nombre, precio, cantidad, imagen) {
    // Usamos el ID como identificador único, no solo el nombre
    let existe = carrito.find(item => item.id === id); 

    if (existe) {
        existe.cantidad += cantidad;
    } else {
        carrito.push({ id, nombre, precio, cantidad, imagen });
    }

    guardarCarritoEnLocalStorage();
    actualizarCarrito();
}

// =========================================================
// LÓGICA DEL CARRITO (RENDERIZADO Y MANIPULACIÓN)
// =========================================================

function actualizarCarrito() {
    let contenedor = document.querySelector(".cart-items");
    contenedor.innerHTML = "";

    let total = 0;
    let totalProductos = 0;

    carrito.forEach((producto, index) => {
        let div = document.createElement("div");
        div.classList.add("cart-item");

        let nombreCorto = producto.nombre.length > 30 ? producto.nombre.substring(0, 30) + "..." : producto.nombre;
        // Usamos el id del producto en el data-index para que la eliminación/actualización sea precisa
        let subtotal = (producto.precio * producto.cantidad).toFixed(2).replace(".", ",");
        totalProductos += producto.cantidad;

        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <span>${nombreCorto}</span>
            <div class="cantidad">
                <button class="decrementar-carrito" data-id="${producto.id}">-</button>
                <span>${producto.cantidad}</span>
                <button class="incrementar-carrito" data-id="${producto.id}">+</button>
            </div>
            <span class="subtotal">Bs. ${subtotal}</span>
            <button class="eliminar" data-id="${producto.id}">
                <img src="https://img.icons8.com/ios-filled/50/trash.png" alt="Eliminar">
            </button>
        `;
        contenedor.appendChild(div);

        total += producto.precio * producto.cantidad;
    });

    let cartCount = document.querySelector(".cart-count");
    cartCount.textContent = totalProductos > 0 ? totalProductos : "";
    cartCount.style.display = totalProductos > 0 ? "flex" : "none";

    document.querySelector(".total-price").textContent = `Total: Bs. ${total.toFixed(2).replace(".", ",")}`;

    guardarCarritoEnLocalStorage();

    // 🛑 Listener para ELIMINAR (Usando data-id para mejor precisión)
    document.querySelectorAll(".eliminar").forEach((boton) => {
        boton.addEventListener("click", () => {
            const idEliminar = boton.getAttribute("data-id");
            let item = boton.closest(".cart-item");
            
            item.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out";
            item.style.opacity = "0";
            item.style.transform = "scale(0.8)";

            setTimeout(() => {
                // Filtramos el carrito para excluir el producto con el ID coincidente
                carrito = carrito.filter(item => item.id !== idEliminar);
                actualizarCarrito();
            }, 300);
        });
    });

    // 🛑 Listener para INCREMENTAR (Usando data-id)
    document.querySelectorAll(".incrementar-carrito").forEach((boton) => {
        boton.addEventListener("click", () => {
            const idIncrementar = boton.getAttribute("data-id");
            let itemIndex = carrito.findIndex(item => item.id === idIncrementar);
            if (itemIndex > -1) {
                carrito[itemIndex].cantidad++;
                actualizarCarrito();
            }
        });
    });

    // 🛑 Listener para DECREMENTAR (Usando data-id)
    document.querySelectorAll(".decrementar-carrito").forEach((boton) => {
        boton.addEventListener("click", () => {
            const idDecrementar = boton.getAttribute("data-id");
            let itemIndex = carrito.findIndex(item => item.id === idDecrementar);

            if (itemIndex > -1 && carrito[itemIndex].cantidad > 1) {
                carrito[itemIndex].cantidad--;
                actualizarCarrito();
            }
        });
    });
}

// 🛒 Vaciar carrito
document.querySelector(".vaciar-carrito").addEventListener("click", () => {
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarCarrito();
    alert("¡Carrito vacío! Puedes empezar una nueva compra.");
});


// 🔹 Cerrar carrito cuando se toca fuera de la ventana, pero NO si se hace clic en botones internos
document.addEventListener("click", (event) => {
    const cartContainer = document.querySelector(".cart-container");
    const cartIcon = document.querySelector(".cart img");

    if (cartContainer && cartIcon) { // Verificar si los elementos existen
        if (!cartContainer.contains(event.target) && 
            !cartIcon.contains(event.target) && 
            !event.target.classList.contains("incrementar-carrito") && 
            !event.target.classList.contains("decrementar-carrito") && 
            !event.target.classList.contains("eliminar") && 
            !event.target.classList.contains("vaciar-carrito") && 
            !event.target.classList.contains("finalizar-compra") && 
            !event.target.closest(".eliminar")) {
            cartContainer.classList.remove("active");
        }
    }
});

// =========================================================
// LÓGICA DE DETALLE DE PRODUCTO INDIVIDUAL
// =========================================================

// ✅ FUNCIONALIDAD PARA EL PRODUCTO INDIVIDUAL
const botonAgregarDetalle = document.querySelector(".info-pro-agregar");
if (botonAgregarDetalle) {
    botonAgregarDetalle.addEventListener("click", () => {
        const contenedorProducto = botonAgregarDetalle.closest(".info-pro-producto");

        // Usamos .dataset.id en lugar de .dataset.precio para obtener el ID único
        const id = contenedorProducto.querySelector(".info-pro-precio").dataset.id; 
        const nombre = contenedorProducto.querySelector(".info-pro-nombre").textContent;
        const precio = parseFloat(contenedorProducto.querySelector(".info-pro-precio").dataset.precio);
        const imagen = contenedorProducto.querySelector(".info-pro-imagen img").src;
        const cantidad = parseInt(contenedorProducto.querySelector(".info-pro-valor").textContent);

        agregarAlCarrito(id, nombre, precio, cantidad, imagen);

        // Reiniciar cantidad a 1
        contenedorProducto.querySelector(".info-pro-valor").textContent = "1";
    });
}

const botonIncrementar = document.querySelector(".info-pro-incrementar");
const botonDecrementar = document.querySelector(".info-pro-decrementar");
const cantidadSpan = document.querySelector(".info-pro-valor");

if (botonIncrementar && botonDecrementar && cantidadSpan) {
    botonIncrementar.addEventListener("click", () => {
        let cantidad = parseInt(cantidadSpan.textContent);
        cantidadSpan.textContent = cantidad + 1;
    });

    botonDecrementar.addEventListener("click", () => {
        let cantidad = parseInt(cantidadSpan.textContent);
        if (cantidad > 1) {
            cantidadSpan.textContent = cantidad - 1;
        }
    });
}

// 🚀 Cargar el carrito cuando se abre cualquier página
cargarCarritoDesdeLocalStorage();
// 🛑 MODIFICACIÓN CLAVE: Se elimina la llamada fallida al listener
// document.addEventListener('DOMContentLoaded', agregarListenersCatalogo);