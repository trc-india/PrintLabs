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
  const [categories, setCategories] = useState<any[]>([])

  // Basic Form State
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    base_price: '',
    is_customizable: false, // Default to false
    production_time_hours: 24,
    status: 'active',
  })

  // --- BUILDER STATE ---
  const [customConfig, setCustomConfig] = useState<CustomConfig>({
    heading: 'Customize Your Order',
    inputs: [],
    visualOptions: []
  })

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data)
      } catch (err) {
        console.error('Error fetching categories:', err)
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

  // --- BUILDER HELPERS ---
  const addInput = (type: 'text' | 'file') => {
    const newId = `input_${Date.now()}`
    setCustomConfig((prev) => ({
      ...prev,
      inputs: [
        ...prev.inputs,
        { id: newId, type, label: type === 'text' ? 'Enter Text' : 'Upload File', required: true },
      ],
    }))
  }

  const updateInput = (index: number, field: string, value: any) => {
    const newInputs = [...customConfig.inputs]
    newInputs[index] = { ...newInputs[index], [field]: value }
    setCustomConfig((prev) => ({ ...prev, inputs: newInputs }))
  }

  const removeInput = (index: number) => {
    setCustomConfig((prev) => ({
      ...prev,
      inputs: prev.inputs.filter((_, i) => i !== index),
    }))
  }

  const addVisualGroup = () => {
    const newId = `option_${Date.now()}`
    setCustomConfig((prev) => ({
      ...prev,
      visualOptions: [
        ...prev.visualOptions,
        { id: newId, name: 'New Option', choices: [] },
      ],
    }))
  }

  const removeVisualGroup = (groupIndex: number) => {
    setCustomConfig((prev) => ({
      ...prev,
      visualOptions: prev.visualOptions.filter((_, i) => i !== groupIndex),
    }))
  }

  const addChoiceToGroup = (groupIndex: number) => {
    const newGroups = [...customConfig.visualOptions]
    const uniqueId = `val_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    
    newGroups[groupIndex].choices.push({
      label: 'New Choice',
      value: uniqueId, 
      imageUrl: '',
    })
    setCustomConfig((prev) => ({ ...prev, visualOptions: newGroups }))
  }

  const updateChoice = (
    groupIndex: number,
    choiceIndex: number,
    field: keyof VisualChoice,
    value: string
  ) => {
    const newGroups = [...customConfig.visualOptions]
    newGroups[groupIndex].choices[choiceIndex][field] = value
    setCustomConfig((prev) => ({ ...prev, visualOptions: newGroups }))
  }

  const removeChoice = (groupIndex: number, choiceIndex: number) => {
    const newGroups = [...customConfig.visualOptions]
    newGroups[groupIndex].choices = newGroups[groupIndex].choices.filter(
      (_, i) => i !== choiceIndex
    )
    setCustomConfig((prev) => ({ ...prev, visualOptions: newGroups }))
  }

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const finalConfig = formData.is_customizable ? customConfig : null

      const payload = {
        ...formData,
        customization_config: finalConfig,
        customization_rules: null, // Deprecated
        imageUrls: imageUrls.filter((url) => url.trim() !== ''),
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push('/admin/products')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create product')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const updateUrl = (index: number, val: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = val
    setImageUrls(newUrls)
  }
  const addUrlField = () => setImageUrls([...imageUrls, ''])

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">New Product</h1>
        <Link href="/admin/products" className="text-gray-600 hover:text-black">
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- SECTION 1: Basic Details --- */}
        <div className="bg-white p-6 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="font-bold text-lg mb-4">Basic Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                type="text" required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text" required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full border p-2 rounded bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="font-bold text-lg mb-4 invisible">.</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <input
                  type="number" required
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hours</label>
                <input
                  type="number" required
                  value={formData.production_time_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, production_time_hours: Number(e.target.value) })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
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
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            {/* Added Description Here */}
            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border p-2 rounded"
                    placeholder="Product description..."
                />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: Images --- */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-4">Gallery Images</h2>
          <div className="space-y-3">
            {imageUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateUrl(i, e.target.value)}
                  placeholder="https://..."
                  className="flex-1 border p-2 rounded text-sm"
                />
              </div>
            ))}
            <button type="button" onClick={addUrlField} className="text-sm text-blue-600 underline">
              + Add URL slot
            </button>
          </div>
        </div>

        {/* --- SECTION 3: The Customization Builder --- */}
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_customizable"
                checked={formData.is_customizable}
                onChange={(e) =>
                  setFormData({ ...formData, is_customizable: e.target.checked })
                }
                className="h-5 w-5 text-black border-gray-300 rounded"
              />
              <label htmlFor="is_customizable" className="ml-2 text-lg font-bold text-gray-900">
                Enable Customization Engine
              </label>
            </div>
          </div>

          {formData.is_customizable && (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium mb-1">Customization Heading</label>
                <input
                  type="text"
                  value={customConfig.heading}
                  onChange={(e) =>
                    setCustomConfig({ ...customConfig, heading: e.target.value })
                  }
                  className="w-full border p-2 rounded bg-white"
                />
              </div>

              {/* === BUILDER PART 1: User Inputs === */}
              <div className="bg-white p-4 rounded border shadow-sm">
                <h3 className="font-bold text-md mb-4 flex justify-between items-center">
                  <span>1. User Inputs (What they type/upload)</span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => addInput('text')}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      + Text Box
                    </button>
                    <button
                      type="button"
                      onClick={() => addInput('file')}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      + File Upload
                    </button>
                  </div>
                </h3>

                {customConfig.inputs.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No inputs defined.</p>
                )}

                <div className="space-y-3">
                  {customConfig.inputs.map((input, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded border">
                      <span className="text-xs font-mono uppercase bg-gray-200 px-1 rounded">
                        {input.type}
                      </span>
                      <input
                        type="text"
                        value={input.label}
                        onChange={(e) => updateInput(i, 'label', e.target.value)}
                        className="flex-1 border p-1 rounded text-sm"
                        placeholder="Label (e.g., Enter Name)"
                      />
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={input.required}
                          onChange={(e) => updateInput(i, 'required', e.target.checked)}
                          className="mr-1"
                        />{' '}
                        Required
                      </label>
                      <button
                        type="button"
                        onClick={() => removeInput(i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* === BUILDER PART 2: Visual Options === */}
              <div className="bg-white p-4 rounded border shadow-sm">
                <h3 className="font-bold text-md mb-4 flex justify-between items-center">
                  <span>2. Visual Options (Clicks that change images)</span>
                  <button
                    type="button"
                    onClick={addVisualGroup}
                    className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800"
                  >
                    + Add Option Group
                  </button>
                </h3>

                {customConfig.visualOptions.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No visual options defined.</p>
                )}

                <div className="space-y-6">
                  {customConfig.visualOptions.map((group, gIndex) => (
                    <div
                      key={group.id}
                      className="border-2 border-gray-200 rounded-lg p-4 relative bg-gray-50"
                    >
                      <button
                        type="button"
                        onClick={() => removeVisualGroup(gIndex)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                      >
                        Delete Group
                      </button>

                      <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">
                          Group Name (e.g., Material)
                        </label>
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => {
                            const newGroups = [...customConfig.visualOptions]
                            newGroups[gIndex].name = e.target.value
                            setCustomConfig({ ...customConfig, visualOptions: newGroups })
                          }}
                          className="w-full md:w-1/2 border p-2 rounded bg-white"
                        />
                      </div>

                      <div className="space-y-3 pl-4 border-l-4 border-gray-300">
                        {group.choices.map((choice, cIndex) => (
                          <div
                            key={cIndex}
                            className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-white p-3 rounded border shadow-sm relative"
                          >
                            <button
                              type="button"
                              onClick={() => removeChoice(gIndex, cIndex)}
                              className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-200"
                            >
                              ×
                            </button>
                            <div>
                              <label className="block text-xs text-gray-500">
                                Choice Label
                              </label>
                              <input
                                type="text"
                                value={choice.label}
                                onChange={(e) =>
                                  updateChoice(gIndex, cIndex, 'label', e.target.value)
                                }
                                className="w-full border p-1 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">
                                ID (Fixed)
                              </label>
                              <input
                                type="text"
                                value={choice.value}
                                readOnly
                                className="w-full border p-1 rounded text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-blue-600">
                                Preview Image URL
                              </label>
                              <input
                                type="text"
                                value={choice.imageUrl}
                                onChange={(e) =>
                                  updateChoice(gIndex, cIndex, 'imageUrl', e.target.value)
                                }
                                placeholder="https://..."
                                className="w-full border p-1 rounded text-sm bg-blue-50"
                              />
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