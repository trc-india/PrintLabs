import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
      items,
      total_amount,
      payment_method,
    } = body

    // Generate order number
    const orderNumber = `PL${Date.now()}`

    // Full shipping address
    const fullAddress = `${shipping_address}, ${shipping_city}, ${shipping_state} - ${shipping_pincode}`

    // 1. Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address: fullAddress,
        total_amount,
        payment_method: payment_method || 'COD',
        payment_status: payment_method === 'COD' ? 'pending' : 'pending',
        production_status: 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Create order items (Fixed to match Checkout Payload + Added Customization)
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,              // Matched with Checkout
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,// Matched with Checkout
      customization_details: item.customization_details, // <--- CRITICAL: Saving the custom data
      
      // We calculate total line price here to be safe
      // (Optional: If your DB has a product_name column, we pass it here if provided, 
      // otherwise we assume the ID is enough)
      // product_name: item.product_name || '', 
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Rollback: delete the order if items insertion fails to prevent "empty" orders
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      throw itemsError
    }

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      order_id: order.id,
    })

  } catch (error) {
    console.error('Order creation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}