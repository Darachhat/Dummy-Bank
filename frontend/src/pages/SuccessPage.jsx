import React from 'react';

export default function SuccessPage({ paymentResult, navigate }) {
  if (!paymentResult) return <div>Nothing to show</div>;
  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-3">Payment Successful</h2>
      <div className="bg-white p-4 rounded shadow">
        <div><strong>Transaction ID:</strong> {paymentResult.transactionId}</div>
        <div><strong>Invoice:</strong> {paymentResult.invoiceNo}</div>
        <div><strong>Amount:</strong> {paymentResult.amount}</div>
        <div><strong>Paid at:</strong> {paymentResult.paidAt}</div>
      </div>
      <div className="mt-4">
        <button onClick={() => navigate('home')} className="px-4 py-2 bg-blue-600 text-white rounded">Back to Home</button>
      </div>
    </div>
  );
}