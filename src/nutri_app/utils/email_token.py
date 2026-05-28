from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from flask import current_app
import uuid

def gerar_token(email):
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    
    payload = {
        "email": email,
        "uuid": str(uuid.uuid4())
    }

    return s.dumps(payload, salt='reset-senha')

def validar_token(token, max_age=1800):
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    
    try:
        data = s.loads(token, salt='reset-senha', max_age=max_age)
        return data["email"]
    
    except (BadSignature, SignatureExpired):
        return None