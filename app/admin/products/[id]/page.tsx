'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// --- Types (Must match New Product Page) ---
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
  extraPrice?: number 
}

type VisualOptionGroup = {
  id: string
  name: string
  choices: VisualChoice[]
}

type CustomConfig = {
  heading: string
  enableMultiItem?: boolean // NEW
  inputs: InputField[]
  visualOptions: VisualOptionGroup[]
}
// -----------------------------

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  // Basic Form State
  const [imageUrls, setImageUrls] = useState<string[]>(['']) 
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    base_price: '',
    compare_at_price: '', 
    sku: '',
    weight_grams: '',
    tags: '', 
    is_customizable: false,
    production_time_hours: 24,
    status: 'active',
  })

  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' })

  const [customConfig, setCustomConfig] = useState<CustomConfig>({
    heading: 'Customize Your Product',
    enableMultiItem: false,
    inputs: [],
    visualOptions: []
  })

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch('/api/categories')
        ])

        if (!prodRes.ok) throw new Error('Product not found')
        
        const product = await prodRes.json()
        const cats = await catRes.json()
        
        setCategories(cats)

        // Populate Fields
        setFormData({
            name: product.name || '',
            slug: product.slug || '',
            category_id: product.category_id || '',
            description: product.description || '',
            base_price: product.base_price || '',
            compare_at_price: product.compare_at_price || '',
            sku: product.sku || '',
            weight_grams: product.weight_grams || '',
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
            is_customizable: product.is_customizable || false,
            production_time_hours: product.production_time_hours || 24,
            status: product.status || 'active'
        })

        if (product.dimensions) {
            setDimensions({
                length: product.dimensions.L || '',
                width: product.dimensions.W || '',
                height: product.dimensions.H || ''
            })
        }

        if (product.imageUrls && product.imageUrls.length > 0) {
            setImageUrls(product.imageUrls)
        }

        if (product.customization_config) {
            setCustomConfig(product.customization_config)
        }

      } catch (err) {
        console.error(err)
        router.push('/admin/products')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, router])


  // --- BUILDER HELPERS ---
  const addInput = () => {
    const newInput: InputField = { 
        id: `input_${Date.now()}`, 
        type: 'text', 
        label: 'Enter text', 
        required: true
    }
    setCustomConfig({ ...customConfig, inputs: [...customConfig.inputs, newInput] })
  }

  const updateInput = (index: number, field: keyof InputField, value: any) => {
    const newInputs = [...customConfig.inputs]
    // @ts-ignore
    newInputs[index][field] = value
    setCustomConfig({ ...customConfig, inputs: newInputs })
  }

  const removeInput = (index: number) => {
    const newInputs = customConfig.inputs.filter((_, i) => i !== index)
    setCustomConfig({ ...customConfig, inputs: newInputs })
  }

  const addVisualGroup = () => {
    const newGroup: VisualOptionGroup = {
      id: `group_${Date.now()}`,
      name: 'Color',
      choices: [{ label: 'Red', value: 'red', imageUrl: '', extraPrice: 0 }]
    }
    setCustomConfig({ ...customConfig, visualOptions: [...customConfig.visualOptions, newGroup] })
  }

  const updateGroup = (index: number, field: 'name', value: string) => {
    const newGroups = [...customConfig.visualOptions]
    newGroups[index][field] = value
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }

  const addChoiceToGroup = (groupIndex: number) => {
    const newGroups = [...customConfig.visualOptions]
    newGroups[groupIndex].choices.push({ 
        label: 'New Option', 
        value: `choice_${Date.now()}`, 
        imageUrl: '',
        extraPrice: 0 
    })
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }

  const updateChoice = (groupIndex: number, choiceIndex: number, field: keyof VisualChoice, value: any) => {
    const newGroups = [...customConfig.visualOptions]
    // @ts-ignore
    newGroups[groupIndex].choices[choiceIndex][field] = value
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }

  const removeChoice = (groupIndex: number, choiceIndex: number) => {
    const newGroups = [...customConfig.visualOptions]
    newGroups[groupIndex].choices = newGroups[groupIndex].choices.filter((_, i) => i !== choiceIndex)
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }

  const removeGroup = (index: number) => {
    const newGroups = customConfig.visualOptions.filter((_, i) => i !== index)
    setCustomConfig({ ...customConfig, visualOptions: newGroups })
  }

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...formData,
      base_price: Number(formData.base_price),
      compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
      weight_grams: formData.weight_grams ? Number(formData.weight_grams) : 0,
      dimensions: {
        L: Number(dimensions.length),
        W: Number(dimensions.width),
        H: Number(dimensions.height)
      },
      tags: formData.tags.toString().split(',').map(t => t.trim()).filter(t => t !== ''),
      imageUrls: imageUrls.filter(url => url.trim() !== ''),
      customization_config: formData.is_customizable ? customConfig : null
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      alert('Error updating product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-gray-500">Loading Product Data...</div>

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <a href={`/products/${formData.slug}`} target="_blank" className="text-blue-600 hover:underline text-sm">
            View Live Page ↗
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. BASIC INFO */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="font-bold text-xl border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input 
                type="text" required 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium mb-1">Slug</label>
               <input 
                 type="text" required 
                 value={formData.slug}
                 onChange={e => setFormData({...formData, slug: e.target.value})}
                 className="w-full border p-2 rounded bg-gray-50 font-mono text-sm"
               />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* 2. PRICING */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="font-bold text-xl border-b pb-2">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Base Price (₹)</label>
              <input 
                type="number" required 
                value={formData.base_price}
                onChange={e => setFormData({...formData, base_price: e.target.value})}
                className="w-full border p-2 rounded font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-500">Compare Price (₹)</label>
              <input 
                type="number" 
                value={formData.compare_at_price}
                onChange={e => setFormData({...formData, compare_at_price: e.target.value})}
                className="w-full border p-2 rounded text-gray-500"
              />
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input 
                type="text" 
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
                className="w-full border p-2 rounded uppercase"
              />
            </div>
          </div>
        </div>

        {/* 3. SHIPPING */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="font-bold text-xl border-b pb-2">Shipping Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Weight (grams)</label>
                    <input 
                        type="number" 
                        value={formData.weight_grams}
                        onChange={e => setFormData({...formData, weight_grams: e.target.value})}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Length (cm)</label>
                    <input type="number" value={dimensions.length} onChange={e => setDimensions({...dimensions, length: e.target.value})} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Width (cm)</label>
                    <input type="number" value={dimensions.width} onChange={e => setDimensions({...dimensions, width: e.target.value})} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Height (cm)</label>
                    <input type="number" value={dimensions.height} onChange={e => setDimensions({...dimensions, height: e.target.value})} className="w-full border p-2 rounded" />
                </div>
            </div>
        </div>

        {/* 4. ORGANIZATION */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
           <h2 className="font-bold text-xl border-b pb-2">Organization</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                    className="w-full border p-2 rounded bg-white"
                >
                    <option value="">Select Category</option>
                    {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input 
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                    className="w-full border p-2 rounded"
                />
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full border p-2 rounded bg-white"
                >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                </select>
             </div>
           </div>
        </div>

        {/* 5. IMAGES */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
           <h2 className="font-bold text-xl border-b pb-2">Product Images</h2>
           {imageUrls.map((url, index) => (
             <div key={index} className="flex gap-2 mb-2 items-start">
               <div className="flex-1">
                 <input 
                   type="text" 
                   value={url}
                   onChange={e => {
                      const newUrls = [...imageUrls]
                      newUrls[index] = e.target.value
                      setImageUrls(newUrls)
                   }}
                   className="w-full border p-2 rounded mb-1"
                   placeholder="https://..."
                 />
                 {url && (
                    <div className="w-16 h-16 relative bg-gray-100 rounded border">
                        <Image src={url} alt="Preview" fill className="object-cover" />
                    </div>
                 )}
               </div>
               {index > 0 && (
                 <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))} className="text-red-500 font-bold px-2 py-2">×</button>
               )}
             </div>
           ))}
           <button type="button" onClick={() => setImageUrls([...imageUrls, ''])} className="text-blue-600 font-medium">+ Add Another Image</button>
        </div>

        {/* 6. CUSTOMIZATION BUILDER */}
        <div className="bg-white p-6 rounded-lg shadow border-2 border-transparent focus-within:border-black transition">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
             <h2 className="font-bold text-xl">Customization Builder</h2>
             <div className="flex items-center">
                <input 
                    type="checkbox"
                    checked={formData.is_customizable}
                    onChange={e => setFormData({...formData, is_customizable: e.target.checked})}
                    className="w-5 h-5 text-black rounded"
                />
                <label className="ml-2 font-medium">Enable Customization</label>
             </div>
          </div>

          {formData.is_customizable && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div>
                <label className="block text-sm font-medium mb-1">Section Heading</label>
                <input 
                    type="text"
                    value={customConfig.heading}
                    onChange={e => setCustomConfig({...customConfig, heading: e.target.value})}
                    className="w-full border p-2 rounded"
                />
              </div>

               {/* NEW: Multi-Item (Repeater) Switch */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                 <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="enableMultiItem"
                        checked={customConfig.enableMultiItem || false}
                        onChange={e => setCustomConfig({...customConfig, enableMultiItem: e.target.checked})}
                        className="w-5 h-5 text-blue-600 rounded"
                    />
                    <label htmlFor="enableMultiItem" className="font-bold text-blue-900 cursor-pointer">
                        Enable Multi-Item Customization?
                    </label>
                 </div>
                 <p className="text-sm text-blue-700 mt-1 ml-7">
                    If checked, when user selects Quantity 3, we show 3 separate sets of input forms. 
                 </p>
              </div>

              {/* A. User Inputs */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700">1. User Inputs (Text/Files)</h3>
                    <button type="button" onClick={addInput} className="bg-white border px-3 py-1 rounded text-sm hover:bg-gray-100">+ Add Input</button>
                </div>
                <div className="space-y-3">
                  {customConfig.inputs.map((input, index) => (
                    <div key={input.id} className="flex gap-2 items-start bg-white p-3 rounded border">
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-1">
                          <input type="text" value={input.label} onChange={(e) => updateInput(index, 'label', e.target.value)} className="border p-2 rounded text-sm" placeholder="Label" />
                          <select value={input.type} onChange={(e) => updateInput(index, 'type', e.target.value)} className="border p-2 rounded text-sm">
                             <option value="text">Text Field</option>
                             <option value="file">File Upload</option>
                          </select>
                          <div className="flex items-center gap-2">
                             <input type="checkbox" checked={input.required} onChange={(e) => updateInput(index, 'required', e.target.checked)} />
                             <span className="text-sm">Required</span>
                          </div>
                       </div>
                       <button type="button" onClick={() => removeInput(index)} className="text-red-500 font-bold px-2">×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* B. Visual Options */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700">2. Visual Choices</h3>
                    <button type="button" onClick={addVisualGroup} className="bg-white border px-3 py-1 rounded text-sm hover:bg-gray-100">+ Add Group</button>
                </div>
                <div className="space-y-6">
                  {customConfig.visualOptions.map((group, gIndex) => (
                    <div key={group.id} className="bg-white p-4 rounded border relative">
                      <button type="button" onClick={() => removeGroup(gIndex)} className="absolute top-2 right-2 text-red-500 text-xs">Remove Group</button>
                      <div className="mb-3">
                        <label className="text-xs font-bold text-gray-500 uppercase">Group Name</label>
                        <input type="text" value={group.name} onChange={(e) => updateGroup(gIndex, 'name', e.target.value)} className="border p-1 rounded w-full" placeholder="e.g. Material" />
                      </div>
                      
                      <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                        {group.choices.map((choice, cIndex) => (
                          <div key={cIndex} className="flex gap-2 items-center">
                            <input type="text" value={choice.label} onChange={(e) => updateChoice(gIndex, cIndex, 'label', e.target.value)} className="border p-1 text-sm bg-white w-1/4" placeholder="Label" />
                            
                            <div className="relative w-20">
                                <span className="absolute left-1 top-1 text-xs text-gray-400">₹</span>
                                <input 
                                    type="number" 
                                    value={choice.extraPrice || 0} 
                                    onChange={(e) => updateChoice(gIndex, cIndex, 'extraPrice', Number(e.target.value))} 
                                    className="border p-1 pl-4 text-sm bg-green-50 w-full" 
                                />
                            </div>

                            <input type="text" value={choice.value} onChange={(e) => updateChoice(gIndex, cIndex, 'value', e.target.value)} className="border p-1 text-sm bg-white w-1/4" placeholder="Value" />
                            <input type="text" value={choice.imageUrl} onChange={(e) => updateChoice(gIndex, cIndex, 'imageUrl', e.target.value)} placeholder="Image URL" className="border p-1 text-sm bg-blue-50 flex-1"/>
                            <button type="button" onClick={() => removeChoice(gIndex, cIndex)} className="text-red-500 font-bold px-2">×</button>
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

        {/* Buttons */}
        <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-gray-50 p-4 -mx-4 shadow-md z-10">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 font-bold text-lg"
          >
            {saving ? 'Saving...' : 'Update Product'}
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