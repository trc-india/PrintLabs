import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      categories (name),
      product_images (image_url, sort_order)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const filteredData = (data || []).filter(p => p && p.id)
  return NextResponse.json(filteredData)
}
