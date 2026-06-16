from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError
from nutri_app.utils.validar_senhas import validar_senha, validar_nova_senha
from src.nutri_app.database import engine
from sqlalchemy import text

class CadastroForm(FlaskForm):
    
    def validate_nome(self, check_user):
        with engine.connect() as coon:
            user = coon.execute(text("SELECT * FROM usuarios WHERE nome = :nome"), {"nome": check_user.data})
            if user.first():
                raise ValidationError("Usuário já existe! Cadastre outro nome de usuário")
            
    def validate_email(self, check_email):
        with engine.connect() as coon:
            email = coon.execute(text("SELECT * FROM usuarios WHERE email = :email"), {"email": check_email.data})
            if email.first():
                raise ValidationError("E-mail já existe! Cadastre outro e-mail")
    
    nome = StringField(label='Nome', validators=[Length(min=2, max=30), DataRequired(message='O nome é obrigatório')])
    email = StringField(label='Email', validators=[Email('Informe um endereço de e-mail válido'), DataRequired(message='O e-mail é obrigatório')])
    senha1 = PasswordField(label='Senha', validators=[DataRequired(message='A senha é obrigatória'), validar_senha])
    senha2 = PasswordField(label='Confirmação da Senha', validators=[EqualTo('senha1', message='As senhas informadas não coincidem'), DataRequired(message='A confirmação da senha é obrigatória')])
    submit = SubmitField(label='Cadastrar')
    
class LoginForm(FlaskForm):
    nome = StringField(label='Nome', validators=[DataRequired(message='O nome é obrigatório')])
    senha = PasswordField(label='Senha', validators=[DataRequired(message='A senha é obrigatória')])
    submit = SubmitField(label='Login')
    
class RecuperarSenhaForm(FlaskForm):
    email = StringField(label='Email', validators=[Email('Informe um endereço de e-mail válido'), DataRequired(message='O e-mail é obrigatório')])
    submit = SubmitField(label='Enviar Token')
    
class RedefinirSenhaForm(FlaskForm):
    senha = PasswordField(label='Nova Senha', validators=[DataRequired(message='A nova senha é obrigatória'), validar_nova_senha])
    submit = SubmitField(label='Atualizar Senha')