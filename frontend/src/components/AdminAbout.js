import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminAbout.css';

export default function AdminAbout() {
    const [sections, setSections] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const sectionLabels = {
        AboutUs: 'About Us',
        Team: 'Our Team',
        Terms: 'Terms & Conditions',
        Privacy: 'Privacy Policy'
    };

    useEffect(() => {
        fetch('/api/aboutcontent')
            .then(res => res.json())
            .then(data => {
                const structured = {};
                data.forEach(item => structured[item.section] = item.content);
                setSections(structured);
                setLoading(false);
            })
            .catch(err => console.error('Failed to fetch content:', err));
    }, []);

    const handleChange = (section, value) => {
        setSections(prev => ({ ...prev, [section]: value }));
    };

    const handleSave = async (section) => {
        try {
            const res = await fetch(`/api/aboutcontent/${section}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section, content: sections[section] })
            });

            if (!res.ok) throw new Error('Update failed');
            setMessage(`${sectionLabels[section]} updated successfully!`);
            setTimeout(() => setMessage(''), 3000);
        } catch {
            alert('Error saving section.');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="admin-about-container">
            <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                <FaArrowLeft />
            </button>
            <h2>Edit About Page Sections</h2>
            {Object.entries(sectionLabels).map(([key, label]) => (
                <div key={key} className="admin-about-section">
                    <h3>{label}</h3>
                    <textarea
                        rows={8}
                        value={sections[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                    />
                    <br/>
                    <button className='save' onClick={() => handleSave(key)}>Save</button>
                </div>
            ))}
            {message && <p className="success-message">{message}</p>}
        </div>
    );
}
