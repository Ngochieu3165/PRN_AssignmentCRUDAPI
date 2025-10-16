'use client';

import { useEffect, useState } from 'react';
import { ordersApi, paymentsApi } from '@/lib/api';
import NavBar from '@/components/NavBar';

export default function CheckoutPage() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setCreating(true);
    setError(null);
    try {
      const order = await ordersApi.create();
      const { url } = await paymentsApi.checkout(order.id!);
      window.location.href = url;
    } catch (e) {
      setError('Please login and ensure your cart has items.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="container">
        <h2>Checkout</h2>
        {error && <div className="error">{error}</div>}
        <button disabled={creating} onClick={handleCheckout}>Proceed to Payment</button>
      </div>
    </div>
  );
}


