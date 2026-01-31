'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ManageGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  
  // State
  const [id, setId] = useState<string | null>(null)
  const [group, setGroup] = useState<any>(null)
  const [items, setItems] = useState<any[]>([]) 
  const [allProducts, setAllProducts] = useState<any[]>([]) 
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Unwrap Params
  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [params])

  // Fetch Data
  useEffect(() => {
    if (!id) return 
    const fetchData = async () => {
      try {
        const [groupRes, productsRes] = await Promise.all([
          fetch(`/api/groups/${id}`),
          fetch('/api/products')
        ])
        
        const groupData = await groupRes.json()
        setGroup(groupData)
        setItems(groupData.products || [])
        setAllProducts(await productsRes.json())
      } catch (err) { console.error(err) } 
      finally { setLoading(false) }
    }
    fetchData()
  }, [id])

  // Handlers
  const addToGroup = (product: any) => {
    if (items.find(i => i.id === product.id)) return
    setItems([...items, product]) // Add to end
  }

  const removeFromGroup = (productId: string) => {
    setItems(items.filter(i => i.id !== productId))
  }

  // NEW: REORDER LOGIC
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === items.length - 1) return

    const newItems = [...items]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]]
    
    setItems(newItems)
  }

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await fetch(`/api/groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: group.name,
          description: group.description,
          // The backend saves them in the order of this array!
          product_ids: items.map(i => i.id) 
        })
      })
      alert('Group updated successfully!')
      router.refresh()
    } catch (err) {
      alert('Error updating group')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !group) return <div>Loading...</div>

  const searchResults = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !items.find(i => i.id === p.id) 
  )

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage: {group.name}</h1>
        <div className="flex gap-4">
             <Link href="/admin/groups" className="text-gray-600 hover:text-black py-2">Back to List</Link>
             <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold disabled:opacity-50"
             >
                {saving ? 'Saving...' : 'Save Changes'}
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: Items currently in this group */}
        <div className="bg-white p-6 rounded-lg shadow h-[600px] flex flex-col">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">
                Products Sequence ({items.length})
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2">
                {items.length === 0 ? (
                    <p className="text-gray-400 text-center mt-10">No products yet.</p>
                ) : (
                    items.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg group">
                            <div className="flex items-center gap-3">
                                <span className="bg-gray-200 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-gray-600">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-gray-500">₹{item.base_price}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                {/* UP/DOWN ARROWS */}
                                <button onClick={() => moveItem(index, 'up')} disabled={index===0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">⬆️</button>
                                <button onClick={() => moveItem(index, 'down')} disabled={index===items.length-1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">⬇️</button>
                                
                                <button 
                                    onClick={() => removeFromGroup(item.id)}
                                    className="ml-2 text-red-500 hover:bg-red-50 p-1 rounded text-xs"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* RIGHT: Search and Add Products */}
        <div className="bg-white p-6 rounded-lg shadow h-[600px] flex flex-col">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">Add Products</h2>
            <input 
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-black"
            />
            <div className="flex-1 overflow-y-auto space-y-2">
                {searchResults.map(product => (
                    <div 
                        key={product.id} 
                        className="flex items-center justify-between p-3 border hover:border-black rounded-lg transition cursor-pointer group" 
                        onClick={() => addToGroup(product)}
                    >
                         <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">₹{product.base_price}</p>
                        </div>
                        <button className="text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100">+ Add</button>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  )
}