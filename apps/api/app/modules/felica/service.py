import os
import json
from openai import OpenAI
from app.modules.analytics.service import AnalyticsService
from app.models.income import IncomeModel
from app.models.expense import ExpenseModel
from app.core.database import db

class FelicaService:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("FELICA_API_KEY"),
            base_url=os.getenv("FELICA_BASE_URL")
        )
        self.model = os.getenv("FELICA_MODEL")
        self.analytics_service = AnalyticsService()

    def get_dashboard_insight(self, user_id):
        # 1. Get real data
        summary = self.analytics_service.get_monthly_summary(user_id)
        
        # 2. Construct Prompt (READ-ONLY, EXPLAIN-ONLY)
        prompt = f"""
        You are Felica, a personal finance assistant. 
        Analyze this monthly financial summary and provide a brief, encouraging, and factual 2-sentence insight.
        
        Data:
        - Income: {summary['totalIncome']}
        - Expenses: {summary['totalExpense']}
        - Savings: {summary['savings']} ({summary['savingsPercentage']}%)
        - Top Expense Categories: {json.dumps(summary['categoryBreakdown'][:3])}
        
        Current stats are for Month {summary['month']}/{summary['year']}.
        
        Rules:
        - DO NOT give financial advice (e.g., "you should invest").
        - DO NOT predict future (e.g., "you will save more").
        - ONLY explain what happened.
        - Be professional yet friendly.
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150
            )
            return {"insight": response.choices[0].message.content.strip()}
        except Exception as e:
            print(f"Felica Error: {e}")
            return {"insight": "Felica is currently offline. Please check back later."}

    def suggest_categorization(self, note):
        prompt = f"""
        Given the expense description: "{note}", suggest a likely Category and Intent.
        
        Intent options: need, want, emergency, impulse.
        
        Return ONLY valid JSON format:
        {{"category": "string", "intent": "string"}}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100
            )
            content = response.choices[0].message.content.strip()
            # Cleanup markdown if present
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "")
            
            return json.loads(content)
        except Exception as e:
            print(f"Felica Suggestion Error: {e}")

    def chat(self, user_id, message, history=[]):
        # 1. Gather Context
        summary = self.analytics_service.get_monthly_summary(user_id)
        
        # Get last 5 transactions for context
        incomes = IncomeModel.query.filter_by(user_id=user_id).order_by(IncomeModel.date.desc()).limit(3).all()
        expenses = ExpenseModel.query.filter_by(user_id=user_id).order_by(ExpenseModel.date.desc()).limit(3).all()
        
        context_str = f"""
        Current Financial Context (Month {summary['month']}/{summary['year']}):
        - Total Income: {summary['totalIncome']}
        - Total Expenses: {summary['totalExpense']}
        - Savings: {summary['savings']}
        
        Recent Incomes:
        {json.dumps([{ 'amt': i.amount, 'src': i.source, 'date': i.date.strftime('%Y-%m-%d')} for i in incomes])}
        
        Recent Expenses:
        {json.dumps([{ 'amt': e.amount, 'cat': e.category, 'date': e.date.strftime('%Y-%m-%d')} for e in expenses])}
        """

        system_prompt = f"""
        You are Felica, a smart and friendly personal finance assistant.
        You have access to the user's current financial data.
        
        {context_str}
        
        Rules:
        1. Answer questions based on the context provided.
        2. Be concise and conversational.
        3. If you suggest saving, be encouraging.
        4. If asked about data you don't have, admit it politely.
        """

        messages = [{"role": "system", "content": system_prompt}]
        
        # Add history (limit to last 4 turns to save tokens)
        for msg in history[-4:]:
            messages.append({"role": "user" if msg['isUser'] else "assistant", "content": msg['text']})
            
        messages.append({"role": "user", "content": message})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=300
            )
            return {"response": response.choices[0].message.content.strip()}
        except Exception as e:
            print(f"Felica Chat Error: {e}")
            return {"response": "I'm having trouble thinking right now. Please try again."}
