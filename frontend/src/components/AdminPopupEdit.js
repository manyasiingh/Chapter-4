import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminPopupEdit.css';

export default function AdminPopupEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    isEnabled: false,
    title: '',
    subtitle: '',
    offerText: '',
    deliveryText: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://localhost:5001/api/PopupSettings/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const text = await res.text();
        if (!text) throw new Error('Empty response from server');

        const data = JSON.parse(text);
        setForm(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load popup data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    try {
      await fetch(`https://localhost:5001/api/PopupSettings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      navigate('/admin/popup-settings');
    } catch (err) {
      console.error('Failed to update popup setting:', err);
      alert('Update failed. Please try again.');
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="admin-popup-edit">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>
      <h2>Edit Popup</h2>
      <table className='edit-table'>
        <tbody>
          <tr>
            <td><label>Enable Popup</label></td>
            <td>
              <input
                type="checkbox"
                name="isEnabled"
                checked={form.isEnabled}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <td><label>Title</label></td>
            <td>
              <input
                type='text'
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <td><label>Sub Title</label></td>
            <td>
              <input
                type='text'
                name="subtitle"
                placeholder="Subtitle"
                value={form.subtitle}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <td><label>Offer</label></td>
            <td>
              <input
                type='text'
                name="offerText"
                placeholder="Offer Text"
                value={form.offerText}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <td><label>Delivery Text</label></td>
            <td>
              <input
                type='text'
                name="deliveryText"
                placeholder="Delivery Text"
                value={form.deliveryText}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <td colSpan="2">
              <button className='ad' onClick={handleSubmit}>Update</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
