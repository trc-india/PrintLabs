'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import AddToCartButton from '@/components/add-to-cart-button'

interface CustomProductBuilderProps {
  product: any
}

// Types matching the Admin structure
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

export default function CustomProductBuilder({ product }: CustomProductBuilderProps) {
  // --- STATE ---
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [selectedOptions, setSelectedOptions] = useState<Record<string, VisualChoice>>({})
  const [currentImage, setCurrentImage] = useState<string>('')
  
  // Safely extract config (handle cases where it might be null)
  const config = product.customization_config || { inputs: [], visualOptions: [] }
  const inputs: InputField[] = config.inputs || []
  const visualOptions: VisualOptionGroup[] = config.visualOptions || []

  // Initialize Default Image
  useEffect(() => {
    const mainImg = product.product_images?.find((img: any) => img.sort_order === 0)
    setCurrentImage(mainImg?.image_url || '')
  }, [product])

  // --- HANDLERS ---

  // 1. Handle Text/File Inputs
  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value
    }))
  }

  // 2. Handle Visual Option Clicks (The Magic Part)
  const handleOptionSelect = (groupId: string, choice: VisualChoice) => {
      // A. Update the selection state
      setSelectedOptions(prev => ({
          ...prev,
          [groupId]: choice
      }))

      // B. SWAP IMAGE LOGIC
      // If this choice has a specific image URL, switch the main view to it
      if (choice.imageUrl && choice.imageUrl.trim() !== '') {
          setCurrentImage(choice.imageUrl)
      }
  }

  // --- VALIDATION ---
  const isValid = () => {
      // 1. Check User Inputs
      const inputsValid = inputs.every(input => {
          if (!input.required) return true;
          return formValues[input.id] && formValues[input.id].trim() !== '';
      })

      // 2. Check Visual Options (User must select 1 from each group)
      const optionsValid = visualOptions.every(group => {
          return selectedOptions[group.id] !== undefined;
      })

      return inputsValid && optionsValid;
  }

  // --- PREPARE DATA FOR CART ---
  const getCustomizationData = () => {
      // Combine text inputs and selected options into one readable object
      const data: Record<string, string> = {};
      
      // Add Visual Options (e.g. "Material": "Wood")
      visualOptions.forEach(group => {
          const selected = selectedOptions[group.id];
          if (selected) {
              data[group.name] = selected.label;
          }
      });

      // Add User Inputs (e.g. "Enter Name": "Shardul")
      inputs.forEach(input => {
          if (formValues[input.id]) {
              data[input.label] = formValues[input.id];
          }
      });

      return data;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* === LEFT COLUMN: The Visual Stage === */}
        <div className="sticky top-24 h-fit">
          <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200">
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover transition-all duration-500 ease-in-out"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Preview Available
              </div>
            )}
          </div>
          
          {/* Standard Gallery Thumbnails */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {product.product_images?.map((img: any, i: number) => (
              <button
                key={i}
                onClick={() => setCurrentImage(img.image_url)}
                className={`aspect-square relative rounded-md overflow-hidden border-2 transition ${
                  currentImage === img.image_url ? 'border-black ring-2 ring-black ring-offset-1' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image src={img.image_url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* === RIGHT COLUMN: The Control Panel === */}
        <div className="space-y-8">
          <div className="border-b pb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-2xl font-medium text-gray-900">₹{product.base_price}</p>
            <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-8">
            <h3 className="font-bold text-xl text-gray-900">
              {config.heading || 'Customize Your Order'}
            </h3>

            {/* 1. VISUAL OPTIONS (Materials, Colors, etc.) */}
            {visualOptions.map((group) => (
                <div key={group.id}>
                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                        {group.name}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {group.choices.map((choice) => {
                            const isSelected = selectedOptions[group.id]?.value === choice.value;
                            return (
                                <button
                                    key={choice.value}
                                    onClick={() => handleOptionSelect(group.id, choice)}
                                    className={`py-3 px-4 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                                        isSelected
                                            ? 'border-black bg-black text-white shadow-md transform scale-105'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm'
                                    }`}
                                >
                                    {choice.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}

            {visualOptions.length > 0 && inputs.length > 0 && <hr className="border-gray-200" />}

            {/* 2. USER INPUTS (Text, Files) */}
            {inputs.map((input) => (
              <div key={input.id}>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  {input.label} {input.required && <span className="text-red-500">*</span>}
                </label>
                
                {input.type === 'text' ? (
                  <input
                    type="text"
                    placeholder="Type here..."
                    value={formValues[input.id] || ''}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition shadow-sm"
                  />
                ) : (
                   <div className="relative">
                       {/* Basic File Input Placeholder - In real app, consider Dropzone */}
                       <input
                        type="text"
                        placeholder="Paste link to file (Google Drive/Dropbox)"
                        value={formValues[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                         className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition shadow-sm"
                       />
                       <p className="text-xs text-gray-500 mt-1">
                           *For custom uploads, please paste a Google Drive link for now.
                       </p>
                   </div>
                )}
              </div>
            ))}
          </div>

          {/* ACTION AREA */}
          <div className="pt-2">
             <AddToCartButton 
                product={product} 
                customization={getCustomizationData()} // <--- Passing the combined data
                disabled={!isValid()} 
             />
             {!isValid() && (
                 <p className="text-center text-sm text-red-500 mt-3 bg-red-50 py-2 rounded">
                     Please select all options to proceed
                 </p>
             )}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 py-3 rounded-lg">
             <span>⚡ Production time: <strong>{product.production_time_hours} Hours</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}