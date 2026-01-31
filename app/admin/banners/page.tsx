'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import DeleteButton from '@/components/delete-button'

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
  const [sliderDelay, setSliderDelay] = useState(4000)
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bannersRes, settingsRes] = await Promise.all([
        fetch('/api/banners'),
        fetch('/api/settings?key=banner_config')
      ])
      
      if (bannersRes.ok) setBanners(await bannersRes.json())
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        if (data.value?.delay) setSliderDelay(data.value.delay)
      }
    } catch (error) {
      console.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    await fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ key: 'banner_config', value: { delay: sliderDelay } })
    })
    setSavingSettings(false)
    alert('Speed updated!')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Manage Banners</h1>
          <Link href="/admin/banners/new" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
            + Add New Banner
          </Link>
        </div>

        {/* SETTINGS BOX */}
        <div className="bg-white p-4 rounded-lg shadow mb-8 flex items-center gap-4 border border-blue-100">
            <h3 className="font-bold text-sm text-blue-900">Slider Config:</h3>
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Auto-Scroll Speed (ms):</label>
                <input 
                    type="number" 
                    value={sliderDelay}
                    onChange={(e) => setSliderDelay(Number(e.target.value))}
                    className="border p-1 rounded w-24"
                    step="500"
                    min="1000"
                />
            </div>
            <button 
                onClick={saveSettings}
                disabled={savingSettings}
                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 font-bold"
            >
                {savingSettings ? 'Saving...' : 'Save Speed'}
            </button>
        </div>

        {loading ? <div>Loading...</div> : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td className="px-6 py-4">
                      <div className="relative w-32 h-10 bg-gray-100 rounded overflow-hidden border">
                        <Image src={banner.image_url} alt={banner.title} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{banner.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{banner.link_url || 'No Link'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">{banner.sort_order}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        banner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      <Link 
                        href={`/admin/banners/${banner.id}`} 
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={banner.id} endpoint="banners" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}