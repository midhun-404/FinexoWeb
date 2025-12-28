from app.core.database import db
from datetime import datetime

class IncomeModel(db.Model):
    __tablename__ = 'incomes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # Changed to Integer FK
    amount = db.Column(db.Float, nullable=False)
    source = db.Column(db.String(255), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    is_recurring = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "_id": str(self.id),
            "userId": str(self.user_id),
            "amount": self.amount,
            "source": self.source,
            "date": self.date,
            "isRecurring": self.is_recurring,
            "createdAt": self.created_at
        }

    def create(self, user_id, amount, source, date, is_recurring):
        new_income = IncomeModel(
            user_id=int(user_id),
            amount=float(amount),
            source=source,
            date=datetime.strptime(date, "%Y-%m-%d"),
            is_recurring=is_recurring
        )
        db.session.add(new_income)
        db.session.commit()
        return str(new_income.id)

    def get_by_user(self, user_id, month=None, year=None):
        query = IncomeModel.query.filter_by(user_id=int(user_id))
        
        if month and year:
            # Filter by month/year logic
            # Simplification: Fetch all and filter or use SQL extract
            # using Python for consistency with previous logic which is fine for small scale
            # Ideally: extract('year', IncomeModel.date) == year ...
            # Let's use Python filtering on query results for now or robust range check
            pass # Apply range check below

        incomes = query.order_by(IncomeModel.date.desc()).all()
        results = []
        
        start_date = None
        end_date = None
        if month and year:
             start_date = datetime(int(year), int(month), 1)
             if int(month) == 12:
                end_date = datetime(int(year) + 1, 1, 1)
             else:
                end_date = datetime(int(year), int(month) + 1, 1)

        for income in incomes:
            if start_date and end_date:
                if not (start_date <= income.date < end_date):
                    continue
            results.append(income.to_dict())
            
        return results

    def update(self, income_id, user_id, data):
        income = IncomeModel.query.filter_by(id=income_id, user_id=int(user_id)).first()
        if not income:
            return None
            
        if 'amount' in data:
            income.amount = float(data['amount'])
        if 'source' in data:
            income.source = data['source']
        if 'date' in data:
            income.date = datetime.strptime(data['date'], "%Y-%m-%d")
        if 'isRecurring' in data:
            income.is_recurring = data['isRecurring']
            
        db.session.commit()
        return income.to_dict()

    def delete(self, income_id, user_id):
        income = IncomeModel.query.filter_by(id=income_id, user_id=int(user_id)).first()
        if not income:
            return False
            
        db.session.delete(income)
        db.session.commit()
        return True
