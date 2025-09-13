import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [status, setStatus] = useState('');

    //password visible toggle
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    //password visible toggle
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.in)$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(form.email)) {
            setStatus('Email must end with @gmail.com or @yahoo.in');
            return;
        }
        if (!form.password) {
            setStatus('Password is required');
            return;
        }

        try {
            const res = await fetch('https://localhost:5001/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const errorText = await res.text();
                setStatus(errorText || 'Invalid email or password');
                return;
            }

            const data = await res.json();

            login(data);
            localStorage.setItem("email", form.email);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            setStatus(`Welcome back, ${data.firstName}!`);
            setForm({ email: '', password: '' });

            console.log("Login response status:", res.status);
            console.log("Login response data:", data);

            if (data.role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error("Login failed with error:", err);
            setStatus('Please try again later.');
        }
    };
    return (
        <>
            <div className="login-container">
                <h2>Login</h2>
                <form className="login-form" onSubmit={handleSubmit}>
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
                        {/* password visible toggle */}
                        <span
                            onClick={toggleShowPassword}
                            className="toggle-eye"
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <button type="submit">Login</button>
                </form>
                {status && <p className="status">{status}</p>}
                <p><Link to="/forgot-password" className="forgot-password-link">
                    Forgot Password?
                </Link>
                </p>
                <p className='login-span'>
                    Don't have an account? <Link to="/signup">Sign up here</Link>
                </p>
            </div>
        </>
    );
}