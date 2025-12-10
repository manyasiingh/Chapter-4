import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './UserExperience.css';

export default function UserExperience() {
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        description: ''
    });

    useEffect(() => {
        const savedEmail = localStorage.getItem('email');
        if (savedEmail) {
            setForm(prevForm => ({ ...prevForm, email: savedEmail }));
        }
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const res = await fetch('/api/experiences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        if (res.ok) {
            setSuccess(true);
            setForm({
                name: '',
                email: form.email,
                description: ''
            });
        } else {
            alert('Failed to submit experience. Make sure all required fields are filled.');
        }
    };
    return (
        <div className="experience-container">
            <br></br>
            <div className='back-button' onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </div>
            <h2>Share Your Experience</h2>
            {success && <p className="success-msg">Thank you for your feedback!</p>}
            <table className='userexp-table'>
                <tbody>
                    <tr>
                        <td colSpan="2">
                            <form onSubmit={handleSubmit}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <label htmlFor="name">Name:</label>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    placeholder="Your Name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="email">Email:</label>
                                            </td>
                                            <td>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={form.email}
                                                    disabled
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="description">Description:</label>
                                            </td>
                                            <td>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    placeholder="Write your experience..."
                                                    value={form.description}
                                                    onChange={handleChange}
                                                    rows="4"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2" style={{ textAlign: 'center' }}>
                                                <button className='sub-but' type="submit">Submit</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </form>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}