import React, { useEffect, useState } from "react";
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "./AdminSpinRewards.css";

export default function AdminSpinRewards() {
    const [rewards, setRewards] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllRewards();
    }, []);

    const fetchAllRewards = async () => {
        try {
            const res = await fetch("/api/spin/all");
            const data = await res.json();
            
            // Always sort by ID in ascending order
            const sortedData = [...data].sort((a, b) => a.id - b.id);
            
            setRewards(sortedData);
        } catch (err) {
            console.error("Error loading rewards:", err);
        }
    };

    return (
        <div className="admin-spin-container">
            {/* Back Arrow */}
            <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                <FaArrowLeft />
            </button>
            
            <h2>User Spin Rewards</h2>

            <table className="spin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Reward Type</th>
                        <th>Reward Value</th>
                        <th>Earned At</th>
                        <th>Used?</th>
                    </tr>
                </thead>

                <tbody>
                    {rewards.map((r) => (
                        <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.email}</td>
                            <td>{r.rewardType}</td>
                            <td>{r.rewardValue}</td>
                            <td>{new Date(r.earnedAt).toLocaleString()}</td>
                            <td>
                                {r.isUsed ? (
                                    <span className="used">YES</span>
                                ) : (
                                    <span className="unused">NO</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}