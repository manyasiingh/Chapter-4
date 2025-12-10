import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminExperiences.css';

export default function AdminExperiences() {
    const [experiences, setExperiences] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchExperiences();
    }, []);

    const fetchExperiences = async () => {
        try {
            const res = await axios.get('/api/Experiences');
            const sorted = res.data.sort((a, b) => a.id - b.id);
            setExperiences(sorted);
        } catch (error) {
            console.error('Error fetching experiences', error);
        }
    };

    const deleteExperience = async (id) => {
        if (!window.confirm("Are you sure you want to delete this experience?")) return;

        try {
            await axios.delete(`/api/admin/${id}`);
            setExperiences(prev => prev.filter(exp => exp.id !== id));
        } catch (error) {
            console.error('Error deleting experience', error);
        }
    };

    return (
        <div className="admin-experiences-container">
            {/* Back Arrow */}
            <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                <FaArrowLeft />
            </button>
            <h2>User Experiences</h2>
            <table>
                <thead>
                    <tr>
                        <th>Sr. No.</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Comment</th>
                        <th>Submitted At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {experiences.map((exp) => (
                        <tr key={exp.id}>
                            <td>{exp.id}</td>
                            <td>{exp.email}</td>
                            <td>{exp.name}</td>
                            <td>{exp.description}</td>
                            <td>{new Date(exp.submittedAt).toLocaleDateString('en-GB')}</td>
                            <td>
                                <button className='del-btn' onClick={() => deleteExperience(exp.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
