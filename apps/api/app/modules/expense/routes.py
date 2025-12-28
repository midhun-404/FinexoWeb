from flask import Blueprint, request, jsonify
from app.modules.expense.service import ExpenseService
from app.core.security import decode_access_token
from functools import wraps

expense_bp = Blueprint('expense', __name__)
expense_service = ExpenseService()

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

@expense_bp.route('/', methods=['POST'])
@token_required
def add_expense(current_user_id):
    data = request.get_json()
    response, status = expense_service.add_expense(current_user_id, data)
    return jsonify(response), status

@expense_bp.route('/', methods=['GET'])
@token_required
def get_expenses(current_user_id):
    month = request.args.get('month')
    year = request.args.get('year')
    response, status = expense_service.get_expenses(current_user_id, month, year)
    return jsonify(response), status

@expense_bp.route('/<id>', methods=['PUT'])
@token_required
def update_expense(current_user_id, id):
    data = request.get_json()
    response, status = expense_service.update_expense(current_user_id, id, data)
    return jsonify(response), status

@expense_bp.route('/<id>', methods=['DELETE'])
@token_required
def delete_expense(current_user_id, id):
    response, status = expense_service.delete_expense(current_user_id, id)
    return jsonify(response), status
