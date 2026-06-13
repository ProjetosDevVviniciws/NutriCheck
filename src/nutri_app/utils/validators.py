import re
from wtforms.validators import ValidationError

def senha_forte(form, field):

    senha = field.data

    regras = [
        (len(senha) >= 6, "A senha deve ter no mínimo 6 caracteres."),
        (re.search(r"[A-Za-zÀ-ÿ]", senha), "A senha deve conter pelo menos uma letra."),
        (re.search(r"\d", senha), "A senha deve conter pelo menos um número.")
    ]

    for regra, mensagem in regras:
        if not regra:
            raise ValidationError(mensagem)