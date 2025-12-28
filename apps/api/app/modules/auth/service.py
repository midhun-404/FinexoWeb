from app.models.user import UserModel
from app.core.security import hash_password, verify_password, create_access_token

class AuthService:
    def __init__(self):
        self.user_model = UserModel()

    def register(self, data):
        email = data.get("email")
        password = data.get("password")
        country = data.get("country")
        currency_code = data.get("currencyCode")
        currency_symbol = data.get("currencySymbol")

        if self.user_model.get_by_email(email):
            return {"error": "User already exists"}, 400

        hashed_pw = hash_password(password)
        user_id = self.user_model.create_user(email, hashed_pw, country, currency_code, currency_symbol)
        
        token = create_access_token(user_id)
        
        return {
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": user_id,
                "email": email,
                "country": country,
                "currencyCode": currency_code,
                "currencySymbol": currency_symbol
            }
        }, 201

    def login(self, data):
        email = data.get("email")
        password = data.get("password")

        user = self.user_model.get_by_email(email)
        if not user or not verify_password(password, user['passwordHash']):
            return {"error": "Invalid credentials"}, 401

        # Since our model wraps get_by_email to return dict with _id, this works
        token = create_access_token(str(user['_id']))

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user['_id']),
                "email": user['email'],
                "country": user['country'],
                "currencyCode": user['currencyCode'],
                "currencySymbol": user['currencySymbol']
            }
        }, 200
