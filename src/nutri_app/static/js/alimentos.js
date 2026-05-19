document.addEventListener("DOMContentLoaded", () => {
  const nomeBuscaInput = document.getElementById('buscaAlimento');
  const nomeInput = document.getElementById('nome');
  const porcaoInput = document.querySelector('input[name="porcao"]');
  const caloriasInput = document.getElementById('calorias');
  const proteinasInput = document.getElementById('proteinas');
  const carboidratosInput = document.getElementById('carboidratos');
  const gordurasInput = document.getElementById('gorduras');
  const tipoPorcaoInput = document.getElementById('unidadePorcao');

  let originalMacros = {
    calorias: 0,
    proteinas: 0,
    carboidratos: 0,
    gorduras: 0
  };

  function safeNumber(value) {
    let num = parseFloat(value)
    return isNaN(num) ? 0 : num;
  }

  function recalcularMacros(porcao) {
    porcao = safeNumber(porcao)
    if (porcao > 0) {
      caloriasInput.value = `${formatarNumero((porcao / 100) * originalMacros.calorias)} kcal`;
      proteinasInput.value = `${formatarNumero((porcao / 100) * originalMacros.proteinas)} g`;
      carboidratosInput.value = `${formatarNumero((porcao / 100) * originalMacros.carboidratos)} g`;
      gordurasInput.value = `${formatarNumero((porcao / 100) * originalMacros.gorduras)} g`;
    } else {
      caloriasInput.value = proteinasInput.value = carboidratosInput.value = gordurasInput.value = '';
    }
  }

  function formatarNumero(valor) {
    return parseFloat(valor)
      .toFixed(2)
      .replace(/\.00$/, '')
      .replace(/(\.\d)0$/, '$1');
  }

  window.atualizarMacrosOriginais = function () {
    originalMacros.calorias = safeNumber(caloriasInput.value) || 0;
    originalMacros.proteinas = safeNumber(proteinasInput.value) || 0;
    originalMacros.carboidratos = safeNumber(carboidratosInput.value) || 0;
    originalMacros.gorduras = safeNumber(gordurasInput.value) || 0;
    recalcularMacros(parseFloat(porcaoInput.value));
  };

  porcaoInput.addEventListener('input', () => {
    recalcularMacros(parseFloat(porcaoInput.value));
  });

  new TomSelect(nomeBuscaInput, {
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

      nomeInput.value = item.nome || '';
      caloriasInput.value = `${formatarNumero(item.calorias || 0)} kcal`;
      proteinasInput.value = `${formatarNumero(item.proteinas || 0)} g`;
      carboidratosInput.value = `${formatarNumero(item.carboidratos || 0)} g`;
      gordurasInput.value = `${formatarNumero(item.gorduras || 0)} g`;
      tipoPorcaoInput.textContent = item.tipo_porcao || "g";
      atualizarMacrosOriginais();

      if (window.setAlimentoSelecionado) {
        window.setAlimentoSelecionado(item);
      }
    }
  });
});