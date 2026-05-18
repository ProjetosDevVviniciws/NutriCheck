document.addEventListener("DOMContentLoaded", function () {
    const tipoHidden = document.getElementById("tipo-refeicao-hidden");
    const modalEditar = new bootstrap.Modal(document.getElementById("modalEditarRefeicao"));
    const tipoPorcaoInput = document.getElementById('tipoPorcao');
    const dataSpan = document.getElementById("data-selecionada");
    const seletorData = document.getElementById("seletor-data");
    const btnAnterior = document.getElementById("dia-anterior");
    const btnProximo = document.getElementById("proximo-dia");
    const btnCalendario = document.getElementById("abrir-calendario");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const fp = flatpickr(seletorData, {
        locale: "pt",
        dateFormat: "Y-m-d",     
        altInput: false, 
        clickOpens: false,         
        defaultDate: hoje,
        allowInput: false,
        position: "auto center",
        disableMobile: true,
        showMonths: 1,
        onChange: function (selectedDates) {
            if (selectedDates.length) {
                dataAtual = selectedDates[0];
                atualizarDataDisplay();
                carregarRefeicoes();
            }
        }
    });

    let dataAtual = new Date(hoje);
    let alimentoSelecionado = null;

    let macrosOriginaisEditar = {
        calorias: 0,
        proteinas: 0,
        carboidratos: 0,
        gorduras: 0
    };

    const atualizarDataDisplay = () => {
        if (dataSpan) {
            dataSpan.textContent = dataAtual.toLocaleDateString("pt-BR");
        }

        window.dataSelecionada = formatarDataLocal(dataAtual);

        fp.setDate(dataAtual, false);
    };

    function formatarDataLocal(date) {
        const ano = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, "0");
        const dia = String(date.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }

    function safeNumber(value) {
        let num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }

    function recalcularMacrosEditar(porcao) {
    porcao = safeNumber(porcao);

    if (porcao > 0) {
            document.getElementById("caloriasEditar").value =
                `${((porcao / 100) * macrosOriginaisEditar.calorias).toFixed(2)} kcal`;

            document.getElementById("proteinasEditar").value =
                `${((porcao / 100) * macrosOriginaisEditar.proteinas).toFixed(2)} g`;

            document.getElementById("carboidratosEditar").value =
                `${((porcao / 100) * macrosOriginaisEditar.carboidratos).toFixed(2)} g`;

            document.getElementById("gordurasEditar").value =
                `${((porcao / 100) * macrosOriginaisEditar.gorduras).toFixed(2)} g`;
        }
    }

    function formatarNumero(valor) {
        return parseFloat(valor)
            .toFixed(2)
            .replace(/\.00$/, '')
            .replace(/(\.\d)0$/, '$1');
    }

    function atualizarMetas(metas) {
        if (!metas) return;
        document.querySelector("#meta-calorias").textContent = `${formatarNumero(metas.calorias_meta)} kcal`;
        document.querySelector("#meta-proteinas").textContent = `${formatarNumero(metas.proteinas_meta)} g`;
        document.querySelector("#meta-carboidratos").textContent = `${formatarNumero(metas.carboidratos_meta)} g`;
        document.querySelector("#meta-gorduras").textContent = `${formatarNumero(metas.gorduras_meta)} g`;
    }

    function atualizarTotais(totais) {
        if (!totais) return;
        document.querySelector("#totais-calorias").textContent = `${formatarNumero(totais.calorias_consumidas)} kcal`;
        document.querySelector("#totais-proteinas").textContent = `${formatarNumero(totais.proteinas_consumidas)} g`;
        document.querySelector("#totais-carboidratos").textContent = `${formatarNumero(totais.carboidratos_consumidos)} g`;
        document.querySelector("#totais-gorduras").textContent = `${formatarNumero(totais.gorduras_consumidas)} g`;
    }

    function atualizarRestantes(restantes) {
        if (!restantes) return;
        document.querySelector("#restantes-calorias").textContent = `${formatarNumero(restantes.calorias_restantes)} kcal`;
        document.querySelector("#restantes-proteinas").textContent = `${formatarNumero(restantes.proteinas_restantes)} g`;
        document.querySelector("#restantes-carboidratos").textContent = `${formatarNumero(restantes.carboidratos_restantes)} g`;
        document.querySelector("#restantes-gorduras").textContent = `${formatarNumero(restantes.gorduras_restantes)} g`;
    }

    function carregarRefeicoes() {
        const dataFormatada = formatarDataLocal(dataAtual);
        
        fetch(`/refeicoes-listar?data=${dataFormatada}`)
            .then(res => res.json())
            .then(dados => {
                const refeicoes = dados.refeicoes || {};
                const totais = dados.totais || {};
                const restantes = dados.restantes || {};
                const metas = dados.metas || {};

                document.querySelectorAll(".refeicao-card").forEach(card => {
                    card.querySelector(".alimentos-list").innerHTML =
                        `<li class="list-group-item text-muted">Nenhum alimento adicionado</li>`;
                });

                for (const tipo in refeicoes) {
                    const card = document.querySelector(`.refeicao-card[data-tipo="${tipo}"]`);
                    if (card) {
                        const lista = card.querySelector(".alimentos-list");
                        if (refeicoes[tipo].length > 0) {
                            lista.innerHTML = refeicoes[tipo].map(a => `
                                <li class="list-group-item d-flex justify-content-between align-items-center refeicao-item"
                                    data-id="${a.id}"
                                    data-nome="${a.alimento}"
                                    data-porcao="${a.porcao}"
                                    data-calorias="${a.calorias}"
                                    data-proteinas="${a.proteinas}"
                                    data-carboidratos="${a.carboidratos}"
                                    data-gorduras="${a.gorduras}"
                                    data-tipo="${tipo}"
                                    data-tipo_porcao="${a.tipo_porcao}">
                                    <span>${a.alimento} — ${a.porcao}${a.tipo_porcao}</span>
                                    <span>${a.calorias} kcal</span>
                                </li>
                            `).join("");

                            inicializarEventosEdicao(lista);
                        }
                    }
                }

                atualizarTotais(totais);
                atualizarRestantes(restantes);
                atualizarMetas(metas);
            })
            .catch(err => console.error("Erro ao carregar refeições:", err));
    }

    function inicializarEventosEdicao(lista) {
        lista.querySelectorAll(".refeicao-item").forEach(item => {
            item.addEventListener("click", () => {
                document.getElementById("refeicaoId").value = item.dataset.id;
                document.getElementById("nomeEditar").value = item.dataset.nome;
                tipoPorcaoInput.textContent = item.dataset.tipo_porcao || "g";
                document.getElementById("porcaoEditar").dataset.tipo_porcao = item.dataset.tipo_porcao;

                macrosOriginaisEditar.calorias =
                (safeNumber(item.dataset.calorias) / safeNumber(item.dataset.porcao)) * 100;

                macrosOriginaisEditar.proteinas =
                    (safeNumber(item.dataset.proteinas) / safeNumber(item.dataset.porcao)) * 100;

                macrosOriginaisEditar.carboidratos =
                    (safeNumber(item.dataset.carboidratos) / safeNumber(item.dataset.porcao)) * 100;

                macrosOriginaisEditar.gorduras =
                    (safeNumber(item.dataset.gorduras) / safeNumber(item.dataset.porcao)) * 100;

                recalcularMacrosEditar(item.dataset.porcao);

                modalEditar.show();
            });
        });
    }

    document.getElementById("porcaoEditar").addEventListener("input", (e) => {
        recalcularMacrosEditar(e.target.value);
    });

    document.getElementById("btnSalvarRefeicao").addEventListener("click", () => {
        const id = document.getElementById("refeicaoId").value;
        const porcao = document.getElementById("porcaoEditar").value;
        const tipo_porcao = document.getElementById("tipoPorcaoEditar").dataset.tipo_porcao;
        const tipo_refeicao = document.querySelector(`.refeicao-card .refeicao-item[data-id="${id}"]`)?.dataset.tipo;

        fetch(`/refeicoes-editar/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                porcao: porcao,
                tipo_refeicao: tipo_refeicao,
                tipo_porcao: tipo_porcao
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                alert(data.erro);
            } else {
                modalEditar.hide();
                carregarRefeicoes();
                atualizarTotais(data.totais);
                atualizarRestantes(data.restantes);
            }
        })
        .catch(err => console.error("Erro ao editar refeição:", err));
    });

    document.getElementById("btnRemoverRefeicao").addEventListener("click", () => {
        const id = document.getElementById("refeicaoId").value;

        if (!confirm("Tem certeza que deseja remover esta refeição?")) return;

        fetch(`/refeicoes-excluir/${id}`, {
            method: "DELETE"
        })
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                alert(data.erro);
            } else {
                modalEditar.hide();
                carregarRefeicoes();
                atualizarTotais(data.totais);
                atualizarRestantes(data.restantes);
            }
        })
        .catch(err => console.error("Erro ao remover refeição:", err));
    });

    document.querySelectorAll(".adicionar-alimento-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            tipoHidden.value = btn.getAttribute("data-tipo");
            new bootstrap.Modal(document.getElementById("modalAdicionarAlimento")).show();
        });
    });

    document.getElementById("btnAdicionarAlimento").addEventListener("click", () => {
        const porcao = document.getElementById("porcao").value;
        const tipo_refeicao = tipoHidden.value;
        const dataSelecionada = window.dataSelecionada || formatarDataLocal(new Date());

        if (!alimentoSelecionado) {
            alert("Selecione um alimento antes de adicionar.");
            return;
        }

        fetch("/refeicoes-registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                alimento_id: alimentoSelecionado.id,
                porcao: porcao,
                tipo_refeicao: tipo_refeicao,
                data_refeicao: dataSelecionada,
                tipo_porcao: alimentoSelecionado.tipo_porcao
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                alert(data.erro);
            } else {
                bootstrap.Modal.getInstance(document.getElementById("modalAdicionarAlimento")).hide();
                carregarRefeicoes();
                atualizarTotais(data.totais);
                atualizarRestantes(data.restantes);
            }
        })
        .catch(err => console.error("Erro ao adicionar refeição:", err));
    });

    if (btnAnterior && btnProximo && seletorData) {
        btnAnterior.addEventListener("click", () => {
            dataAtual.setDate(dataAtual.getDate() - 1);
            atualizarDataDisplay();
            carregarRefeicoes();
        });

        btnProximo.addEventListener("click", () => {
            dataAtual.setDate(dataAtual.getDate() + 1);
            atualizarDataDisplay();
            carregarRefeicoes();
        });

        seletorData.addEventListener("change", (e) => {
            const [ano, mes, dia] = e.target.value.split("-").map(Number);
            dataAtual = new Date(ano, mes - 1, dia);
            atualizarDataDisplay();
            carregarRefeicoes();
        });

        btnCalendario?.addEventListener("click", () => {
            fp.open();
        });

    }

    atualizarDataDisplay();
    carregarRefeicoes();

    window.setAlimentoSelecionado = (item) => {
        alimentoSelecionado = item;
    };
});