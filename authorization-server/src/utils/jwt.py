import jwt
import uuid
from datetime import datetime, timezone

from src.services.dbService import dbService
from src.config.serverConfig import JWT_KEY

def edcode_token(type_token: str, lifetime: int, user_data: dict, query_id: str) -> str:
    current_timestamp = int(datetime.now(tz=timezone.utc).timestamp())
    data = dict(
        iss = 'AxiuraLeocephala',
        type = type_token,
        user = user_data,
        iat = current_timestamp,
        nbf = current_timestamp,
        exp = current_timestamp + lifetime,
        qi = query_id,
        jti = str(uuid.uuid4())
    )
    
    try:
        dbService.set_jwt_whitelist("JTI, UserId, EXP", f"'{data["jti"]}', '{data["user"]["id"]}', {data["exp"]}")
    except Exception as e: raise e
    
    return jwt.encode(payload=data, key=JWT_KEY, algorithm='HS256')

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            jwt=token,
            key=JWT_KEY,
            algorithms='HS256', 
            options={
                "verify_signature": True, 
                "require": ["iss", "type", "user", "iat", "nbf", "exp", "jti"],
                "iss": "verify_signature",
                "verify_exp": "verify_signature",
                "verify_iat": "verify_signature",
                "verify_nbf": "verify_signature"
            }
        )
        
        if payload['type'] == "refresh":
            res = dbService.get_jwt_blacklist(f"WHERE JTI='{payload["jti"]}'")
            if res is None:
                dbService.set_jwt_blacklist(f"WHERE JTI='{payload["jti"]}'")
                dbService.delete_jwt_whitelist(f"WHERE JTI='{payload["jti"]}'")
                return payload
            else: raise ValueError
        else: raise ValueError

    except Exception as e: raise e
