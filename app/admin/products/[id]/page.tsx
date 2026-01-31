'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type InputField = { id: string; type: 'text' | 'file'; label: string; required: boolean }
type VisualChoice = { label: string; value: string; imageUrl: string }
type VisualOptionGroup = { id: string; name: string; choices: VisualChoice[] }
type CustomConfig = { heading: string; inputs: InputField[]; visualOptions: VisualOptionGroup[] }

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [formData, setFormData] = useState({
    name: '', slug: '', category_id: '', description: '', base_price: '',
    tags: '', is_customizable: false, production_time_hours: 24, status: 'active',
  })

  const [customConfig, setCustomConfig] = useState<CustomConfig>({
    heading: 'Customize Your Product',
    inputs: [],
    visualOptions: []
  })

  // ... [Existing Fetch Logic remains same] ...
  useEffect(() => {
    if (!id) return 
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
           fetch('/api/categories'),
           fetch(`/api/products/${id}`)
        ])
        if (catRes.ok) setCategories(await catRes.json())
        if (prodRes.ok) {
            const data = await prodRes.json()
            setFormData({
                name: data.name, slug: data.slug, category_id: data.category_id || '',
                description: data.description || '', base_price: data.base_price,
                tags: data.tags ? data.tags.join(', ') : '', 
                is_customizable: data.is_customizable,
                production_time_hours: data.production_time_hours || 24, status: data.status
            })
            if (data.imageUrls?.length) setImageUrls(data.imageUrls)
            if (data.customization_config) setCustomConfig(data.customization_config)
        }
      } catch (err) { console.error(err) } finally { setLoading(false) }
    }
    fetchData()
  }, [id])

  // --- Handlers ---
  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls]; newUrls[index] = value; setImageUrls(newUrls)
  }
  const addImageUrl = () => setImageUrls([...imageUrls, ''])
  const removeImageUrl = (index: number) => setImageUrls(imageUrls.filter((_, i) => i !== index))

  // --- BUILDER HANDLERS (UPDATED WITH DELETE) ---
  const addInput = () => {
    setCustomConfig({
        ...customConfig,
        inputs: [...customConfig.inputs, { id: `input_${Date.now()}`, type: 'text', label: 'New Input', required: true }]
    })
  }
  const updateInput = (index: number, field: keyof InputField, value: any) => {
    const newInputs = [...customConfig.inputs]
    newInputs[index] = { ...newInputs[index], [field]: value }
    setCustomConfig({ ...customConfig, inputs: newInputs })
  }
  const removeInput = (index: number) => {
    setCustomConfig({ ...customConfig, inputs: customConfig.inputs.filter((_, i) => i !== index) })
  }

  // Visual Groups
  const addVisualGroup = () => {
    setCustomConfig({
        ...customConfig,
        visualOptions: [...customConfig.visualOptions, { id: `group_${Date.now()}`, name: 'New Option Group', choices: [] }]
    })
  }
  const updateVisualGroup = (index: number, field: keyof VisualOptionGroup, value: any) => {
    const newGroups = [...customConfig.visualOptions]
    newGroups[index] = { ...newGroups[index], [field]: value }
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }
  
  // 👇 NEW: Delete Visual Group
  const removeVisualGroup = (index: number) => {
    if(!confirm('Delete this entire group?')) return
    const newGroups = customConfig.visualOptions.filter((_, i) => i !== index)
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }

  // Choices
  const addChoiceToGroup = (groupIndex: number) => {
    const newGroups = [...customConfig.visualOptions]
    const uniqueId = `choice_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`
    newGroups[groupIndex].choices.push({ label: 'New Choice', value: uniqueId, imageUrl: '' })
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }
  const updateChoice = (groupIndex: number, choiceIndex: number, field: keyof VisualChoice, value: string) => {
    const newGroups = [...customConfig.visualOptions]
    newGroups[groupIndex].choices[choiceIndex] = { ...newGroups[groupIndex].choices[choiceIndex], [field]: value }
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }

  // 👇 NEW: Delete Choice
  const removeChoice = (groupIndex: number, choiceIndex: number) => {
    const newGroups = [...customConfig.visualOptions]
    newGroups[groupIndex].choices = newGroups[groupIndex].choices.filter((_, i) => i !== choiceIndex)
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      const payload = {
        ...formData,
        tags: tagsArray,
        imageUrls: imageUrls.filter(url => url.trim() !== ''),
        customization_config: formData.is_customizable ? customConfig : null
      }
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      router.push('/admin/products')
      router.refresh()
    } catch (error) { alert('Error updating product') } finally { setSaving(false) }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <Link href="/admin/products" className="text-gray-600 hover:text-black">Cancel</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          {/* ... Inputs same as before ... */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input type="text" readOnly value={formData.slug} className="w-full border p-2 rounded bg-gray-50 text-gray-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium mb-1">Price (₹)</label>
               <input type="number" required value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: e.target.value })} className="w-full border p-2 rounded" />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Category</label>
               <select required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full border p-2 rounded">
                 <option value="">Select Category</option>
                 {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full border p-2 rounded" />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
             <h2 className="text-lg font-semibold">Images</h2>
             <div className="space-y-2">
                 {imageUrls.map((url, index) => (
                     <div key={index} className="flex gap-2">
                         <input type="url" value={url} onChange={(e) => handleImageUrlChange(index, e.target.value)} className="flex-1 border p-2 rounded" />
                         <button type="button" onClick={() => removeImageUrl(index)} className="text-red-500">×</button>
                     </div>
                 ))}
                 <button type="button" onClick={addImageUrl} className="text-sm text-blue-600 font-bold">+ Add Image URL</button>
             </div>
        </div>

        {/* Builder */}
        <div className="bg-white p-6 rounded-lg shadow">
           <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Customization</h2>
              <input type="checkbox" checked={formData.is_customizable} onChange={(e) => setFormData({ ...formData, is_customizable: e.target.checked })} className="w-6 h-6" />
           </div>

           {formData.is_customizable && (
            <div className="space-y-6 pt-4 border-t">
                <div>
                    <label className="block text-sm font-medium mb-1">Heading</label>
                    <input type="text" value={customConfig.heading} onChange={(e) => setCustomConfig({...customConfig, heading: e.target.value})} className="w-full border p-2 rounded"/>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between"><h3 className="font-medium">Inputs</h3><button type="button" onClick={addInput} className="text-sm bg-gray-100 px-2 rounded">+ Add</button></div>
                    {customConfig.inputs.map((input, index) => (
                        <div key={input.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                            <input type="text" value={input.label} onChange={(e) => updateInput(index, 'label', e.target.value)} className="flex-1 border p-1" />
                            <select value={input.type} onChange={(e) => updateInput(index, 'type', e.target.value)} className="border p-1"><option value="text">Text</option><option value="file">File</option></select>
                            <button type="button" onClick={() => removeInput(index)} className="text-red-500">×</button>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between"><h3 className="font-medium">Visual Groups</h3><button type="button" onClick={addVisualGroup} className="text-sm bg-gray-100 px-2 rounded">+ Group</button></div>
                    {customConfig.visualOptions.map((group, gIndex) => (
                        <div key={group.id} className="border p-4 rounded bg-gray-50 relative group">
                            {/* DELETE GROUP BUTTON */}
                            <button 
                                type="button" 
                                onClick={() => removeVisualGroup(gIndex)}
                                className="absolute top-2 right-2 text-red-500 text-xs font-bold hover:bg-red-100 p-1 rounded"
                            >
                                DELETE GROUP
                            </button>

                            <input type="text" value={group.name} onChange={(e) => updateVisualGroup(gIndex, 'name', e.target.value)} className="w-full font-bold mb-2 border-b bg-transparent" placeholder="Group Name" />
                            
                            {group.choices.map((choice, cIndex) => (
                                <div key={cIndex} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-2 items-center">
                                    <input type="text" value={choice.label} onChange={(e) => updateChoice(gIndex, cIndex, 'label', e.target.value)} className="border p-1 text-sm bg-white" placeholder="Label" />
                                    <input type="text" value={choice.value} onChange={(e) => updateChoice(gIndex, cIndex, 'value', e.target.value)} className="border p-1 text-sm bg-white" placeholder="Value" />
                                    <input type="text" value={choice.imageUrl} onChange={(e) => updateChoice(gIndex, cIndex, 'imageUrl', e.target.value)} placeholder="Image URL" className="border p-1 text-sm bg-white" />
                                    {/* DELETE CHOICE BUTTON */}
                                    <button type="button" onClick={() => removeChoice(gIndex, cIndex)} className="text-red-500 font-bold px-2">×</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addChoiceToGroup(gIndex)} className="text-xs text-blue-600 font-bold mt-2">+ Add Choice</button>
                        </div>
                    ))}
                </div>
            </div>
           )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 p-4 -mx-4 border-t flex gap-4">
          <button type="submit" disabled={saving} className="flex-1 bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Update Product'}
          </button>
        </div>

      </form>
    </div>
  )
}