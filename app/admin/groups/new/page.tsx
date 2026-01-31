'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewGroupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: '', description: '', sort_order: 0 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/groups', {
      method: 'POST',
      body: JSON.stringify(formData)
    })
    router.push('/admin/groups')
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create New Collection</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Group Name</label>
          <input 
            type="text" required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full border p-2 rounded"
            placeholder="e.g. Gifts Under 500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description (Optional)</label>
          <textarea 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sort Order (Homepage Priority)</label>
          <input 
            type="number"
            value={formData.sort_order}
            onChange={e => setFormData({...formData, sort_order: Number(e.target.value)})}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex gap-4 pt-4">
          <button type="submit" className="flex-1 bg-black text-white py-2 rounded">Create Group</button>
          <Link href="/admin/groups" className="flex-1 bg-gray-100 text-center py-2 rounded">Cancel</Link>
        </div>
      </form>
    </div>
  )
}