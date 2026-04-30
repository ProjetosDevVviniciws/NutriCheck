import pandas as pd
from sqlalchemy import text
from src.nutri_app.database import engine

def importar_alimentos_csv(caminho_csv):
    chunks = pd.read_csv(
        caminho_csv,
        sep="\t",
        chunksize=10000,
        low_memory=False
    )
    
    with engine.begin() as conn:
        for chunk in chunks:
            chunk.columns = chunk.columns.str.replace("-", "_")

            for row in chunk.itertuples():

                countries = str(getattr(row, "countries_tags", ""))
                if "en:brazil" not in countries:
                    continue
                
                nome_raw = getattr(row, "product_name", "")

                if pd.isna(nome_raw):
                    continue

                nome = str(nome_raw).strip()
                
                calorias = getattr(row, "energy_kcal_100g", None)
                proteinas = getattr(row, "proteins_100g", None)
                gordura = getattr(row, "fat_100g", None)
                carboidrato = getattr(row, "carbohydrates_100g", None)
                
                if (
                    not nome or
                    pd.isna(calorias) or pd.isna(proteinas) or
                    pd.isna(gordura) or pd.isna(carboidrato) or
                    calorias <= 0 or proteinas < 0 or
                    gordura < 0 or carboidrato < 0
                ):
                    continue
                
                existe = conn.execute(text("""
                    SELECT id FROM catalogo_alimentos WHERE nome = :nome
                    """), {"nome": nome}).fetchone()
                
                if existe:
                    print(f"Produto já existe: {nome}")
                    continue
                
                try:
                    serving_size = getattr(row, "serving_size", None)
                    porcao, tipo = extrair_porcao(serving_size)
                    
                    conn.execute(text("""
                        INSERT INTO catalogo_alimentos (nome, porcao, tipo_porcao, calorias, proteinas, carboidratos, gorduras)
                        VALUES (:nome, :porcao, :tipo_porcao, :calorias, :proteinas, :carboidratos, :gorduras)
                    """), {
                        "nome": nome[:100],
                        "porcao": porcao,
                        "tipo_porcao": tipo,
                        "calorias": calorias,
                        "proteinas": proteinas or 0,
                        "gorduras": gordura or 0,
                        "carboidratos": carboidrato or 0
                    })
                    print(f"Inserido: {nome}")
                    
                except Exception as e:
                    print(f"Erro ao inserir {nome}: {e}")
                    raise
    
    print("\nImportação concluída.")
    
if __name__ == "__main__":
    from pathlib import Path

    BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
    CSV_PATH = BASE_DIR / "data" / "openfoodfacts.csv"
    importar_alimentos_csv(CSV_PATH)
                    