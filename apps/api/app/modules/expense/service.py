from app.models.expense import ExpenseModel

class ExpenseService:
    def __init__(self):
        self.expense_model = ExpenseModel()

    def add_expense(self, user_id, data):
        amount = data.get("amount")
        category = data.get("category")
        intent = data.get("intent")
        date = data.get("date")
        note = data.get("note", "")

        if not amount or not category or not intent or not date:
            return {"error": "Missing required fields"}, 400

        # Validate intent
        valid_intents = ["need", "want", "emergency", "impulse"]
        if intent not in valid_intents:
             return {"error": f"Invalid intent. Must be one of {valid_intents}"}, 400

        expense_id = self.expense_model.create(user_id, amount, category, intent, date, note)
        return {"message": "Expense added successfully", "id": expense_id}, 201

    def get_expenses(self, user_id, month=None, year=None):
        expenses = self.expense_model.get_by_user(user_id, month, year)
        
        serialized = []
        for exp in expenses:
            exp["_id"] = str(exp["_id"])
            exp["userId"] = str(exp["userId"])
            exp["date"] = exp["date"].strftime("%Y-%m-%d")
            exp["createdAt"] = exp["createdAt"].isoformat()
            serialized.append(exp)
            
        return serialized, 200

    def update_expense(self, user_id, expense_id, data):
        if 'intent' in data:
            valid_intents = ["need", "want", "emergency", "impulse"]
            if data['intent'] not in valid_intents:
                 return {"error": f"Invalid intent. Must be one of {valid_intents}"}, 400

        updated_expense = self.expense_model.update(expense_id, user_id, data)
        if not updated_expense:
             return {"error": "Expense not found or unauthorized"}, 404
        
        # Serialize specific fields if needed, but to_dict handles most
        # We just need to ensure date formatting if the frontend expects string
        updated_expense["date"] = updated_expense["date"].strftime("%Y-%m-%d")
        updated_expense["createdAt"] = updated_expense["createdAt"].isoformat()

        return {"message": "Expense updated successfully", "expense": updated_expense}, 200

    def delete_expense(self, user_id, expense_id):
        success = self.expense_model.delete(expense_id, user_id)
        if not success:
             return {"error": "Expense not found or unauthorized"}, 404
        return {"message": "Expense deleted successfully"}, 200
