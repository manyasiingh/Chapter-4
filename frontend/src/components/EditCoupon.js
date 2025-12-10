import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './EditCoupon.css';

export default function EditCoupon() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        id: 0,
        code: '',
        discountType: 'fixed',
        discountAmount: '',
        discountPercentage: '',
        minimumOrderAmount: '',
        expiryDate: '',
        isActive: true,
        assignedToEmail: '',
        firstOrderOnly: false,
        totalQuantity: '',
        usedCount: 0
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCoupon = async () => {
            try {
                const response = await fetch(`/api/coupons/${id}`);
                if (!response.ok) throw new Error('Failed to fetch coupon');
                const data = await response.json();

                setForm({
                    id: data.id,
                    code: data.code,
                    discountType: data.discountPercentage ? 'percentage' : 'fixed',
                    discountAmount: data.discountAmount?.toString() || '',
                    discountPercentage: data.discountPercentage?.toString() || '',
                    minimumOrderAmount: data.minimumOrderAmount?.toString() || '',
                    expiryDate: data.expiryDate.split('T')[0],
                    isActive: data.isActive,
                    assignedToEmail: data.assignedToEmail || '',
                    firstOrderOnly: data.firstOrderOnly || false,
                    totalQuantity: data.stock?.totalQuantity?.toString() || '',
                    usedCount: data.stock?.usedCount || 0
                });
            } catch (err) {
                setError(err.message);
            }
        };

        fetchCoupon();
    }, [id]);

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
            setError("Coupon code cannot be empty.");
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
            id: form.id,
            code: trimmedCode,
            discountAmount: form.discountType === 'fixed' ? parseFloat(form.discountAmount) : null,
            discountPercentage: form.discountType === 'percentage' ? parseFloat(form.discountPercentage) : null,
            minimumOrderAmount: form.minimumOrderAmount ? parseFloat(form.minimumOrderAmount) : 0,
            expiryDate: form.expiryDate,
            isActive: form.isActive,
            assignedToEmail: trimmedEmail || null,
            firstOrderOnly: form.firstOrderOnly,
            stock: {
                totalQuantity: form.totalQuantity ? parseInt(form.totalQuantity) : 0,
                usedCount: form.usedCount || 0
            }
        };

        try {
            const response = await fetch(`/api/coupons/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                const errorText = contentType && contentType.includes("application/json")
                    ? (await response.json()).title || "Failed to update coupon"
                    : await response.text();

                throw new Error(errorText);
            }

            alert("Coupon updated successfully!");
            navigate('/admin/coupons');
        } catch (err) {
            setError(err.message);
            console.error("Error updating coupon:", err);
        }
    };

    return (
        <div className="edit-coupon-container">
            <button className="back-button" onClick={() => navigate('/admin/coupons')}>
                <FaArrowLeft />
            </button>
            <h2>Edit Coupon</h2>
            {error && <div className="error-message">{error}</div>}
            <form className="edit-coupon-form" onSubmit={handleSubmit}>
                <table className="coupon-edit-table">
                    <tbody>
                        <tr>
                            <td><label><b>Code:</b></label></td>
                            <td>
                                <input
                                    type="text"
                                    name="code"
                                    value={form.code}
                                    onChange={handleChange}
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
                            <td><label><b>Total Quantity Allowed:</b></label></td>
                            <td>
                                <input
                                    name="totalQuantity"
                                    type="number"
                                    value={form.totalQuantity}
                                    onChange={handleChange}
                                    min="1"
                                    step="1"
                                    required
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
                                    placeholder="user@example.com"
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
                            <td><label><b>Active:</b></label></td>
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
                                <div className="form-buttons">
                                    <button type="submit" className="sub-btn">Update Coupon</button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => navigate('/admin/coupons')}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
}