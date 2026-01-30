import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import OrderStatusUpdate from '@/components/order-status-update'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin-auth')

  if (!authCookie || authCookie.value !== 'authenticated') {
    redirect('/admin/login')
  }

  const { id } = await params

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (
        *
      )
    `)
    .eq('id', id)
    .single()

  if (error || !order) {
    notFound()
  }

  const orderDate = new Date(order.created_at).toLocaleString('en-IN')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">PrintLabs Admin</h1>
            <div className="flex gap-4">
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-black">
                Dashboard
              </Link>
              <Link href="/admin/products" className="text-gray-700 hover:text-black">
                Products
              </Link>
              <Link href="/admin/orders" className="text-black font-semibold">
                Orders
              </Link>
              <Link href="/admin/categories" className="text-gray-700 hover:text-black">
                Categories
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin/orders" className="text-gray-600 hover:text-black mb-4 inline-block">
            ← Back to Orders
          </Link>
          <h2 className="text-2xl font-bold">Order Details</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{order.order_number}</h3>
                  <p className="text-sm text-gray-500">Placed on {orderDate}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  order.production_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : order.production_status === 'in_production'
                    ? 'bg-blue-100 text-blue-800'
                    : order.production_status === 'ready_to_ship'
                    ? 'bg-purple-100 text-purple-800'
                    : order.production_status === 'shipped'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {order.production_status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Status Update Component */}
              <OrderStatusUpdate orderId={order.id} currentStatus={order.production_status} />
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Unit Price: ₹{item.unit_price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{item.total_price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span>₹{order.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            {order.customer_notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-2">Customer Notes</h3>
                <p className="text-gray-700">{order.customer_notes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Customer & Shipping Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Customer Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium break-words">{order.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Shipping Address</h3>
              <p className="text-gray-700 whitespace-pre-line">{order.shipping_address}</p>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium">{order.payment_method || 'COD'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    order.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold">₹{order.total_amount}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Actions</h3>
              <div className="space-y-2">
                <a
                  href={`mailto:${order.customer_email}`}
                  className="block w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                >
                  Email Customer
                </a>
                <a
                  href={`tel:${order.customer_phone}`}
                  className="block w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                >
                  Call Customer
                </a>
                <a
                  href={`https://wa.me/91${order.customer_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
                >
                  WhatsApp Customer
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
