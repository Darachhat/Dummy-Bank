import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/client';

export default function PaymentPage({ navigate, setPaymentDraft }) {
  const { token, user, setUser } = useContext(AuthContext);
  const [myAccounts, setMyAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [toUserId, setToUserId] = useState(null);
  const [toAccounts, setToAccounts] = useState([]);
  const [fromAccountId, setFromAccountId] = useState(null);
  const [toAccountId, setToAccountId] = useState(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [amount, setAmount] = useState('');
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/users', { token });
        setUsers(res.users || []);
      } catch (e) {
        console.error('Failed to load users', e);
      }
      try {
        const res2 = await apiFetch('/accounts', { token });
        setMyAccounts(res2.accounts || []);
        if ((res2.accounts || []).length > 0) setFromAccountId(res2.accounts[0].id);
      } catch (e) {
        console.error('Failed to load my accounts', e);
      }
    }
    load();
  }, []);

  async function onSelectRecipient(userId) {
    setToUserId(userId);
    setToAccounts([]);
    setToAccountId(null);
    if (!userId) return;
    try {
      const res = await apiFetch(`/users/${userId}/accounts`, { token });
      setToAccounts(res.accounts || []);
      if ((res.accounts || []).length > 0) setToAccountId(res.accounts[0].id);
    } catch (e) {
      console.error('Failed to load recipient accounts', e);
    }
  }

  async function lookupInvoice() {
    setInvoice(null);
    setErr('');
    if (!invoiceNo) return;
    setLoadingInvoice(true);
    try {
      const res = await apiFetch('/invoices', { token });
      const list = res.invoices || res;
      const found = (Array.isArray(list) ? list : []).find((inv) => {
        const id = inv.invoiceNo || inv.invoiceNumber || inv.id || inv.number;
        return String(id) === String(invoiceNo);
      });
      if (!found) {
        setErr('Invoice not found');
      } else {
        setInvoice(found);
        const amt = found.amount || found.total || found.value || found.price || '';
        setAmount(amt);
      }
    } catch (e) {
      setErr('Invoice lookup failed: ' + e.message);
    } finally {
      setLoadingInvoice(false);
    }
  }

  function goToPin() {
    if (!invoiceNo || !amount || !fromAccountId) {
      setErr('From account, invoice and amount required');
      return;
    }
    setPaymentDraft({ fromAccountId, toUserId, toAccountId, invoiceNo, amount });
    navigate('pin');
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Payment</h2>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm">From account</label>
          <select className="w-full border rounded p-2" value={fromAccountId || ''} onChange={(e) => setFromAccountId(Number(e.target.value) || null)}>
            <option value="">-- Select from account --</option>
            {myAccounts.map(a => <option key={a.id} value={a.id}>{a.type} — {a.number} — {a.balance}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm">Select recipient user</label>
          <select className="w-full border rounded p-2" value={toUserId || ''} onChange={(e) => onSelectRecipient(Number(e.target.value) || null)}>
            <option value="">-- Select recipient --</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>)}
          </select>
        </div>

        {toAccounts.length > 0 && (
          <div>
            <label className="block text-sm">Recipient account (optional)</label>
            <select className="w-full border rounded p-2" value={toAccountId || ''} onChange={(e) => setToAccountId(Number(e.target.value) || null)}>
              <option value="">-- recipient account --</option>
              {toAccounts.map(a => <option key={a.id} value={a.id}>{a.type} — {a.number}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm">Invoice No</label>
          <div className="flex gap-2">
            <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="flex-1 border rounded p-2" />
            <button onClick={lookupInvoice} disabled={loadingInvoice} className="px-3 py-2 bg-gray-200 rounded">{loadingInvoice ? '...' : 'Load'}</button>
          </div>
          {err && <div className="text-red-500 text-sm mt-1">{err}</div>}
        </div>

        {invoice && (
          <div className="p-3 border rounded bg-gray-50">
            <div className="text-sm text-gray-600">{invoice.description || invoice.title}</div>
            <div className="font-medium">{invoice.invoiceNo || invoice.id}</div>
            <div className="text-sm">Due: {invoice.dueDate || invoice.date || '—'}</div>
          </div>
        )}

        <div>
          <label className="block text-sm">Amount</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border rounded p-2" />
        </div>

        <div className="flex gap-2">
          <button onClick={goToPin} className="px-4 py-2 bg-blue-600 text-white rounded">Pay</button>
          <button onClick={() => navigate('home')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}