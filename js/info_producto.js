document.addEventListener("DOMContentLoaded", () => {
    const imagenes = document.querySelectorAll(".zoom-imagen");
    const modal = document.getElementById("modal");
    const modalImagen = document.getElementById("modalImagen");
    const cerrarModal = document.getElementById("cerrar-modal");

    let tiempoSalida;
    const esPantallaPequena = window.innerWidth < 768;

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

    imagenes.forEach(img => {
        img.addEventListener("click", () => {
            modal.classList.add("activo");
            modalImagen.src = img.src;
            modalImagen.style.transform = "scale(1)";
        });
    });

    cerrarModal.addEventListener("click", () => {
        modal.classList.remove("activo");
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("activo");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            modal.classList.remove("activo");
        }
    });

    if (!esPantallaPequena) {
        modalImagen.addEventListener("mousemove", (event) => {
            const { left, top, width, height } = modalImagen.getBoundingClientRect();
            const margen = 20;

            if (
                event.clientX > left + margen &&
                event.clientX < left + width - margen &&
                event.clientY > top + margen &&
                event.clientY < top + height - margen
            ) {
                const x = ((event.clientX - left) / width) * 100;
                const y = ((event.clientY - top) / height) * 100;

                modalImagen.style.transform = "scale(2)";
                modalImagen.style.transformOrigin = `${x}% ${y}%`;
            }
        });

        modalImagen.addEventListener("mouseleave", () => {
            tiempoSalida = setTimeout(() => {
                modalImagen.style.transform = "scale(1)";
                modalImagen.style.transformOrigin = "center";
            }, 100);
        });
    }
});