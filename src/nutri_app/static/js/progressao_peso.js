document.addEventListener("DOMContentLoaded", () => {
    const modalElement = document.getElementById("modalRegistrarProgresso");
    const modalRegistrar = new bootstrap.Modal(modalElement, {
        focus: false
    });
    const inputPeso = document.getElementById("input-peso");
    const inputDataRegistro = document.getElementById("input-data-registro");
    const inputDataEditar = document.getElementById("input-data-editar");
    const btnRegistrar = document.getElementById("btnRegistrarProgresso");
    const erro = document.getElementById("erro-progressao-registro");

    const calendarioRegistro = flatpickr("#input-data-registro", {
        locale: "pt",
        dateFormat: "Y-m-d",   
        altInput: true,
        altFormat: "d/m/Y",    
        defaultDate: "today",
        allowInput: false,
        position: "below",
        static: false,
        clickOpens: true,
        disableMobile: true,

    });
    
    function formatarNumero(valor) {
        return parseFloat(valor)
        .toFixed(2)
        .replace(/\.00$/, '')
        .replace(/(\.\d)0$/, '$1');
    }

    modalElement.addEventListener("shown.bs.modal", () => {
        limparMensagemErro(erro);
    });
    
    modalElement.addEventListener("hidden.bs.modal", () => {
        inputPeso.value = '';
        calendarioRegistro.setDate("today", true);
        limparMensagemErro(erro);
        
    });

    btnRegistrar.addEventListener("click", async (e) => {
        limparMensagemErro(erro);

        const peso = inputPeso.value;
        const data = inputDataRegistro.value;

        if (!peso || peso <= 50 || peso > 300) {
            erro.textContent = "Informe um peso válido.";
            erro.classList.remove("d-none");
            return;
        }

        if (!data) {
            erro.textContent = "Informe a data.";
            erro.classList.remove("d-none");
            return;
        }

        const response = await fetch("/progressao-registrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ peso, data })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            modalRegistrar.hide()
            window.location.reload(); 
        } else {
            erro.textContent = result.message;
            erro.classList.remove("d-none");
        }
    });

    if (window.graficoPesoData) {
        const ctx = document.getElementById("graficoPeso");

        new Chart(ctx, {
            type: "line",
            data: {
                labels: window.graficoPesoData.labels,
                datasets: [{
                    label: "Peso (kg)",
                    data: window.graficoPesoData.values,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: "Kg"
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Data"
                        }
                    }
                }
            }
        });
    }

    const listaRegistros = document.getElementById("lista-registros-peso");

    async function carregarRegistrosPeso() {
        if (!listaRegistros) return;

        const response = await fetch("/progressao-listar");
        const result = await response.json();

        listaRegistros.innerHTML = "";

        if (!result.success || result.progressoes.length === 0) {
            listaRegistros.innerHTML = `
                <li class="list-group-item text-muted text-center">
                    Nenhum registro ainda
                </li>
            `;
            return;
        }

        result.progressoes.forEach(registro => {
            const li = document.createElement("li");
            li.classList.add(
                "list-group-item",
                "d-flex",
                "justify-content-between",
                "align-items-center",
                "registro-peso"
            );

            li.dataset.data = (registro.data);
            li.dataset.peso = formatarNumero(registro.peso);

            li.innerHTML = `
                <span>${registro.data_formatada}</span>
                <strong>${formatarNumero(registro.peso)} kg</strong>
            `;

            li.addEventListener("click", () => abrirModalEditar(li));

            listaRegistros.appendChild(li);
        });
    }

    carregarRegistrosPeso();

    function limparMensagemErro(elementoErro) {
        elementoErro.classList.add("d-none");
        elementoErro.textContent = "";
    }

    const modalEditarEl = document.getElementById("modalEditarProgresso");
    const modalEditar = new bootstrap.Modal(modalEditarEl, {
        focus: false
    });

    const inputEditarPeso = modalEditarEl.querySelector("#input-peso-editar");
    const inputEditarData = modalEditarEl.querySelector("#input-data-editar");
    const erroEditar = modalEditarEl.querySelector("#erro-progressao-editar");

    let dataRegistroSelecionado = null;

    const calendarioEditar = flatpickr("#input-data-editar", {
        locale: "pt",
        dateFormat: "Y-m-d",   
        altInput: true,
        altFormat: "d/m/Y",    
        defaultDate: "today",
        allowInput: false,
        position: "below",
        static: false,
        clickOpens: true,
        disableMobile: true,

    });

    modalEditarEl.addEventListener("shown.bs.modal", () => {
        limparMensagemErro(erroEditar);
    });

    modalEditarEl.addEventListener("hidden.bs.modal", () => {
        inputEditarPeso.value = "";
        calendarioEditar.clear();
        limparMensagemErro(erroEditar);
    });

    function abrirModalEditar(elemento) {
        limparMensagemErro(erroEditar);

        const peso = elemento.dataset.peso;
        const data = elemento.dataset.data;

        dataRegistroSelecionado = data;

        inputEditarPeso.value = peso;
        calendarioEditar.setDate(data, true);

        modalEditar.show();
    }

    document.getElementById("btnSalvarProgresso").addEventListener("click", async () => {
        limparMensagemErro(erroEditar);

        const peso = inputEditarPeso.value;
        const data = inputEditarData.value;

        if (!peso || peso <= 50 || peso > 300) {
            erroEditar.textContent = "Informe um peso válido.";
            erroEditar.classList.remove("d-none");
            return;
        }

        const response = await fetch("/progressao-editar", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ peso, data })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            modalEditar.hide();
            window.location.reload();
        } else {
            erroEditar.textContent = result.message;
            erroEditar.classList.remove("d-none");
        }
    });

    document.getElementById("btnRemoverProgresso").addEventListener("click", async () => {
        if (!confirm("Deseja realmente remover este registro?")) return;

        const response = await fetch("/progressao-excluir", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: dataRegistroSelecionado })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            modalEditar.hide();
            window.location.reload();
        } else {
            erroEditar.textContent = result.message;
            erroEditar.classList.remove("d-none");
        }
    });

});
