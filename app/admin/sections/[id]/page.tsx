'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [groups, setGroups] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    section_type: 'product_row',
    title: '',
    source_type: 'group', 
    data_source_id: '',
    layout_variant: 'grid_4',
    // New: Settings for extra config like delay
    settings: { auto_scroll_delay: 3000 }
  })

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
        const [groupsRes, catsRes, sectionRes] = await Promise.all([
            fetch('/api/groups'),
            fetch('/api/categories'),
            fetch(`/api/sections`) 
        ])
        
        setGroups(await groupsRes.json())
        setCategories(await catsRes.json())

        const allSections = await sectionRes.json()
        const current = allSections.find((s: any) => s.id === id)
        
        if (current) {
            setFormData({
                section_type: current.section_type,
                title: current.title,
                source_type: current.source_type || 'group',
                data_source_id: current.data_source_id || '',
                layout_variant: current.layout_variant || 'grid_4',
                // Load existing settings or default to 3000
                settings: current.settings || { auto_scroll_delay: 3000 }
            })
        }
        setLoading(false)
    }
    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    await fetch(`/api/sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    router.push('/admin/sections')
  }

  const layoutOptions = [
    { id: 'grid_4', name: 'Standard Grid', icon: '■ ■ ■ ■' },
    { id: 'grid_5', name: 'Wide Grid', icon: '■ ■ ■ ■ ■' },
    { id: 'grid_6', name: 'High Density', icon: '▫ ▫ ▫ ▫ ▫ ▫' },
    { id: 'scroll_row', name: 'Manual Scroll', icon: '➡ ■ ■ ■ ➡' },
    { id: 'auto_scroll', name: 'Auto Scroll ⚡', icon: '⚡ ■ ■ ■ ⚡' }, // <--- New Option
    { id: 'featured_split', name: 'Big Left', icon: '█ ::' },
    { id: 'featured_split_right', name: 'Big Right', icon: ':: █' },
    { id: 'grid_2_big', name: 'Two Big', icon: '█ █' },
  ]

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-3xl mx-auto p-8 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Homepage Section</h1>
        <Link href="/admin/sections" className="text-gray-500 hover:text-black">Cancel</Link>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-8">
        
        {formData.section_type === 'product_row' ? (
            <>
                <div>
                    <label className="block text-sm font-bold mb-2">Content Source</label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                         <button type="button" onClick={() => setFormData({...formData, source_type: 'group'})} className={`p-2 border rounded text-sm ${formData.source_type === 'group' ? 'bg-black text-white' : ''}`}>Collection</button>
                         <button type="button" onClick={() => setFormData({...formData, source_type: 'category'})} className={`p-2 border rounded text-sm ${formData.source_type === 'category' ? 'bg-black text-white' : ''}`}>Category</button>
                         <button type="button" onClick={() => setFormData({...formData, source_type: 'manual_products'})} className={`p-2 border rounded text-sm ${formData.source_type === 'manual_products' ? 'bg-black text-white' : ''}`}>Manual</button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded">
                        <label className="block text-sm font-medium mb-1">Section Title</label>
                        <input 
                            type="text" required value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full border p-2 rounded mb-4"
                        />

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

                        {formData.source_type === 'manual_products' && (
                            <div className="text-sm text-blue-600">
                                ℹ️ Save this section, then use "Manage Items" on the list page to select products.
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-3">Layout Style</label>
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

                    {/* NEW: Settings for Auto Scroll */}
                    {formData.layout_variant === 'auto_scroll' && (
                        <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                            <label className="block text-sm font-bold text-blue-800 mb-1">
                                Auto-Scroll Speed (Milliseconds)
                            </label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={formData.settings?.auto_scroll_delay || 3000}
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
                </div>
            </>
        ) : (
            <div className="p-4 bg-gray-100 rounded text-center">
                This is a Banner Section. Manage actual banners in the "Banners" tab.
            </div>
        )}

        <button type="submit" disabled={saving} className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg">
            {saving ? 'Saving...' : 'Update Section'}
        </button>
      </form>
    </div>
  )
}