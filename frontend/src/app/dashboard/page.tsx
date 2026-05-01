'use client';

import { useAuth } from '@/context/auth-context';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span> {user.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Role:</span> {user.role}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/dashboard/orders" className="block text-blue-600 hover:text-blue-700">
                → View Orders
              </Link>
              <Link href="/dashboard/settings" className="block text-blue-600 hover:text-blue-700">
                → Settings
              </Link>
              <Link href="/" className="block text-blue-600 hover:text-blue-700">
                → Back to Marketplace
              </Link>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Account</h2>
            <p className="text-sm text-gray-600 mb-4">Manage your account settings and preferences</p>
            <Link href="/dashboard/settings" className="text-blue-600 hover:text-blue-700">
              Edit Profile
            </Link>
          </div>
        </div>

        {user.role === 'SELLER' && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Seller Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/dashboard/items"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold mb-2">My Products</h3>
                <p className="text-gray-600">Manage your agricultural products</p>
              </Link>
              <Link
                href="/dashboard/sales"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold mb-2">Sales</h3>
                <p className="text-gray-600">View your sales and revenue</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
