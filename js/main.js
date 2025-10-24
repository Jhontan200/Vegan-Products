import { supabase } from './supabaseClient.js';

const firstLetterUppercase = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const SLIDE_WIDTH_REM = 12;
const SLIDE_GAP_REM = 3;

const slideTemplate = (data) => {
    const linkHref = `detalle_producto.html?id=${data.id}`;

    return `
        <div class="slide producto-carrusel-item" data-id="${data.id}">
            <a href="${linkHref}" class="slide__link">
                <img src="${data.imagen_url}" alt="${data.nombre}" class="carrusel-img">
                <p class="product__name product__name--fixed">${firstLetterUppercase(data.nombre)}</p>
            </a>
        </div>
    `;
};

async function cargarCarruselProductos() {
    const slideTrack = document.querySelector(".slide__track");
    const sliderContainer = document.getElementById('carrusel-productos-infinito');

    if (!slideTrack || !sliderContainer) {
        console.warn("Contenedor de carrusel no encontrado. Verifique el ID/Clase.");
        return;
    }

    let { data: productos, error } = await supabase
        .from('producto')
        .select('id, nombre, imagen_url')
        .eq('visible', true);

    if (error || !productos.length) {
        console.error('Error al cargar productos:', error);
        sliderContainer.innerHTML = '<p style="text-align:center;">No hay productos para el carrusel.</p>';
        return;
    }

    const productosAleatorios = [...productos].sort(() => 0.5 - Math.random());
    const listaCompleta = [...productosAleatorios, ...productosAleatorios];

    const numProductosOriginales = productosAleatorios.length;
    const numProductosTotal = listaCompleta.length;

    const carruselCards = listaCompleta
        .map(data => slideTemplate(data))
        .join("");

    slideTrack.innerHTML = carruselCards;

    const itemFullWidth = SLIDE_WIDTH_REM + SLIDE_GAP_REM;
    const totalWidthRem = (itemFullWidth * numProductosTotal) - SLIDE_GAP_REM;
    const translationDistanceRem = (itemFullWidth * numProductosOriginales) - SLIDE_GAP_REM;

    slideTrack.style.setProperty('width', `${totalWidthRem}rem`);
    sliderContainer.style.setProperty('--scroll-distance', `-${translationDistanceRem}rem`);

    const newDuration = Math.max(40, numProductosOriginales * 3.5);
    sliderContainer.style.setProperty('--animation-duration', `${newDuration}s`);
}

document.addEventListener('DOMContentLoaded', cargarCarruselProductos);