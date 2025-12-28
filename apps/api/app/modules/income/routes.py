from flask import Blueprint, request, jsonify
from app.modules.income.service import IncomeService
from app.core.security import decode_access_token
from functools import wraps

income_bp = Blueprint('income', __name__)
income_service = IncomeService()

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

@income_bp.route('/', methods=['POST'])
@token_required
def add_income(current_user_id):
    data = request.get_json()
    response, status = income_service.add_income(current_user_id, data)
    return jsonify(response), status

@income_bp.route('/', methods=['GET'])
@token_required
def get_incomes(current_user_id):
    month = request.args.get('month')
    year = request.args.get('year')
    response, status = income_service.get_incomes(current_user_id, month, year)
    return jsonify(response), status

@income_bp.route('/<id>', methods=['PUT'])
@token_required
def update_income(current_user_id, id):
    data = request.get_json()
    response, status = income_service.update_income(current_user_id, id, data)
    return jsonify(response), status

@income_bp.route('/<id>', methods=['DELETE'])
@token_required
def delete_income(current_user_id, id):
    response, status = income_service.delete_income(current_user_id, id)
    return jsonify(response), status
