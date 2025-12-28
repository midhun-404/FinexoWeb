from flask import Blueprint, request, jsonify
from app.modules.auth.service import AuthService
from app.core.security import decode_access_token
from functools import wraps

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        payload = decode_access_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
            
        return f(payload['sub'], *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    response, status = auth_service.register(data)
    return jsonify(response), status

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    response, status = auth_service.login(data)
    return jsonify(response), status
