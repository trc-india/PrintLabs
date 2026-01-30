import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin-auth')

  if (!authCookie || authCookie.value !== 'authenticated') {
    redirect('/admin/login')
  }

  // Fetch real counts from database
  const { count: productsCount } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: pendingOrdersCount } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('production_status', ['pending', 'in_production'])

  const { count: categoriesCount } = await supabaseAdmin
    .from('categories')
    .select('*', { count: 'exact', head: true })

  // Fetch recent orders
  const { data: recentOrders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">PrintLabs Admin</h1>
            <div className="flex gap-4">
              <Link href="/admin/dashboard" className="text-black font-semibold">
                Dashboard
              </Link>
              <Link href="/admin/products" className="text-gray-700 hover:text-black">
                Products
              </Link>
              <Link href="/admin/orders" className="text-gray-700 hover:text-black">
                Orders
              </Link>
              <Link href="/admin/categories" className="text-gray-700 hover:text-black">
                Categories
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-gray-600">Welcome to PrintLabs admin panel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/products" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
            <p className="text-3xl font-bold mt-2">{productsCount || 0}</p>
            <p className="text-sm text-gray-600 mt-2">View all products →</p>
          </Link>

          <Link href="/admin/orders" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-gray-500 text-sm font-medium">Pending Orders</h3>
            <p className="text-3xl font-bold mt-2">{pendingOrdersCount || 0}</p>
            <p className="text-sm text-gray-600 mt-2">Manage orders →</p>
          </Link>

          <Link href="/admin/categories" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
            <p className="text-3xl font-bold mt-2">{categoriesCount || 0}</p>
            <p className="text-sm text-gray-600 mt-2">Manage categories →</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/products/new"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 transition text-center"
            >
              <span className="text-2xl">+</span>
              <p className="mt-2 font-medium">Add New Product</p>
            </Link>
            <Link
              href="/admin/categories"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 transition text-center"
            >
              <span className="text-2xl">📁</span>
              <p className="mt-2 font-medium">Manage Categories</p>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{order.order_number}</td>
                      <td className="px-6 py-4 text-sm">{order.customer_name}</td>
                      <td className="px-6 py-4 text-sm">₹{order.total_amount}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          {order.production_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No orders yet</p>
              <p className="text-sm mt-2">Orders will appear here once customers start purchasing</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
