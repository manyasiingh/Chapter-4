import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminUsers.css';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('https://localhost:5001/api/users/all')
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        const res = await fetch(`https://localhost:5001/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('User deleted');
            setUsers(prev => prev.filter(user => user.id !== id)); // update UI
        } else {
            alert('Failed to delete user');
        }
    };

    return (
        <div className="admin-users-container">
            {/* Back Arrow */}
            <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                <FaArrowLeft />
            </button>
            <h2 className="admin-users-title">Manage Users</h2>
            <button onClick={() => navigate('/admin/users/add')} className='add-user-btn'>
                + Add New User
            </button>
            <table className="admin-users-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Password</th>
                        <th>Profile Pic</th>
                        <th>Role</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.mobileNumber}</td>
                            <td>{user.password}</td>
                            <td>{user.profileImageUrl
                                ? (
                                    <img
                                        src={user.profileImageUrl?.startsWith('http')
                                            ? user.profileImageUrl
                                            : `https://localhost:5001/${user.profileImageUrl}`}
                                        alt={user.firstName}
                                    // className="book-thumb"
                                    />
                                ) : 'N/A'}
                            </td>
                            <td>{user.role}</td>
                            <td>
                                <button
                                    className="edit-button"
                                    onClick={() => navigate(`/admin/users/${user.id}`)}
                                >
                                    Edit
                                </button>
                            </td>
                            <td>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(user.id)}
                                >
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
