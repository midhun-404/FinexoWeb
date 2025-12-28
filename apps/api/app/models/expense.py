from app.core.database import db
from datetime import datetime

class ExpenseModel(db.Model):
    __tablename__ = 'expenses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    intent = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "_id": str(self.id),
            "userId": str(self.user_id),
            "amount": self.amount,
            "category": self.category,
            "intent": self.intent,
            "date": self.date,
            "note": self.note,
            "createdAt": self.created_at
        }

    def create(self, user_id, amount, category, intent, date, note):
        new_expense = ExpenseModel(
            user_id=int(user_id),
            amount=float(amount),
            category=category,
            intent=intent,
            date=datetime.strptime(date, "%Y-%m-%d"),
            note=note
        )
        db.session.add(new_expense)
        db.session.commit()
        return str(new_expense.id)

    def get_by_user(self, user_id, month=None, year=None):
        query = ExpenseModel.query.filter_by(user_id=int(user_id))
        
        expenses = query.order_by(ExpenseModel.date.desc()).all()
        results = []
        
        start_date = None
        end_date = None
        if month and year:
             start_date = datetime(int(year), int(month), 1)
             if int(month) == 12:
                end_date = datetime(int(year) + 1, 1, 1)
             else:
                end_date = datetime(int(year), int(month) + 1, 1)

        for expense in expenses:
             if start_date and end_date:
                if not (start_date <= expense.date < end_date):
                    continue
             results.append(expense.to_dict())
            
        return results

    def update(self, expense_id, user_id, data):
        expense = ExpenseModel.query.filter_by(id=expense_id, user_id=int(user_id)).first()
        if not expense:
            return None
            
        if 'amount' in data:
            expense.amount = float(data['amount'])
        if 'category' in data:
            expense.category = data['category']
        if 'intent' in data:
            expense.intent = data['intent']
        if 'date' in data:
            expense.date = datetime.strptime(data['date'], "%Y-%m-%d")
        if 'note' in data:
            expense.note = data['note']
            
        db.session.commit()
        return expense.to_dict()

    def delete(self, expense_id, user_id):
        expense = ExpenseModel.query.filter_by(id=expense_id, user_id=int(user_id)).first()
        if not expense:
            return False
            
        db.session.delete(expense)
        db.session.commit()
        return True
