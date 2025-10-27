import React, { useState } from 'react';

export default function InvoiceList({ invoices = [], setInvoices, apiBase }) {
  const [payingFor, setPayingFor] = useState(null);
  const handlePay = async (invoiceNo) => {
    if (!invoiceNo) return;
    setPayingFor(invoiceNo);
    try {
      const res = await fetch(`${apiBase}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceNo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment failed');

      // Optionally update UI: mark invoice as paid locally
      setInvoices((prev) =>
        prev.map((inv) => (inv.invoiceNo === invoiceNo ? { ...inv, paid: true, payment: data.payment } : inv))
      );
      alert(`Payment success: ${data.payment.transactionId}`);
    } catch (err) {
      alert('Payment error: ' + err.message);
    } finally {
      setPayingFor(null);
    }
  };

  if (!Array.isArray(invoices)) {
    return <div>No invoice data returned from API.</div>;
  }

  return (
    <div className="space-y-4">
      {invoices.length === 0 && <p>No invoices found.</p>}
      {invoices.map((inv) => {
        // Accept several common field names:
        const invoiceNo = inv.invoiceNo || inv.invoiceNumber || inv.id || inv.number || 'unknown';
        const amount = inv.amount || inv.total || inv.value || inv.price || '—';
        const due = inv.dueDate || inv.due || inv.date || '';
        const paid = inv.paid || inv.status === 'PAID' || inv.paid === true || inv.paidAt;

        return (
          <div key={invoiceNo} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Invoice</div>
              <div className="font-medium">{invoiceNo}</div>
              <div className="text-sm text-gray-500">Amount: {amount} {due && <span>• Due: {due}</span>}</div>
              {paid && <div className="text-green-600 text-sm">Status: Paid</div>}
            </div>
            <div>
              <button
                disabled={paid || payingFor === invoiceNo}
                onClick={() => handlePay(invoiceNo)}
                className={`px-4 py-2 rounded ${
                  paid
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {paid ? 'Paid' : payingFor === invoiceNo ? 'Processing...' : 'Pay'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}