'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar() {
  const pathname = usePathname()

  // Don't show sidebar on the Login page
  if (pathname === '/admin/login') return null

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Orders', href: '/admin/orders', icon: '📦' },
    { name: 'Products', href: '/admin/products', icon: '🏷️' },
    { name: 'Categories', href: '/admin/categories', icon: '📂' },
    { name: 'Collections (Groups)', href: '/admin/groups', icon: '📑' },
    { name: 'Homepage Layout', href: '/admin/sections', icon: '🏠' },
    { name: 'Banners', href: '/admin/banners', icon: '🖼️' },
  ]

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex-shrink-0 hidden md:block">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold tracking-wider">ADMIN PANEL</h2>
        <p className="text-xs text-gray-500 mt-1">PrintLabs Manager</p>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 mt-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm px-4">
          <span>⬅️</span> Back to Website
        </Link>
      </div>
    </aside>
  )
}