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

  // Fetch Order with Items and Product Names
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (
          name,
          slug
        )
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
              <Link href="/admin/orders" className="text-gray-700 hover:text-black">
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h2>
            <p className="text-gray-500">{orderDate}</p>
          </div>
          <OrderStatusUpdate orderId={order.id} currentStatus={order.production_status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info: Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-bold">Order Items</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.order_items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.products?.name || 'Unknown Product'}
                        </div>
                        {/* --- THIS SHOWS THE CUSTOM DATA --- */}
                        {item.customization_details && (
                          <div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-200 text-xs font-mono text-yellow-900">
                            <strong>Customization:</strong>
                            <pre className="whitespace-pre-wrap mt-1">
                              {JSON.stringify(item.customization_details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">₹{item.price_at_purchase}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        ₹{item.price_at_purchase * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar: Customer & Payment */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Customer Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{order.customer_email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Shipping Address</p>
                  <p className="font-medium">
                    {order.shipping_address},<br/>
                    {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Payment Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium uppercase">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-bold">Total Amount</span>
                    <span className="text-xl font-bold">₹{order.total_amount}</span>
                  </div>
                </div>
              </div>
            </div>
            
             <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <a
                  href={`https://wa.me/91${order.customer_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-medium"
                >
                   Chat on WhatsApp
                </a>
                <a
                  href={`tel:${order.customer_phone}`}
                  className="block w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center text-sm"
                >
                  Call Customer
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}