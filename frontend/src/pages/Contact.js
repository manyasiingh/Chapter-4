import React, { useEffect, useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    queryText: ''
  });
  const [status, setStatus] = useState(null);
  const [userQueries, setUserQueries] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    address: '123 Main Street, City, Country',
    email: 'contact@bookstore.com',
    phone: '+123 456 7890'
  });

  const email = form.email || localStorage.getItem('email');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    // Fetch contact info from API
    const fetchContactInfo = async () => {
      try {
        const res = await fetch('https://localhost:5001/api/contactinfo');
        if (res.ok) {
          const data = await res.json();
          setContactInfo(data);
        }
      } catch (err) {
        console.error("Failed to fetch contact info");
      }
    };

    fetchContactInfo();
    
    if (email) {
      fetchUserQueries();
    }
  }, [email]);


  async function handleSubmit(e) {
    e.preventDefault();

    const mobileValid = /^[0-9]{10}$/.test(form.mobileNumber);
    const emailValid = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.in)$/.test(form.email);

    if (!mobileValid) {
      setStatus('Mobile number must be exactly 10 digits.');
      return;
    }

    if (!emailValid) {
      setStatus('Email must be @gmail.com or @yahoo.in.');
      return;
    }

    try {
      const res = await fetch('https://localhost:5001/api/contactqueries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('Query submitted successfully!');
        setForm({ name: '', mobileNumber: '', email: '', queryText: '' });
        fetchUserQueries(); // Refresh list after submitting
      } else {
        setStatus('Error submitting query. Try again.');
      }
    } catch (error) {
      setStatus('Network error. Try again later.');
    }
  }

  const fetchUserQueries = async () => {
    if (!email) return;
    try {
      const res = await fetch(`https://localhost:5001/api/contactqueries/user/${email}`);
      if (res.ok) {
        const data = await res.json();
        setUserQueries(data);
      }
    } catch (err) {
      console.error("Failed to fetch user queries.");
    }
  };

  useEffect(() => {
    if (email) fetchUserQueries();
  }, [email]);

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>

      <form onSubmit={handleSubmit} className="contact-form">
        <table className='table'>
          <tbody>
            <tr>
              <td><label htmlFor="name">Your Name</label></td>
              <td><input type="text" name="name" value={form.name} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <td><label htmlFor="mobileNumber">Mobile Number</label></td>
              <td><input type="tel" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <td><label htmlFor="email">Email Address</label></td>
              <td><input type="email" name="email" value={form.email} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <td><label htmlFor="queryText">Your Query</label></td>
              <td><textarea name="queryText" value={form.queryText} onChange={handleChange} rows={4} required></textarea></td>
            </tr>
            <tr>
              <td colSpan="2"><button type="submit">Submit</button></td>
            </tr>
          </tbody>
        </table>
      </form>

      {status && <p className="contact-status">{status}</p>}

      {userQueries.length > 0 && (
        <div className="your-queries">
          <h2>Your Past Queries</h2>
          <ul>
            {userQueries.map(query => (
              <li key={query.id}>
                <p className='red'><strong>Your Query:</strong> {query.queryText}</p>
                <p className='white'><strong>Submitted On:</strong> {new Date(query.submittedAt).toLocaleString('en-GB')}</p>
                <p>
                  <strong>Reply:</strong>{' '}
                  {query.replyText
                    ? <span style={{ color: 'green' }}>{query.replyText}</span>
                    : <span style={{ color: 'gray' }}>No reply yet</span>}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="contact-info">
        <h3>Our Address</h3>
        <p>{contactInfo.address}</p>
        <p>Email: {contactInfo.email}</p>
        <p>Phone: {contactInfo.phone}</p>
      </div>
    </div>
  );
}