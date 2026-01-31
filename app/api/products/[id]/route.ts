import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Fetch product with its images
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select(`*, product_images(image_url)`)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  // Flatten images for the frontend
  const formattedProduct = {
    ...product,
    imageUrls: product.product_images ? product.product_images.map((img: any) => img.image_url) : []
  }

  return NextResponse.json(formattedProduct)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { imageUrls, ...productData } = body

    // 1. Update Product Details
    const { error: productError } = await supabaseAdmin
      .from('products')
      .update(productData)
      .eq('id', id)

    if (productError) throw productError

    // 2. Handle Images (Delete old, Insert new)
    if (imageUrls && Array.isArray(imageUrls)) {
        await supabaseAdmin
            .from('product_images')
            .delete()
            .eq('product_id', id)
        
        if (imageUrls.length > 0) {
            const imageInserts = imageUrls
                .filter(url => url.trim() !== '')
                .map((url, index) => ({
                    product_id: id,
                    image_url: url,
                    sort_order: index
                }))
            
            if (imageInserts.length > 0) {
                await supabaseAdmin
                    .from('product_images')
                    .insert(imageInserts)
            }
        }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // --- SAFETY CHECK START ---
    // Check if product is used in orders BEFORE deleting anything
    const { data: usageCheck, error: checkError } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1)

    if (checkError) throw checkError

    // If we find the product in ANY order, stop immediately.
    // This prevents deleting the images if the product deletion is going to fail anyway.
    if (usageCheck && usageCheck.length > 0) {
        return NextResponse.json(
            { error: 'Cannot delete: This product is part of existing orders. Please set it to "Out of Stock" or "Draft" instead.' },
            { status: 400 }
        )
    }
    // --- SAFETY CHECK END ---


    // 1. Now it is safe to delete images
    const { error: imageError } = await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('product_id', id)

    if (imageError) throw imageError

    // 2. Delete the product
    const { error: productError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (productError) throw productError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}