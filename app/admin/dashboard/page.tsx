import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin-auth')

  if (!authCookie || authCookie.value !== 'authenticated') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">PrintLabs Admin</h1>
            <div className="flex gap-4">
              <a href="/admin/dashboard" className="text-gray-700 hover:text-black">
                Dashboard
              </a>
              <a href="/admin/products" className="text-gray-700 hover:text-black">
                Products
              </a>
              <a href="/admin/orders" className="text-gray-700 hover:text-black">
                Orders
              </a>
              <a href="/admin/categories" className="text-gray-700 hover:text-black">
                Categories
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-gray-600">Welcome to PrintLabs admin panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Pending Orders</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin/products/new"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 transition text-center"
            >
              <span className="text-2xl">+</span>
              <p className="mt-2 font-medium">Add New Product</p>
            </a>
            <a
              href="/admin/categories"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 transition text-center"
            >
              <span className="text-2xl">📁</span>
              <p className="mt-2 font-medium">Manage Categories</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
