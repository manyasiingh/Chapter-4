import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminOrderDetails.css';

export default function AdminOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [adminReturnReason, setAdminReturnReason] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then(async res => {
                const text = await res.text();
                if (!res.ok) {
                    setError(text || 'Order not found.');
                    return;
                }
                const data = JSON.parse(text);
                setOrder(data);
                setNewStatus(data.status);
            })
            .catch(err => {
                console.error('Failed to fetch order:', err);
                setError('Failed to fetch order.');
            });
    }, [id]);

    const handleStatusUpdate = async () => {
        if (newStatus === 'Returned' && !adminReturnReason.trim()) {
            setMessage('Please provide a return reason.');
            return;
        }

        try {
            // const payload =
            //     newStatus === 'Returned'
            //         ? { newStatus, returnReason: adminReturnReason }
            //         : newStatus;
            const payload = {
                newStatus,
                ...(newStatus === 'Returned' && { returnReason: adminReturnReason })
            };


            const res = await fetch(`/api/orders/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setMessage('Status updated successfully!');
            } else {
                const errorText = await res.text();
                setMessage(`Failed to update status: ${errorText}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('Server error.');
        }
    };

    if (error) return <p className="error-message">{error}</p>;
    if (!order) return <p>Loading order details...</p>;

    return (
        <div className="admin-order-details">
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>Order #{order.id}</h2>

            <table className="order-table">
                <tbody>
                    <tr>
                        <th>Email</th>
                        <td>{order.email}</td>
                    </tr>
                    <tr>
                        <th>Status</th>
                        <td>
                            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                <option>Placed</option>
                                <option>Delivered</option>
                                <option>Cancelled</option>
                                <option>Returned</option>
                            </select>
                        </td>
                    </tr>

                    {/* Show return reason input when status is 'Returned' */}
                    {newStatus === 'Returned' && (
                        <tr>
                            <th>Return Reason</th>
                            <td>
                                <textarea
                                    value={adminReturnReason}
                                    onChange={(e) => setAdminReturnReason(e.target.value)}
                                    placeholder="Enter reason for return"
                                    rows={3}
                                    required
                                />
                            </td>
                        </tr>
                    )}

                    <tr>
                        <th>Items</th>
                        <td>
                            <ul>
                                {order.items.map(item => (
                                    <li key={item.id}>
                                        {item.book.title} × {item.quantity}
                                    </li>
                                ))}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <th>Total</th>
                        <td>₹{order.total}</td>
                    </tr>
                    <tr>
                        <th>Delivery Date</th>
                        <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <th>Return Date</th>
                        <td>
                            {order.returnRequestedDate
                                ? new Date(order.returnRequestedDate).toLocaleDateString()
                                : 'N/A'}
                        </td>
                    </tr>
                    <tr>
                        <th>User Return Reason</th>
                        <td>{order.returnReason || 'N/A'}</td>
                    </tr>
                </tbody>
            </table>

            <br />
            <button className="update-status" onClick={handleStatusUpdate}>
                Update Status
            </button>
            {message && <p className="status-msg">{message}</p>}
        </div>
    );
}