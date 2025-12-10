import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminPopupList.css'

export default function AdminPopupList() {
  const [settingsList, setSettingsList] = useState([]);
  const navigate = useNavigate();

  const fetchSettings = async () => {
    const res = await fetch('/api/PopupSettings');
    const data = await res.json();
    setSettingsList(Array.isArray(data) ? data : [data]); // in case it's a single object
  };

  const deleteSetting = async (id) => {
    if (!window.confirm('Are you sure you want to delete this popup setting?')) return;
    await fetch(`/api/PopupSettings/${id}`, {
      method: 'DELETE'
    });
    fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="admin-popup-list">
      {/* Back Arrow */}
      <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
        <FaArrowLeft />
      </button>
      <h2>Startup Popup Settings</h2>
      <Link to="/admin/popup-settings/add" className="btn-add">+
        Add New</Link>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Subtitle</th>
            <th>Enabled</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {settingsList.map(setting => (
            <tr key={setting.id}>
              <td>{setting.title}</td>
              <td>{setting.subtitle}</td>
              <td>{setting.isEnabled ? 'Yes' : 'No'}</td>
              <td>
                <button className="submit-button" onClick={() => navigate(`/admin/popup-settings/edit/${setting.id}`)}>
                  Edit
                </button>
              </td>
              <td>
                <button className='dis-button' onClick={() => deleteSetting(setting.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
