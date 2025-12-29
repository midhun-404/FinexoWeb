DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  country TEXT,
  currency_code TEXT,
  currency_symbol TEXT,
  created_at TEXT
);

DROP TABLE IF EXISTS incomes;
CREATE TABLE incomes (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  amount REAL,
  source TEXT,
  date TEXT,
  is_recurring INTEGER,
  created_at TEXT
);

DROP TABLE IF EXISTS expenses;
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  amount REAL,
  category TEXT,
  intent TEXT,
  date TEXT,
  note TEXT,
  created_at TEXT
);
