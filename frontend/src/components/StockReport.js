import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './StockReport.css';

export default function StockReport() {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        fetch("/api/admin/stock-report")
            .then(res => res.json())
            .then(setBooks)
            .catch(err => console.error("Failed to fetch stock report", err));
    }, []);

    return (
        <div className="stock-report">
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>Stock Report</h2>
            <table className="stock-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map(book => (
                        <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.category}</td>
                            <td>{book.quantity}
                            </td>
                            <td
                                className={
                                    book.quantity === 0
                                        ? 'out-of-stock'
                                        : book.quantity <= 5
                                            ? 'low-stock'
                                            : ''
                                }>{book.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}