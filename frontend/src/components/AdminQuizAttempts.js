import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AdminQuizAttempts.css';

export default function AdminQuizAttempts() {
    const [attempts, setAttempts] = useState([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/monthlyquiz/all')
            .then(res => res.json())
            .then(data => {
                setAttempts(data);
                setFiltered(data);
            })
            .catch(err => console.error("Failed to fetch quiz attempts", err));
    }, []);

    const handleSearch = () => {
        const filteredResults = attempts.filter(a =>
            a.email.toLowerCase().includes(searchEmail.trim().toLowerCase())
        );
        setFiltered(filteredResults);
    };

    return (
        <div className="admin-quiz-container">
            {/* Back Arrow */}
            <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                <FaArrowLeft />
            </button>
            <h2>Monthly Quiz Attempts</h2>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by user email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                />
                <br></br><br></br>
                <button className='search-btn' onClick={handleSearch}>Search</button>
            </div>

            <table className="quiz-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Score</th>
                        <th>Discount</th>
                        <th>Date</th>
                        <th>Used</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((attempt, i) => (
                        <tr key={i}>
                            <td>{attempt.email}</td>
                            <td>{attempt.score}</td>
                            <td>₹{attempt.discountAmount}</td>
                            <td>{new Date(attempt.attemptDate).toLocaleString()}</td>
                            <td style={{ color: attempt.used ? 'red' : 'green' }}>
                                {attempt.used ? 'Yes' : 'No'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
