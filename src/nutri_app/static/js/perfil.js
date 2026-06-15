document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("perfil-form");
  const toggleSenha = document.getElementById("toggle-senha");
  const inputSenha = document.getElementById("input-senha");
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

  function validarNovoNome(nome) {
      const regex = /^[A-Za-zÀ-ÿ\s]+$/;

      return nome.trim().length >= 2 && regex.test(nome);
  }

  function validarNovaSenha(senha) {

    if (!senha) return { valido: true };

    const senhaLimpa = senha.trim();

    if (senhaLimpa.length < 6) {
        return {
            valido: false,
            mensagem: "A senha deve ter no mínimo 6 caracteres"
        };
    }

    if (!/[A-Za-zÀ-ÿ]/.test(senhaLimpa)) {
        return {
            valido: false,
            mensagem: "A senha deve conter pelo menos uma letra"
        };
    }

    if (!/\d/.test(senhaLimpa)) {
        return {
            valido: false,
            mensagem: "A senha deve conter pelo menos um número"
        };
    }

    return { valido: true };
  }

  if (!toggleSenha || !inputSenha || !iconeSenha) return;
    toggleSenha.addEventListener("click", () => {
        const isPassword = inputSenha.type === "password";

        inputSenha.type = isPassword ? "text" : "password";
        iconeSenha.classList.toggle("fa-eye");
        iconeSenha.classList.toggle("fa-eye-slash");
    });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("input-nome").value;

    if (!validarNovoNome(nome)) {
        alert("Informe um nome válido utilizando apenas letras.");
        return;
    }

    const senha = document.getElementById("input-senha").value;

    const validacaoSenha = validarNovaSenha(senha);
    
    if (!validacaoSenha.valido) {
        alert(validacaoSenha.mensagem);
        return;
    }

    const payload = {
      nome: nome.trim(),
      altura: formatarNumero(safeNumber(document.getElementById("input-altura").value.replace(",", "."))),
      peso: formatarNumero(safeNumber(document.getElementById("input-peso").value.replace(",", "."))),
      idade: document.getElementById("input-idade").value,
      sexo: document.getElementById("sexo").value,
      senha: senha.trim()
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
