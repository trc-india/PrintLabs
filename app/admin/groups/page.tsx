'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DeleteButton from '@/components/delete-button'

export default function GroupsListPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/groups').then(res => res.json()).then(data => {
      setGroups(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Product Collections</h1>
            <p className="text-gray-500">Curated groups for your homepage (e.g. "Diwali Sale")</p>
          </div>
          <Link href="/admin/groups/new" className="bg-black text-white px-4 py-2 rounded-lg">
            + Create Group
          </Link>
        </div>

        {loading ? <div>Loading...</div> : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-medium text-gray-500">Name</th>
                  <th className="p-4 font-medium text-gray-500">Slug</th>
                  <th className="p-4 font-medium text-gray-500">Status</th>
                  <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {groups.map(group => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{group.name}</td>
                    <td className="p-4 text-gray-500">{group.slug}</td>
                    <td className="p-4">
                      {group.is_active ? 
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span> : 
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Hidden</span>
                      }
                    </td>
                    <td className="p-4 text-right flex justify-end gap-4">
                      <Link href={`/admin/groups/${group.id}`} className="text-blue-600 hover:underline">
                        Manage Products
                      </Link>
                      <DeleteButton id={group.id} endpoint="groups" />
                    </td>
                  </tr>
                ))}
                {groups.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No groups yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}