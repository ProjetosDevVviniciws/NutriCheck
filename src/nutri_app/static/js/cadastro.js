document.addEventListener("DOMContentLoaded", () => {
    function configurarToggleSenha(inputId, toggleId, iconeId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        const icone = document.getElementById(iconeId);

        if (!input || !toggle || !icone) return;

        toggle.addEventListener("click", () => {
            const isPassword = input.type === "password";

            input.type = isPassword ? "text" : "password";
            icone.classList.toggle("fa-eye");
            icone.classList.toggle("fa-eye-slash");
        }); 
    }

    configurarToggleSenha(
        "input-senha1",
        "toggle-senha1",
        "icone-senha1"
    );

    configurarToggleSenha(
        "input-senha2",
        "toggle-senha2",
        "icone-senha2"
    );
});
