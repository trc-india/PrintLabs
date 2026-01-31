'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SectionManagerPage() {
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSections = async () => {
    setLoading(true)
    const res = await fetch('/api/sections')
    if (res.ok) {
        setSections(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => { fetchSections() }, [])

  // ROBUST MOVE LOGIC
  const moveSection = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sections.length - 1) return

    const newSections = [...sections]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    // 1. Visually Swap immediately
    ;[newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]]
    setSections(newSections)

    try {
        // 2. Send update to server (Swap their sort_orders)
        const itemA = newSections[index]
        const itemB = newSections[swapIndex]

        await Promise.all([
            fetch(`/api/sections/${itemA.id}`, {
                method: 'PUT',
                body: JSON.stringify({ sort_order: index + 1 }) // Update to new position
            }),
            fetch(`/api/sections/${itemB.id}`, {
                method: 'PUT',
                body: JSON.stringify({ sort_order: swapIndex + 1 }) // Update to new position
            })
        ])
    } catch (error) {
        console.error("Sort failed", error)
        fetchSections() // Revert if server fails
    }
  }

  const deleteSection = async (id: string) => {
    if(!confirm('Delete this section?')) return
    await fetch(`/api/sections/${id}`, { method: 'DELETE' })
    fetchSections()
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold">Homepage Layout</h1>
           <p className="text-gray-500">Manage your dynamic homepage blocks.</p>
        </div>
        <Link href="/admin/sections/new" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
          + Add New Block
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="p-4 w-16">Pos</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Layout</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {sections.map((section, index) => (
                    <tr key={section.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-mono text-gray-500 font-bold">{index + 1}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                                section.section_type === 'banner_slider' ? 'bg-purple-100 text-purple-800' :
                                section.source_type === 'category' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {section.section_type === 'banner_slider' ? 'Banner' : section.source_type || 'Group'}
                            </span>
                        </td>
                        <td className="p-4 font-medium">
                            {section.title || '(No Title)'}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                             {section.layout_variant?.replace('_', ' ')}
                        </td>
                        <td className="p-4 flex justify-end gap-2 items-center">
                            {/* MOVE ARROWS */}
                            <button onClick={() => moveSection(index, 'up')} disabled={index===0} className="p-2 hover:bg-gray-200 rounded disabled:opacity-30">⬆️</button>
                            <button onClick={() => moveSection(index, 'down')} disabled={index===sections.length-1} className="p-2 hover:bg-gray-200 rounded disabled:opacity-30">⬇️</button>
                            
                            {/* EDIT BUTTON */}
                            <Link href={`/admin/sections/${section.id}`} className="ml-4 text-blue-600 hover:text-blue-900 font-medium text-sm">
                                Edit
                            </Link>
                            
                            {/* DELETE BUTTON */}
                            <button onClick={() => deleteSection(section.id)} className="ml-4 text-red-500 hover:text-red-700 text-sm">
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  )
}