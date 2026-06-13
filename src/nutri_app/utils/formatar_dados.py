def formatar_valor_nutricional(valor):
    valor = round(float(valor or 0), 2)

    if valor.is_integer():
        return int(valor)

    return valor

def formatar_dados_nutricionais(dados):
    return {
        chave: formatar_valor_nutricional(valor)
        for chave, valor in dados.items()
    }
    
def formatar_numero(valor):
    valor = round(float(valor or 0), 2)

    if valor.is_integer():
        return int(valor)

    return f"{valor:.2f}".rstrip('0').rstrip('.')