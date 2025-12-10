import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import './AdminAddUser.css';

export default function AdminAddUser() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        password: '',
        role: 'User',
        profileImageUrl: ''
    });

    const toggleShowPassword = () => setShowPassword(!showPassword);

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.in)$/;
        return emailRegex.test(email);
    };

    const validateMobile = (mobileNumber) => {
        const mobileRegex = /^[0-9]{10}$/;
        return mobileRegex.test(mobileNumber);
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_])[A-Za-z\d@_]{8}$/;
        return passwordRegex.test(password);
    };

    const handleAdd = async () => {
        if (!validateEmail(user.email)) {
            setStatus('Email must end with @gmail.com or @yahoo.in');
            return;
        }

        if (!validateMobile(user.mobileNumber)) {
            setStatus('Mobile number must be exactly 10 digits');
            return;
        }

        if (!validatePassword(user.password)) {
            setStatus('Password must be 8 characters, include uppercase, lowercase, number, and @ or _');
            return;
        }

        setStatus('Creating user...');

        try {
            const res = await fetch(`/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            if (res.status === 409) {
                const message = await res.text();
                alert(`${message}`);
                setStatus('');
                return;
            }

            if (!res.ok) {
                alert('Failed to add user. Please try again later.');
                setStatus('');
                return;
            }

            const newUser = await res.json();
            const userId = newUser.id;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const imageRes = await fetch(`/api/users/${userId}/upload-profile-image`, {
                    method: 'POST',
                    body: formData
                });

                if (!imageRes.ok) {
                    alert('User added, but image upload failed.');
                } else {
                    alert('User and image added successfully.');
                }
            } else {
                alert('User added successfully.');
            }

            navigate('/admin/users');

        } catch (err) {
            console.error('Error:', err);
            alert('Server error occurred.');
            setStatus('');
        }
    };

    const handleDiscard = () => {
        setUser({
            firstName: '',
            lastName: '',
            email: '',
            mobileNumber: '',
            password: '',
            role: 'User',
            profileImageUrl: ''
        });
        setSelectedFile(null);
        setPreview('');
        setStatus('');
    };

    return (
        <div className="edit-user-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>Add New User</h2>
            {status && <p className="form-status">{status}</p>}
            <table className="edit-user-table">
                <tbody>
                    <tr>
                        <td><label>First Name:</label></td>
                        <td>
                            <input
                                type="text"
                                name="firstName"
                                value={user.firstName}
                                onChange={handleChange}
                                required
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Last Name:</label></td>
                        <td>
                            <input
                                type="text"
                                name="lastName"
                                value={user.lastName}
                                onChange={handleChange}
                                required
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Email:</label></td>
                        <td>
                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                                required
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Mobile Number:</label></td>
                        <td>
                            <input
                                type="text"
                                name="mobileNumber"
                                value={user.mobileNumber}
                                onChange={handleChange}
                                required
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Password:</label></td>
                        <td>
                            <div className='password-wrapper'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={user.password}
                                    onChange={handleChange}
                                    required
                                />
                                <span
                                    onClick={toggleShowPassword}
                                    className="toggle-eye"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td><label>Upload Image (optional):</label></td>
                        <td>
                            <input
                                type="file"
                                accept="image/*"
                                onClick={(e) => (e.target.value = null)}
                                onChange={(e) => {
                                    setSelectedFile(e.target.files[0]);
                                    setPreview(URL.createObjectURL(e.target.files[0]));
                                }}
                            />
                            {preview && (
                                <div className="image-preview-wrapper">
                                    <img src={preview} alt="Preview" className="preview-img" />
                                </div>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td><label>Role:</label></td>
                        <td>
                            <select name="role" value={user.role} onChange={handleChange} required>
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2" style={{ textAlign: 'center', paddingTop: '10px' }}>
                            <button className="submit-button" onClick={handleAdd}>Add User</button>
                            <button className='dis-button' type="button" onClick={handleDiscard}>Clear</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}