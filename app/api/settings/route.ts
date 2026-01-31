import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error) return NextResponse.json({ value: null })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { key, value } = body

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key, value })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}