document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("perfil-form");

  const toggleSenha = document.getElementById("toggle-senha");
  const senhaInput = document.getElementById("senha-input");
  const iconeSenha = document.getElementById("icone-senha");

  function safeNumber(value) {
    let num = parseFloat(value)
    return isNaN(num) ? 0 : num;
  }

  function formatarNumero(valor) {
    return parseFloat(valor)
      .toFixed(2)
      .replace(/\.00$/, '')
      .replace(/(\.\d)0$/, '$1');
  }

  if (!toggleSenha || !senhaInput || !iconeSenha) return;
    toggleSenha.addEventListener("click", () => {
        const isPassword = senhaInput.type === "password";

        senhaInput.type = isPassword ? "text" : "password";
        iconeSenha.classList.toggle("fa-eye");
        iconeSenha.classList.toggle("fa-eye-slash");
    });

  fetch("/perfil-dados")
    .then(res => res.json())
    .then(data => {
      document.getElementById("nome").value = data.nome || "";
      document.getElementById("altura").value = formatarNumero(data.altura || " ");
      document.getElementById("peso").value = formatarNumero(data.peso || " ");
      document.getElementById("idade").value = data.idade || "";
      document.getElementById("sexo").value = data.sexo || "M";
    });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const payload = {
      nome: document.getElementById("nome").value,
      altura: formatarNumero(safeNumber(document.getElementById("altura").value.replace(",", "."))),
      peso: formatarNumero(safeNumber(document.getElementById("peso").value.replace(",", "."))),
      idade: document.getElementById("idade").value,
      sexo: document.getElementById("sexo").value,
      senha: document.getElementById("senha-input").value
    };

    fetch("/perfil-atualizar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        form.reset();
        location.reload(); 
      })
      .catch(err => {
        console.error("Erro ao atualizar perfil:", err);
        alert("Erro ao atualizar perfil.");
      });
  });
});
