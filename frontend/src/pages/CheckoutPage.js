import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import RazorpayFakeModal from './RazorpayFakeModal';
import './CheckoutPage.css';

// SAFE JSON PARSER
async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [activeSale, setActiveSale] = useState(null);
  const [quizDiscount, setQuizDiscount] = useState(null);

  const [spinReward, setSpinReward] = useState(null);
  const [spinDiscount, setSpinDiscount] = useState(0);
  const [spinApplied, setSpinApplied] = useState(false);

  const orderData = useMemo(() => {
    return JSON.parse(localStorage.getItem('orderData')) || [];
  }, []);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', state: '', zip: '', country: '', phone: '',
  });

  const [tip, setTip] = useState(0);
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  // payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalMethod, setModalMethod] = useState('Card'); // Default to Card
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Online Payment'); // Always online

  const subtotal = orderData.reduce((sum, item) => sum + item.quantity * item.book.price, 0);

  // ----------------------------------------------------------
  // FETCH DISCOUNTS (QUIZ + SALE + COUPON + SPIN)
  // ----------------------------------------------------------
  useEffect(() => {
    async function fetchDiscounts() {
      try {
        // QUIZ
        const quizRes = await fetch(`/api/monthlyquiz/reward/${encodeURIComponent(email)}`);
        const quizData = quizRes.ok ? await safeJson(quizRes) : null;

        if (quizData && quizData.hasReward && quizData.discount > 0 && subtotal >= 150) {
          setQuizDiscount(quizData);
          setAppliedDiscount(quizData.discount);
        }

        // SALE
        const saleRes = await fetch(`/api/saleevent/active`);
        const saleData = saleRes.ok ? (await safeJson(saleRes) || []) : [];
        if (saleData.length > 0) {
          const bestSale = saleData.reduce((a, b) =>
            a.discountPercentage > b.discountPercentage ? a : b
          );
          setActiveSale(bestSale);
        }

        // COUPONS
        const couponRes = await fetch(`/api/coupons/my-valid/${encodeURIComponent(email)}`);
        const validCoupons = couponRes.ok ? (await safeJson(couponRes) || []) : [];
        setAvailableCoupons(validCoupons);

        // SPIN
        const spinRes = await fetch(`/api/spin/unused/${encodeURIComponent(email)}`);
        const spinData = spinRes.ok ? await safeJson(spinRes) : null;

        if (spinData && spinData.rewardValue) {
          setSpinReward(spinData);
        }

      } catch (err) {
        console.error("Failed to fetch discounts:", err);
      }
    }

    fetchDiscounts();
  }, [email, subtotal]);

  // ----------------------------------------------------------
  // FETCH SAVED ADDRESSES
  // ----------------------------------------------------------
  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await fetch(
          `/api/addresses/user/${encodeURIComponent(email)}`
        );

        const data = res.ok ? await safeJson(res) : [];

        if (Array.isArray(data)) {
          setSavedAddresses(data);
        } else {
          setSavedAddresses([]);
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
        setSavedAddresses([]);
      }
    }

    loadAddresses();
  }, [email]);

  // ----------------------------------------------------------
  // APPLY SPIN REWARD
  // ----------------------------------------------------------
  const applySpinReward = () => {
    if (!spinReward) return;

    let val = (spinReward.rewardValue || "").toString().toLowerCase();
    let discountValue = 0;

    if (val.includes("%")) {
      const num = parseInt(val.replace("%", ""), 10);
      discountValue = (subtotal * num) / 100;
    } else if (!isNaN(parseInt(val, 10))) {
      const numeric = parseInt(val, 10);
      if (numeric === 50) discountValue = 5;
      else if (numeric === 100) discountValue = 10;
      else discountValue = numeric;
    } else if (val.includes("₹")) {
      const num = parseInt(val.replace(/[^\d]/g, ""), 10);
      discountValue = num;
    } else if (val.includes("free") || val === "yes") {
      discountValue = 50;
    }

    setSpinDiscount(discountValue);
    setSpinApplied(true);
    setAppliedDiscount(0);
    setCouponCode("");
    alert("🎡 Spin reward applied!");
  };

  // ----------------------------------------------------------
  // DISCOUNT PRIORITY
  // ----------------------------------------------------------
  const discount =
    (quizDiscount ? quizDiscount.discount : 0) ||
    (activeSale ? subtotal * (activeSale.discountPercentage / 100) : 0) ||
    (spinApplied ? spinDiscount : appliedDiscount);

  const tipAmount = parseFloat(tip || 0);
  const preShippingTotal = subtotal - discount + tipAmount;
  const shippingCharge = preShippingTotal < 100 ? 50 : 0;
  const total = preShippingTotal + shippingCharge;

  // ----------------------------------------------------------
  // ADDRESS HANDLING
  // ----------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const isAddressDuplicate = (newAddr) => {
    return savedAddresses.some(addr =>
      addr.fullName?.trim().toLowerCase() === newAddr.fullName?.trim().toLowerCase() &&
      addr.street?.trim().toLowerCase() === newAddr.street?.trim().toLowerCase() &&
      addr.city?.trim().toLowerCase() === newAddr.city?.trim().toLowerCase() &&
      addr.state?.trim().toLowerCase() === newAddr.state?.trim().toLowerCase() &&
      addr.zip?.trim().toLowerCase() === newAddr.zip?.trim().toLowerCase() &&
      addr.country?.trim().toLowerCase() === newAddr.country?.trim().toLowerCase() &&
      addr.phone?.trim() === newAddr.phone?.trim()
    );
  };

  const validateStep1 = () => {
    if (selectedAddressId === 'new') {
      for (const key in address) {
        if (!address[key]?.trim()) {
          alert(`Please fill your ${key}`);
          return false;
        }
      }
      if (isAddressDuplicate(address)) {
        alert("This address already exists.");
        return false;
      }
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  // ----------------------------------------------------------
  // APPLY COUPON
  // ----------------------------------------------------------
  const applyCoupon = async () => {
    if (spinApplied) {
      setCouponError("Coupons cannot be used with Spin Reward.");
      return;
    }
    if (quizDiscount) {
      setCouponError("Quiz reward active. Coupon disabled.");
      return;
    }
    if (activeSale) {
      setCouponError("Sale is active. Coupon disabled.");
      return;
    }

    try {
      const res = await fetch(
        `/api/coupons/apply?code=${encodeURIComponent(couponCode)}&totalAmount=${subtotal}&email=${encodeURIComponent(email)}`
      );

      const data = await safeJson(res);

      if (!res.ok || !data) {
        setCouponError(data?.message || "Invalid coupon");
        setAppliedDiscount(0);
        return;
      }

      if (data.message) {
        setCouponError(data.message);
        setAppliedDiscount(0);
        return;
      }

      setAppliedDiscount(data.discountAmount || 0);
      setCouponError('');
    } catch (err) {
      console.error(err);
      setCouponError("Error applying coupon.");
    }
  };

  // ----------------------------------------------------------
  // CREATE PAYMENT ORDER (backend) and open modal
  // ----------------------------------------------------------
  // In startOnlinePayment function, replace with this:

const startOnlinePayment = async () => {
  try {
    const amountToPay = Number(total.toFixed(2));
    console.log('Starting payment with amount:', amountToPay, 'for email:', email);

    const res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        UserEmail: email,
        Amount: amountToPay,
        Notes: `Order for ${email}`
      })
    });

    console.log('Payment create response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Payment create error response:', errorText);
      
      // Try to parse as JSON
      try {
        const errorData = JSON.parse(errorText);
        alert(errorData.message || `Payment failed: ${res.status} ${res.statusText}`);
      } catch {
        alert(`Payment failed: ${res.status} ${res.statusText}\n${errorText}`);
      }
      return;
    }

    const data = await safeJson(res);
    console.log('Payment create success response:', data);

    if (!data || !data.success) {
      alert(data?.message || "Failed to initialize payment");
      return;
    }

    setPaymentOrder({
      orderId: data.orderId,
      transactionId: data.transactionId,
      amount: data.amount ?? amountToPay
    });

    setShowPaymentModal(true);
  } catch (err) {
    console.error("Payment create failed:", err);
    alert(`Network error: ${err.message}`);
  }
};

  // ----------------------------------------------------------
  // HANDLE PAYMENT SUCCESS FROM MODAL
  // ----------------------------------------------------------
  const onPaymentSuccess = async ({ paymentId, orderId }) => {
    setShowPaymentModal(false);

    const verifyOrderId = orderId || paymentOrder?.orderId;
    
    if (!verifyOrderId) {
      alert("Missing payment order info");
      return;
    }

    try {
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          RazorpayOrderId: verifyOrderId,
          RazorpayPaymentId: paymentId,
          RazorpaySignature: ''
        })
      });

      const verifyJson = await safeJson(verifyRes);

      if (!verifyRes.ok || !verifyJson || !verifyJson.success) {
        alert(verifyJson?.message || "Payment verification failed");
        return;
      }

      await finalizeOrderAfterPayment();
    } catch (err) {
      console.error('Payment verification error:', err);
      alert("Payment verification failed.");
    }
  };

  // ----------------------------------------------------------
  // FINALIZE ORDER AFTER ONLINE PAYMENT
  // ----------------------------------------------------------
  const finalizeOrderAfterPayment = async () => {
    if (selectedAddressId === 'new') {
      try {
        const addressRes = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, ...address })
        });
        if (!addressRes.ok) {
          alert('Failed to save address.');
          return;
        }
      } catch (err) {
        console.error('Save address error:', err);
        alert('Failed to save address.');
        return;
      }
    }

    const discountToSend = discount;

    const orderPayload = {
      email,
      items: orderData.map(item => ({
        BookId: item.book.id,
        Quantity: item.quantity,
        Price: item.book.price
      })),
      subtotal,
      discount: discountToSend,
      tip: tipAmount,
      shippingCharge,
      total,
      paymentMethod: "Online Payment" // Always online
    };

    if (couponCode && !spinApplied && !quizDiscount && !activeSale) {
      orderPayload.couponCode = couponCode;
    }

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        alert(`Order failed: ${errorText}`);
        return;
      }

      // Mark spin used
      if (spinApplied && spinReward) {
        try {
          await fetch(`/api/spin/mark-used/${spinReward.id}`, { method: "POST" });
        } catch (err) {
          console.error('Failed to mark spin used:', err);
        }
      }

      // Consume quiz
      if (quizDiscount) {
        try {
          await fetch(`/api/monthlyquiz/consume-reward/${encodeURIComponent(email)}`, {
            method: 'POST'
          });
        } catch (err) {
          console.error('Failed to consume quiz reward:', err);
        }
      }

      // Clear cart both local and server
      try {
        localStorage.removeItem('orderData');
        window.dispatchEvent(new Event('clearLocalCart'));
        await fetch(`/api/cartitems/clear/${encodeURIComponent(email)}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to clear cart:', err);
      }

      setOrderDetails({
        items: orderData,
        subtotal,
        discount: discountToSend,
        tipAmount,
        shippingCharge,
        total,
        paymentMethod: "Online Payment"
      });

      setOrderPlaced(true);
      setStep(3);

    } catch (err) {
      console.error('Error placing order:', err);
      alert('Order failed due to a network error.');
    }
  };

  // ----------------------------------------------------------
  // PLACE ORDER (entry point)
  // ----------------------------------------------------------
  const handlePlaceOrder = async () => {
    if (selectedAddressId === 'new') {
      try {
        const addressRes = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, ...address })
        });
        if (!addressRes.ok) {
          alert('Failed to save address.');
          return;
        }
      } catch (err) {
        console.error('Save address error:', err);
        alert('Failed to save address.');
        return;
      }
    }

    if (!window.confirm('Are you sure you want to place this order?')) return;

    // Always use online payment
    await startOnlinePayment();
  };

  // ----------------------------------------------------------
  // RENDER: Step 3 (order success)
  // ----------------------------------------------------------
  if (step === 3 && orderPlaced && orderDetails) {
    return (
      <div className="checkout-page" style={{ textAlign: 'center', paddingTop: 50 }}>
        <h2>Order Placed Successfully!</h2>
        <div style={{ fontSize: '5rem', color: 'green' }}>&#10004;</div>

        <p className="paymet">
          <strong>Payment Method:</strong> {orderDetails.paymentMethod}
        </p>

        <h3>Order Items</h3>
        <ul className="ul">
          {orderDetails.items.map((item, i) => (
            <li key={i}>
              <center>
                {item.book.title} — ₹{item.book.price.toFixed(2)}
                × {item.quantity} = ₹{(item.book.price * item.quantity).toFixed(2)}
              </center>
            </li>
          ))}
        </ul>

        <div className="totaling">
          <p><strong>Subtotal:</strong> ₹{orderDetails.subtotal.toFixed(2)}</p>
          <p><strong>Discount:</strong> -₹{orderDetails.discount.toFixed(2)}</p>
          <p><strong>Tip:</strong> ₹{orderDetails.tipAmount.toFixed(2)}</p>
          {orderDetails.shippingCharge > 0 && (
            <p><strong>Shipping Charges:</strong> ₹{orderDetails.shippingCharge.toFixed(2)}</p>
          )}
          <h4 className="ex">Total Paid: ₹{orderDetails.total.toFixed(2)}</h4>
        </div>

        <button className="home" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Main render (Step 1 + Step 2)
  // ----------------------------------------------------------
  return (
    <div className="checkout-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>
      <h2>Checkout</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={handleNext}>
          <h3>Choose Address</h3>

          <select
            value={selectedAddressId}
            onChange={(e) => setSelectedAddressId(e.target.value)}
          >
            {savedAddresses.map(addr => (
              <option key={addr.id} value={addr.id}>
                {addr.fullName}, {addr.street}, {addr.city}
              </option>
            ))}
            <option value="new">+ Add New Address</option>
          </select>

          {selectedAddressId === 'new' && (
            <>
              <h3>Delivery Address</h3>
              {Object.entries(address).map(([key, value]) => (
                <input
                  key={key}
                  type="text"
                  name={key}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={value}
                  onChange={handleChange}
                  required
                />
              ))}
            </>
          )}

          <button type="submit" className="submit-btn">Next</button>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          <h3>Order Summary</h3>

          {/* SPIN REWARD */}
          {spinReward && !spinApplied && !quizDiscount && !activeSale && (
            <div style={{
              marginTop: 12, padding: 12,
              background: "#eef8ff", borderRadius: 8
            }}>
              <h4>🎡 Spin Reward Available!</h4>
              <p><strong>{spinReward.rewardType}</strong> : {spinReward.rewardValue}</p>
              <button className="apply" onClick={applySpinReward}>
                Apply Spin Reward
              </button>
            </div>
          )}

          {spinApplied && (
            <p style={{ color: "green", fontWeight: "bold" }}>
              🎉 Spin Reward Applied: -₹{spinDiscount.toFixed(2)}
            </p>
          )}

          <ul className="ul">
            {orderData.map(item => (
              <li key={item.id}>
                {item.book.title} — ₹{item.book.price.toFixed(2)} × {item.quantity}
                = ₹{(item.book.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>

          {/* COUPON */}
          <h3>Apply Coupon</h3>
          {spinApplied ? (
            <p style={{ color: "red" }}>Coupons disabled because Spin Reward is applied.</p>
          ) : (
            <>
              {availableCoupons.length === 0 ? (
                <p>No coupons available</p>
              ) : (
                availableCoupons.map(coupon => (
                  <label key={coupon.code}>
                    <input
                      type="radio"
                      name="coupon"
                      value={coupon.code}
                      checked={couponCode === coupon.code}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <strong>{coupon.code}</strong> —
                    {coupon.discountPercentage
                      ? `${coupon.discountPercentage}% off`
                      : `₹${coupon.discountAmount} off`}
                    <br />
                  </label>
                ))
              )}

              <button className="apply" onClick={applyCoupon} disabled={!couponCode}>
                Apply Selected Coupon
              </button>
              {couponError && <p style={{ color: "red" }}>{couponError}</p>}
            </>
          )}

          <h3>Tip Amount</h3>
          <input
            type="number"
            min="0"
            value={tip}
            onChange={(e) => setTip(e.target.value)}
          />

          {/* REMOVED PAYMENT METHOD SELECTION */}

          <div className="totaling">
            <p><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>
            <p><strong>Discount:</strong> -₹{discount.toFixed(2)}</p>
            <p><strong>Tip:</strong> ₹{tipAmount.toFixed(2)}</p>
            {shippingCharge > 0 && (
              <p><strong>Shipping Charges:</strong> ₹{shippingCharge.toFixed(2)}</p>
            )}
            <h4 className="ex">Total: ₹{total.toFixed(2)}</h4>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
              <strong>Payment Method:</strong> Online Payment (Card/UPI)
            </p>
          </div>

          <div className="button-row">
            <button className="backbtn" onClick={() => setStep(1)}>Back</button>
            <button className="place-btn" onClick={handlePlaceOrder}>
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {showPaymentModal && paymentOrder && (
        <RazorpayFakeModal
          amount={paymentOrder.amount}
          method={modalMethod}
          orderId={paymentOrder.orderId}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={onPaymentSuccess}
        />
      )}
    </div>
  );
}