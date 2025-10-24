document.querySelector(".cart img").addEventListener("click", () => {
    document.querySelector(".cart-container").classList.toggle("active");
});

document.querySelector(".close-cart").addEventListener("click", () => {
    document.querySelector(".cart-container").classList.remove("active");
});

let carrito = [];

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

function guardarCarritoEnLocalStorage() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

export function agregarListenersCatalogo() {
    document.querySelectorAll(".agregar").forEach((boton) => {
        boton.addEventListener("click", () => {
            let producto = boton.closest(".producto");

            if (!producto) return;

            let id = boton.getAttribute("data-id");
            let nombre = producto.querySelector("h3").textContent;
            let precio = parseFloat(producto.getAttribute("data-precio"));

            let cantidadInput = producto.querySelector(".cantidad-input");
            let cantidad = parseInt(cantidadInput.value);

            let imagen = producto.querySelector("img").src;

            agregarProductoPorID(id, cantidad, nombre, precio, imagen);

            cantidadInput.value = 1;
        });
    });

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

export async function agregarProductoPorID(id, cantidad, nombre = null, precio = null, imagen = null) {

    const idString = String(id);

    let existe = carrito.find(item => String(item.id) === idString);

    if (existe) {
        existe.cantidad += cantidad;
    } else if (nombre && precio) {
        carrito.push({ id: idString, nombre, precio, cantidad, imagen });
    } else {
        console.error("No se puede agregar el producto: faltan datos (nombre o precio).");
        return false;
    }

    guardarCarritoEnLocalStorage();
    actualizarCarrito();

    document.querySelector(".cart-container").classList.add("active");

    return true;
}

function actualizarCarrito() {
    let contenedor = document.querySelector(".cart-items");
    contenedor.innerHTML = "";

    let total = 0;
    let totalProductos = 0;

    carrito.forEach((producto) => {
        let div = document.createElement("div");
        div.classList.add("cart-item");

        let nombreCorto = producto.nombre.length > 30 ? producto.nombre.substring(0, 30) + "..." : producto.nombre;
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

    document.querySelectorAll(".eliminar").forEach((boton) => {
        boton.addEventListener("click", () => {
            const idEliminar = boton.getAttribute("data-id");
            let item = boton.closest(".cart-item");

            item.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out";
            item.style.opacity = "0";
            item.style.transform = "scale(0.8)";

            setTimeout(() => {
                carrito = carrito.filter(item => String(item.id) !== idEliminar);
                actualizarCarrito();
            }, 300);
        });
    });

    document.querySelectorAll(".incrementar-carrito").forEach((boton) => {
        boton.addEventListener("click", () => {
            const idIncrementar = boton.getAttribute("data-id");
            let itemIndex = carrito.findIndex(item => String(item.id) === idIncrementar);
            if (itemIndex > -1) {
                carrito[itemIndex].cantidad++;
                actualizarCarrito();
            }
        });
    });

    document.querySelectorAll(".decrementar-carrito").forEach((boton) => {
        boton.addEventListener("click", () => {
            const idDecrementar = boton.getAttribute("data-id");
            let itemIndex = carrito.findIndex(item => String(item.id) === idDecrementar);

            if (itemIndex > -1 && carrito[itemIndex].cantidad > 1) {
                carrito[itemIndex].cantidad--;
                actualizarCarrito();
            }
        });
    });
}


document.querySelector(".vaciar-carrito").addEventListener("click", () => {
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarCarrito();
    alert("¡Carrito vacío! Puedes empezar una nueva compra.");
});


document.addEventListener("click", (event) => {
    const cartContainer = document.querySelector(".cart-container");
    const cartIcon = document.querySelector(".cart img");

    if (cartContainer && cartIcon) {
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

cargarCarritoDesdeLocalStorage();