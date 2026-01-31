'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import AddToCartButton from '@/components/add-to-cart-button'
import { supabase } from '@/lib/supabase/client' // Import Supabase Client

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
  
  // New State for Uploading Status (to show spinner while file uploads)
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({})

  // Safely extract config (handle cases where it might be null)
  const config = product.customization_config || { inputs: [], visualOptions: [] }
  const inputs: InputField[] = config.inputs || []
  const visualOptions: VisualOptionGroup[] = config.visualOptions || []

  // Initialize Default Image
  useEffect(() => {
    const mainImg = product.product_images?.find((img: any) => img.sort_order === 0)
    if (mainImg) {
        setCurrentImage(mainImg.image_url)
    }
  }, [product])

  const handleInputChange = (id: string, value: string) => {
    setFormValues(prev => ({ ...prev, [id]: value }))
  }

  // --- NEW: Handle File Upload for Customers ---
  const handleFileUpload = async (inputId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    
    // Set uploading state for this specific input
    setUploadingState(prev => ({ ...prev, [inputId]: true }))

    try {
        // 1. Generate unique file path: uploads/timestamp_filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `uploads/${fileName}` // Keeping uploads in a subfolder

        // 2. Upload to Supabase 'products' bucket (or 'orders' if you prefer)
        // Note: Ensure your 'products' bucket allows public uploads or create a new public bucket
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        // 3. Get Public URL
        const { data } = supabase.storage
            .from('products')
            .getPublicUrl(filePath)
        
        // 4. Save URL to formValues (just like a text input)
        handleInputChange(inputId, data.publicUrl)

    } catch (error) {
        console.error('Upload failed:', error)
        alert('File upload failed. Please try again.')
    } finally {
        setUploadingState(prev => ({ ...prev, [inputId]: false }))
    }
  }

  const handleOptionSelect = (groupId: string, choice: VisualChoice) => {
    setSelectedOptions(prev => ({ ...prev, [groupId]: choice }))
    // If choice has a preview image, update the main image
    if (choice.imageUrl) {
        setCurrentImage(choice.imageUrl)
    }
  }

  // Validation
  const isValid = () => {
    // Check required inputs
    for (const input of inputs) {
        if (input.required && !formValues[input.id]) return false
    }
    return true
  }

  // Combine all data for Cart
  const getCustomizationData = () => {
    const textData = inputs.map(input => ({
        label: input.label,
        value: formValues[input.id]
    }))
    
    const visualData = Object.entries(selectedOptions).map(([groupId, choice]) => {
        const groupName = visualOptions.find(g => g.id === groupId)?.name || 'Option'
        return {
            label: groupName,
            value: choice.label // Storing the human-readable label (e.g., "Red")
        }
    })

    return [...textData, ...visualData]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
        
        {/* LEFT COLUMN: Image Gallery */}
        <div className="flex flex-col-reverse">
           <div className="mt-6 w-full max-w-2xl mx-auto block lg:max-w-none">
              <div className="grid grid-cols-4 gap-6">
                {product.product_images?.map((img: any) => (
                    <button 
                        key={img.image_url}
                        onClick={() => setCurrentImage(img.image_url)}
                        className={`relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4 ${currentImage === img.image_url ? 'ring ring-black' : ''}`}
                    >
                        <Image src={img.image_url} alt="" fill className="object-cover rounded-md" />
                    </button>
                ))}
              </div>
           </div>
           
           <div className="w-full aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                {currentImage && (
                    <Image 
                        src={currentImage} 
                        alt={product.name} 
                        fill 
                        className="object-cover object-center"
                        priority
                    />
                )}
           </div>
        </div>

        {/* RIGHT COLUMN: Customization Controls */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
          <div className="mt-3">
             <p className="text-3xl text-gray-900">₹{product.base_price}</p>
          </div>
          <div className="mt-6">
             <h3 className="sr-only">Description</h3>
             <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>

          <div className="mt-10 border-t pt-10">
            <h2 className="text-lg font-medium text-gray-900 mb-6">{config.heading || 'Customize Product'}</h2>
            
            {/* Visual Options (Colors, etc.) */}
            <div className="space-y-8 mb-8">
                {visualOptions.map((group) => (
                    <div key={group.id}>
                        <h3 className="text-sm font-medium text-gray-900 mb-4">{group.name}</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {group.choices.map((choice) => (
                                <button
                                    key={choice.value}
                                    onClick={() => handleOptionSelect(group.id, choice)}
                                    className={`
                                        border rounded-lg p-2 text-center transition hover:border-black
                                        ${selectedOptions[group.id]?.value === choice.value ? 'border-2 border-black bg-gray-50' : 'border-gray-200'}
                                    `}
                                >
                                    {choice.imageUrl && (
                                        <div className="relative w-full aspect-square mb-2 rounded overflow-hidden bg-gray-100">
                                            <Image src={choice.imageUrl} alt={choice.label} fill className="object-cover" />
                                        </div>
                                    )}
                                    <span className="text-sm block">{choice.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Inputs (Text & Files) */}
            {inputs.map((input) => (
              <div key={input.id} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {input.label} {input.required && <span className="text-red-500">*</span>}
                </label>
                
                {input.type === 'text' ? (
                    <input 
                     type="text"
                     value={formValues[input.id] || ''}
                     onChange={(e) => handleInputChange(input.id, e.target.value)}
                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                     placeholder="Type here..."
                    />
                ) : (
                    // --- CHANGED: FILE UPLOAD UI ---
                    <div className="space-y-2">
                        {formValues[input.id] ? (
                            // Show preview if file uploaded
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-green-600">✓</span>
                                    <a href={formValues[input.id]} target="_blank" rel="noreferrer" className="text-sm text-green-700 underline truncate">
                                        View Uploaded File
                                    </a>
                                </div>
                                <button 
                                    onClick={() => handleInputChange(input.id, '')}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            // Show File Input
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition text-center cursor-pointer">
                                <input 
                                    type="file" 
                                    onChange={(e) => handleFileUpload(input.id, e)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*,.pdf,.ai,.dxf"
                                />
                                {uploadingState[input.id] ? (
                                    <div className="text-gray-500 font-medium animate-pulse">Uploading...</div>
                                ) : (
                                    <div className="space-y-1 pointer-events-none">
                                        <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <p className="text-sm text-gray-600">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, PDF up to 10MB
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
              </div>
            ))}
          </div>

          {/* ACTION AREA */}
          <div className="pt-2">
             <AddToCartButton 
                product={product} 
                customization={getCustomizationData()}
                disabled={!isValid()} 
             />
             {!isValid() && (
                 <p className="text-center text-sm text-red-500 mt-3 bg-red-50 py-2 rounded">
                     Please fill all required fields to proceed
                 </p>
             )}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 py-3 rounded-lg mt-4">
             <span>⚡ Production time: <strong>{product.production_time_hours} Hours</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}