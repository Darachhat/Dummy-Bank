const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const INVOICE_API_URL = process.env.INVOICE_API_URL || '';
const USE_LOCAL = (process.env.USE_LOCAL_INVOICES || 'false').toLowerCase() === 'true';
const LOCAL_FILE = path.join(__dirname, 'mock-invoices.json');

async function readLocalInvoices() {
  try {
    const txt = await fs.readFile(LOCAL_FILE, 'utf8');
    const data = JSON.parse(txt);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.invoices)) return data.invoices;
    return data;
  } catch (err) {
    throw new Error(`Failed to read local mock invoices: ${err.message}`);
  }
}

async function getInvoices() {
  // If user explicitly wants local mock, skip external call
  if (USE_LOCAL || !INVOICE_API_URL) {
    return await readLocalInvoices();
  }

  try {
    const res = await axios.get(INVOICE_API_URL, {
      headers: { Accept: 'application/json' },
      timeout: 8000
    });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.invoices)) return data.invoices;
    return data;
  } catch (err) {
    // External API failed — log and fallback to local mock
    console.warn(`External invoices API failed (${INVOICE_API_URL}):`, err.message);
    return await readLocalInvoices();
  }
}

module.exports = {
  getInvoices
};