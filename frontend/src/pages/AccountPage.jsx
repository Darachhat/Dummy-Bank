import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/client';

export default function AccountPage() {
  const { token } = useContext(AuthContext);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Accounts</h2>
      </div>

      {loading && <div>Loading accounts…</div>}
      {err && <div className="text-red-600">{err}</div>}
      {!loading && accounts.length === 0 && <div>No accounts found.</div>}
      {!loading && accounts.length > 0 && (
        <div className="space-y-2">
          {accounts.map(a => (
            <div key={a.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">{a.type} • {a.number}</div>
                <div className="font-medium">{(typeof a.balance_cents !== 'undefined' ? (Number(a.balance_cents)/100).toFixed(2) : Number(a.balance || 0).toFixed(2))}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}