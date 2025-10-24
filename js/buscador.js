import { ProductManager } from './productManager.js';

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById('searchBar');
    const searchModal = document.getElementById('searchModal');
    const resultsList = document.getElementById('resultsList');

    if (!searchInput || !searchModal || !resultsList) return;

    const productManager = new ProductManager();
    let searchTimeout;

    function renderResults(products) {
        resultsList.innerHTML = '';

        if (products.length > 0) {
            products.forEach(product => {
                const item = document.createElement('li');
                item.classList.add('search-result-item');

                const productDetailURL = `detalle_producto.html?id=${product.id}`;

                item.onclick = (e) => {
                    e.preventDefault();

                    searchInput.value = '';

                    searchModal.classList.add('hidden');

                    window.location.href = productDetailURL;
                };

                item.innerHTML = `
                    <img src="${product.imagen_url || 'imagenes/placeholder.png'}" alt="${product.nombre}" class="result-img">
                    <p class="result-name">${product.nombre}</p>
                `;
                resultsList.appendChild(item);
            });
            searchModal.classList.remove('hidden');

        } else if (searchInput.value.trim().length >= 3) {
            const li = document.createElement("li");
            li.textContent = "No se encontraron resultados.";
            li.classList.add("no-results");
            resultsList.appendChild(li);
            searchModal.classList.remove('hidden');

        } else {
            searchModal.classList.add('hidden');
        }
    }

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();

        clearTimeout(searchTimeout);

        if (searchTerm.length < 3) {
            searchModal.classList.add('hidden');
            return;
        }

        searchTimeout = setTimeout(async () => {
            const products = await productManager.searchProductsByName(searchTerm);
            renderResults(products);
        }, 300);
    });

    document.addEventListener('click', (e) => {
        const isClickInside = searchInput.contains(e.target) || searchModal.contains(e.target);

        if (!isClickInside) {
            searchModal.classList.add('hidden');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchModal.classList.add('hidden');
        }
    });
});