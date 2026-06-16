from flask import Blueprint, redirect, url_for, flash
from flask_login import login_required, logout_user

logout_bp = Blueprint('logout', __name__)

@logout_bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Você fez o logout", category="info")
    return redirect(url_for('home.home'))