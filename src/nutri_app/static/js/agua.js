document.addEventListener("DOMContentLoaded", () => {
    const inputAgua = document.getElementById("input-agua");
    const modalElement = document.getElementById("modalRegistrarAgua");
    const modalRegistrar = new bootstrap.Modal(modalElement, {
        focus: false
    });
    const btnRegistrar = document.getElementById("btnRegistrarAgua");
    const erro = document.getElementById("erro-agua-registro");
    const aguaTotal = document.getElementById("agua-total");
    const seletorData = document.getElementById("seletor-data");
    const btnAnterior = document.getElementById("dia-anterior");
    const btnProximo = document.getElementById("proximo-dia");
    const btnCalendario = document.getElementById("abrir-calendario");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    function limparMensagemErro(elementoErro) {
        elementoErro.classList.add("d-none");
        elementoErro.textContent = "";
    }

    modalElement.addEventListener("shown.bs.modal", () => {
        limparMensagemErro(erro);
    });
    
    modalElement.addEventListener("hidden.bs.modal", () => {
        inputAgua.value = '';
        limparMensagemErro(erro);
        
    });

    let dataAtual = new Date(seletorData.value || hoje);
    
    function atualizarDataDisplay() {
        seletorData.value = dataAtual.toISOString().split("T")[0];
        window.dataSelecionada = seletorData.value;
    }

    function carregarTotalAgua() {
        const data = dataAtual.toISOString().split("T")[0];
        
        fetch(`/agua-total?data=${data}`)
            .then(res => res.json())
            .then(data => {
                aguaTotal.textContent = `${data.total} ml`;
            })
            .catch(() => {
                aguaTotal.textContent = "0 ml";
            });
    }

    window.dataSelecionada = seletorData.value;
    carregarTotalAgua(window.dataSelecionada);

    btnRegistrar.addEventListener("click", () => {
        limparMensagemErro(erro);

        const valor = Number(inputAgua.value.trim());
        const dataSelecionada = window.dataSelecionada;

        if (!valor) return mostrarErro("Informe a quantidade de água.");
        if (valor < 50 || valor > 12000) return mostrarErro("Informe uma quantidade entre 50ml e 12000ml.");

        erro.classList.add("d-none");

        fetch("/agua-registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantidade: valor, data: dataSelecionada })
        })
            .then(res => res.json())
            .then(data => {

                if (data.erro) {
                    mostrarErro(data.erro);
                    return;
                }
                
                modalRegistrar.hide();

                aguaTotal.textContent = `${data.total} ml`;
                inputAgua.value = "";

                alert(data.mensagem);

            })
            .catch(() => {
                mostrarErro("Erro ao registrar água. Tente novamente.");
            });
    });

    const modalEditarEl = document.getElementById("modalEditarAgua");
    const modalEditarAgua = modalEditarEl
        ? new bootstrap.Modal(modalEditarEl)
        : null;
    const inputEditarAgua = document.getElementById("input-agua-editar");
    const erroEditarAgua = document.getElementById("erro-agua-editar");
    const cardBodyAgua = document.querySelector(".agua-card-body");

    modalEditarEl.addEventListener("shown.bs.modal", () => {
        limparMensagemErro(erroEditarAgua);
    });

    modalEditarEl.addEventListener("hidden.bs.modal", () => {
        inputEditarAgua.value = "";
        limparMensagemErro(erroEditarAgua);
    });

    function abrirModalEditar() {
        limparMensagemErro(erroEditarAgua);
        
        const aguaConsumida = parseInt(
                aguaTotal.textContent.replace("ml", "").trim()
            ) || 0;

        inputEditarAgua.value = aguaConsumida;

        modalEditarAgua.show();
    }

    if (cardBodyAgua && modalEditarAgua) {
        cardBodyAgua.addEventListener("click", abrirModalEditar);
    }

    const btnSalvar = document.getElementById("btnSalvarAgua");

    if (btnSalvar) {
        btnSalvar.addEventListener("click", () => {
            const novaQuantidade = Number(inputEditarAgua.value);
            const dataSelecionada = window.dataSelecionada;

            if (!novaQuantidade || novaQuantidade < 0 || novaQuantidade > 12000) {
                erroEditarAgua.textContent =
                    "Informe um valor entre 0 e 12000 ml.";
                erroEditarAgua.classList.remove("d-none");
                return;
            }

            fetch("/agua-editar", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quantidade: novaQuantidade,
                    data: dataSelecionada
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.erro) {
                    alert(data.erro);
                    return;
                }

                aguaTotal.textContent = `${data.total} ml`;
                modalEditarAgua.hide();
            })
            .catch(() => {
                alert("Erro ao editar consumo de água.");
            });
        });
    }

    const btnRemover = document.getElementById("btnRemoverAgua");

    if (btnRemover && modalEditarAgua) {
        btnRemover.addEventListener("click", () => {

            if (!confirm("Deseja remover todo o consumo de água deste dia?")) return;

            fetch("/agua-remover", {
                method: "DELETE", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: window.dataSelecionada
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.erro) {
                    alert(data.erro);
                    return;
                }

                aguaTotal.textContent = "0 ml";
                modalEditarAgua.hide();
            })
            .catch(() => {
                alert("Erro ao remover consumo de água.");
            });
        });
    }

    if (btnAnterior && btnProximo && seletorData) {
        btnAnterior.addEventListener("click", () => {
            dataAtual.setDate(dataAtual.getDate() - 1);
            atualizarDataDisplay();
            carregarTotalAgua();
        });

        btnProximo.addEventListener("click", () => {
            dataAtual.setDate(dataAtual.getDate() + 1);
            atualizarDataDisplay();
            carregarTotalAgua();
        });

        seletorData.addEventListener("change", e => {
            const [ano, mes, dia] = e.target.value.split("-").map(Number);
            dataAtual = new Date(ano, mes - 1, dia);
            atualizarDataDisplay();
            carregarTotalAgua();
        });

        btnCalendario?.addEventListener("click", () => {
            seletorData.showPicker();
        });
    }
        
    function mostrarErro(msg) {
        erro.textContent = msg;
        erro.classList.remove("d-none");
    }
});
