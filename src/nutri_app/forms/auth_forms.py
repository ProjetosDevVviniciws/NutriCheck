from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length, Length, EqualTo, ValidationError
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
    
    nome = StringField(label='Nome', validators=[Length(min=2, max=30), DataRequired()])
    email = StringField(label='Email', validators=[Email(), DataRequired()])
    senha1 = PasswordField(label='Senha', validators=[Length(min=6), DataRequired()])
    senha2 = PasswordField(label='Confirmação da Senha', validators=[EqualTo('senha1', message='As senhas informadas não coincidem'), DataRequired()])
    submit = SubmitField(label='Cadastrar')
    
class LoginForm(FlaskForm):
    nome = StringField(label='Nome', validators=[DataRequired()])
    senha = PasswordField(label='Senha', validators=[DataRequired()])
    submit = SubmitField(label='Login')
    
class RecuperarSenhaForm(FlaskForm):
    email = StringField(label='Email', validators=[Email(), DataRequired()])
    submit = SubmitField(label='Enviar Token')
    
class RedefinirSenhaForm(FlaskForm):
    senha = PasswordField(label='Nova Senha', validators=[Length(min=6), DataRequired()])
    submit = SubmitField(label='Atualizar Senha')