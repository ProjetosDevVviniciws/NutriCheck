from flask import Blueprint, render_template, redirect, url_for, flash
from src.nutri_app.database import engine
from src.nutri_app.forms.auth_forms import RedefinirSenhaForm
from nutri_app.utils.email_token import validar_token
from src.nutri_app.utils.hash import gerar_hash
from sqlalchemy import text

redefinir_senha_bp = Blueprint('redefinir_senha', __name__)

@redefinir_senha_bp.route("/redefinir-senha/<token>", methods=["GET", "POST"])
def redefinir_senha(token):
    form = RedefinirSenhaForm()
    email = validar_token(token)

    if not email:
        flash("Token inválido ou expirado", "danger")
        return redirect(url_for("login.login"))

    with engine.connect() as conn:

        user = conn.execute(text("""
            SELECT *
            FROM usuarios
            WHERE email = :email
        """), {
            "email": email
        }).mappings().first()

    if not user:
        flash("Usuário não encontrado", "danger")
        return redirect(url_for("login.login"))

    if not user["reset_token"]:
        flash(
            "Este link de recuperação já foi utilizado",
            "info"
        )
        return redirect(url_for("login.login"))

    if user["reset_token"] != token:
        flash("Link inválido", "danger")
        return redirect(url_for("login.login"))
    
    if form.validate_on_submit():
        nova_senha = form.senha.data
        senha_hash = gerar_hash(nova_senha)

        with engine.begin() as conn:
            conn.execute(text("""
                UPDATE usuarios
                SET senha = :senha,
                reset_token = NULL
                WHERE email = :email
            """), {
                "senha": senha_hash,
                "email": email
            })

        flash("Senha atualizada com sucesso!", "info")
        return redirect(url_for("login.login"))

    if form.errors != {}:
        for errors in form.errors.values():
            for err in errors:
                flash(f"Erro ao atualizar senha: {err}", category="danger")
            return redirect(url_for("redefinir_senha.redefinir_senha", token=token))
    
    return render_template("pages/redefinir_senha.html", form=form)