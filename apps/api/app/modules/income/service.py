from app.models.income import IncomeModel

class IncomeService:
    def __init__(self):
        self.income_model = IncomeModel()

    def add_income(self, user_id, data):
        amount = data.get("amount")
        source = data.get("source")
        date = data.get("date")
        is_recurring = data.get("isRecurring", False)

        if not amount or not source or not date:
            return {"error": "Missing required fields"}, 400

        income_id = self.income_model.create(user_id, amount, source, date, is_recurring)
        return {"message": "Income added successfully", "id": income_id}, 201

    def get_incomes(self, user_id, month=None, year=None):
        incomes = self.income_model.get_by_user(user_id, month, year)
        
        # Serialize Dates (Firestore does not use ObjectId for user IDs anymore)
        serialized = []
        for inc in incomes:
            inc["_id"] = str(inc["_id"])
            inc["userId"] = str(inc["userId"])
            inc["date"] = inc["date"].strftime("%Y-%m-%d")
            inc["createdAt"] = inc["createdAt"].isoformat()
            serialized.append(inc)
            
        return serialized, 200

    def update_income(self, user_id, income_id, data):
        updated_income = self.income_model.update(income_id, user_id, data)
        if not updated_income:
             return {"error": "Income not found or unauthorized"}, 404
        
        updated_income["date"] = updated_income["date"].strftime("%Y-%m-%d")
        updated_income["createdAt"] = updated_income["createdAt"].isoformat()

        return {"message": "Income updated successfully", "income": updated_income}, 200

    def delete_income(self, user_id, income_id):
        success = self.income_model.delete(income_id, user_id)
        if not success:
             return {"error": "Income not found or unauthorized"}, 404
        return {"message": "Income deleted successfully"}, 200
