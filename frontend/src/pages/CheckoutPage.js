import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './CheckoutPage.css';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const email = localStorage.getItem('email');
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [activeSale, setActiveSale] = useState(null);
    const [quizDiscount, setQuizDiscount] = useState(null);

    const orderData = useMemo(() => {
        return JSON.parse(localStorage.getItem('orderData')) || [];
    }, []);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('new');
    const [address, setAddress] = useState({
        fullName: '', street: '', city: '', state: '', zip: '', country: '', phone: '',
    });

    const [tip, setTip] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [step, setStep] = useState(1);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

    useEffect(() => {
        if (!orderData.length && step !== 3 && !orderPlaced) {
            alert("No order data found. Redirecting to cart.");
            navigate('/cart');
        }
    }, [orderData, step, orderPlaced, navigate]);

    const subtotal = orderData.reduce((sum, item) => sum + item.quantity * item.book.price, 0);

    useEffect(() => {
        fetch(`https://localhost:5001/api/addresses/user/${email}`)
            .then(res => res.json())
            .then(setSavedAddresses)
            .catch(err => console.error("Failed to fetch addresses:", err));
    }, [email]);

    useEffect(() => {
        async function fetchDiscounts() {
            try {
                const quizRes = await fetch(`https://localhost:5001/api/monthlyquiz/reward/${email}`);
                if (quizRes.ok) {
                    const quizData = await quizRes.json();
                    if (quizData.hasReward && quizData.discount > 0 && subtotal >= 150) {
                        setQuizDiscount(quizData);
                        setAppliedDiscount(quizData.discount);
                        return;
                    } else if (quizData.hasReward && subtotal < 200) {
                        return alert("Quiz discount not applied: subtotal is less than 150");
                    }
                }

                const saleRes = await fetch('https://localhost:5001/api/saleevent/active');
                const saleData = saleRes.ok ? await saleRes.json() : [];

                if (saleData.length > 0) {
                    const bestSale = saleData.reduce((a, b) => a.discountPercentage > b.discountPercentage ? a : b);
                    setActiveSale(bestSale);
                }

                // Fetch only valid coupons for this user
                const couponRes = await fetch(`https://localhost:5001/api/coupons/my-valid/${email}`);
                const validCoupons = couponRes.ok ? await couponRes.json() : [];
                setAvailableCoupons(validCoupons);

            } catch (err) {
                console.error("Failed to fetch discounts:", err);
            }
        }

        fetchDiscounts();
    }, [email, subtotal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const isAddressDuplicate = (newAddr) => {
        return savedAddresses.some(addr =>
            addr.fullName.trim().toLowerCase() === newAddr.fullName.trim().toLowerCase() &&
            addr.street.trim().toLowerCase() === newAddr.street.trim().toLowerCase() &&
            addr.city.trim().toLowerCase() === newAddr.city.trim().toLowerCase() &&
            addr.state.trim().toLowerCase() === newAddr.state.trim().toLowerCase() &&
            addr.zip.trim().toLowerCase() === newAddr.zip.trim().toLowerCase() &&
            addr.country.trim().toLowerCase() === newAddr.country.trim().toLowerCase() &&
            addr.phone.trim() === newAddr.phone.trim()
        );
    };

    const discount = quizDiscount
        ? quizDiscount.discount
        : activeSale
            ? subtotal * (activeSale.discountPercentage / 100)
            : appliedDiscount;

    const tipAmount = parseFloat(tip || 0);
    const preShippingTotal = subtotal - discount + tipAmount;
    const shippingCharge = preShippingTotal < 100 ? 50 : 0;
    const total = preShippingTotal + shippingCharge;

    const validateStep1 = () => {
        if (selectedAddressId === 'new') {
            for (const key in address) {
                if (!address[key].trim()) {
                    alert(`Please fill in your ${key}`);
                    return false;
                }
            }
            if (isAddressDuplicate(address)) {
                alert('This address already exists.');
                return false;
            }
        } else if (!savedAddresses.find(addr => addr.id.toString() === selectedAddressId)) {
            alert('Invalid address selected.');
            return false;
        }
        return true;
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (validateStep1()) setStep(2);
    };

    const handleBack = () => setStep(1);

    const applyCoupon = async () => {
        if (quizDiscount) {
            setCouponError("Coupons are disabled when a quiz discount is applied.");
            return;
        }
        if (activeSale) {
            setCouponError("Coupons are not allowed during an active sale.");
            return;
        }

        try {
            const res = await fetch(
                `https://localhost:5001/api/coupons/apply?code=${couponCode}&totalAmount=${subtotal}&email=${email}`
            );

            if (!res.ok) {
                const error = await res.text();
                setCouponError(error || "Coupon cannot be applied.");
                setAppliedDiscount(0);
                return;
            }

            const data = await res.json();

            if (data.discountAmount === 0 && data.message) {
                setCouponError(data.message);
                setAppliedDiscount(0);
                return;
            }

            setAppliedDiscount(data.discountAmount);
            setCouponError('');

            // Show success message for the 50% coupon
            if (couponCode.startsWith('NEXT50')) {
                alert("🎉 50% discount applied! This is a one-time use coupon.");
            }
        } catch (err) {
            setCouponError('Error applying coupon.');
            setAppliedDiscount(0);
        }
    };

    const handlePlaceOrder = async () => {
        if (selectedAddressId === 'new') {
            const addressRes = await fetch('https://localhost:5001/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, ...address }),
            });

            if (!addressRes.ok) {
                alert('Failed to save address.');
                return;
            }
        }

        const discountToSend = quizDiscount ? quizDiscount.discount : appliedDiscount;

        if (!window.confirm('Are you sure you want to place this order?')) return;

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
            paymentMethod
        };

        // Only attach coupon code if no quiz reward is used
        if (!quizDiscount && couponCode) {
            orderPayload.couponCode = couponCode;
        }

        setOrderDetails({
            items: orderData.map(item => ({
                title: item.book.title,
                price: item.book.price,
                quantity: item.quantity
            })),
            subtotal,
            discount: discountToSend,
            tipAmount,
            shippingCharge,
            total,
            paymentMethod
        });

        try {
            const orderRes = await fetch('https://localhost:5001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            });

            if (!orderRes.ok) {
                const errorText = await orderRes.text();
                alert(`Order failed: ${errorText}`);
                return;
            }

            const orderResult = await orderRes.json();

            // Show coupon earned message if applicable
            if (total >= 1000) {
                setTimeout(() => {
                    alert("🎉 You've earned a 50% discount coupon for your next order! Check your account for details.");
                }, 1000);
            }

            localStorage.removeItem('orderData');
            window.dispatchEvent(new Event('clearLocalCart'));

            await fetch(`https://localhost:5001/api/cartitems/clear/${email}`, {
                method: 'DELETE'
            });

            if (quizDiscount) {
                await fetch(`https://localhost:5001/api/monthlyquiz/consume-reward/${email}`, {
                    method: 'POST'
                });
            }

            setOrderPlaced(true);
            setStep(3);
        } catch (err) {
            console.error('Error placing order:', err);
            alert('Order failed due to a network error.');
        }
    };

    if (step === 3 && orderPlaced && orderDetails) {
        return (
            <div className="checkout-page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <h2>Order Placed Successfully!</h2>
                <div style={{ fontSize: '5rem', color: 'green' }}>&#10004;</div>
                <p className='paymet'><strong>Payment Method:</strong> {orderDetails.paymentMethod}</p>
                <h3>Order Items</h3>
                <ul className='ul'>
                    {orderDetails.items.map((item, index) => (
                        <li key={index}>
                            <center>{item.title} — ₹{item.price.toFixed(2)} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}</center>
                        </li>
                    ))}
                </ul>
                <div className='totaling'>
                    <p><strong>Subtotal:</strong> ₹{orderDetails.subtotal.toFixed(2)}</p>
                    <p><strong>Discount:</strong> -₹{orderDetails.discount.toFixed(2)}</p>
                    <p><strong>Tip:</strong> ₹{orderDetails.tipAmount.toFixed(2)}</p>
                    {orderDetails.shippingCharge > 0 && (
                        <p><strong>Shipping Charges:</strong> ₹{orderDetails.shippingCharge.toFixed(2)}</p>
                    )}
                    <h4 className='ex'>Total Paid: ₹{orderDetails.total.toFixed(2)}</h4>
                </div>
                <button className='home' onClick={() => navigate('/')}>Back to Home</button>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <button className="back-button" onClick={() => navigate(-1)}><FaArrowLeft /></button>
            <h2>Checkout</h2>

            {step === 1 && (
                <form onSubmit={handleNext}>
                    <h3>Choose Address</h3>
                    <select value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                        {savedAddresses.map(addr => (
                            <option key={addr.id} value={addr.id}>
                                {addr.fullName}, {addr.street}, {addr.city}
                            </option>
                        ))}
                        <option value="new"> +Add New Address</option>
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

            {step === 2 && (
                <div>
                    <h3>Order Summary</h3>
                    <ul className='ul'>
                        {orderData.map(item => (
                            <li key={item.id}>
                                {item.book.title} — ₹{item.book.price.toFixed(2)} × {item.quantity} = ₹{(item.book.price * item.quantity).toFixed(2)}
                            </li>
                        ))}
                    </ul>

                    {quizDiscount && (
                        <p style={{ color: 'green' }}>
                            🎉 You earned ₹{quizDiscount.discount} from the Monthly Book Quiz!
                        </p>
                    )}

                    {!quizDiscount && activeSale && (
                        <p style={{ color: 'green' }}>
                            🥳 <strong>{activeSale.title}</strong> is active. You get {activeSale.discountPercentage}% off!
                        </p>
                    )}

                    {!quizDiscount && !activeSale && (
                        <>
                            <h3>Apply Coupon</h3>
                            {availableCoupons.length === 0 ? (
                                <p>No available coupons.</p>
                            ) : (
                                <>
                                    {availableCoupons.map(coupon => {
                                        const usesLeft = coupon.stock?.totalQuantity
                                            ? coupon.stock.totalQuantity - (coupon.stock.usedCount || 0)
                                            : null;

                                        return (
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
                                                {coupon.minimumOrderAmount > 0 &&
                                                    ` (Min. order ₹${coupon.minimumOrderAmount})`}
                                                {coupon.assignedToEmail && <span style={{ color: 'purple' }}> (Personal)</span>}
                                                {usesLeft !== null && (
                                                    <span style={{ color: 'gray' }}> — {usesLeft} use{usesLeft === 1 ? '' : 's'} left</span>
                                                )}
                                                <br />
                                            </label>
                                        );
                                    })}
                                    <br />
                                    <button
                                        className='apply'
                                        onClick={applyCoupon}
                                        disabled={!couponCode}
                                    >
                                        Apply Selected Coupon
                                    </button>
                                    {couponError && <p style={{ color: 'red' }}>{couponError}</p>}
                                    {appliedDiscount > 0 && (
                                        <p style={{ color: 'green' }}>
                                            You saved ₹{appliedDiscount.toFixed(2)}
                                        </p>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    <h3>Tip Amount</h3>
                    <input
                        type="number"
                        name="tip"
                        placeholder="Tip Amount"
                        value={tip}
                        onChange={(e) => setTip(e.target.value)}
                        min="0"
                    />

                    <h3>Payment Method</h3>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                    </select>

                    <div className='totaling'>
                        <p><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>
                        <p><strong>Discount:</strong> ₹{discount.toFixed(2)}</p>
                        <p><strong>Tip:</strong> ₹{tipAmount.toFixed(2)}</p>
                        {shippingCharge > 0 && (
                            <p><strong>Shipping Charges:</strong> ₹{shippingCharge.toFixed(2)}</p>
                        )}
                        <h4 className='ex'>Total: ₹{total.toFixed(2)}</h4>
                    </div>

                    <div className="button-row">
                        <button className="backbtn" onClick={handleBack}>Back</button>
                        <button className="place-btn" onClick={handlePlaceOrder}>Place Order</button>
                    </div>
                </div>
            )}
        </div>
    );
}