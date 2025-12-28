import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { IncomePage } from './features/income/IncomePage';
import { ExpensesPage } from './features/expenses/ExpensesPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { SettingsPage } from './features/settings/SettingsPage';

import { DateProvider } from './context/DateContext';

function App() {
  return (
    <DateProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </DateProvider>
  );
}

export default App;
