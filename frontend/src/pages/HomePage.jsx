import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function HomePage({ navigate }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <div className="text-sm text-gray-600">Balance: <span className="font-semibold">{user?.balance ?? 0}</span></div>
        </div>
        <div>
          <button onClick={() => navigate('account')} className="mr-2 px-3 py-2 border rounded">Account</button>
          <button onClick={() => logout()} className="px-3 py-2 border rounded">Sign out</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => navigate('payment')} className="col-span-1 py-6 bg-blue-600 text-white rounded">Make Payment</button>
        <button onClick={() => navigate('transactions')} className="py-6 bg-gray-100 rounded">Transactions</button>
        <button onClick={() => navigate('account')} className="py-6 bg-gray-100 rounded">Account</button>
      </div>
    </div>
  );
}