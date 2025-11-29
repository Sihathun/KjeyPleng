import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart
      addToCart: (product, orderType = 'sale', rentalDays = 1) => {
        const items = get().items;
        
        // Check if item already exists with same product id and order type
        const existingIndex = items.findIndex(
          item => item.product.id === product.id && item.orderType === orderType
        );
        
        if (existingIndex !== -1) {
          // Update quantity if item exists
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += 1;
          if (orderType === 'rental') {
            updatedItems[existingIndex].rentalDays = rentalDays;
          }
          set({ items: updatedItems });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                id: `${product.id}-${orderType}-${Date.now()}`,
                product,
                orderType, // 'sale' or 'rental'
                quantity: 1,
                rentalDays: orderType === 'rental' ? rentalDays : null,
              },
            ],
          });
        }
      },

      // Remove item from cart
      removeFromCart: (itemId) => {
        set({
          items: get().items.filter((item) => item.id !== itemId),
        });
      },

      // Update item quantity
      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(itemId);
          return;
        }
        
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },

      // Update rental days
      updateRentalDays: (itemId, rentalDays) => {
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, rentalDays: Math.max(1, rentalDays) } : item
          ),
        });
      },

      // Get cart total
      getCartTotal: () => {
        return get().items.reduce((total, item) => {
          if (item.orderType === 'rental') {
            return total + (parseFloat(item.product.rental_price) * item.rentalDays * item.quantity);
          }
          return total + (parseFloat(item.product.sale_price) * item.quantity);
        }, 0);
      },

      // Get item count
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      // Clear cart
      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: "kjeypleng-cart", // localStorage key
    }
  )
);
