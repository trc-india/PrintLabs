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
      payment_method,
    } = body

    // --- 1. VALIDATION & SECURITY CHECK ---
    let calculatedTotal = 0
    const validatedItems = []

    for (const item of items) {
      // A. Fetch REAL product
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .single()

      if (productError || !product) {
        throw new Error(`Product not found with ID: ${item.product_id}`)
      }

      // B. Determine Base Price
      const basePrice = Number(product.base_price)
      let lineTotal = 0
      let unitPriceForRecord = basePrice // Default, updated below if needed

      // C. Handle Customization Logic (Array vs Object)
      const config = product.customization_config || { visualOptions: [] }
      const customizations = item.customization_details

      if (Array.isArray(customizations)) {
          // --- NEW: REPEATER MODE (Array of Items) ---
          // Each item in the array is a full configuration { "Material": "Gold", "Name": "X" }
          
          let sumOfExtras = 0
          
          for (const customItem of customizations) {
              let itemCost = basePrice
              
              if (config.visualOptions) {
                  config.visualOptions.forEach((group: any) => {
                      const selectedLabel = customItem[group.name]
                      if (selectedLabel) {
                          const matchedChoice = group.choices.find((c: any) => c.label === selectedLabel)
                          if (matchedChoice && matchedChoice.extraPrice) {
                              itemCost += Number(matchedChoice.extraPrice)
                          }
                      }
                  })
              }
              sumOfExtras += itemCost
          }
          
          // If customizations array length matches quantity, trust the sum
          // If not (e.g. user sent 1 config for 3 items), multiply
          if (customizations.length === item.quantity) {
              lineTotal = sumOfExtras
          } else {
              // Fallback logic
              lineTotal = sumOfExtras * (item.quantity / customizations.length)
          }

          // Average unit price for database record
          unitPriceForRecord = lineTotal / item.quantity

      } else {
          // --- OLD: LEGACY MODE (Single Object) ---
          let singleItemCost = basePrice
          const userChoices = customizations || {}

          if (config.visualOptions) {
            config.visualOptions.forEach((group: any) => {
               const selectedLabel = userChoices[group.name] 
               if (selectedLabel) {
                 const matchedChoice = group.choices.find((c: any) => c.label === selectedLabel)
                 if (matchedChoice && matchedChoice.extraPrice) {
                   singleItemCost += Number(matchedChoice.extraPrice)
                 }
               }
            })
          }
          lineTotal = singleItemCost * item.quantity
          unitPriceForRecord = singleItemCost
      }

      calculatedTotal += lineTotal

      validatedItems.push({
        order_id: null, 
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: unitPriceForRecord,      
        total_price: lineTotal,     
        customization_details: customizations // Save full array or object
      })
    }

    // --- 2. CREATE ORDER ---
    const orderNumber = `PL${Date.now()}`
    const fullAddress = `${shipping_address}, ${shipping_city}, ${shipping_state} - ${shipping_pincode}`

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address: fullAddress,
        total_amount: calculatedTotal, 
        payment_method: payment_method || 'COD',
        payment_status: 'pending',
        production_status: 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // --- 3. CREATE ORDER ITEMS ---
    const orderItemsInsert = validatedItems.map(item => ({
      ...item,
      order_id: order.id 
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsInsert)

    if (itemsError) {
       await supabaseAdmin.from('orders').delete().eq('id', order.id)
       throw itemsError
    }

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      order_id: order.id
    })

  } catch (error: any) {
    console.error('Order Creation Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 })
  }
}