document.addEventListener("DOMContentLoaded", () => {
    const toggleSenha = document.getElementById("toggle-senha");
    const inputSenha = document.getElementById("input-senha");
    const iconeSenha = document.getElementById("icone-senha");

    if (!toggleSenha || !inputSenha || !iconeSenha) return;

    toggleSenha.addEventListener("click", () => {
        const isPassword = inputSenha.type === "password";

        inputSenha.type = isPassword ? "text" : "password";
        iconeSenha.classList.toggle("fa-eye");
        iconeSenha.classList.toggle("fa-eye-slash");
    });

    const form = document.querySelector("form");
    const loading = document.getElementById("loading-screen");

    if (form && loading) {
        form.addEventListener("submit", () => {
            loading.classList.add("active");
        });
    } 
});
