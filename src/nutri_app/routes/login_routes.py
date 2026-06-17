from flask import Blueprint, render_template, redirect, url_for, flash
from src.nutri_app.database import engine
from src.nutri_app.utils.hash import verificar_senha
from nutri_app.utils.usuario import Usario
from nutri_app.forms.login_forms import LoginForm
from sqlalchemy import text
from flask_login import login_user

login_bp = Blueprint('login', __name__)

@login_bp.route("/login", methods=['GET', 'POST'])
def login():
    forms = LoginForm()
    if forms.validate_on_submit():
        nome = forms.nome.data
        senha = forms.senha.data
        
        with engine.connect() as conn:
            query = (text("SELECT * FROM usuarios WHERE nome = :nome"))
            result = conn.execute(query, {"nome": nome}).fetchone()
            
        if result:
            if verificar_senha(result.senha, senha):
                user = Usario(result)
                login_user(user)
                flash(f"Sucesso! Bem-Vindo(a), {result.nome}", category="info")
                return redirect(url_for('home.home'))
            else:
                flash("Nome ou senha estão incorretos! Tente novamente", category="danger")
                return redirect(url_for('login.login'))
                
    return render_template("pages/login.html", form=forms)