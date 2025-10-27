import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PaymentPage from './pages/PaymentPage';
import PinPage from './pages/PinPage';
import SuccessPage from './pages/SuccessPage';
import TransactionsPage from './pages/TransactionsPage';

// Simple local navigation state. Replace with react-router if you prefer.
function AppContent() {
  const [page, setPage] = useState('login');
  const [paymentDraft, setPaymentDraft] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  function navigate(p) {
    setPage(p);
  }
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        {page === 'login' && <LoginPage onLogin={() => navigate('home')} />}
        {page === 'home' && <HomePage navigate={navigate} />}
        {page === 'payment' && <PaymentPage navigate={navigate} setPaymentDraft={setPaymentDraft} />}
        {page === 'pin' && <PinPage navigate={navigate} paymentDraft={paymentDraft} setPaymentResult={setPaymentResult} />}
        {page === 'success' && <SuccessPage navigate={navigate} paymentResult={paymentResult} />}
        {page === 'transactions' && <TransactionsPage navigate={navigate} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}