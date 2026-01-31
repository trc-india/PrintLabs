'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import DeleteButton from '@/components/delete-button' // Reusing your existing component

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string
  sort_order: number
  is_active: boolean
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners')
      if (res.ok) {
        const data = await res.json()
        setBanners(data)
      }
    } catch (error) {
      console.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">Manage Banners</h1>
            <div className="flex gap-4">
               <Link href="/admin" className="text-gray-600 hover:text-black">Dashboard</Link>
               <Link href="/admin/products" className="text-gray-600 hover:text-black">Products</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Homepage Sliders</h2>
          <Link
            href="/admin/banners/new"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            + Add New Banner
          </Link>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td className="px-6 py-4">
                      <div className="relative w-32 h-16 bg-gray-100 rounded overflow-hidden">
                        <Image 
                            src={banner.image_url} 
                            alt={banner.title} 
                            fill 
                            className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{banner.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{banner.link_url || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{banner.sort_order}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        banner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <DeleteButton id={banner.id} endpoint="banners" />
                    </td>
                  </tr>
                ))}
                {banners.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No banners added yet.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}