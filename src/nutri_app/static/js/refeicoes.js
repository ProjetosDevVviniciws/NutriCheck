document.addEventListener("DOMContentLoaded", function () {
    const tipoHidden = document.getElementById("tipo-refeicao-hidden");
    const modalEditar = new bootstrap.Modal(document.getElementById("modalEditarRefeicao"));
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

    let editarMacrosOriginais = {
        calorias: 0,
        proteinas: 0,
        carboidratos: 0,
        gorduras: 0
    };

    function limparMacros() {
        document.getElementById("editarCalorias").value = "";
        document.getElementById("editarProteinas").value = "";
        document.getElementById("editarCarboidratos").value = "";
        document.getElementById("editarGorduras").value = "";
    }

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

        if (porcao <= 0) {
            limparMacros();
            return;
        }
        
        document.getElementById("editarCalorias").value =
            `${formatarNumero((porcao / 100) * editarMacrosOriginais.calorias)} kcal`;

        document.getElementById("editarProteinas").value =
            `${formatarNumero((porcao / 100) * editarMacrosOriginais.proteinas)} g`;

        document.getElementById("editarCarboidratos").value =
            `${formatarNumero((porcao / 100) * editarMacrosOriginais.carboidratos)} g`;

        document.getElementById("editarGorduras").value =
            `${formatarNumero((porcao / 100) * editarMacrosOriginais.gorduras)} g`;
    }
    
    function formatarNumero(valor) {
        return parseFloat(valor)
            .toFixed(2)
            .replace(/\.00$/, '')
            .replace(/(\.\d)0$/, '$1');
    }

    function atualizarMacros(tipo, dados) {
        if (!dados) return;

        const campos = {
            meta: {
                ids: {
                    calorias: "#meta-calorias",
                    proteinas: "#meta-proteinas",
                    carboidratos: "#meta-carboidratos",
                    gorduras: "#meta-gorduras"
                },

                valores: {
                    calorias: "calorias_meta",
                    proteinas: "proteinas_meta",
                    carboidratos: "carboidratos_meta",
                    gorduras: "gorduras_meta"
                }
            },

            totais: {
                ids: {
                    calorias: "#calorias-totais",
                    proteinas: "#proteinas-totais",
                    carboidratos: "#carboidratos-totais",
                    gorduras: "#gorduras-totais"
                },

                valores: {
                    calorias: "calorias_consumidas",
                    proteinas: "proteinas_consumidas",
                    carboidratos: "carboidratos_consumidos",
                    gorduras: "gorduras_consumidas"
                }
            },

            restantes: {
                ids: {
                    calorias: "#calorias-restantes",
                    proteinas: "#proteinas-restantes",
                    carboidratos: "#carboidratos-restantes",
                    gorduras: "#gorduras-restantes"
                },

                valores: {
                    calorias: "calorias_restantes",
                    proteinas: "proteinas_restantes",
                    carboidratos: "carboidratos_restantes",
                    gorduras: "gorduras_restantes"
                }
            }
        };

        const config = campos[tipo];

        if (!config) return;

        document.querySelector(config.ids.calorias).textContent =
            `${formatarNumero(dados[`${config.valores.calorias}`])} kcal`;

        document.querySelector(config.ids.proteinas).textContent =
            `${formatarNumero(dados[`${config.valores.proteinas}`])} g`;

        document.querySelector(config.ids.carboidratos).textContent =
            `${formatarNumero(dados[`${config.valores.carboidratos}`])} g`;

        document.querySelector(config.ids.gorduras).textContent =
            `${formatarNumero(dados[`${config.valores.gorduras}`])} g`;
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
                                    <span>${a.alimento} — ${formatarNumero(a.porcao)}${a.tipo_porcao}</span>
                                    <span>${formatarNumero(a.calorias)} kcal</span>
                                </li>
                            `).join("");

                            inicializarEventosEdicao(lista);
                        }
                    }
                }

                atualizarMacros("totais", totais);
                atualizarMacros("restantes", restantes);
                atualizarMacros("metas", metas);
            })
            .catch(err => console.error("Erro ao carregar refeições:", err));
    }

    function inicializarEventosEdicao(lista) {
        lista.querySelectorAll(".refeicao-item").forEach(item => {
            item.addEventListener("click", () => {
                document.getElementById("refeicaoId").value = item.dataset.id;
                document.getElementById("input-nome-editar").value = item.dataset.nome;
                document.getElementById("input-tipo-porcao-editar").textContent = item.dataset.tipo_porcao || "g";
                document.getElementById("input-porcao-editar").value = formatarNumero(item.dataset.porcao);

                const porcaoOriginal = safeNumber(item.dataset.porcao);

                if (porcaoOriginal <= 0) {
                    editarMacrosOriginais = {
                        calorias: 0,
                        proteinas: 0,
                        carboidratos: 0,
                        gorduras: 0
                    };

                    limparMacros();
                } else {

                    editarMacrosOriginais.calorias =
                        (safeNumber(item.dataset.calorias) / safeNumber(item.dataset.porcao)) * 100;

                    editarMacrosOriginais.proteinas =
                        (safeNumber(item.dataset.proteinas) / safeNumber(item.dataset.porcao)) * 100;

                    editarMacrosOriginais.carboidratos =
                        (safeNumber(item.dataset.carboidratos) / safeNumber(item.dataset.porcao)) * 100;

                    editarMacrosOriginais.gorduras =
                        (safeNumber(item.dataset.gorduras) / safeNumber(item.dataset.porcao)) * 100;

                    recalcularMacrosEditar(item.dataset.porcao);
                }
                    modalEditar.show();
            });
        });
    }

    document.getElementById("input-porcao-editar").addEventListener("input", (e) => {
        recalcularMacrosEditar(e.target.value);
    });

    document.getElementById("btnSalvarRefeicao").addEventListener("click", () => {
        const id = document.getElementById("refeicaoId").value;
        const inputPorcaoEditar = document.getElementById("input-porcao-editar").value;
        const tipo_refeicao = document.querySelector(`.refeicao-card .refeicao-item[data-id="${id}"]`)?.dataset.tipo;

        if (!inputPorcaoEditar || Number(inputPorcaoEditar) <= 0) {
            alert("Informe uma porção maior que zero.");
            return;
        }

        fetch(`/refeicoes-editar/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                porcao: inputPorcaoEditar,
                tipo_refeicao: tipo_refeicao
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                alert(data.erro);
            } else {
                modalEditar.hide();
                carregarRefeicoes();
                atualizarMacros("totais", data.totais);
                atualizarMacros("restantes", data.restantes);
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
                atualizarMacros("totais", data.totais);
                atualizarMacros("restantes", data.restantes);
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
        const porcao = document.getElementById("input-porcao").value;
        const tipo_refeicao = tipoHidden.value;
        const dataSelecionada = window.dataSelecionada || formatarDataLocal(new Date());

        if (!alimentoSelecionado) {
            alert("Selecione um alimento antes de adicionar.");
            return;
        }

        if (!porcao || Number(porcao) <= 0) {
            alert("Informe uma porção maior que zero.");
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
                atualizarMacros("totais", data.totais);
                atualizarMacros("restantes", data.restantes);
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