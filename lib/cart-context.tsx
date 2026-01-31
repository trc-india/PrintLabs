'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  cartItemId: string // New Unique ID for the cart line item
  productId: string
  productName: string
  productSlug: string
  price: number
  quantity: number
  imageUrl: string
  customization?: any // Stores { "Name": "Shardul", "Material": "Wood" }
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  totalAmount: number
  addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'>) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedCart = localStorage.getItem('printlabs_cart')
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('printlabs_cart', JSON.stringify(items))
    }
  }, [items, mounted])

  const addItem = (newItem: Omit<CartItem, 'quantity' | 'cartItemId'>) => {
    setItems((currentItems) => {
      // Create a unique signature for this exact configuration
      const customizationKey = JSON.stringify(newItem.customization || {})
      const targetCartItemId = `${newItem.productId}-${customizationKey}`

      const existingItem = currentItems.find(
        (item) => item.cartItemId === targetCartItemId
      )

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartItemId === targetCartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...currentItems, { ...newItem, quantity: 1, cartItemId: targetCartItemId }]
    })
  }

  const removeItem = (cartItemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.cartItemId !== cartItemId)
    )
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('printlabs_cart')
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const totalAmount = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}