from flask import Blueprint, request, jsonify
from app.modules.analytics.service import AnalyticsService
from app.core.security import decode_access_token
from functools import wraps

analytics_bp = Blueprint('analytics', __name__)
analytics_service = AnalyticsService()

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

@analytics_bp.route('/monthly', methods=['GET'])
@token_required
def get_monthly_summary(current_user_id):
    month = request.args.get('month')
    year = request.args.get('year')
    return jsonify(analytics_service.get_monthly_summary(current_user_id, month, year))

@analytics_bp.route('/timeline', methods=['GET'])
@token_required
def get_timeline(current_user_id):
    return jsonify(analytics_service.get_timeline(current_user_id))

@analytics_bp.route('/daily', methods=['GET'])
@token_required
def get_daily_breakdown(current_user_id):
    month = request.args.get('month')
    year = request.args.get('year')
    if not month or not year:
        return jsonify({"error": "Month and Year are required"}), 400
    return jsonify(analytics_service.get_daily_breakdown(current_user_id, month, year))

@analytics_bp.route('/search', methods=['GET'])
@token_required
def search_transactions(current_user_id):
    filters = {
        "month": request.args.get('month'),
        "year": request.args.get('year'),
        "min_amount": request.args.get('min_amount'),
        "max_amount": request.args.get('max_amount'),
        "category": request.args.get('category'),
        "intent": request.args.get('intent'),
        "search_text": request.args.get('q')
    }
    return jsonify(analytics_service.search_transactions(current_user_id, filters))
