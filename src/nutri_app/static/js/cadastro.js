document.addEventListener("DOMContentLoaded", () => {
    const toggleSenha1 = document.getElementById("toggle-senha1");
    const senhaInput1 = document.getElementById("senha-input1");
    const iconeSenha1 = document.getElementById("icone-senha1");

    if (!toggleSenha1 || !senhaInput1 || !iconeSenha1) return;

    toggleSenha1.addEventListener("click", () => {
        const isPassword = senhaInput1.type === "password";

        senhaInput1.type = isPassword ? "text" : "password";
        iconeSenha1.classList.toggle("fa-eye");
        iconeSenha1.classList.toggle("fa-eye-slash");
    }); 

    const toggleSenha2 = document.getElementById("toggle-senha2");
    const senhaInput2 = document.getElementById("senha-input2");
    const iconeSenha2 = document.getElementById("icone-senha2");

    if (!toggleSenha2 || !senhaInput2 || !iconeSenha2) return;

    toggleSenha2.addEventListener("click", () => {
        const isPassword = senhaInput2.type === "password";

        senhaInput2.type = isPassword ? "text" : "password";
        iconeSenha2.classList.toggle("fa-eye");
        iconeSenha2.classList.toggle("fa-eye-slash");
    });
});
