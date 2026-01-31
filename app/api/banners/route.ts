import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

// GET: Fetch all banners
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST: Create a new banner
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Validate required fields
    if (!body.title || !body.image_url) {
      return NextResponse.json(
        { error: 'Title and Image URL are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}