import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

// GET: Fetch Group + The Products inside it
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // 1. Get Group Details
  const { data: group, error: groupError } = await supabaseAdmin
    .from('product_groups')
    .select('*')
    .eq('id', id)
    .single()

  if (groupError) return NextResponse.json({ error: groupError.message }, { status: 404 })

  // 2. Get the actual Products in this group (Joined query)
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('product_group_items')
    .select(`
      sort_order,
      products (
        id,
        name,
        base_price,
        slug,
        product_images (image_url)
      )
    `)
    .eq('group_id', id)
    .order('sort_order', { ascending: true })

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  // Format the data nicely for frontend
  const products = items.map((item: any) => ({
    ...item.products,
    sort_order: item.sort_order,
    // Safely get first image
    imageUrl: item.products.product_images?.[0]?.image_url || null
  }))

  return NextResponse.json({ ...group, products })
}

// PUT: Update Group Metadata OR Sync Products
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Separate product_ids from metadata
    const { product_ids, ...metadata } = body

    // 1. Update Metadata (Name, Description, etc.)
    const { error: updateError } = await supabaseAdmin
      .from('product_groups')
      .update(metadata)
      .eq('id', id)

    if (updateError) throw updateError

    // 2. IF product_ids is provided, Sync the items (Delete all, then Insert new)
    if (product_ids && Array.isArray(product_ids)) {
      // A. Delete existing links
      await supabaseAdmin
        .from('product_group_items')
        .delete()
        .eq('group_id', id)

      // B. Insert new links (if any)
      if (product_ids.length > 0) {
        const itemsToInsert = product_ids.map((prodId: string, index: number) => ({
          group_id: id,
          product_id: prodId,
          sort_order: index // Save the order they were sent in
        }))
        
        const { error: insertError } = await supabaseAdmin
          .from('product_group_items')
          .insert(itemsToInsert)

        if (insertError) throw insertError
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Remove Group
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await supabaseAdmin.from('product_groups').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}