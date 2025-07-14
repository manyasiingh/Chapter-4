import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './OrderSummaryPage.css';

export default function OrderSummaryPage() {
  const orderData = JSON.parse(localStorage.getItem('orderData')) || [];
  const navigate = useNavigate();

  const goToCart = () => {
    navigate('/cart');
  };

  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  const calculateSubtotal = () =>
    orderData.reduce((sum, item) => sum + item.quantity * item.book.price, 0);

  const subtotal = calculateSubtotal();
  const total = subtotal;

  return (
    <div className="order-summary">
      <button className="back-button" onClick={() => navigate(-1)}><FaArrowLeft /></button>
      <h2>Order Summary</h2>
      {orderData.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <>
          <ul>
            {orderData.map(item => (
              <li key={item.id}>
                <b>{item.book?.title} : </b>
                {item.book.price} × {item.quantity} = ₹
                {item.book.price * item.quantity}
              </li>
            ))}
          </ul>
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <h4>Total: ₹{total.toFixed(2)}</h4>
          <div className="button-group">
            <button className="pay-btn" onClick={goToCart}>
              Back to Cart
            </button>
            <button className="pay-btn" onClick={proceedToCheckout}>
              Pay
            </button>
          </div>
        </>
      )}
    </div>
  );
}