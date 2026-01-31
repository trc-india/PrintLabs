'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import AddToCartButton from '@/components/add-to-cart-button'

interface CustomProductBuilderProps {
  product: any
}

export default function CustomProductBuilder({ product }: CustomProductBuilderProps) {
  // 1. Setup State for Form Inputs
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [currentImage, setCurrentImage] = useState<string>('')
  
  const config = product.customization_config || { fields: [] }
  const rules = product.customization_rules || {}

  // Set initial image
  useEffect(() => {
    const mainImg = product.product_images?.find((img: any) => img.sort_order === 0)
    setCurrentImage(mainImg?.image_url || '')
  }, [product])

  // Handle Input Changes
  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value
    }))

    // Future: Check 'rules' here to swap images based on selection
    // e.g. if (rules[value]) setCurrentImage(rules[value])
  }

  // Validate: Check if all required fields are filled
  const isValid = config.fields.every((field: any) => {
    if (field.required === false) return true
    return formValues[field.id] && formValues[field.id].trim() !== ''
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* LEFT COLUMN: The Visual Stage */}
        <div className="sticky top-24 h-fit">
          <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden shadow-lg border">
             {/* This image can eventually be dynamic/canvas */}
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Preview Available
              </div>
            )}
            
            {/* Optional: Text Overlay Preview (Phase 3) */}
            {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold font-mono">
                {formValues['name_text']}
            </div> */}
          </div>
          
          {/* Thumbnails */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {product.product_images?.map((img: any, i: number) => (
              <button
                key={i}
                onClick={() => setCurrentImage(img.image_url)}
                className={`aspect-square relative rounded-md overflow-hidden border-2 ${
                  currentImage === img.image_url ? 'border-black' : 'border-transparent'
                }`}
              >
                <Image src={img.image_url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: The Control Panel */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-2xl font-medium text-gray-900">₹{product.base_price}</p>
          </div>

          <div className="prose text-gray-600">
            <p>{product.description}</p>
          </div>

          {/* DYNAMIC FORM BUILDER */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">
              {config.heading || 'Customize Your Order'}
            </h3>

            {config.fields.map((field: any) => (
              <div key={field.id}>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {field.label}
                </label>
                
                {/* TEXT INPUT */}
                {field.type === 'text' && (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    value={formValues[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition"
                  />
                )}

                {/* SELECT DROPDOWN */}
                {field.type === 'select' && (
                  <div className="grid grid-cols-2 gap-2">
                    {field.options.map((opt: string) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleInputChange(field.id, opt)}
                        className={`py-2 px-4 rounded-lg text-sm border font-medium transition ${
                          formValues[field.id] === opt
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Helper Text */}
                {field.type === 'text' && field.maxLength && (
                    <p className="text-xs text-gray-500 mt-1 text-right">
                        {formValues[field.id]?.length || 0} / {field.maxLength} chars
                    </p>
                )}
              </div>
            ))}
          </div>

          {/* ACTION AREA */}
          <div className="pt-4">
             <AddToCartButton 
                product={product} 
                customization={formValues}
                disabled={!isValid} 
             />
             {!isValid && (
                 <p className="text-center text-sm text-red-500 mt-2">
                     Please fill in all options to continue
                 </p>
             )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
             <span>🚚 {product.production_time_hours} Hours Production Time</span>
          </div>
        </div>
      </div>
    </div>
  )
}