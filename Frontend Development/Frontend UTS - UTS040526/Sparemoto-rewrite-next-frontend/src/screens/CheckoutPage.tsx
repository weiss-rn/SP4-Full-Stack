'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Check, Package } from 'lucide-react';

import { getShippingFee } from '@/lib/commerce';
import { useCart } from '../store/CartContext';
import type { DemoOrderInput, DemoOrderReceipt } from '@/types/demo-orders';

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export default function CheckoutPage() {
  const { items, subtotal, discount, discountCode, total, clearCart, totalItems } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [receipt, setReceipt] = useState<DemoOrderReceipt | null>(null);
  const shipping = getShippingFee(subtotal);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const form = new FormData(event.currentTarget);
    const payload: DemoOrderInput = {
      customer: {
        firstName: String(form.get('firstName') ?? '').trim(),
        lastName: String(form.get('lastName') ?? '').trim(),
        email: String(form.get('email') ?? '').trim(),
        phone: String(form.get('phone') ?? '').trim(),
        addressLine1: String(form.get('addressLine1') ?? '').trim(),
        addressLine2: String(form.get('addressLine2') ?? '').trim(),
        city: String(form.get('city') ?? '').trim(),
        state: String(form.get('state') ?? '').trim(),
        postalCode: String(form.get('postalCode') ?? '').trim(),
        country: String(form.get('country') ?? '').trim(),
      },
      items: items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })),
      discountCode: discountCode || null,
    };

    try {
      const response = await fetch('/api/demo-orders', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string; order?: DemoOrderReceipt };
      if (!response.ok || !data.order) {
        throw new Error(data.error || 'Unable to place demo order.');
      }

      setReceipt(data.order);
      clearCart();
    } catch (submitError) {
      setErrorMessage(submitError instanceof Error ? submitError.message : 'Unable to place demo order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 bg-mono-900 squircle mx-auto flex items-center justify-center mb-4">
          <Check className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-mono-900">Demo Order Recorded!</h1>
        <p className="text-sm text-mono-500 mt-2 mb-1">{receipt.orderNumber}</p>
        <p className="text-xs text-mono-400 mb-6">
          Logged at {formatTimestamp(receipt.createdAt)}. Inventory has been updated for this demo purchase.
        </p>

        <div className="bg-white border border-mono-200 squircle p-5 text-left mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-mono-500" />
            <span className="text-sm font-semibold text-mono-900">Recorded Purchase</span>
          </div>
          <div className="space-y-2 text-xs text-mono-600">
            {receipt.items.map((item) => (
              <div key={item.productId} className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-mono-900">{item.productName}</p>
                  <p>
                    {item.category} · Qty {item.quantity} · Remaining stock {item.remainingStock}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-mono-900">{formatCurrency(item.lineTotal)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-mono-200 squircle p-5 text-left mb-6">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-mono-600">
              <span>Customer</span>
              <span className="font-medium text-mono-900">{receipt.customerName}</span>
            </div>
            <div className="flex justify-between text-mono-600">
              <span>Items</span>
              <span className="font-medium text-mono-900">{receipt.totalItems}</span>
            </div>
            <div className="flex justify-between text-mono-600">
              <span>Total</span>
              <span className="font-medium text-mono-900">{formatCurrency(receipt.total)}</span>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-mono-900 text-white text-sm font-semibold squircle hover:bg-mono-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-mono-900">Nothing to Checkout</h1>
        <p className="text-sm text-mono-500 mt-1 mb-4">Add some items to your cart first.</p>
        <Link href="/products" className="text-sm text-mono-600 hover:underline">← Browse Parts</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-mono-500 hover:text-mono-900 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
      </Link>

      <h1 className="text-2xl font-bold text-mono-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {errorMessage && (
              <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="bg-white border border-mono-200 squircle p-5">
              <h2 className="text-sm font-bold text-mono-900 mb-3">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input required name="firstName" placeholder="First Name" className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="lastName" placeholder="Last Name" className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="email" type="email" placeholder="Email" className="sm:col-span-2 px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="phone" placeholder="Phone" className="sm:col-span-2 px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
              </div>
            </div>

            <div className="bg-white border border-mono-200 squircle p-5">
              <h2 className="text-sm font-bold text-mono-900 mb-3">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input required name="addressLine1" placeholder="Address Line 1" className="sm:col-span-2 px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input name="addressLine2" placeholder="Address Line 2 (optional)" className="sm:col-span-2 px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="city" placeholder="City" className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="state" placeholder="State / Province" className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="postalCode" placeholder="ZIP / Postal Code" className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
                <input required name="country" placeholder="Country" className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400" />
              </div>
            </div>

            <div className="bg-white border border-mono-200 squircle p-5">
              <h2 className="text-sm font-bold text-mono-900 mb-3 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-mono-400" /> Payment (Demo)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input required placeholder="Card Number" defaultValue="4242 4242 4242 4242" className="sm:col-span-2 px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400 font-mono" />
                <input required placeholder="MM / YY" defaultValue="12/28" className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400 font-mono" />
                <input required placeholder="CVC" defaultValue="123" className="px-3 py-2 bg-mono-50 border border-mono-200 squircle-sm text-sm placeholder:text-mono-400 focus:outline-none focus:border-mono-400 font-mono" />
              </div>
              <p className="text-[10px] text-mono-400 mt-2">
                Demo mode only. A receipt will be recorded with a timestamp and shown in the admin report.
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-mono-200 squircle p-5 sticky top-20">
              <h2 className="text-sm font-bold text-mono-900 mb-3">Order Summary</h2>

              <div className="space-y-2 mb-3">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-mono-600 truncate flex-1">
                      {product.name} <span className="text-mono-400">×{quantity}</span>
                    </span>
                    <span className="font-medium text-mono-900 shrink-0">{formatCurrency(product.price * quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-mono-200 pt-2 space-y-1.5 text-xs">
                <div className="flex justify-between text-mono-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-medium text-mono-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-mono-600">
                  <span>Shipping</span>
                  <span className="font-medium text-mono-900">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-mono-700">
                    <span>Discount ({discountCode})</span>
                    <span className="font-medium">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t border-mono-200 pt-2 flex justify-between">
                  <span className="font-semibold text-mono-900">Total</span>
                  <span className="text-lg font-extrabold text-mono-900">{formatCurrency(total + shipping)}</span>
                </div>
              </div>

              <button
                disabled={submitting}
                type="submit"
                className="mt-4 w-full h-10 flex items-center justify-center gap-2 bg-mono-900 text-white text-sm font-semibold squircle hover:bg-mono-800 transition-colors active:scale-[0.98] disabled:opacity-60"
              >
                <Lock className="w-3.5 h-3.5" /> {submitting ? 'Recording Demo Order...' : 'Place Demo Order'}
              </button>

              <p className="text-[10px] text-mono-400 text-center mt-2">
                This is still a demonstration, but successful checkouts now update stock and the admin report.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
