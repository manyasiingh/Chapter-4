import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import OrderHistory from './OrderHistory';
import './Cart.css';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const email = localStorage.getItem('email');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`/api/cartitems/${email}`);
        if (res.ok) {
          const data = await res.json();
          setCartItems(data);
        } else {
          console.error('Error fetching cart items');
        }
      } catch (err) {
        console.error('Network error:', err);
      }
    };

    if (email) fetchCart();

    const clearCartHandler = () => {
      setCartItems([]);
    };

    window.addEventListener('clearLocalCart', clearCartHandler);
    return () => {
      window.removeEventListener('clearLocalCart', clearCartHandler);
    };
  }, [email]);

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await fetch(`/api/cartitems/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (res.ok) {
        setCartItems(prev =>
          prev.map(item => (item.id === id ? { ...item, quantity } : item))
        );
      }
    } catch (err) {
      console.error('Network error:', err);
    }
  };

  const removeItem = async (id) => {
    try {
      const res = await fetch(`/api/cartitems/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCartItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Network error:', err);
    }
  };

  const handlePlaceOrder = () => {
    const filteredItems = cartItems.filter(item => item.book.quantity > 0);

    for (const item of filteredItems) {
      if (item.quantity > item.book.quantity) {
        alert(`${item.book.title} only has ${item.book.quantity} left`);
        return;
      }
    }

    localStorage.setItem('orderData', JSON.stringify(filteredItems));
    navigate('/order-summary');
  };


  return (
    <>
      <br></br>
      <div className="cart-container">
        <button className="back-button" onClick={() => navigate(-1)}><FaArrowLeft /></button>
        <button
          className="toggle-order-history-btn"
          onClick={() => setShowOrderHistory(prev => !prev)}
        >
          {showOrderHistory ? 'Hide Order History' : 'Show Order History'}
        </button>

        {showOrderHistory && <OrderHistory />}

        <h2>Your Cart</h2>

        {cartItems.length === 0 ? (
          <p>No items in your cart.</p>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map(item => {
                const isOutOfStock = item.book?.quantity === 0;
                return (
                  <li
                    key={item.id}
                    className={`cart-item ${isOutOfStock ? 'out-of-stock' : ''}`}
                  >
                    <div className="cart-book-info">
                      <h4>{item.book?.title}</h4>
                      <p>Author: {item.book?.author}</p>
                      <p>Price: ₹{item.book?.price}</p>
                      <p>In Stock: {item.book?.quantity}</p>
                      {isOutOfStock && <p className="red-text">Out of Stock</p>}
                    </div>
                    <div className="cart-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={isOutOfStock || item.quantity <= 1}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={isOutOfStock || item.quantity >= item.book?.quantity}>+</button>
                      <button className="remove-btn" onClick={() => removeItem(item.id)}>Remove</button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <button className="place-order-btn" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </>
        )}
      </div>
      <br></br>
    </>
  );
}