import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const payment = location.state?.paymentResult || null;

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-semibold mb-4">Payment Result</h2>
      {!payment ? (
        <div>No payment result available.</div>
      ) : (
        <div className="space-y-2">
          <div>Transaction ID: <span className="font-medium">{payment.transactionId}</span></div>
          <div>Invoice: <span className="font-medium">{payment.invoiceNo}</span></div>
          <div>Amount: <span className="font-medium">{payment.amount}</span></div>
          <div>Paid At: <span className="font-medium">{payment.paidAt || payment.createdAt}</span></div>
        </div>
      )}
      <div className="mt-4">
        <button onClick={() => navigate('/transactions')} className="px-3 py-2 border rounded mr-2">View Transactions</button>
        <button onClick={() => navigate('/')} className="px-3 py-2 border rounded">Home</button>
      </div>
    </div>
  );
}