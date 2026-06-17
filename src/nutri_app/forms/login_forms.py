from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired

class LoginForm(FlaskForm):
    nome = StringField(label='Nome', validators=[DataRequired(message='O nome é obrigatório')])
    senha = PasswordField(label='Senha', validators=[DataRequired(message='A senha é obrigatória')])
    submit = SubmitField(label='Login')