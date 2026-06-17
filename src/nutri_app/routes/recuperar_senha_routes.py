from flask import Blueprint, render_template, redirect, url_for, flash
from src.nutri_app.database import engine
from src.nutri_app.forms.auth_forms import RecuperarSenhaForm
from nutri_app.utils.email_token import gerar_token
from nutri_app.utils.servico_email import enviar_email_reset
from sqlalchemy import text
from flask import request

recuperar_senha_bp = Blueprint('recuperar_senha', __name__)

@recuperar_senha_bp.route("/recuperar-senha", methods=["GET", "POST"])
def recuperar_senha():
    form = RecuperarSenhaForm()
    if form.validate_on_submit():
        email = form.email.data

        with engine.connect() as conn:
            user = conn.execute(text("""
                SELECT * FROM usuarios WHERE email = :email
            """), {"email": email}).mappings().first()

        if user:
            token = gerar_token(email)
            with engine.begin() as conn:
                conn.execute(text("""
                    UPDATE usuarios
                    SET 
                        reset_token = :token
                    WHERE email = :email
                """), {
                    "token": token,
                    "email": email
                })
                
            link = url_for("redefinir_senha.redefinir_senha", token=token, _external=True)

            enviar_email_reset(user["email"], link, user["nome"])

        flash("Se o email existir, um link de recuperação será enviado", "info")
        return redirect(url_for("login.login"))
    
    if request.method == "POST" and form.errors:
        flash(form.email.errors[0], "danger")
        return redirect(url_for("recuperar_senha.recuperar_senha"))

    return render_template("pages/recuperar_senha.html", form=form)