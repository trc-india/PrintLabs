import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

// GET: Fetch all products
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST: Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 1. Separate 'imageUrls' from the rest of the product data
    // We MUST remove imageUrls because it is not a column in the 'products' table
    const { imageUrls, ...productData } = body

    // 2. Insert the Product into the database
    // This saves name, price, customization_config, etc.
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (productError) {
        console.error('Product Insert Error:', productError)
        throw productError
    }

    // 3. Insert Images (if any provided)
    // We use the ID of the product we just created
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      const imageInserts = imageUrls
        .filter((url: string) => url && url.trim() !== '')
        .map((url: string, index: number) => ({
          product_id: product.id,
          image_url: url,
          sort_order: index
        }))

      if (imageInserts.length > 0) {
        const { error: imageError } = await supabaseAdmin
          .from('product_images')
          .insert(imageInserts)

        if (imageError) {
          console.error('Image Insert Error:', imageError)
          // We don't throw here to avoid crashing the whole request if just images fail
        }
      }
    }

    return NextResponse.json(product)

  } catch (error: any) {
    console.error('Create Product Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}