import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminPopupAdd.css';

export default function AdminPopupAdd() {
    const [form, setForm] = useState({
        isEnabled: false,
        title: '',
        subtitle: '',
        offerText: '',
        deliveryText: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async () => {
        await fetch('/api/PopupSettings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        navigate('/admin/popup-settings');
    };

    return (
        <div className="admin-popup-add">
            {/* Back Arrow */}
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>Add New Popup</h2>
            <table>
                <tbody>
                    <tr>
                        <td><label>Enable Popup</label></td>
                        <td>
                            <input
                                type="checkbox"
                                name="isEnabled"
                                checked={form.isEnabled}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Title</label></td>
                        <td>
                            <input
                                type='text'
                                name="title"
                                placeholder="Title"
                                value={form.title}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Sub Title</label></td>
                        <td>
                            <input
                                type='text'
                                name="subtitle"
                                placeholder="Subtitle"
                                value={form.subtitle}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Offer</label></td>
                        <td>
                            <input
                                type='text'
                                name="offerText"
                                placeholder="Offer Text"
                                value={form.offerText}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Delivery Text</label></td>
                        <td>
                            <input
                                type='text'
                                name="deliveryText"
                                placeholder="Delivery Text"
                                value={form.deliveryText}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <button className='ad' onClick={handleSubmit}>Add</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
