import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/client';

export default function PinPage({ navigate, paymentDraft, setPaymentResult }) {
  const { token } = useContext(AuthContext);
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handlePay() {
    setErr('');
    if (!paymentDraft) return setErr('No payment data');
    setLoading(true);
    try {
      const body = {
        invoiceNo: paymentDraft.invoiceNo,
        amount: paymentDraft.amount,
        toUserId: paymentDraft.toUserId,
        pincode
      };
      const res = await apiFetch('/payments', { method: 'POST', body, token });
      setPaymentResult(res.payment);
      navigate('success');
    } catch (e) {
      setErr(e.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold mb-3">Enter pincode to confirm</h2>
      {err && <div className="text-red-500 mb-2">{err}</div>}
      <input value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full border p-2 rounded mb-3" placeholder="4-digit pincode" />
      <div className="flex gap-2">
        <button onClick={handlePay} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Processing...' : 'Confirm'}</button>
        <button onClick={() => navigate('payment')} className="px-4 py-2 border rounded">Back</button>
      </div>
    </div>
  );
}