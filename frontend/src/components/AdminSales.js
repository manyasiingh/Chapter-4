import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminSales.css';

export default function AdminSales() {
    const [sales, setSales] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        const res = await fetch("/api/saleevent");
        if (!res.ok) return console.error("Failed to fetch sales");

        const text = await res.text();
        const data = text ? JSON.parse(text) : [];
        setSales(data);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        await fetch(`/api/saleevent/${id}`, { method: 'DELETE' });
        fetchSales();
    };

    return (
        <div className="admin-sales-container">
            <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                <FaArrowLeft />
            </button>
            <h2>Manage Sales</h2>

            <button className="add-sale-button" onClick={() => navigate('/admin/sales/add')}>
                + Add Sale
            </button>

            <table className="sales-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Discount</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map(sale => (
                        <tr key={sale.id}>
                            <td>{sale.title}</td>
                            <td>{sale.description}</td>
                            <td>{sale.discountPercentage}%</td>
                            <td>{sale.startDate?.split('T')[0]}</td>
                            <td>{sale.endDate?.split('T')[0]}</td>
                            <td>
                                <button className='edit-button' onClick={() => navigate(`/admin/sales/edit/${sale.id}`)}>
                                    Edit
                                </button>
                            </td>
                            <td>
                                <button className='del-button' onClick={() => handleDelete(sale.id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}