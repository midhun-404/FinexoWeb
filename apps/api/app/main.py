from flask import Flask, request
from flask_cors import CORS
from app.core.config import Config
from app.core.database import init_db
from app.modules.auth.routes import auth_bp
from app.modules.income.routes import income_bp
from app.modules.expense.routes import expense_bp
from app.modules.analytics.routes import analytics_bp
from app.modules.felica.routes import felica_bp
from app.modules.user.routes import user_bp

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.errorhandler(500)
def internal_error(error):
    response = {
        "error": "Internal Server Error",
        "message": str(error)
    }
    return response, 500

@app.before_request
def log_request():
    print(f"Request: {request.method} {request.path}")

init_db(app)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(income_bp, url_prefix='/api/income')
app.register_blueprint(expense_bp, url_prefix='/api/expense')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(felica_bp, url_prefix='/api/felica')
app.register_blueprint(user_bp, url_prefix='/api/user')

@app.route("/")
def health_check():
    return {"status": "ok", "service": "Finexo API"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
