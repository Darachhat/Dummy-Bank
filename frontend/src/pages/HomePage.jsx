import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/client';

export default function HomePage() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const res = await apiFetch('/accounts', { token });
        if (!mounted) return;
        setAccounts(res.accounts || []);
      } catch (e) {
        console.error('Failed to load accounts', e);
        setErr(e.message || 'Failed to load accounts');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [token]);

  function accountBalanceFloat(acc) {
    if (!acc) return 0;
    if (typeof acc.balance_cents !== 'undefined' && acc.balance_cents !== null) {
      const cents = Number(acc.balance_cents);
      return Number.isFinite(cents) ? cents / 100 : 0;
    }
    if (typeof acc.balance !== 'undefined' && acc.balance !== null) {
      const val = Number(acc.balance);
      return Number.isFinite(val) ? val : 0;
    }
    return 0;
  }

  const total = accounts.reduce((s, a) => s + accountBalanceFloat(a), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <div className="text-sm text-gray-600">Total Balance: <span className="font-semibold">{loading ? 'Loading…' : total.toFixed(2)}</span></div>
        </div>
        <div>
          <button onClick={() => navigate('/payment')} className="mr-2 px-3 py-2 border rounded">Make Payment</button>
          <button onClick={() => logout()} className="px-3 py-2 border rounded">Sign out</button>
        </div>
      </div>

      {loading && <div>Loading accounts…</div>}
      {err && <div className="text-red-600">{err}</div>}

      {!loading && accounts.length === 0 && (
        <div>No accounts found. Create an account from the Accounts page or via the API.</div>
      )}

      {!loading && accounts.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Accounts</h3>
          <div className="space-y-2">
            {accounts.map(a => (
              <div key={a.id} className="p-3 border rounded flex justify-between">
                <div>
                  <div className="text-sm text-gray-600">{a.type} • {a.number}</div>
                  <div className="font-medium">{accountBalanceFloat(a).toFixed(2)}</div>
                </div>
                <div>
                  <button onClick={() => {
                    const draft = { fromAccountId: a.id };
                    try { localStorage.setItem('paymentDraft', JSON.stringify(draft)); } catch (e) {}
                    navigate('/payment', { state: { paymentDraft: draft } });
                  }} className="px-3 py-1 bg-gray-100 rounded">Use</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}