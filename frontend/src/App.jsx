import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PaymentPage from './pages/PaymentPage';
import PinPage from './pages/PinPage';
import SuccessPage from './pages/SuccessPage';
import TransactionsPage from './pages/TransactionsPage';
import AccountPage from './pages/AccountPage';
import { AuthContext } from './context/AuthContext';

/** RequireAuth: redirects to /login when not authenticated */
function RequireAuth({ children }) {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children ? children : <Outlet />;
}

/** Simple header */
function Header() {
  const { token, user, logout } = useContext(AuthContext);

  return (
    <header className="p-4 border-b mb-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="space-x-4">
          <Link to="/" className="font-semibold">Dummy Bank</Link>
          {token && <Link to="/payment">Pay</Link>}
          {token && <Link to="/transactions">Transactions</Link>}
          {token && <Link to="/accounts">Accounts</Link>}
        </div>
        <div>
          {token ? (
            <>
              <span className="mr-3 text-sm">Hi, {user?.name || 'User'}</span>
              <button onClick={() => logout()} className="px-3 py-1 border rounded">Sign out</button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-1 border rounded">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/pin" element={<PinPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/accounts" element={<AccountPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}