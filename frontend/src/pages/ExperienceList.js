import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './ExperienceList.css';

export default function ExperienceList() {
    const [experiences, setExperiences] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('https://localhost:5001/api/experiences')
            .then(res => res.json())
            .then(data => setExperiences(data))
            .catch(error => console.error('Error fetching experiences:', error));
    }, []);

    return (
        <div className="experience-list">
            {/* Back Button */}
            <div className='back-button' onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </div>
            
            <h2>What Our Readers Say</h2>
            
            <div className="experiences-container">
                {experiences.map(exp => (
                    <div key={exp.id} className="experience-card">
                        <table className="experience-table">
                            <tbody>
                                <tr>
                                    <th>Email</th>
                                    <td><h4>{exp.email}</h4></td>
                                </tr>
                                <tr>
                                    <th>Author</th>
                                    <td><h4>{exp.name}</h4></td>
                                </tr>
                                <tr>
                                    <th>Date</th>
                                    <td><small>{new Date(exp.submittedAt).toLocaleDateString()}</small></td>
                                </tr>
                                <tr>
                                    <th>Description</th>
                                    <td><p>{exp.description}</p></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}