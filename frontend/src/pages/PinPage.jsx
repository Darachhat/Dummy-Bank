import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/client';

export default function PinPage() {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [draft, setDraft] = useState(location.state?.paymentDraft || null);
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!draft) {
      try {
        const raw = localStorage.getItem('paymentDraft');
        if (raw) setDraft(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to read paymentDraft', e);
      }
    }
  }, [draft]);

  async function handlePay() {
    setErr('');
    if (!draft) return setErr('No payment data (fromAccountId required)');
    if (!draft.fromAccountId) return setErr('fromAccountId required');
    if (!pincode) return setErr('Pincode required');

    setLoading(true);
    try {
      const body = { invoiceNo: draft.invoiceNo, amount: draft.amount, fromAccountId: draft.fromAccountId, pincode };
      const res = await apiFetch('/payments', { method: 'POST', body, token });
      try { localStorage.removeItem('paymentDraft'); } catch (e) {}
      navigate('/success', { state: { paymentResult: res.payment } });
    } catch (e) {
      setErr(e.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  if (!draft) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">No payment data</h2>
        <p>Please create a payment first.</p>
        <div className="mt-3">
          <button onClick={() => navigate('/payment')} className="px-3 py-2 border rounded">Back to Payment</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold mb-3">Enter pincode to confirm</h2>
      {err && <div className="text-red-500 mb-2">{err}</div>}
      <div className="mb-2">
        <div className="text-sm text-gray-600">Invoice: {draft.invoiceNo}</div>
        <div className="font-medium">Amount: {draft.amount}</div>
      </div>
      <input value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full border p-2 rounded mb-3" placeholder="4-digit pincode" />
      <div className="flex gap-2">
        <button onClick={handlePay} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Processing...' : 'Confirm'}</button>
        <button onClick={() => navigate('/payment')} className="px-4 py-2 border rounded">Back</button>
      </div>
    </div>
  );
}