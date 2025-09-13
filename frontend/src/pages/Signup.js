import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Signup.css';

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState('');

  //password visible toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //password visible toggle
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validate = () => {
    const mobileRegex = /^[0-9]{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.in)$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[@_])[A-Za-z\d@_]{8}$/;

    if (!mobileRegex.test(form.mobileNumber))
      return "Mobile number must be 10 digits";
    if (!emailRegex.test(form.email))
      return "Email must end with @gmail.com or @yahoo.in";
    if (!passwordRegex.test(form.password))
      return "Password must be 8 characters, include uppercase, lowercase, digit and _ or @";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setStatus(error);
      return;
    }

    try {
      const res = await fetch('https://localhost:5001/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('Signup successful!');
        setForm({
          firstName: '', lastName: '',
          mobileNumber: '', email: '',
          password: '', confirmPassword: ''
        });
      } else {
        const message = await res.text();
        setStatus(`Error: ${message}`);
      }
    } catch {
      setStatus('Network error');
    }
  };
  return (
    <>
      <div className="signup-container">
        <h2>Sign Up</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <label>First Name</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />

          <label>Last Name</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />

          <label>Mobile Number</label>
          <input
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <div className='password-wrapper'>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
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

          <label>Confirm Password</label>
          <div className='password-wrapper'>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <span
              onClick={toggleShowConfirmPassword}
              className="toggle-eye"
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit">Register</button>
        </form>
        {status && <p className="status">{status}</p>}
        <p className='login-span'>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </>
  );
}