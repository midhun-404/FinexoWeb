from flask import Blueprint, request, jsonify
from app.modules.user.service import UserService
from app.modules.auth.routes import token_required

user_bp = Blueprint('user', __name__)
user_service = UserService()

@user_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user_id):
    response, status = user_service.get_profile(current_user_id)
    return jsonify(response), status

@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user_id):
    data = request.get_json()
    response, status = user_service.update_profile(current_user_id, data)
    return jsonify(response), status

@user_bp.route('/password', methods=['PUT'])
@token_required
def change_password(current_user_id):
    data = request.get_json()
    response, status = user_service.change_password(current_user_id, data)
    return jsonify(response), status
