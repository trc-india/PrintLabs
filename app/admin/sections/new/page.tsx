'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewSectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    section_type: 'product_row',
    title: '',
    source_type: 'group', 
    data_source_id: '',
    layout_variant: 'grid_4',
    sort_order: 10,
    is_active: true,
    settings: { auto_scroll_delay: 3000 } // Default delay
  })

  useEffect(() => {
    fetch('/api/groups').then(res => res.json()).then(setGroups)
    fetch('/api/categories').then(res => res.json()).then(setCategories)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    router.push('/admin/sections')
  }

  // --- UPDATED LAYOUT OPTIONS ---
  const layoutOptions = [
    { id: 'grid_4', name: 'Standard Grid', icon: '■ ■ ■ ■' },
    { id: 'grid_5', name: 'Wide Grid', icon: '■ ■ ■ ■ ■' },
    { id: 'grid_6', name: 'High Density', icon: '▫ ▫ ▫ ▫ ▫ ▫' },
    { id: 'scroll_row', name: 'Manual Scroll', icon: '➡ ■ ■ ■ ➡' },
    { id: 'auto_scroll', name: 'Auto Scroll ⚡', icon: '⚡ ■ ■ ■ ⚡' }, // <--- NEW OPTION
    { id: 'featured_split', name: 'Big Left', icon: '█ ::' },
    { id: 'featured_split_right', name: 'Big Right', icon: ':: █' },
    { id: 'grid_2_big', name: 'Two Big', icon: '█ █' },
  ]

  return (
    <div className="max-w-3xl mx-auto p-8 pb-20">
      <h1 className="text-2xl font-bold mb-6">Add Homepage Section</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-8">
        
        {/* 1. SECTION TYPE */}
        <div>
            <label className="block text-sm font-bold mb-2">1. Section Type</label>
            <div className="flex gap-4">
                <button type="button" onClick={() => setFormData({...formData, section_type: 'product_row'})} className={`flex-1 p-4 border rounded-lg ${formData.section_type === 'product_row' ? 'ring-2 ring-black bg-gray-50' : ''}`}>Product List</button>
                <button type="button" onClick={() => setFormData({...formData, section_type: 'banner_slider'})} className={`flex-1 p-4 border rounded-lg ${formData.section_type === 'banner_slider' ? 'ring-2 ring-black bg-gray-50' : ''}`}>Banner Slider</button>
            </div>
        </div>

        {formData.section_type === 'product_row' && (
            <>
                {/* 2. SOURCE & TITLE */}
                <div className="bg-gray-50 p-4 rounded">
                    <label className="block text-sm font-medium mb-1">Section Title</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded mb-4" />

                    <div className="grid grid-cols-3 gap-2 mb-2">
                         <button type="button" onClick={() => setFormData({...formData, source_type: 'group'})} className={`p-2 border rounded text-sm ${formData.source_type === 'group' ? 'bg-black text-white' : 'bg-white'}`}>Collection</button>
                         <button type="button" onClick={() => setFormData({...formData, source_type: 'category'})} className={`p-2 border rounded text-sm ${formData.source_type === 'category' ? 'bg-black text-white' : 'bg-white'}`}>Category</button>
                         <button type="button" onClick={() => setFormData({...formData, source_type: 'manual_products'})} className={`p-2 border rounded text-sm ${formData.source_type === 'manual_products' ? 'bg-black text-white' : 'bg-white'}`}>Manual</button>
                    </div>

                    {formData.source_type === 'group' && (
                        <select required value={formData.data_source_id} onChange={e => setFormData({...formData, data_source_id: e.target.value})} className="w-full border p-2 rounded">
                            <option value="">-- Select Collection --</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    )}
                    {formData.source_type === 'category' && (
                        <select required value={formData.data_source_id} onChange={e => setFormData({...formData, data_source_id: e.target.value})} className="w-full border p-2 rounded">
                            <option value="">-- Select Category --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                </div>

                {/* 3. LAYOUT STYLE */}
                <div>
                    <label className="block text-sm font-bold mb-3">3. Layout Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {layoutOptions.map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setFormData({...formData, layout_variant: opt.id})}
                                className={`border rounded-lg p-3 text-left hover:bg-gray-50 transition ${formData.layout_variant === opt.id ? 'ring-2 ring-black border-black bg-gray-50' : ''}`}
                            >
                                <div className="text-gray-400 font-mono mb-1">{opt.icon}</div>
                                <span className="text-sm font-bold block">{opt.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. SETTINGS (Only for Auto Scroll) */}
                {formData.layout_variant === 'auto_scroll' && (
                    <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <label className="block text-sm font-bold text-blue-800 mb-1">
                            Auto-Scroll Speed (Milliseconds)
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                value={formData.settings.auto_scroll_delay}
                                onChange={(e) => setFormData({
                                    ...formData, 
                                    settings: { ...formData.settings, auto_scroll_delay: Number(e.target.value) }
                                })}
                                className="w-32 border p-2 rounded"
                                min="1000"
                                step="500"
                            />
                            <span className="text-sm text-blue-600">
                                (1000ms = 1 second)
                            </span>
                        </div>
                    </div>
                )}
            </>
        )}

        <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg">
            {loading ? 'Adding...' : 'Create Section'}
        </button>
      </form>
    </div>
  )
}