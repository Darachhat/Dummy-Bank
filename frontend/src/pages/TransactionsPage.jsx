import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/client';

/**
 * TransactionsPage
 * Fetches /api/transactions and displays them in a simple table/list.
 */
export default function TransactionsPage({ navigate }) {
  const { token } = useContext(AuthContext);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const res = await apiFetch('/transactions', { token });
        setTxs(res.transactions || []);
      } catch (e) {
        setErr(e.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <div>
          <button onClick={() => navigate('home')} className="px-3 py-2 border rounded">Home</button>
        </div>
      </div>

      {loading && <div>Loading transactions...</div>}
      {err && <div className="text-red-600">{err}</div>}

      {!loading && txs.length === 0 && <div>No transactions found.</div>}

      {!loading && txs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="px-3 py-2">Transaction ID</th>
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">From</th>
                <th className="px-3 py-2">To</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Paid At</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.transactionId || t.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 text-sm">{t.transactionId || t.id}</td>
                  <td className="px-3 py-2 text-sm">{t.invoiceNo}</td>
                  <td className="px-3 py-2 text-sm">{t.amount ?? '—'}</td>
                  <td className="px-3 py-2 text-sm">{t.metadata?.fromUserId ?? t.fromUserId ?? '—'}</td>
                  <td className="px-3 py-2 text-sm">{t.metadata?.toUserId ?? t.toUserId ?? '—'}</td>
                  <td className="px-3 py-2 text-sm">{t.status}</td>
                  <td className="px-3 py-2 text-sm">{t.paidAt ? new Date(t.paidAt).toLocaleString() : (t.createdAt ? new Date(t.createdAt).toLocaleString() : '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}