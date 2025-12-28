from flask import Blueprint, request, jsonify
from app.modules.felica.service import FelicaService
from app.core.security import decode_access_token
from functools import wraps

felica_bp = Blueprint('felica', __name__)
felica_service = FelicaService()

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

@felica_bp.route('/insight', methods=['GET'])
@token_required
def get_insight(current_user_id):
    response = felica_service.get_dashboard_insight(current_user_id)
    return jsonify(response), 200

@felica_bp.route('/suggest', methods=['POST'])
@token_required
def suggest(current_user_id):
    data = request.get_json()
    note = data.get('note', '')
    response = felica_service.suggest_categorization(note)
    return jsonify(response), 200

@felica_bp.route('/chat', methods=['POST'])
@token_required
def chat(current_user_id):
    data = request.get_json()
    message = data.get('message', '')
    history = data.get('history', [])
    response = felica_service.chat(current_user_id, message, history)
    return jsonify(response), 200
