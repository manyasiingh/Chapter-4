import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './SaleForm.css';

export default function SaleForm() {
    const [form, setForm] = useState({
        title: '',
        description: '',
        discountPercentage: '',
        startDate: '',
        endDate: ''
    });
    const [status, setStatus] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            fetch(`/api/saleevent/${id}`)
                .then(res => {
                    if (!res.ok) throw new Error("Sale not found");
                    return res.json();
                })
                .then(sale => {
                    if (!sale) throw new Error("Empty sale response");

                    setForm({
                        title: sale.title || '',
                        description: sale.description || '',
                        discountPercentage: sale.discountPercentage || '',
                        startDate: sale.startDate ? sale.startDate.split('T')[0] : '',
                        endDate: sale.endDate ? sale.endDate.split('T')[0] : ''
                    });
                })
                .catch(err => {
                    console.error("Failed to load sale:", err);
                });
        }
    }, [id]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = id ? 'PUT' : 'POST';
        const url = id
            ? `/api/saleevent/${id}`
            : '/api/saleevent';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            navigate('/admin/sales');
        } else {
            setStatus('Error saving sale');
        }
    };

    return (
        <div className="admin-sales">
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>{id ? 'Edit Sale' : 'Add New Sale'}</h2>
            <form className="sales-form" onSubmit={handleSubmit}>
                <table className="sales-table-form">
                    <tbody>
                        <tr>
                            <td><label>Title:</label></td>
                            <td>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td><label>Description:</label></td>
                            <td>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Description"
                                    value={form.description}
                                    onChange={handleChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td><label>Discount (%):</label></td>
                            <td>
                                <input
                                    type="number"
                                    name="discountPercentage"
                                    placeholder="Discount (%)"
                                    value={form.discountPercentage}
                                    onChange={handleChange}
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td><label>Start Date:</label></td>
                            <td>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td><label>End Date:</label></td>
                            <td>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={form.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2" style={{ paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start' }}>
                                    <button className='edit-button' type="submit">{id ? 'Update' : 'Add'} Sale</button>
                                    <button className='dis-button' type="button" onClick={() => navigate('/admin/sales')}>Cancel</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
            {status && <p className="form-status">{status}</p>}
        </div>
    );
}
