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
            <h1 className="text-xl font-bold">Order Details</h1>
            <Link href="/admin/orders" className="text-gray-600 hover:text-black">
              ← Back to Orders
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Order Items */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-bold">Order Items</h2>
              </div>
              <div className="divide-y">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="p-6 flex gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {item.product_name || item.products?.name || 'Unknown Product'}
                      </h3>
                      
                      {/* --- UPDATED: Customization Display with File Links --- */}
                      {item.customization_details && Array.isArray(item.customization_details) && (
                        <div className="mt-2 bg-gray-50 p-3 rounded text-sm space-y-1">
                          {item.customization_details.map((detail: any, i: number) => (
                            <div key={i} className="grid grid-cols-3 gap-2">
                              <span className="font-medium text-gray-600">{detail.label}:</span>
                              <span className="col-span-2 break-all">
                                {typeof detail.value === 'string' && detail.value.startsWith('http') ? (
                                  <a 
                                    href={detail.value} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline hover:text-blue-800 font-medium inline-flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download File
                                  </a>
                                ) : (
                                  detail.value
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* ----------------------------------------------------- */}

                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{item.unit_price} x {item.quantity}</div>
                      <div className="font-bold mt-1">₹{item.total_price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Status Update Component */}
            <div className="bg-white rounded-lg shadow p-6">
               <h2 className="text-lg font-bold mb-4">Production Status</h2>
               <div className="flex items-center gap-2 mb-4">
                 <span className="text-gray-600">Current Status:</span>
                 <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    order.production_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.production_status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                 }`}>
                   {order.production_status.replace('_', ' ').toUpperCase()}
                 </span>
               </div>
               <OrderStatusUpdate orderId={order.id} currentStatus={order.production_status} />
            </div>
          </div>

          {/* RIGHT COLUMN: Customer Details */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Customer Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="block text-gray-500">Name</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Email</span>
                  <span className="font-medium">{order.customer_email}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Phone</span>
                  <span className="font-medium">{order.customer_phone}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Shipping Address</span>
                  <p className="font-medium mt-1">{order.shipping_address}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Payment Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-bold">{order.payment_method || 'COD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
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