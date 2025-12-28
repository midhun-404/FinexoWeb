from app.models.user import UserModel
from app.core.security import hash_password, verify_password

class UserService:
    def __init__(self):
        self.user_model = UserModel()

    def get_profile(self, user_id):
        user = self.user_model.get_by_id(user_id)
        if not user:
            return None, 404
        
        return {
            "id": str(user['_id']),
            "email": user['email'],
            "country": user.get('country', ''),
            "currencyCode": user.get('currencyCode', ''),
            "currencySymbol": user.get('currencySymbol', ''),
            "createdAt": user.get('createdAt', '')
        }, 200

    def update_profile(self, user_id, data):
        user = self.user_model.get_by_id(user_id)
        if not user:
            return {"error": "User not found"}, 404

        update_data = {}
        if "country" in data:
            update_data["country"] = data["country"]
        if "currencyCode" in data:
            update_data["currencyCode"] = data["currencyCode"]
        if "currencySymbol" in data:
            update_data["currencySymbol"] = data["currencySymbol"]

        self.user_model.update_user(user_id, update_data)
        
        # Return updated profile
        return self.get_profile(user_id)

    def change_password(self, user_id, data):
        current_password = data.get("currentPassword")
        new_password = data.get("newPassword")

        user = self.user_model.get_by_id(user_id)
        if not user:
            return {"error": "User not found"}, 404

        if not verify_password(current_password, user['passwordHash']):
            return {"error": "Incorrect current password"}, 400

        new_hash = hash_password(new_password)
        self.user_model.update_password(user_id, new_hash)

        return {"message": "Password updated successfully"}, 200
