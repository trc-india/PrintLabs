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
    imageUrls: product.product_images.map((img: any) => img.image_url)
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

    // 2. Handle Images (Simple Strategy: Delete all old, Insert all new)
    // Only do this if imageUrls is provided
    if (imageUrls && Array.isArray(imageUrls)) {
        // Delete old images
        await supabaseAdmin
            .from('product_images')
            .delete()
            .eq('product_id', id)
        
        // Insert new images
        if (imageUrls.length > 0) {
            const imageInserts = imageUrls
                .filter(url => url.trim() !== '')
                .map((url, index) => ({
                    product_id: id,
                    image_url: url,
                    sort_order: index
                }))
            
            if (imageInserts.length > 0) {
                const { error: imageError } = await supabaseAdmin
                    .from('product_images')
                    .insert(imageInserts)
                
                if (imageError) throw imageError
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
  const { id } = await params
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}