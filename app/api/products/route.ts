import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

// GET all products
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories (
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// POST create new product
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      slug, 
      category_id, 
      description, 
      base_price,
      is_customizable,
      production_time_hours,
      status,
      images // This is the array of image URLs
    } = body

    // Check if slug already exists
    const { data: existing } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 400 }
      )
    }

    // Insert product first
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        slug,
        category_id: category_id || null,
        description,
        base_price,
        is_customizable: is_customizable !== undefined ? is_customizable : true,
        production_time_hours: production_time_hours || 24,
        status: status || 'active',
      })
      .select()
      .single()

    if (productError) throw productError

    // Now insert product images
    if (images && images.length > 0) {
      const imageRecords = images.map((url: string, index: number) => ({
        product_id: product.id,
        image_url: url,
        sort_order: index, // First image (index 0) will be the cover
        alt_text: `${name} - Image ${index + 1}`
      }))

      const { error: imagesError } = await supabaseAdmin
        .from('product_images')
        .insert(imageRecords)

      if (imagesError) {
        // If images fail, delete the product to keep data consistent
        await supabaseAdmin.from('products').delete().eq('id', product.id)
        throw imagesError
      }
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
