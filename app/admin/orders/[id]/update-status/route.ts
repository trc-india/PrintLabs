import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const production_status = formData.get('production_status')

    if (!production_status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ production_status: production_status as string })
      .eq('id', id)

    if (error) throw error

    // Revalidate the order page to show updated data
    revalidatePath(`/admin/orders/${id}`)
    revalidatePath('/admin/orders')

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Status updated successfully' 
    })

  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
