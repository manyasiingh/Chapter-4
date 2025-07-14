import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './OrderHistory.css';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [returningOrderId, setReturningOrderId] = useState(null);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const email = localStorage.getItem('email');

    const predefinedReasons = [
        "Wrong book received",
        "Damaged item",
        "Late delivery",
        "Other"
    ];

    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        if (!email) return;

        try {
            const response = await fetch(`https://localhost:5001/api/orders/user/${encodeURIComponent(email)}`);
            if (!response.ok) {
                console.error(`Failed to fetch orders. Status: ${response.status}`);
                return;
            }
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Network error while fetching orders:', error);
        }
    }, [email]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const handleCancelOrder = async (orderId) => {
        const confirmed = window.confirm('Are you sure you want to cancel this order?');
        if (!confirmed) return;

        try {
            const response = await fetch(`https://localhost:5001/api/orders/cancel/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(email)
            });

            if (response.ok) {
                alert('Order cancelled successfully.');
                fetchOrders();
            } else {
                const errorMsg = await response.text();
                alert('Failed to cancel order: ' + errorMsg);
            }
        } catch (err) {
            alert('Network error while cancelling order.');
        }
    };

    const handleReturn = async (orderId) => {
        const reasonToSend = selectedReason === "Other" ? customReason : selectedReason;

        if (!reasonToSend.trim()) {
            alert("Please select or enter a return reason.");
            return;
        }
        const res = await fetch(`https://localhost:5001/api/orders/return/${orderId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reasonToSend)
        });

        if (res.ok) {
            alert("Return submitted.");
            setReturningOrderId(null);
            setSelectedReason('');
            setCustomReason('');
            fetchOrders();
        }
    };

    const isWithinReturnWindow = (deliveryDate) => {
        if (!deliveryDate) return false;
        const delivery = new Date(deliveryDate);
        const now = new Date();
        const diffInDays = (now - delivery) / (1000 * 60 * 60 * 24);
        return diffInDays <= 7;
    };

    return (
        <div className="order-history-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>Your Order History</h2>
            {orders.length === 0 ? (
                <p>You have no past orders.</p>
            ) : (
                <ul className="order-list">
                    {orders.map((order) => (
                        <li key={order.id} className="order-item">
                            <div className="order-header">
                                <div><strong>Order ID:</strong> {order.id}</div>
                                <div><strong>Order Date:</strong> {formatDate(order.date)}</div>
                                <div><strong>Status:</strong> {order.status}</div>
                            </div>

                            <div className="order-summary">
                                <div><strong>Subtotal:</strong> ₹{order.subtotal?.toFixed(2) ?? '0.00'}</div>
                                <div><strong>Discount:</strong> ₹{order.discount?.toFixed(2) ?? '0.00'}</div>
                                <div><strong>Total:</strong> ₹{order.total?.toFixed(2) ?? '0.00'}</div>
                                <div><strong>Delivery Date:</strong> {formatDate(order.deliveryDate)}</div>
                            </div>

                            <div className="order-items">
                                <h4 className='p'>Items:</h4>
                                <ul>
                                    {order.items.map((item) => (
                                        <li key={item.id}>
                                            <span className='p'>{item.book?.title || 'Unknown Book'} - Qty: {item.quantity} - Price: ₹{item.book?.price?.toFixed(2) ?? 'N/A'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {order.status !== 'Cancelled' && order.status !== 'Delivered' && order.status !== "Returned" && (
                                <button onClick={() => handleCancelOrder(order.id)} className="cancel-order-btn">
                                    Cancel Order
                                </button>
                            )}

                            {order.status === 'Delivered' && !order.isReturned && isWithinReturnWindow(order.deliveryDate) && (
                                <>
                                    {returningOrderId === order.id ? (
                                        <div className="return-section">
                                            {predefinedReasons.map((reason) => (
                                                <div key={reason}>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name={`returnReason-${order.id}`}
                                                            value={reason}
                                                            checked={selectedReason === reason}
                                                            onChange={(e) => setSelectedReason(e.target.value)}
                                                        />
                                                        {reason}
                                                    </label>
                                                </div>
                                            ))}

                                            {selectedReason === "Other" && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter your reason"
                                                    value={customReason}
                                                    onChange={(e) => setCustomReason(e.target.value)}
                                                />
                                            )}

                                            <div className="return-btn-container">
                                                <button
                                                    onClick={() => handleReturn(order.id)}
                                                    className="submit-return-btn"
                                                >
                                                    Submit Return
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setReturningOrderId(null);
                                                        setSelectedReason('');
                                                        setCustomReason('');
                                                    }}
                                                    className="cancel-return-btn"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setReturningOrderId(order.id)}
                                            className="return-order-btn"
                                        >
                                            Return Order
                                        </button>
                                    )}
                                </>
                            )}

                            {order.isReturned && (
                                <>
                                    <p className="return-status"><strong>Return Requested:</strong> {formatDate(order.returnRequestedDate)}</p>
                                    <p className="return-status"><strong>Reason:</strong> {order.returnReason || 'N/A'}</p>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
