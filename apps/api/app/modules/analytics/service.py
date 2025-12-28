from app.core.database import db
from app.models.income import IncomeModel
from app.models.expense import ExpenseModel
from datetime import datetime
import calendar

class AnalyticsService:
    def __init__(self):
        pass

    def get_monthly_summary(self, user_id, month=None, year=None):
        if not month or not year:
            now = datetime.now()
            month = now.month
            year = now.year

        start_date = datetime(int(year), int(month), 1)
        _, last_day = calendar.monthrange(int(year), int(month))
        end_date = datetime(int(year), int(month), last_day, 23, 59, 59)

        # Helper method to get data
        # We can implement specific queries in Models or just do ad-hoc queries here
        # For simplicity, let's reuse the get_by_user logic but simpler
        incomes = IncomeModel.query.filter(
            IncomeModel.user_id == user_id, 
            IncomeModel.date >= start_date, 
            IncomeModel.date <= end_date
        ).all()
        
        expenses = ExpenseModel.query.filter(
            ExpenseModel.user_id == user_id, 
            ExpenseModel.date >= start_date, 
            ExpenseModel.date <= end_date
        ).all()

        # 1. Total Income
        total_income = sum(item.amount for item in incomes)

        # 2. Total Expense
        total_expense = sum(item.amount for item in expenses)

        # 3. Savings
        savings = total_income - total_expense
        savings_percentage = (savings / total_income * 100) if total_income > 0 else 0

        # 4. Category Breakdown
        category_map = {}
        for item in expenses:
            cat = item.category
            category_map[cat] = category_map.get(cat, 0) + item.amount
        
        category_breakdown = [{"category": k, "amount": v} for k, v in category_map.items()]
        category_breakdown.sort(key=lambda x: x['amount'], reverse=True)

        # 5. Intent Breakdown & Impulse Calculation
        intent_map = {}
        total_impulse_expense = 0
        for item in expenses:
            intent = item.intent
            intent_map[intent] = intent_map.get(intent, 0) + item.amount
            if intent == 'impulse':
                total_impulse_expense += item.amount
        
        intent_breakdown = [{"intent": k, "amount": v} for k, v in intent_map.items()]
        intent_breakdown.sort(key=lambda x: x['amount'], reverse=True)

        # 6. Financial Health Score Calculation
        # A. Savings Score (Max 40 pts): 2 pts for every 1% savings
        savings_score = min(savings_percentage * 2, 40) if savings_percentage > 0 else 0
        
        # B. Impulse Control Score (Max 40 pts): Start 40, deduct 2 pts for every 1% impulse
        impulse_percentage = (total_impulse_expense / total_expense * 100) if total_expense > 0 else 0
        impulse_score = max(40 - (impulse_percentage * 2), 0)

        # C. Cash Flow Score (Max 20 pts): 20 pts if Income > Expense
        cash_flow_score = 20 if total_income > total_expense else 0

        health_score = round(savings_score + impulse_score + cash_flow_score)

        # 7. Smart Highlights Generation
        highlights = []
        
        # A. Critical Warnings
        if total_expense > total_income and total_income > 0:
            deficit = total_expense - total_income
            highlights.append(f"Warning: Expenses exceed Income by ${deficit:.2f}")
        
        if impulse_percentage > 25:
            highlights.append(f"Be careful! {impulse_percentage:.1f}% of spending was on Impulse items.")
            
        if savings_percentage < 5 and total_income > 0:
            highlights.append("Savings rate is critically low (< 5%). Try to cut non-essential costs.")

        # B. Achievements
        if savings_percentage >= 20:
            highlights.append(f"Great job! You saved {savings_percentage:.1f}% of your income this month.")
        
        if impulse_percentage == 0 and total_expense > 0:
            highlights.append("Outstanding control! No impulse spending recorded this month.")
            
        # Hide health score if no data
        if total_income == 0 and total_expense == 0:
            health_score = None
        elif health_score >= 80:
             highlights.append("Your Financial Health Score is excellent! Keep it up.")

        # C. Observations
        if category_breakdown:
            top_cat = category_breakdown[0]
            highlights.append(f"Highest spending category: {top_cat['category']} (${top_cat['amount']:.2f})")

        # 8. Month-Over-Month Comparison
        prev_month = int(month) - 1
        prev_year = int(year)
        if prev_month == 0:
            prev_month = 12
            prev_year -= 1
            
        prev_start = datetime(prev_year, prev_month, 1)
        _, prev_last_day = calendar.monthrange(prev_year, prev_month)
        prev_end = datetime(prev_year, prev_month, prev_last_day, 23, 59, 59)
        
        # Helper to get totals for a range (simplified reuse)
        def get_totals(s, e):
            inc = db.session.query(db.func.sum(IncomeModel.amount)).filter(
                IncomeModel.user_id == user_id, IncomeModel.date >= s, IncomeModel.date <= e
            ).scalar() or 0
            exp = db.session.query(db.func.sum(ExpenseModel.amount)).filter(
                ExpenseModel.user_id == user_id, ExpenseModel.date >= s, ExpenseModel.date <= e
            ).scalar() or 0
            return inc, exp

        prev_income, prev_expense = get_totals(prev_start, prev_end)
        prev_savings = prev_income - prev_expense

        def calc_pct_change(current, previous):
            if previous == 0: return 0 if current == 0 else 100
            return ((current - previous) / previous) * 100

        income_change_pct = calc_pct_change(total_income, prev_income)
        expense_change_pct = calc_pct_change(total_expense, prev_expense)
        savings_change_pct = calc_pct_change(savings, prev_savings)

        return {
            "month": int(month),
            "year": int(year),
            "totalIncome": total_income,
            "totalExpense": total_expense,
            "savings": savings,
            "savingsPercentage": round(savings_percentage, 2),
            "categoryBreakdown": category_breakdown,
            "intentBreakdown": intent_breakdown,
            "healthScore": health_score,
            "healthScoreDetails": {
                "savingsScore": round(savings_score, 1),
                "impulseScore": round(impulse_score, 1),
                "cashFlowScore": cash_flow_score,
                "impulsePercentage": round(impulse_percentage, 1)
            },
            "highlights": highlights,
            "comparison": {
                "incomeChangePercentage": round(income_change_pct, 1),
                "expenseChangePercentage": round(expense_change_pct, 1),
                "savingsChangePercentage": round(savings_change_pct, 1)
            }
        }

    def get_timeline(self, user_id):
        # Last 6 months
        # We fetch all data for user and aggregate in python (easiest migration path)
        # Optimized: query last 6 months range strictly
        
        # Calculate start date (approx 6 months ago)
        # simplified: just get all and filter
        
        incomes = IncomeModel.query.filter_by(user_id=user_id).all()
        expenses = ExpenseModel.query.filter_by(user_id=user_id).all()
        
        timeline_map = {}
        
        def process_items(items, type_key):
             for item in items:
                d = item.date
                key = f"{d.year}-{d.month:02d}"
                if key not in timeline_map: timeline_map[key] = {"date": key, "income": 0, "expense": 0}
                timeline_map[key][type_key] += item.amount

        process_items(incomes, 'income')
        process_items(expenses, 'expense')

        # Sort and return list
        timeline = sorted(timeline_map.values(), key=lambda x: x['date'], reverse=True) # Recent first
        return timeline[:6][::-1] # Last 6 items, chronological

    def get_daily_breakdown(self, user_id, month, year):
        start_date = datetime(int(year), int(month), 1)
        _, last_day = calendar.monthrange(int(year), int(month))
        end_date = datetime(int(year), int(month), last_day, 23, 59, 59)

        incomes = IncomeModel.query.filter(
            IncomeModel.user_id == user_id, IncomeModel.date >= start_date, IncomeModel.date <= end_date
        ).all()
        
        expenses = ExpenseModel.query.filter(
            ExpenseModel.user_id == user_id, ExpenseModel.date >= start_date, ExpenseModel.date <= end_date
        ).all()

        daily_map = {}
        # Initialize all days
        for day in range(1, last_day + 1):
            daily_map[day] = {"day": day, "income": 0, "expense": 0, "balance": 0}

        for item in incomes:
            daily_map[item.date.day]["income"] += item.amount

        for item in expenses:
            daily_map[item.date.day]["expense"] += item.amount
            
        # Calculate daily balance (net flow for the day)
        result = []
        cumulative_balance = 0 # To verify if we want cumulative or just daily net
        # Let's do daily net for now, visualization can handle cumulative if needed, but often "Daily Flow" implies daily net.
        # Actually, "Cash Burn" is better visualized with cumulative. Let's provide both.
        
        sorted_days = sorted(daily_map.keys())
        for day in sorted_days:
            data = daily_map[day]
            net = data["income"] - data["expense"]
            cumulative_balance += net
            data["balance"] = cumulative_balance
            result.append(data)
            
        return result

    def search_transactions(self, user_id, filters):
        # Filters: start_date, end_date, min_amount, max_amount, category, intent, search_text
        
        query_inc = IncomeModel.query.filter(IncomeModel.user_id == user_id)
        query_exp = ExpenseModel.query.filter(ExpenseModel.user_id == user_id)

        if filters.get('month') and filters.get('year'):
             s = datetime(int(filters['year']), int(filters['month']), 1)
             _, ld = calendar.monthrange(int(filters['year']), int(filters['month']))
             e = datetime(int(filters['year']), int(filters['month']), ld, 23, 59, 59)
             query_inc = query_inc.filter(IncomeModel.date >= s, IncomeModel.date <= e)
             query_exp = query_exp.filter(ExpenseModel.date >= s, ExpenseModel.date <= e)

        if filters.get('min_amount'):
            query_inc = query_inc.filter(IncomeModel.amount >= float(filters['min_amount']))
            query_exp = query_exp.filter(ExpenseModel.amount >= float(filters['min_amount']))
            
        if filters.get('max_amount'):
            query_inc = query_inc.filter(IncomeModel.amount <= float(filters['max_amount']))
            query_exp = query_exp.filter(ExpenseModel.amount <= float(filters['max_amount']))
            
        if filters.get('search_text'):
            text = f"%{filters['search_text']}%"
            # Incomes have source/description, Expenses have category/note/description
            query_inc = query_inc.filter(db.or_(IncomeModel.source.ilike(text), IncomeModel.description.ilike(text)))
            query_exp = query_exp.filter(db.or_(ExpenseModel.category.ilike(text), ExpenseModel.note.ilike(text), ExpenseModel.description.ilike(text)))

        # Category and Intent only apply to Expenses usually, but let's see
        # Income has category too? Let's check model. Income usually has source. 
        # Actually in Phase 1 we might not have unified category.
        # Let's assume filters apply where possible.
        
        if filters.get('category') and filters['category'] != 'All':
             # Income doesn't strictly have 'category' field in standard model usually, but check. 
             # Just filter expenses for category for now.
             query_exp = query_exp.filter(ExpenseModel.category == filters['category'])
             # If searching for a category, likely not looking for income unless income has that category
             if filters['category'] != 'Income': # Simple hack
                 query_inc = query_inc.filter(db.literal(False)) # No income matches expense category usually

        if filters.get('intent') and filters['intent'] != 'All':
             query_exp = query_exp.filter(ExpenseModel.intent == filters['intent'])
             query_inc = query_inc.filter(db.literal(False)) # Income has no intent

        incomes = query_inc.all()
        expenses = query_exp.all()
        
        results = []
        for i in incomes:
            results.append({
                "id": i.id, "date": i.date.isoformat(), "amount": i.amount, 
                "type": "income", "category": "Income", "source": i.source, 
                "description": i.description
            })
        for e in expenses:
            results.append({
                "id": e.id, "date": e.date.isoformat(), "amount": e.amount, 
                "type": "expense", "category": e.category, "intent": e.intent,
                "note": e.note, "description": e.description
            })
            
        # Sort by date desc
        results.sort(key=lambda x: x['date'], reverse=True)
        return results
