import React, { useEffect, useState, useCallback } from 'react';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [edit, setEdit] = useState(false);
    const [formUser, setFormUser] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();
    const email = localStorage.getItem('email');

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch(`https://localhost:5001/api/users/email/${email}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setFormUser(data);
            }
        } catch (err) {
            console.error('Error fetching user:', err);
        }
    }, [email]);

    useEffect(() => {
        if (!email) return;
        const fetchWishlist = async () => {
            try {
                const res = await fetch(`https://localhost:5001/api/wishlist/user/${email}`);
                if (res.ok) {
                    const data = await res.json();
                    setWishlist(data);
                }
            } catch (err) {
                console.error('Error fetching wishlist:', err);
            }
        };

        fetchUser();
        fetchWishlist();
    }, [email, fetchUser]);

    const handleChange = (e) => {
        setFormUser({ ...formUser, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        if (!formUser.firstName || !formUser.lastName || !formUser.mobileNumber) {
            alert("All fields are required.");
            return;
        }
        if (!/^\d{10}$/.test(formUser.mobileNumber)) {
            alert("Mobile number must be exactly 10 digits.");
            return;
        }

        const confirm = window.confirm("Are you sure you want to save changes?");
        if (!confirm) return;

        try {
            const res = await fetch(`https://localhost:5001/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formUser),
            });

            if (res.ok) {
                alert("Profile updated successfully!");
                setUser(formUser);
                setEdit(false);
            } else {
                alert("Update failed.");
            }
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    const handleCancel = () => {
        const confirm = window.confirm("Discard changes?");
        if (!confirm) return;
        setFormUser(user);
        setEdit(false);
    };

    const handleRemoveImage = async () => {
        const confirm = window.confirm("Are you sure you want to remove your profile image?");
        if (!confirm) return;

        try {
            const res = await fetch(`https://localhost:5001/api/users/${user.id}/profile-image`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert("Image removed successfully.");
                await fetchUser();
                setUser(prev => ({ ...prev, profileImageUrl: null }));
            } else {
                alert("Failed to remove image.");
            }
        } catch (err) {
            console.error("Error removing image:", err);
            alert("Network error while removing image.");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);

        try {
            const res = await fetch(`https://localhost:5001/api/users/${user.id}/upload-profile-image`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setUser(prev => ({ ...prev, profileImageUrl: data.imageUrl }));
                alert("Image uploaded successfully!");
                await fetchUser();
            } else {
                alert("Image upload failed.");
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
        }
    };

    if (!user) return <p>Loading profile...</p>;
    return (
        <div className="profile-container">
            <h2>Your Profile</h2>
            {/* Profile Image Section */}
            <div className="profile-image-section">
                {user.profileImageUrl ? (
                    <>
                        <img
                            src={
                                user.profileImageUrl.startsWith('http')
                                    ? user.profileImageUrl
                                    : `https://localhost:5001/${user.profileImageUrl}`
                            }
                            alt="Profile"
                            className="profile-image"
                        />
                        {edit && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                style={{ marginTop: '10px', marginRight: '10px' }}
                            >
                                Remove Image
                            </button>
                        )}
                    </>
                ) : (
                    <p>No profile image uploaded</p>
                )}
                {edit && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        style={{ marginTop: '10px' }}
                    />
                )}
            </div>
            {!edit ? (
                <div className="profile-info">
                    <table className="profile-table">
                        <tbody>
                            <tr>
                                <td><strong>First Name:</strong></td>
                                <td>{user.firstName}</td>
                            </tr>
                            <tr>
                                <td><strong>Last Name:</strong></td>
                                <td>{user.lastName}</td>
                            </tr>
                            <tr>
                                <td><strong>Email:</strong></td>
                                <td>{user.email}</td>
                            </tr>
                            <tr>
                                <td><strong>Mobile:</strong></td>
                                <td>{user.mobileNumber}</td>
                            </tr>
                            <tr>
                                <td><strong>Role:</strong></td>
                                <td>{user.role}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="profile-buttons">
                        <button onClick={() => setEdit(true)}>Edit Profile</button>
                        <button onClick={() => navigate('/order-history')}>View Orders</button>
                    </div>
                </div>
            ) : (
                <div className="profile-info">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdate();
                        }}
                    >
                        <label>First Name:</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formUser.firstName}
                            onChange={handleChange}
                            required
                            placeholder="First Name"
                        />
                        <label>Last Name:</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formUser.lastName}
                            onChange={handleChange}
                            required
                            placeholder="Last Name"
                        />
                        <label>Email:</label>
                        <input
                            type="email"
                            value={formUser.email}
                            disabled
                        />
                        <label>Mobile:</label>
                        <input
                            type="text"
                            name="mobileNumber"
                            value={formUser.mobileNumber}
                            onChange={handleChange}
                            maxLength={10}
                            pattern="\d{10}"
                            title="Mobile number must be exactly 10 digits"
                            required
                            placeholder="Mobile Number"
                        />
                        <div className="profile-buttons">
                            <button>Save</button>
                            <button onClick={handleCancel}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            {/* Wishlist Section */}
            <div className="wishlist-section">
                <h3>Your Wishlist</h3>
                {wishlist.length === 0 ? (
                    <p>No items in wishlist.</p>
                ) : (
                    <ul className="wishlist-list">
                        {wishlist.map(item => (
                            <li key={item.id} className="wishlist-item">
                                <strong>{item.book.title}</strong><br />
                                <span>₹{item.book.price}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}