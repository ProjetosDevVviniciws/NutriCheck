document.addEventListener("DOMContentLoaded", () => {
  const modalAdicionarAlimento = document.getElementById("modalAdicionarAlimento");
  const buscaAlimento = document.getElementById('busca-alimento');
  const inputNome = document.getElementById('input-nome');
  const inputPorcao = document.getElementById('input-porcao');
  const inputCalorias = document.getElementById('input-calorias');
  const inputProteinas = document.getElementById('input-proteinas');
  const inputCarboidratos = document.getElementById('input-carboidratos');
  const inputGorduras = document.getElementById('input-gorduras');
  const tipoPorcao = document.getElementById('tipo-porcao');

  let macrosOriginais = {
    calorias: 0,
    proteinas: 0,
    carboidratos: 0,
    gorduras: 0
  };

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

  function recalcularMacros(porcao) {
    porcao = safeNumber(porcao)
    if (porcao > 0) {
      inputCalorias.value = `${formatarNumero((porcao / 100) * macrosOriginais.calorias)} kcal`;
      inputProteinas.value = `${formatarNumero((porcao / 100) * macrosOriginais.proteinas)} g`;
      inputCarboidratos.value = `${formatarNumero((porcao / 100) * macrosOriginais.carboidratos)} g`;
      inputGorduras.value = `${formatarNumero((porcao / 100) * macrosOriginais.gorduras)} g`;
    } else {
      inputCalorias.value = inputProteinas.value = inputCarboidratos.value = inputGorduras.value = '';
    }
  }

  window.atualizarMacrosOriginais = function () {
    macrosOriginais.calorias = safeNumber(inputCalorias.value) || 0;
    macrosOriginais.proteinas = safeNumber(inputProteinas.value) || 0;
    macrosOriginais.carboidratos = safeNumber(inputCarboidratos.value) || 0;
    macrosOriginais.gorduras = safeNumber(inputGorduras.value) || 0;
    recalcularMacros(parseFloat(inputPorcao.value));
  };

  inputPorcao.addEventListener('input', () => {
    recalcularMacros(parseFloat(inputPorcao.value));
  });

  modalAdicionarAlimento.addEventListener("hidden.bs.modal", () => {
    document.getElementById("formAdicionarAlimento").reset();
    
    tomSelect.clear();

    inputNome.value = '';
    inputCalorias.value = '';
    inputProteinas.value = '';
    inputCarboidratos.value = '';
    inputGorduras.value = '';

    tipoPorcao.textContent = 'g';

    macrosOriginais = {
      calorias: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0
    };
  });

  const tomSelect = new TomSelect(buscaAlimento, {
    valueField: "id",
    labelField: "nome",
    searchField: "nome",
    load: function (query, callback) {
      if (!query.length) return callback();
      fetch(`/buscar-alimentos?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(json => {
          callback(json.map(item => ({
            id: item.id,
            nome: item.nome,
            calorias: item.calorias,
            proteinas: item.proteinas,
            carboidratos: item.carboidratos,
            gorduras: item.gorduras,
            tipo_porcao: item.tipo_porcao
          })));
        })
        .catch(() => callback());
    },
    render: {
      option: function (item, escape) {
        return `<div>${escape(item.nome || "")}</div>`;
      }
    },
    onChange: function (value) {
      if (!value) return;
      const item = this.options[value];
      if (!item) return;

      inputNome.value = item.nome || '';
      inputCalorias.value = `${formatarNumero(item.calorias || 0)} kcal`;
      inputProteinas.value = `${formatarNumero(item.proteinas || 0)} g`;
      inputCarboidratos.value = `${formatarNumero(item.carboidratos || 0)} g`;
      inputGorduras.value = `${formatarNumero(item.gorduras || 0)} g`;
      tipoPorcao.textContent = item.tipo_porcao || "g";
      atualizarMacrosOriginais();

      if (window.setAlimentoSelecionado) {
        window.setAlimentoSelecionado(item);
      }
    }
  });
});