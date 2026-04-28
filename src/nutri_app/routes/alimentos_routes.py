from flask import Blueprint, request, jsonify
from flask_login import login_required
from sqlalchemy import text
from src.nutri_app.database import engine

alimentos_bp = Blueprint('alimentos', __name__)

@alimentos_bp.route("/buscar-alimentos")
@login_required
def buscar_alimentos():
    termo = request.args.get('q', '').strip()
    if not termo:
        return jsonify([])

    with engine.connect() as conn:
        result_catalogo = conn.execute(text("""
            SELECT id, nome, calorias, proteinas, carboidratos, gorduras
            FROM catalogo_alimentos
            WHERE nome LIKE :termo
        """), {"termo": f"%{termo}%"}).mappings().all()

    alimentos = []
    for row in result_catalogo:
        alimentos.append({
            "id": row.get("id"),
            "nome": row.get("nome") or "",
            "calorias": float(row.get("calorias") or 0),
            "proteinas": float(row.get("proteinas") or 0),
            "carboidratos": float(row.get("carboidratos") or 0),
            "gorduras": float(row.get("gorduras") or 0)
        })

    return jsonify(alimentos)




