import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminOrders.css';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('https://localhost:5001/api/orders/all')
            .then(res => res.json())
            .then(data => {
                const statusPriority = {
                    Placed: 1,
                    Delivered: 2,
                    Returned: 3,
                    Cancelled: 4
                };

                const sortedOrders = data.sort((a, b) => {
                    return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
                });

                setOrders(sortedOrders);
            })
            .catch(err => console.error('Failed to load orders:', err));
    }, []);

    return (
        <div className="admin-orders-container">
            {/* Back Arrow */}
            <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                <FaArrowLeft />
            </button>
            <h2>All Orders</h2>
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Delivery Date</th>
                        <th>Return Date</th>
                        <th>Return Reason</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr
                            key={order.id}
                            className={
                                order.status === 'Returned'
                                    ? 'returned'
                                    : order.status === 'Delivered'
                                        ? 'delivered'
                                        : order.status === 'Cancelled'
                                            ? 'cancelled'
                                            : ''
                            }
                        >
                            <td>{order.id}</td>
                            <td>{order.email}</td>
                            <td>{order.status}</td>
                            <td>₹{order.total}</td>
                            <td>{new Date(order.deliveryDate).toLocaleDateString('en-GB')}</td>
                            <td>
                                {order.returnRequestedDate
                                    ? new Date(order.returnRequestedDate).toLocaleDateString('en-GB')
                                    : '-'}
                            </td>
                            {/* <td>{new Date(order.returnRequestedDate).toLocaleDateString('en-GB')}</td> */}
                            <td>
                                {order.status === 'Returned' && order.returnReason
                                    ? order.returnReason
                                    : '-'}
                            </td>
                            <td>
                                <button className='update' onClick={() => navigate(`/admin/orders/${order.id}`)}>
                                    Update
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}