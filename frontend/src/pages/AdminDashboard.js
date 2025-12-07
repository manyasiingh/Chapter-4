import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            <div className="admin-buttons">
                <button onClick={() => navigate('/admin/books')}>Manage Books</button>
                <button onClick={() => navigate('/admin/orders')}>View Orders</button>
                <button onClick={() => navigate('/admin/users')}>Manage Users</button>
                <button onClick={() => navigate('/admin/questions')}>User Questions</button>
                <button onClick={() => navigate('/admin/experiences')}>Manage Experiences</button>
                <button onClick={() => navigate('/admin/coupons')}>Manage Coupons</button>
                <button onClick={() => navigate('/admin/chat')}>Live Chat</button>
                <button onClick={() => navigate('/admin/quiz-attempts')}>Monthly Quiz Attempts</button>
                <button onClick={() => navigate('/admin/sales')}>Manage Sales</button>
                <button onClick={() => navigate('/admin/reviews')}>Manage Reviews</button>
                <button onClick={() => navigate('/admin/popup-settings')}>View Popups</button>
                <button onClick={() => navigate('/admin/about')}>Manage About</button>
                <button onClick={() => navigate('/admin/contactinfo')}>Manage Contact</button>
                <button onClick={() => navigate('/admin/contact-queries')}>Manage Contact Queries</button>

                {/* ⭐ NEW SPIN FEATURES */}
                <button onClick={() => navigate('/admin/spin-options')}>Manage Spin Wheel Options</button>
                <button onClick={() => navigate('/admin/spin-rewards')}>View User Spin Rewards</button>
            </div>

            <div className="report-panels">
                <div className="report-panel">
                    <h2>Sales Report</h2>
                    <p>View detailed information about recent sales and revenue.</p>
                    <button onClick={() => navigate('/admin/sales-report')}>
                        View Sales Report
                    </button>
                </div>

                <div className="report-panel">
                    <h2>Stock Report</h2>
                    <p>Check current inventory levels and stock status.</p>
                    <button onClick={() => navigate('/admin/stock-report')}>
                        View Stock Report
                    </button>
                </div>

                <div className="report-panel">
                    <h2>Earnings Report</h2>
                    <p>Analyze earnings and financial performance.</p>
                    <button onClick={() => navigate('/admin/earnings-report')}>
                        View Earnings Report
                    </button>
                </div>
            </div>
        </div>
    );
}