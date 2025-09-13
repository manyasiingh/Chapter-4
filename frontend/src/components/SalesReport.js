import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './SalesReport.css';

export default function SalesReport() {
    const [report, setReport] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('https://localhost:5001/api/admin/sales-report')
            .then(res => {
                if (!res.ok) {
                    throw new Error("Failed to fetch sales report");
                }
                return res.json();
            })
            .then(setReport)
            .catch(err => console.error("Error loading sales report:", err));
    }, []);


    if (!report) return <div className='div'>Loading sales report...</div>;

    return (
        <div className="sales-report">
            {/* Back Arrow */}
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>Report</h2>
            <div className="report-box">
                <table className="sales-report-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Total Orders</strong></td>
                            <td>{report.totalOrders}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Revenue</strong></td>
                            <td>₹{report.totalRevenue}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Books Sold</strong></td>
                            <td>{report.totalBooksSold}</td>
                        </tr>
                        <tr>
                            <td><strong>Placed Orders</strong></td>
                            <td>{report.placedOrders}</td>
                        </tr>
                        <tr>
                            <td><strong>Delivered Orders</strong></td>
                            <td>{report.deliveredOrders}</td>
                        </tr>
                        <tr>
                            <td><strong>Cancelled Orders</strong></td>
                            <td>{report.cancelledOrders}</td>
                        </tr>
                        <tr>
                            <td><strong>Returned Orders</strong></td>
                            <td>{report.returnedOrders}</td>
                        </tr>
                        <tr>
                            <td><strong>Top Selling Book</strong></td>
                            <td>{report.topBook}</td>
                        </tr>
                        <tr>
                            <td><strong>Least Selling Book</strong></td>
                            <td>{report.leastBook}</td>
                        </tr>
                        <tr>
                            <td><strong>Most Recent Order Date</strong></td>
                            <td>{new Date(report.lastOrderDate).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
