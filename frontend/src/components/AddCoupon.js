import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AddCoupon.css';

export default function AddCoupon() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        code: '',
        discountType: 'fixed',
        discountAmount: '',
        discountPercentage: '',
        minimumOrderAmount: '',
        expiryDate: new Date().toISOString().split('T')[0],
        isActive: true,
        assignedToEmail: '',
        firstOrderOnly: false,
        totalQuantity: ''  // total number of uses allowed
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const trimmedCode = form.code.trim();
        const trimmedEmail = form.assignedToEmail.trim();

        if (!trimmedCode) {
            setError("Coupon code is required.");
            return;
        }

        if (form.discountType === 'fixed') {
            const discount = parseFloat(form.discountAmount);
            if (isNaN(discount)) {
                setError("Please enter a valid discount amount.");
                return;
            }
        } else {
            const percentage = parseFloat(form.discountPercentage);
            if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                setError("Please enter a valid discount percentage (0-100).");
                return;
            }
        }

        const payload = {
            code: trimmedCode,
            discountAmount: form.discountType === 'fixed' ? parseFloat(form.discountAmount) : null,
            discountPercentage: form.discountType === 'percentage' ? parseFloat(form.discountPercentage) : null,
            minimumOrderAmount: form.minimumOrderAmount ? parseFloat(form.minimumOrderAmount) : 0,
            expiryDate: form.expiryDate,
            isActive: form.isActive,
            assignedToEmail: trimmedEmail || null,
            firstOrderOnly: form.firstOrderOnly,
            stock: {
                totalQuantity: parseInt(form.totalQuantity || '1'),
                usedCount: 0
            }
        };

        try {
            const response = await fetch('/api/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(errorData.title || 'Failed to add coupon');
            // }

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                const errorText = contentType && contentType.includes("application/json")
                    ? (await response.json()).title || "Failed to add coupon"
                    : await response.text(); // fallback for plain text

                throw new Error(errorText);
            }


            alert("Coupon added successfully!");
            navigate('/admin/coupons');
        } catch (err) {
            setError(err.message);
            console.error("Error adding coupon:", err);
        }
    };

    return (
        <div className="admin-coupons">
            <button className="back-button" onClick={() => navigate('/admin/coupons')}>
                <FaArrowLeft />
            </button>
            <h2>Add New Coupon</h2>
            {error && <div className="error-message">{error}</div>}

            <form className="coupon-form" onSubmit={handleSubmit}>
                <table className="coupon-form-table">
                    <tbody>
                        <tr>
                            <td><label><b>Coupon Code:</b></label></td>
                            <td>
                                <input
                                    name="code"
                                    type="text"
                                    value={form.code}
                                    onChange={handleChange}
                                    placeholder="e.g. NEXT50"
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td><label><b>Discount Type:</b></label></td>
                            <td>
                                <select
                                    name="discountType"
                                    value={form.discountType}
                                    onChange={handleChange}
                                >
                                    <option value="fixed">Fixed Amount (₹)</option>
                                    <option value="percentage">Percentage (%)</option>
                                </select>
                            </td>
                        </tr>
                        {form.discountType === 'fixed' ? (
                            <tr>
                                <td><label><b>Discount Amount (₹):</b></label></td>
                                <td>
                                    <input
                                        name="discountAmount"
                                        type="number"
                                        value={form.discountAmount}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td><label><b>Discount Percentage (%):</b></label></td>
                                <td>
                                    <input
                                        name="discountPercentage"
                                        type="number"
                                        value={form.discountPercentage}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        step="1"
                                        required
                                    />
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td><label><b>Minimum Order Amount (₹):</b></label></td>
                            <td>
                                <input
                                    name="minimumOrderAmount"
                                    type="number"
                                    value={form.minimumOrderAmount}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td><label><b>Total Quantity (Uses):</b></label></td>
                            <td>
                                <input
                                    name="totalQuantity"
                                    type="number"
                                    value={form.totalQuantity}
                                    onChange={handleChange}
                                    min="1"
                                    step="1"
                                    placeholder="e.g. 10"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td><label><b>Expiry Date:</b></label></td>
                            <td>
                                <input
                                    name="expiryDate"
                                    type="date"
                                    value={form.expiryDate}
                                    onChange={handleChange}
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td><label><b>Assigned To (Email):</b></label></td>
                            <td>
                                <input
                                    name="assignedToEmail"
                                    type="email"
                                    placeholder="user@example.com (optional)"
                                    value={form.assignedToEmail}
                                    onChange={handleChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td><label><b>First Order Only:</b></label></td>
                            <td>
                                <input
                                    name="firstOrderOnly"
                                    type="checkbox"
                                    checked={form.firstOrderOnly}
                                    onChange={handleChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td><label><b>Active Coupon:</b></label></td>
                            <td>
                                <input
                                    name="isActive"
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={handleChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2" style={{ paddingTop: '1rem' }}>
                                <button type="submit" className="submit-btn">Add Coupon</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
}