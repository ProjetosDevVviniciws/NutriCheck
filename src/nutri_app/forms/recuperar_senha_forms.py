from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired, Email

class RecuperarSenhaForm(FlaskForm):
    email = StringField(label='Email', validators=[Email('Informe um endereço de e-mail válido'), DataRequired(message='O e-mail é obrigatório')])
    submit = SubmitField(label='Enviar Token')