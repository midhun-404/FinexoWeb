from app.core.database import db
from datetime import datetime

class UserModel(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    country = db.Column(db.String(100))
    currency_code = db.Column(db.String(10))
    currency_symbol = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "_id": str(self.id), # Maintain compatibility with frontend expecting _id
            "id": str(self.id),
            "email": self.email,
            "passwordHash": self.password_hash,
            "country": self.country,
            "currencyCode": self.currency_code,
            "currencySymbol": self.currency_symbol,
            "createdAt": self.created_at
        }

    # Helper methods to maintain Interface compatibility with Services
    def create_user(self, email, password_hash, country, currency_code, currency_symbol):
        new_user = UserModel(
            email=email,
            password_hash=password_hash,
            country=country,
            currency_code=currency_code,
            currency_symbol=currency_symbol
        )
        db.session.add(new_user)
        db.session.commit()
        return str(new_user.id)

    def get_by_email(self, email):
        user = UserModel.query.filter_by(email=email).first()
        return user.to_dict() if user else None

    def get_by_id(self, user_id):
        if not user_id: return None
        try:
            user = UserModel.query.get(int(user_id))
            return user.to_dict() if user else None
        except:
            return None

    def update_user(self, user_id, update_data):
        user = UserModel.query.get(int(user_id))
        if user:
            if 'country' in update_data: user.country = update_data['country']
            if 'currencyCode' in update_data: user.currency_code = update_data['currencyCode']
            if 'currencySymbol' in update_data: user.currency_symbol = update_data['currencySymbol']
            db.session.commit()
            return True
        return False

    def update_password(self, user_id, password_hash):
        user = UserModel.query.get(int(user_id))
        if user:
            user.password_hash = password_hash
            db.session.commit()
            return True
        return False
