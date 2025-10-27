// backend/src/services/usersService.js
const bcrypt = require('bcryptjs');

// In-memory demo data: users & accounts
const users = [
  {
    id: 1,
    name: 'Alice Example',
    phone: '0812345678',
    passwordHash: bcrypt.hashSync('password123', 10),
    pincode: '1234'
  },
  {
    id: 2,
    name: 'Bob Receiver',
    phone: '0898765432',
    passwordHash: bcrypt.hashSync('password123', 10),
    pincode: '4321'
  }
];

// accounts in-memory: each account belongs to a user (user_id)
let accounts = [
  { id: 1, user_id: 1, type: 'saving', number: 'SA-1001', balance: 1000.00 },
  { id: 2, user_id: 1, type: 'checking', number: 'CA-1002', balance: 250.00 },
  { id: 3, user_id: 2, type: 'saving', number: 'SA-2001', balance: 500.00 }
];

function findByPhone(phone) {
  return users.find((u) => String(u.phone) === String(phone));
}

function findById(id) {
  return users.find((u) => Number(u.id) === Number(id));
}

async function authenticate(phone, password) {
  const user = findByPhone(phone);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  const { passwordHash, pincode, ...publicUser } = user;
  // return user public data (no balances here)
  return { ...publicUser, id: user.id };
}

function verifyPincode(userId, pincode) {
  const u = findById(userId);
  if (!u) return false;
  return String(u.pincode) === String(pincode);
}

function listUsers() {
  // return public info for selection (id, name, phone)
  return users.map(({ id, name, phone }) => ({ id, name, phone }));
}

function getAccountsForUser(userId) {
  return accounts.filter(a => Number(a.user_id) === Number(userId)).map(a => ({ ...a }));
}

function findAccountById(accountId) {
  return accounts.find(a => Number(a.id) === Number(accountId));
}

function updateAccountBalance(accountId, delta) {
  const acc = findAccountById(accountId);
  if (!acc) throw new Error('Account not found');
  acc.balance = Number(acc.balance || 0) + Number(delta);
  return acc;
}

// Export
module.exports = {
  authenticate,
  findByPhone,
  findById,
  verifyPincode,
  listUsers,
  getAccountsForUser,
  findAccountById,
  updateAccountBalance,
  // expose accounts for debugging/testing
  _accounts: accounts
};