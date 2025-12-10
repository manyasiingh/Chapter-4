import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminContactInfo.css';

export default function AdminContactInfo() {
    const [info, setInfo] = useState({ 
        id: 0, 
        address: 'Loading...', 
        email: 'Loading...', 
        phone: 'Loading...' 
    });
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/contactinfo')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                if (data) {
                    setInfo(data);
                } else {
                    // Initialize with default values if no data exists
                    setInfo({
                        id: 0,
                        address: '123 Main Street, City, Country',
                        email: 'contact@bookstore.com',
                        phone: '+123 456 7890'
                    });
                }
            })
            .catch(() => {
                setStatus('Failed to load contact info');
                // Set default values if API fails
                setInfo({
                    id: 0,
                    address: '123 Main Street, City, Country',
                    email: 'contact@bookstore.com',
                    phone: '+123 456 7890'
                });
            });
    }, []);

    const handleChange = (e) => {
        setInfo({ ...info, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Saving...');

        try {
            const method = info.id ? 'PUT' : 'POST';
            const url = info.id 
                ? `/api/contactinfo/${info.id}`
                : '/api/contactinfo';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(info),
            });

            if (res.ok) {
                const data = await res.json();
                setInfo(data);
                setStatus('Contact info updated successfully!');
            } else {
                throw new Error('Failed to update');
            }
        } catch (err) {
            setStatus('Failed to update contact info.');
        }
    };

    return (
        <div className="admin-contact-container">
            <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                <FaArrowLeft />
            </button>
            <h2>Manage Contact Info</h2>
            <form onSubmit={handleSubmit} className="admin-contact-form">
                <label>Address</label>
                <textarea 
                    name="address" 
                    value={info.address} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter full address"
                />

                <label>Email</label>
                <input 
                    type="email" 
                    name="email" 
                    value={info.email} 
                    onChange={handleChange} 
                    required 
                    placeholder="contact@example.com"
                />

                <label>Phone</label>
                <input 
                    type="text" 
                    name="phone" 
                    value={info.phone} 
                    onChange={handleChange} 
                    required 
                    placeholder="+123 456 7890"
                />

                <br/><br/>
                <button className='update' type="submit">
                    {info.id ? 'Update Info' : 'Create Info'}
                </button>
            </form>
            {status && <p className="status-message">{status}</p>}
        </div>
    );
}