from flask import Blueprint, render_template, redirect, url_for, flash
from nutri_app.forms.cadastro_forms import CadastroForm
from src.nutri_app.database import engine
from src.nutri_app.utils.hash import gerar_hash
from sqlalchemy import text
from flask import request

cadastro_bp = Blueprint('cadastro', __name__)

@cadastro_bp.route("/cadastro", methods=['GET', 'POST'])
def cadastro():
    forms = CadastroForm()
    if forms.validate_on_submit():
        nome = forms.nome.data
        email = forms.email.data
        senha_hash = gerar_hash(forms.senha1.data)
        
        with engine.connect() as conn:
            query = text("INSERT INTO usuarios (nome, email, senha) VALUES (:nome, :email, :senha)")
            conn.execute(query, {"nome": nome, "email": email, "senha": senha_hash})
            conn.commit()   
            flash("Cadastro realizado com sucesso!", category="info")
            return redirect(url_for('login.login'))
        
    if request.method == 'POST' and forms.errors != {}:
        for errors in forms.errors.values():
            for err in errors:
                flash(f"{err}", category="danger")
        return redirect(url_for("cadastro.cadastro"))
        
    return render_template("pages/cadastro.html", form=forms)
                    