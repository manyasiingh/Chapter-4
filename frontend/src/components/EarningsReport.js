import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './EarningsReport.css';

export default function EarningsReport() {
    const [report, setReport] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/admin/earnings-report')
            .then(res => res.json())
            .then(setReport)
            .catch(err => console.error("Failed to load earnings report:", err));
    }, []);

    if (!report) return <div>Loading...</div>;

    return (
        <div className="earnings-report">
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>

            <h2>Earnings Report</h2>

            <table className="earnings-table">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Revenue (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {report.monthlyRevenue.length === 0 ? (
                        <tr>
                            <td colSpan="2">No data available</td>
                        </tr>
                    ) : (
                        report.monthlyRevenue.map((m, index) => (
                            <tr key={index}>
                                <td>{m.month}</td>
                                <td>₹{m.revenue ? m.revenue.toFixed(2) : "0.00"}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <p><strong>Total Revenue (All Status):</strong> ₹{report.revenueAll.toFixed(2)}</p>
            <p><strong>Delivered Revenue:</strong> ₹{report.revenueDelivered.toFixed(2)}</p>
            <p><strong>Returned Revenue:</strong> ₹{report.revenueReturned.toFixed(2)}</p>
            <p><strong>Cancelled Revenue:</strong> ₹{report.revenueCancelled.toFixed(2)}</p>
            <p><strong>Placed Revenue:</strong> ₹{report.revenuePlaced.toFixed(2)}</p>
        </div>
    );
}