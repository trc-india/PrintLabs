'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// --- Types for the Builder ---
type InputField = {
  id: string
  type: 'text' | 'file'
  label: string
  required: boolean
}

type VisualChoice = {
  label: string
  value: string
  imageUrl: string
}

type VisualOptionGroup = {
  id: string
  name: string
  choices: VisualChoice[]
}

type CustomConfig = {
  heading: string
  inputs: InputField[]
  visualOptions: VisualOptionGroup[]
}
// -----------------------------

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Basic Form State
  const [imageUrls, setImageUrls] = useState<string[]>(['']) 
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    base_price: '',
    tags: '', // <--- NEW: State for Tags (String format for input)
    is_customizable: false,
    production_time_hours: 24,
    status: 'active',
  })

  // --- BUILDER STATE ---
  const [customConfig, setCustomConfig] = useState<CustomConfig>({
    heading: 'Customize Your Product',
    inputs: [],
    visualOptions: []
  })

  // Fetch Categories
  const [categories, setCategories] = useState<any[]>([])
  useEffect(() => {
    const fetchCategories = async () => {
        const res = await fetch('/api/categories')
        if (res.ok) {
            const data = await res.json()
            setCategories(data)
        }
    }
    fetchCategories()
  }, [])

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    setFormData({ ...formData, name, slug })
  }

  // --- Image URL Management ---
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
  // --------------------------------------

  // --- HELPER FUNCTIONS FOR BUILDER ---
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
    
    // Generate Unique ID
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert comma-separated tags to Array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '')

      const payload = {
        ...formData,
        tags: tagsArray, // <--- Sending Array to backend
        imageUrls: imageUrls.filter(url => url.trim() !== ''),
        customization_config: formData.is_customizable ? customConfig : null
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to create product')

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Error creating product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        
        {/* Basic Info Section */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (Auto-generated)</label>
              <input
                type="text"
                required
                value={formData.slug}
                readOnly
                className="w-full border p-2 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Base Price (₹)</label>
              <input
                type="number"
                required
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Category</label>
               <select
                 value={formData.category_id}
                 onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                 className="w-full border p-2 rounded focus:ring-2 focus:ring-black focus:border-transparent"
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
              className="w-full border p-2 rounded focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
                Used for filtering (e.g., "Gifts under 500", "Diwali Special").
            </p>
          </div>
          {/* ---------------------- */}

          {/* Image URL Inputs */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Images (URLs)</label>
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 border p-2 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageUrl}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Another Image URL
              </button>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Detailed product description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium mb-1">Production Time (Hours)</label>
                <input
                  type="number"
                  value={formData.production_time_hours}
                  onChange={(e) => setFormData({ ...formData, production_time_hours: Number(e.target.value) })}
                  className="w-full border p-2 rounded"
                />
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
             </div>
          </div>
        </div>

        {/* Customization Toggle */}
        <div className="bg-white p-6 rounded-lg shadow">
           <div className="flex items-center justify-between mb-4">
              <div>
                  <h2 className="text-lg font-semibold">Customization Options</h2>
                  <p className="text-sm text-gray-500">Enable if users can customize this product</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.is_customizable}
                    onChange={(e) => setFormData({ ...formData, is_customizable: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
           </div>

           {/* BUILDER UI */}
           {formData.is_customizable && (
            <div className="mt-6 border-t pt-6 space-y-6">
              
              {/* Heading Configuration */}
              <div>
                <label className="block text-sm font-medium mb-1">Customization Heading</label>
                <input 
                    type="text" 
                    value={customConfig.heading}
                    onChange={(e) => setCustomConfig({...customConfig, heading: e.target.value})}
                    className="w-full border p-2 rounded"
                />
              </div>

              {/* Text Inputs Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">Text/File Inputs</h3>
                    <button type="button" onClick={addInput} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">
                        + Add Input Field
                    </button>
                </div>
                
                <div className="space-y-3">
                    {customConfig.inputs.map((input, index) => (
                        <div key={input.id} className="flex gap-4 items-start bg-gray-50 p-3 rounded">
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    placeholder="Label (e.g. 'Enter Name')"
                                    value={input.label}
                                    onChange={(e) => updateInput(index, 'label', e.target.value)}
                                    className="w-full border p-1 rounded text-sm mb-2"
                                />
                                <div className="flex gap-4">
                                    <select 
                                        value={input.type}
                                        onChange={(e) => updateInput(index, 'type', e.target.value)}
                                        className="border p-1 rounded text-sm"
                                    >
                                        <option value="text">Text Box</option>
                                        <option value="file">File Upload</option>
                                    </select>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input 
                                            type="checkbox"
                                            checked={input.required}
                                            onChange={(e) => updateInput(index, 'required', e.target.checked)}
                                        />
                                        Required
                                    </label>
                                </div>
                            </div>
                            <button type="button" onClick={() => removeInput(index)} className="text-red-500 hover:text-red-700">
                                ×
                            </button>
                        </div>
                    ))}
                </div>
              </div>

              {/* Visual Options Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">Visual Options (Colors, Materials)</h3>
                    <button type="button" onClick={addVisualGroup} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">
                        + Add Option Group
                    </button>
                </div>

                <div className="space-y-6">
                  {customConfig.visualOptions.map((group, gIndex) => (
                    <div key={group.id} className="border p-4 rounded-lg">
                      <div className="mb-4">
                        <input 
                           type="text"
                           placeholder="Group Name (e.g. 'Select Material')"
                           value={group.name}
                           onChange={(e) => updateVisualGroup(gIndex, 'name', e.target.value)}
                           className="w-full font-semibold border-b border-transparent hover:border-gray-300 focus:border-black outline-none bg-transparent"
                        />
                      </div>
                      
                      <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                        {group.choices.map((choice, cIndex) => (
                          <div key={cIndex} className="grid grid-cols-3 gap-3 bg-gray-50 p-2 rounded">
                            <div>
                                <label className="text-xs text-gray-500">Label</label>
                                <input type="text" value={choice.label} onChange={(e) => updateChoice(gIndex, cIndex, 'label', e.target.value)} className="w-full border p-1 rounded text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Value (Internal)</label>
                                <input type="text" value={choice.value} onChange={(e) => updateChoice(gIndex, cIndex, 'value', e.target.value)} className="w-full border p-1 rounded text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-blue-600">Preview Image URL</label>
                                <input type="text" value={choice.imageUrl} onChange={(e) => updateChoice(gIndex, cIndex, 'imageUrl', e.target.value)} placeholder="https://..." className="w-full border p-1 rounded text-sm bg-blue-50"/>
                            </div>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => addChoiceToGroup(gIndex)}
                          className="text-sm text-blue-600 underline font-bold"
                        >
                          + Add Choice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-gray-50 p-4 -mx-4 shadow-md">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 font-bold text-lg"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <Link
            href="/admin/products"
            className="flex-none px-8 py-3 bg-white border-2 border-gray-300 text-center rounded-lg hover:bg-gray-100 text-gray-800 font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}