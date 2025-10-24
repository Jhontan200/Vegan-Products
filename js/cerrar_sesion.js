import { AuthManager } from './authManager.js';

document.addEventListener("DOMContentLoaded", async function () {
    const loginLink = document.getElementById("login-link");
    const logoutLink = document.getElementById("logout-link");

    if (!loginLink || !logoutLink) return;

    const authManager = new AuthManager();

    const user = await authManager.getActiveUser();

    if (user) {
        loginLink.style.display = "none";
        logoutLink.style.display = "inline-flex";
    } else {
        loginLink.style.display = "inline-flex";
        logoutLink.style.display = "none";
    }

    logoutLink.addEventListener("click", async function (e) {
        e.preventDefault();

        if (confirm("¿Seguro que quieres cerrar sesión?")) {
            const { success, error } = await authManager.cerrarSesion();

            if (success) {
                localStorage.removeItem("usuarioEmail");
                window.location.href = "index.html";
            } else {
                console.error("Error al cerrar sesión:", error);
                alert("Ocurrió un error al intentar cerrar la sesión. Intenta de nuevo.");
            }
        }
    });
});