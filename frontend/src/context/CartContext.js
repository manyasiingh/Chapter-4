import React, { createContext, useContext, useState, useEffect } from 'react';

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export default function CartProvider({ children, userEmail }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!userEmail) return;
    refreshCart(userEmail);
  }, [userEmail]);

  const refreshCart = async (email) => {
    try {
      const res = await fetch(`https://localhost:5001/api/cartitems/${email}`);
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCartItems(data.map(item => ({
        bookId: item.bookId,
        quantity: item.quantity,
        book: item.book
      })));
    } catch (err) {
      console.error("Cart load error:", err);
    }
  };

  const addToCart = async (book) => {
    const email = localStorage.getItem("email");
    if (!email) {
      alert("Please log in to add to cart");
      return;
    }

    try {
      const res = await fetch('https://localhost:5001/api/cartitems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          bookId: book.id,
          quantity: 1
        }),
      });

      if (res.ok) {
        await refreshCart(email);  
      } else {
        const errorText = await res.text();
        console.error("Failed to add to cart:", errorText);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (bookId) => {
    const email = localStorage.getItem("email");
    try {
      const res = await fetch(`https://localhost:5001/api/cartitems/${bookId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await refreshCart(email); 
      } else {
        console.error("Failed to remove item");
      }
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    if (quantity < 1) return;
    const email = localStorage.getItem("email");
    try {
      const res = await fetch(`https://localhost:5001/api/cartitems/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (res.ok) {
        await refreshCart(email); 
      } else {
        console.error("Failed to update quantity");
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}
