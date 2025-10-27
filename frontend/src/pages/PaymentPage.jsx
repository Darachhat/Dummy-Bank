import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/client';

export default function PaymentPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const prefill = location.state?.paymentDraft;
  const [myAccounts, setMyAccounts] = useState([]);
  const [fromAccountId, setFromAccountId] = useState(prefill?.fromAccountId || null);

  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [amount, setAmount] = useState('');
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadAccounts() {
      setLoadingAccounts(true);
      try {
        const myAccRes = await apiFetch('/accounts', { token });
        if (!mounted) return;
        setMyAccounts(myAccRes.accounts || []);
        if ((myAccRes.accounts || []).length === 1 && !fromAccountId) {
          setFromAccountId(myAccRes.accounts[0].id);
        }
      } catch (e) {
        console.error('Failed to load accounts', e);
        setError('Failed to load accounts. See console for details.');
      } finally {
        if (mounted) setLoadingAccounts(false);
      }
    }
    loadAccounts();
    return () => { mounted = false; };
  }, [token]);

  async function lookupInvoice() {
    setInvoice(null);
    setError('');
    if (!invoiceNo) {
      setError('Please enter an invoice number');
      return;
    }
    setLoadingInvoice(true);
    try {
      const res = await apiFetch('/invoices', { token });
      const list = res.invoices || res;
      const found = (Array.isArray(list) ? list : []).find(inv => {
        const id = inv.invoiceNo || inv.invoiceNumber || inv.id || inv.number;
        return String(id) === String(invoiceNo);
      });
      if (!found) setError('Invoice not found');
      else {
        setInvoice(found);
        const detected = found.amount || found.total || found.value || found.price || '';
        setAmount(detected !== undefined && detected !== null ? String(detected) : '');
      }
    } catch (e) {
      console.error('Invoice lookup failed', e);
      setError('Invoice lookup failed: ' + (e.message || 'unknown'));
    } finally {
      setLoadingInvoice(false);
    }
  }

  function clearInvoice() {
    setInvoice(null);
    setAmount('');
    setError('');
    try { localStorage.removeItem('paymentDraft'); } catch (e) {}
  }

  function goToPin() {
    setError('');
    if (!fromAccountId) return setError('Please select a from-account');
    if (!invoiceNo) return setError('Please enter an invoice number');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError('Please enter a valid amount');

    const draft = { fromAccountId, invoiceNo, amount: Number(amount) };
    try { localStorage.setItem('paymentDraft', JSON.stringify(draft)); } catch (e) {}
    navigate('/pin', { state: { paymentDraft: draft } });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Payment</h2>
        {invoice && <button onClick={clearInvoice} className="text-sm text-red-500 underline">Clear invoice</button>}
      </div>

      {error && <div className="text-red-600 mb-3">{error}</div>}

      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium">From account</label>
          {loadingAccounts ? (
            <div className="text-sm text-gray-500">Loading accounts…</div>
          ) : (
            <select
              className="w-full border rounded p-2"
              value={fromAccountId ?? ''}
              onChange={(e) => setFromAccountId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- Select from account --</option>
              {myAccounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.type} — {a.number} — {typeof a.balance !== 'undefined' ? Number(a.balance).toFixed(2) : '—'}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Invoice No</label>
          <input
            value={invoiceNo}
            onChange={(e) => { setInvoiceNo(e.target.value); if (invoice) setInvoice(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); lookupInvoice(); } }}
            onBlur={() => { if (invoiceNo) lookupInvoice(); }}
            className="w-full border rounded p-2"
            placeholder="Enter invoice number (e.g. INV-2025-001)"
          />
        </div>

        {invoice && (
          <div className="p-3 border rounded bg-gray-50">
            <div className="text-sm text-gray-600">{invoice.description || invoice.title}</div>
            <div className="font-medium">{invoice.invoiceNo || invoice.id || invoice.number}</div>
            <div className="text-sm">Due: {invoice.dueDate || invoice.date || '—'}</div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Amount</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border rounded p-2" inputMode="decimal" placeholder="0.00" readOnly={!!invoice} />
        
        </div>

        <div className="flex gap-2">
          <button onClick={goToPin} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={!fromAccountId || !invoiceNo || !amount || loadingInvoice}>{loadingInvoice ? 'Loading…' : 'Pay'}</button>
          <button onClick={() => navigate('/')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}