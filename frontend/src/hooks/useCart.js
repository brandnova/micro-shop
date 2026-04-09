import { useState, useCallback } from 'react'

export function useCart() {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const addToCart = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalPrice = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  // Build the items payload for the API
  const toOrderItems = () =>
    items.map((i) => ({
      product_name: i.name,
      price: parseFloat(i.price).toFixed(2),
      quantity: i.quantity,
    }))

  return {
    items,
    isOpen,
    setIsOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
    toOrderItems,
  }
}