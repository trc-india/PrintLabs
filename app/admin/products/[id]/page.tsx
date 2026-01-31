'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type InputField = {
    id: string;
    type: 'text' | 'file';
    label: string;
    required: boolean;
}

type VisualChoice = {
    label: string;
    value: string;
    imageUrl: string;
}

type VisualOptionGroup = {
    id: string;
    name: string;
    choices: VisualChoice[];
}

type CustomConfig = {
    heading: string;
    inputs: InputField[];
    visualOptions: VisualOptionGroup[];
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    base_price: '',
    tags: '', // <--- NEW: State for Tags
    is_customizable: false,
    production_time_hours: 24,
    status: 'active',
  })

  // Builder State
  const [customConfig, setCustomConfig] = useState<CustomConfig>({
    heading: 'Customize Your Product',
    inputs: [],
    visualOptions: []
  })

  // 1. Fetch Categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  // 2. Fetch Product Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()

        setFormData({
            name: data.name,
            slug: data.slug,
            category_id: data.category_id || '',
            description: data.description || '',
            base_price: data.base_price,
            tags: data.tags ? data.tags.join(', ') : '', // <--- Join array to string for display
            is_customizable: data.is_customizable,
            production_time_hours: data.production_time_hours || 24,
            status: data.status
        })

        if (data.imageUrls && data.imageUrls.length > 0) {
            setImageUrls(data.imageUrls)
        }

        if (data.customization_config) {
            setCustomConfig(data.customization_config)
        }

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  // --- Handlers (Same as New Page) ---
  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
  }

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ''])
  }

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index)
    setImageUrls(newUrls)
  }

  // Builder Helpers
  const addInput = () => {
    const newInput: InputField = {
        id: `input_${Date.now()}`,
        type: 'text',
        label: 'New Input',
        required: true
    }
    setCustomConfig({
        ...customConfig,
        inputs: [...customConfig.inputs, newInput]
    })
  }

  const updateInput = (index: number, field: keyof InputField, value: any) => {
    const newInputs = [...customConfig.inputs]
    newInputs[index] = { ...newInputs[index], [field]: value }
    setCustomConfig({ ...customConfig, inputs: newInputs })
  }

  const removeInput = (index: number) => {
    const newInputs = customConfig.inputs.filter((_, i) => i !== index)
    setCustomConfig({ ...customConfig, inputs: newInputs })
  }

  const addVisualGroup = () => {
    const newGroup: VisualOptionGroup = {
        id: `group_${Date.now()}`,
        name: 'New Option Group',
        choices: []
    }
    setCustomConfig({
        ...customConfig,
        visualOptions: [...customConfig.visualOptions, newGroup]
    })
  }

  const updateVisualGroup = (index: number, field: keyof VisualOptionGroup, value: any) => {
    const newGroups = [...customConfig.visualOptions]
    newGroups[index] = { ...newGroups[index], [field]: value }
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }

  const addChoiceToGroup = (groupIndex: number) => {
    const newGroups = [...customConfig.visualOptions]
    // Unique ID Fix here too
    const uniqueId = `choice_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`
    
    newGroups[groupIndex].choices.push({
        label: 'New Choice',
        value: uniqueId,
        imageUrl: ''
    })
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }

  const updateChoice = (groupIndex: number, choiceIndex: number, field: keyof VisualChoice, value: string) => {
    const newGroups = [...customConfig.visualOptions]
    newGroups[groupIndex].choices[choiceIndex] = {
        ...newGroups[groupIndex].choices[choiceIndex],
        [field]: value
    }
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Parse Tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '')

      const payload = {
        ...formData,
        tags: tagsArray, // <--- Send Array
        imageUrls: imageUrls.filter(url => url.trim() !== ''),
        customization_config: formData.is_customizable ? customConfig : null
      }

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to update')

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      alert('Error updating product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading product...</div>

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <Link href="/admin/products" className="text-gray-600 hover:text-black">Cancel</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Category</label>
               <select
                 value={formData.category_id}
                 onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                 className="w-full border p-2 rounded focus:ring-2 focus:ring-black"
                 required
               >
                 <option value="">Select Category</option>
                 {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
            </div>
          </div>

          {/* --- NEW TAGS INPUT --- */}
          <div>
            <label className="block text-sm font-medium mb-1">
                Tags (Comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="gift, couple, best-seller"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-black"
            />
          </div>
          {/* ---------------------- */}

          <div>
             <label className="block text-sm font-medium mb-1">Product Images (URLs)</label>
             <div className="space-y-2">
                 {imageUrls.map((url, index) => (
                     <div key={index} className="flex gap-2">
                         <input
                             type="url"
                             value={url}
                             onChange={(e) => handleImageUrlChange(index, e.target.value)}
                             className="flex-1 border p-2 rounded"
                         />
                         <button type="button" onClick={() => removeImageUrl(index)} className="text-red-500">×</button>
                     </div>
                 ))}
                 <button type="button" onClick={addImageUrl} className="text-sm text-blue-600">+ Add URL</button>
             </div>
          </div>

          {/* Builder UI (Same as previous) */}
          {formData.is_customizable && (
            <div className="mt-6 border-t pt-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Customization Heading</label>
                    <input type="text" value={customConfig.heading} onChange={(e) => setCustomConfig({...customConfig, heading: e.target.value})} className="w-full border p-2 rounded"/>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <h3 className="font-medium">Text/File Inputs</h3>
                        <button type="button" onClick={addInput} className="text-sm bg-gray-100 px-2 py-1 rounded">+ Add</button>
                    </div>
                    {customConfig.inputs.map((input, index) => (
                        <div key={input.id} className="flex gap-4 items-center bg-gray-50 p-2 rounded">
                            <input type="text" value={input.label} onChange={(e) => updateInput(index, 'label', e.target.value)} className="flex-1 border p-1" />
                            <select value={input.type} onChange={(e) => updateInput(index, 'type', e.target.value)} className="border p-1">
                                <option value="text">Text</option>
                                <option value="file">File</option>
                            </select>
                            <button type="button" onClick={() => removeInput(index)} className="text-red-500">×</button>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <h3 className="font-medium">Visual Options</h3>
                        <button type="button" onClick={addVisualGroup} className="text-sm bg-gray-100 px-2 py-1 rounded">+ Group</button>
                    </div>
                    {customConfig.visualOptions.map((group, gIndex) => (
                        <div key={group.id} className="border p-4 rounded">
                            <input type="text" value={group.name} onChange={(e) => updateVisualGroup(gIndex, 'name', e.target.value)} className="w-full font-bold mb-2 border-b" />
                            <div className="pl-4 border-l-2 space-y-2">
                                {group.choices.map((choice, cIndex) => (
                                    <div key={cIndex} className="grid grid-cols-3 gap-2">
                                        <input type="text" value={choice.label} onChange={(e) => updateChoice(gIndex, cIndex, 'label', e.target.value)} className="border p-1" />
                                        <input type="text" value={choice.imageUrl} onChange={(e) => updateChoice(gIndex, cIndex, 'imageUrl', e.target.value)} placeholder="Image URL" className="border p-1" />
                                    </div>
                                ))}
                                <button type="button" onClick={() => addChoiceToGroup(gIndex)} className="text-sm text-blue-600 underline">+ Add Choice</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-gray-50 p-4 -mx-4 shadow-md">
          <button type="submit" disabled={saving} className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 font-bold text-lg">
            {saving ? 'Saving...' : 'Update Product'}
          </button>
          <Link href="/admin/products" className="flex-none px-8 py-3 bg-white border-2 border-gray-300 text-center rounded-lg hover:bg-gray-100 text-gray-800 font-semibold">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}