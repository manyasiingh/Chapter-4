import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminUserDetails.css';

export default function AdminUserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [originalUser, setOriginalUser] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetch(`/api/users/${id}`)
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setOriginalUser(data);
                if (data.profileImageUrl) {
                    setPreview(`${data.profileImageUrl}`);
                }
            });
    }, [id]);

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.in)$/;
        return emailRegex.test(email);
    };

    const validateMobile = (mobile) => {
        const mobileRegex = /^[0-9]{10}$/;
        return mobileRegex.test(mobile);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!validateEmail(user.email)) {
            setStatus("Email must end with @gmail.com or @yahoo.in");
            return;
        }

        if (!validateMobile(user.mobileNumber)) {
            setStatus("Mobile number must be exactly 10 digits");
            return;
        }

        setStatus('');

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            if (res.ok) {
                alert('User updated');
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append('file', selectedFile);

                    const uploadRes = await fetch(`/api/users/${id}/upload-profile-image`, {
                        method: 'POST',
                        body: formData
                    });

                    if (uploadRes.ok) {
                        const data = await uploadRes.json();
                        setUser(prev => ({ ...prev, profileImageUrl: data.imageUrl }));
                        setPreview(`${data.imageUrl}`);
                        alert('Profile image uploaded');
                    } else {
                        alert('User updated, but image upload failed');
                    }
                }
                navigate('/admin/users');
            } else if (res.status === 409) {
                alert("A user with this email already exists.");
            } else {
                alert("Failed to update user.");
            }

        } catch (err) {
            console.error("Update failed:", err);
            alert("Something went wrong while updating.");
        }
    };

    const handleClear = () => {
        if (!window.confirm('Discard the Changes?')) return;
        setUser(originalUser);
        setSelectedFile(null);
        setPreview(originalUser?.profileImageUrl
            ? `${originalUser.profileImageUrl}`
            : ''
        );
        navigate('/admin/users');
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="edit-user-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>Edit User #{user.id}</h2>
            {status && <p>{status}</p>}
            <table className="edit-user-table">
                <tbody>
                    <tr>
                        <td><label>First Name:</label></td>
                        <td>
                            <input type="text"
                                name="firstName"
                                value={user.firstName}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Last Name:</label></td>
                        <td>
                            <input type="text"
                                name="lastName"
                                value={user.lastName}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Email:</label></td>
                        <td>
                            <input type="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Mobile Number:</label></td>
                        <td>
                            <input type="text"
                                name="mobileNumber"
                                value={user.mobileNumber}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><label>Upload New Image:</label></td>
                        <td>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setSelectedFile(e.target.files[0]);
                                    setPreview(URL.createObjectURL(e.target.files[0]));
                                }}
                            />
                            {preview && <img src={preview} alt="Preview" style={{ height: '60px', marginTop: '10px' }} />}
                        </td>
                    </tr>
                    <tr>
                        <td><label>Role:</label></td>
                        <td>
                            <select name="role" value={user.role} onChange={handleChange}>
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2" style={{ textAlign: 'center', paddingTop: '10px' }}>
                            <button className="update-btn" onClick={handleUpdate}>Update</button>
                            <button className="clear-btn" onClick={handleClear}>Clear</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
