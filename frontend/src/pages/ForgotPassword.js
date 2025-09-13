import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.in)$/;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[@_])[A-Za-z\d@_]{8}$/;

    if (!email || !newPassword || !confirm) {
      return alert("All fields are required.");
    }

    if (!emailRegex.test(email))
      return alert ("Email must end with @gmail.com or @yahoo.in");
    if (!passwordRegex.test(newPassword))
      return alert ("Password must be 8 characters, include uppercase, lowercase, digit and _ or @");

    if (newPassword !== confirm) {
      return alert("Passwords do not match.");
    }

    try {
      const res = await fetch(`https://localhost:5001/api/users/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });

      if (res.ok) {
        alert("Password reset successful!");
        window.location.href = '/login';
      } else {
        alert("Invalid email.");
      }
    } catch (err) {
      console.error("Reset failed", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="forgot-container">
      <h2>Reset Password</h2>

      <input
        className='input-email'
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <div className="password-input-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        <span onClick={() => setShowPassword(!showPassword)} className="toggle-eye">
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <div className="password-input-wrapper">
        <input
          type={showConfirm ? 'text' : 'password'}
          placeholder="Confirm Password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />
        <span onClick={() => setShowConfirm(!showConfirm)} className="toggle-eye">
          {showConfirm ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <button onClick={handleReset}>
        Reset Password
      </button>
    </div>
  );
}