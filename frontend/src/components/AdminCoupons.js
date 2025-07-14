import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminCoupons.css';

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [topCustomer, setTopCustomer] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCoupons();
        fetchTopCustomer();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://localhost:5001/api/coupons');
            if (!response.ok) throw new Error('Failed to fetch coupons');
            const data = await response.json();
            setCoupons(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopCustomer = async () => {
        try {
            const response = await fetch('https://localhost:5001/api/coupons/top-customer');
            if (!response.ok) return;
            const data = await response.json();
            setTopCustomer(data);
        } catch (err) {
            console.error("Error fetching top customer:", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                const response = await fetch(`https://localhost:5001/api/coupons/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to delete coupon');
                setCoupons(prev => prev.filter(c => c.id !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const navigateToEdit = (id) => {
        navigate(`/admin/coupons/edit/${id}`);
    };

    const formatDiscount = (coupon) => {
        if (coupon.discountPercentage)
            return `${coupon.discountPercentage}%`;
        if (coupon.discountAmount)
            return `₹${coupon.discountAmount.toFixed(2)}`;
        return '-';
    };

    const getCouponType = (coupon) => {
        if (coupon.code?.startsWith('NEXT50'))
            return 'Next Order 50%';
        if (coupon.discountPercentage)
            return 'Percentage';
        return 'Fixed Amount';
    };

    return (
        <div className="admin-coupon-list">
            <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                <FaArrowLeft /> 
            </button>

            <h2>Coupon Management</h2>
            <br/>
            <Link to="/admin/coupons/add" className="add-button">+ Add New Coupon</Link>

            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-message">Loading coupons...</div>}
            
            {topCustomer && (
                <div className="top-customer-banner">
                    <br/>
                    🏆 <strong>Top Customer:</strong> {topCustomer.email} ({topCustomer.orderCount} orders)
                </div>
            )}

            {!loading && coupons.length === 0 ? (
                <p>No coupons found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Discount</th>
                            <th>Min Order</th>
                            <th>Expiry</th>
                            <th>Active</th>
                            <th>Used</th>
                            <th>First-Time Only</th>
                            <th>Assigned To</th>
                            <th>Total Qty</th>
                            <th>Used</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map(c => {
                            const totalQty = c.stock?.totalQuantity ?? '-';
                            const usedQty = c.stock?.usedCount ?? 0;
                            const remaining = (c.stock?.totalQuantity ?? 0) - usedQty;
                            const isDepleted = c.stock && remaining <= 0;

                            return (
                                <tr key={c.id}>
                                    <td>{c.code}</td>
                                    <td>{getCouponType(c)}</td>
                                    <td>{formatDiscount(c)}</td>
                                    <td>{c.minimumOrderAmount ? `₹${c.minimumOrderAmount.toFixed(2)}` : '-'}</td>
                                    <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                                    <td style={{
                                        textAlign: 'center',
                                        color: c.isActive ? 'green' : 'red',
                                        fontWeight: 'bold'
                                    }}>
                                        {c.isActive ? '✓' : '✗'}
                                    </td>
                                    <td style={{
                                        textAlign: 'center',
                                        color: c.isUsed ? 'red' : 'green',
                                        fontWeight: 'bold'
                                    }}>
                                        {c.isUsed ? '✓' : '✗'}
                                    </td>
                                    <td style={{
                                        textAlign: 'center',
                                        color: c.firstOrderOnly ? 'blue' : 'gray',
                                        fontWeight: c.firstOrderOnly ? 'bold' : 'normal'
                                    }}>
                                        {c.firstOrderOnly ? '✓' : '✗'}
                                    </td>
                                    <td>{c.assignedToEmail || 'All Users'}</td>
                                    <td style={{
                                        color: isDepleted ? 'red' : 'green',
                                        fontWeight: 'bold'
                                    }}>
                                        {totalQty}
                                    </td>
                                    <td>{usedQty}</td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => navigateToEdit(c.id)}
                                            disabled={c.isUsed}
                                        >
                                            {c.isUsed ? 'Used' : 'Edit'}
                                        </button>
                                    </td>
                                    <td>
                                        <button className="delete-btn" onClick={() => handleDelete(c.id)}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}