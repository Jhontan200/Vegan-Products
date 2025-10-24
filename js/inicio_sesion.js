import { AuthManager } from './authManager.js';

function iniciarCarrusel() {
    const slides = document.querySelectorAll(".slide");
    let index = 0;

    function changeSlide() {
        slides.forEach((slide, i) => {
            slide.style.opacity = i === index ? "1" : "0";
        });
        index = (index + 1) % slides.length;
    }

    if (slides.length > 0) {
        setInterval(changeSlide, 2500);
        changeSlide();
    }
}

window.togglePassword = function () {
    const passwordInput = document.getElementById('password');
    const eyeOpenIcon = document.getElementById('eye-open');
    const eyeClosedIcon = document.getElementById('eye-closed');

    if (!passwordInput || !eyeOpenIcon || !eyeClosedIcon) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeOpenIcon.style.display = 'none';
        eyeClosedIcon.style.display = 'block';
    } else {
        passwordInput.type = 'password';
        eyeOpenIcon.style.display = 'block';
        eyeClosedIcon.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", function () {

    iniciarCarrusel();

    const authManager = new AuthManager();

    const loginButton = document.querySelector(".login-btn");

    if (!loginButton) return;

    loginButton.addEventListener("click", async function (event) {
        event.preventDefault();

        const email = document.querySelector("#email")?.value.trim() || "";
        const password = document.querySelector("#password")?.value.trim() || "";

        if (email === "" || password === "") {
            alert("⚠️ No puedes dejar campos vacíos."); return;
        }
        if (!email.endsWith("@gmail.com")) {
            alert("⚠️ Ingresa un correo con @gmail.com."); return;
        }
        if (password.length < 8) {
            alert("⚠️ La contraseña debe tener al menos 8 caracteres."); return;
        }

        const authResult = await authManager.iniciarSesion(email, password);

        if (!authResult.success) {
            alert("⚠️ Error: El correo o la contraseña son incorrectos.");
            return;
        }

        const perfilUsuario = await authManager.getPerfilActual();

        if (!perfilUsuario || perfilUsuario.rol !== 'cliente') {
            await authManager.cerrarSesion();
            alert("❌ Acceso denegado. Solo los clientes pueden acceder por esta vía.");
            return;
        }

        localStorage.setItem("usuarioEmail", email);
        localStorage.setItem("usuarioId", perfilUsuario.id);

        alert("✅ ¡Inicio de sesión exitoso!");
        window.location.href = "index.html";
    });
});