from flask_wtf import FlaskForm
from wtforms import PasswordField, SubmitField
from wtforms.validators import DataRequired
from nutri_app.utils.validar_senhas import validar_nova_senha

class RedefinirSenhaForm(FlaskForm):
    senha = PasswordField(label='Nova Senha', validators=[DataRequired(message='A nova senha é obrigatória'), validar_nova_senha])
    submit = SubmitField(label='Atualizar Senha')