'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import AddToCartButton from '@/components/add-to-cart-button'
import { supabase } from '@/lib/supabase/client' 

interface CustomProductBuilderProps {
  product: any
}

// --- Types ---
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
    extraPrice?: number;
}

type VisualOptionGroup = {
    id: string;
    name: string;
    choices: VisualChoice[];
}

type CustomizationItem = {
    formValues: Record<string, string>
    selectedOptions: Record<string, VisualChoice>
}

export default function CustomProductBuilder({ product }: CustomProductBuilderProps) {
  // Config
  const config = product.customization_config || { inputs: [], visualOptions: [] }
  const inputs: InputField[] = config.inputs || []
  const visualOptions: VisualOptionGroup[] = config.visualOptions || []
  const enableMultiItem = config.enableMultiItem || false // THE MASTER SWITCH

  // --- STATE ---
  const [quantity, setQuantity] = useState(1)
  
  // Array of Customization Items (If enableMultiItem is true, length = quantity)
  // If enableMultiItem is false, length = 1
  const [items, setItems] = useState<CustomizationItem[]>([
      { formValues: {}, selectedOptions: {} }
  ])

  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({}) // Key: "0-label"
  const [totalPrice, setTotalPrice] = useState(product.base_price)


  // --- 1. SYNC ITEMS ARRAY WITH QUANTITY ---
  useEffect(() => {
     if (enableMultiItem) {
        setItems(prev => {
            if (prev.length === quantity) return prev
            
            // If increasing quantity, add new empty items
            if (quantity > prev.length) {
                const newItems = [...prev]
                for (let i = prev.length; i < quantity; i++) {
                    newItems.push({ formValues: {}, selectedOptions: {} })
                }
                return newItems
            }
            
            // If decreasing, cut off the end
            return prev.slice(0, quantity)
        })
     } else {
        // Legacy mode: Always 1 item
        if (items.length !== 1) {
            setItems([items[0] || { formValues: {}, selectedOptions: {} }])
        }
     }
  }, [quantity, enableMultiItem])


  // --- 2. CALCULATE TOTAL PRICE ---
  useEffect(() => {
    let total = 0
    
    // Loop through every item in the list
    items.forEach(item => {
        let itemPrice = Number(product.base_price)
        
        // Add extra costs for this specific item
        Object.values(item.selectedOptions).forEach((choice) => {
            if (choice.extraPrice) {
                itemPrice += Number(choice.extraPrice)
            }
        })
        
        total += itemPrice
    })
    
    // If NOT multi-item (Legacy), we have 1 item config but Quantity > 1
    // So we multiply the single config price by quantity
    if (!enableMultiItem) {
        total = total * quantity
    }

    setTotalPrice(total)
  }, [items, quantity, product.base_price, enableMultiItem])


  // --- HANDLERS ---
  const handleOptionSelect = (itemIndex: number, groupName: string, choice: VisualChoice) => {
    setItems(prev => {
        const newItems = [...prev]
        newItems[itemIndex] = {
            ...newItems[itemIndex],
            selectedOptions: { ...newItems[itemIndex].selectedOptions, [groupName]: choice }
        }
        return newItems
    })
  }

  const handleTextChange = (itemIndex: number, label: string, value: string) => {
    setItems(prev => {
        const newItems = [...prev]
        newItems[itemIndex] = {
            ...newItems[itemIndex],
            formValues: { ...newItems[itemIndex].formValues, [label]: value }
        }
        return newItems
    })
  }

  const handleFileUpload = async (itemIndex: number, label: string, file: File) => {
    const key = `${itemIndex}-${label}`
    try {
        setUploadingState(prev => ({ ...prev, [key]: true }))
        
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `custom-uploads/${fileName}`

        const { error } = await supabase.storage
            .from('products') 
            .upload(filePath, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath)

        setItems(prev => {
            const newItems = [...prev]
            newItems[itemIndex] = {
                ...newItems[itemIndex],
                formValues: { ...newItems[itemIndex].formValues, [label]: publicUrl }
            }
            return newItems
        })

    } catch (error) {
        console.error('Upload failed', error)
        alert('Upload failed. Please try again.')
    } finally {
        setUploadingState(prev => ({ ...prev, [key]: false }))
    }
  }

  // --- VALIDATION ---
  const isValid = () => {
    // Check every active item
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        
        // Check Required Inputs
        for (const input of inputs) {
            if (input.required && !item.formValues[input.label]) return false
        }
        // Check Required Visual Options
        for (const group of visualOptions) {
            if (!item.selectedOptions[group.name]) return false
        }
    }
    return true
  }

  // Prepare Data for Cart
  // If Multi-Item: Send the Array. If Single: Send the Object (for backward compatibility if needed, but array is safer)
  const getCustomizationData = () => {
      // Return the raw items array. backend will handle it.
      // We map it to a cleaner format: { "Name": "Rahul", "Color": "Red" }
      return items.map(item => {
          const options = Object.entries(item.selectedOptions).reduce((acc, [key, val]) => {
              acc[key] = val.label
              return acc
          }, {} as Record<string, string>)
          return { ...options, ...item.formValues }
      })
  }

  // Helper to get preview image (From Item 0 or Product)
  const previewImage = items[0]?.selectedOptions && Object.values(items[0].selectedOptions).reverse()[0]?.imageUrl 
    ? Object.values(items[0].selectedOptions).reverse()[0]?.imageUrl 
    : product.product_images?.[0]?.image_url || '/placeholder.png'


  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
      
      {/* LEFT: Image Gallery */}
      <div className="space-y-4">
         <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden border sticky top-24">
            <Image 
                src={previewImage} 
                alt="Preview"
                fill
                className="object-cover"
            />
         </div>
      </div>

      {/* RIGHT: Builder Controls */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        
        {/* PRICE DISPLAY */}
        <div className="text-2xl font-bold mb-6 flex items-center gap-3">
             <span>₹{totalPrice}</span>
             {quantity > 1 && (
                 <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                     ({quantity} items)
                 </span>
             )}
        </div>

        <p className="text-gray-600 mb-8">{product.description}</p>
        
        {/* QUANTITY SELECTOR (Moved to Top) */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-bold text-sm uppercase mb-3 text-gray-800">Quantity</h3>
            <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-10 h-10 rounded border bg-white hover:bg-gray-100 font-bold">-</button>
                <span className="font-bold text-xl w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q+1)} className="w-10 h-10 rounded border bg-white hover:bg-gray-100 font-bold">+</button>
            </div>
            {enableMultiItem && quantity > 1 && (
                <p className="text-sm text-blue-600 mt-2">
                    Fill in details for {quantity} separate items below:
                </p>
            )}
        </div>

        <div className="space-y-8 border-t pt-8">
          
          {/* RENDER FORM ITEMS (Loop based on items array) */}
          {items.map((item, index) => (
             <div key={index} className={`space-y-6 ${index > 0 ? 'border-t pt-8 mt-8' : ''}`}>
                
                {enableMultiItem && (
                    <h3 className="font-black text-lg text-black bg-gray-100 inline-block px-3 py-1 rounded">
                        Item #{index + 1}
                    </h3>
                )}

                {/* 1. VISUAL OPTIONS */}
                {visualOptions.map((group) => (
                    <div key={group.id}>
                        <h3 className="font-bold text-sm uppercase mb-3 text-gray-800">{group.name}</h3>
                        <div className="flex flex-wrap gap-3">
                            {group.choices.map((choice, idx) => {
                                const isSelected = item.selectedOptions[group.name]?.value === choice.value
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(index, group.name, choice)}
                                        className={`
                                            relative border-2 rounded-lg p-1 transition-all
                                            ${isSelected ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 px-3 py-2">
                                            {choice.imageUrl && (
                                                <div className="w-8 h-8 rounded-full overflow-hidden relative border">
                                                    <Image src={choice.imageUrl} alt={choice.label} fill className="object-cover" />
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <span className={`block text-sm font-medium ${isSelected ? 'text-black' : 'text-gray-600'}`}>
                                                    {choice.label}
                                                </span>
                                                {choice.extraPrice && choice.extraPrice > 0 ? (
                                                    <span className="text-xs text-green-600 font-bold">+₹{choice.extraPrice}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {/* 2. USER INPUTS */}
                {inputs.map((input) => (
                    <div key={input.id}>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                            {input.label} {input.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {input.type === 'text' ? (
                            <input 
                                type="text" 
                                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-black focus:outline-none transition"
                                placeholder={`Enter ${input.label}`}
                                value={item.formValues[input.label] || ''}
                                onChange={(e) => handleTextChange(index, input.label, e.target.value)}
                            />
                        ) : (
                            <div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    id={`file-${index}-${input.id}`}
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(index, input.label, e.target.files[0])}
                                />
                                <label 
                                    htmlFor={`file-${index}-${input.id}`}
                                    className={`
                                        block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
                                        ${item.formValues[input.label] ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}
                                    `}
                                >
                                    {uploadingState[`${index}-${input.label}`] ? (
                                        <span className="text-gray-500 animate-pulse">Uploading...</span>
                                    ) : item.formValues[input.label] ? (
                                        <span className="text-green-700 font-medium">✓ File Uploaded</span>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-600">Click to Upload File</p>
                                            <p className="text-xs text-gray-400">JPG, PNG, PDF</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        )}
                    </div>
                ))}
             </div>
          ))}

          {/* ACTION AREA */}
          <div className="pt-4 pb-20">
             <AddToCartButton 
                product={product} 
                // We flatten the list if it's single mode, or pass array if multi
                customization={enableMultiItem ? getCustomizationData() : getCustomizationData()[0]}
                disabled={!isValid()} 
                price={totalPrice / quantity} // Button expects Unit Price, math works out
                quantity={quantity}
             />
             {!isValid() && (
                 <p className="text-center text-sm text-red-500 mt-3">
                     Please fill all fields for all items to continue
                 </p>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}