import React, { useEffect, useState } from "react";
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "./AdminSpinOptions.css";

export default function AdminSpinOptions() {
    const [options, setOptions] = useState([]);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        rewardType: "",
        rewardValue: "",
        isActive: true,
        sortOrder: 0
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        const res = await fetch("/api/spin-options");
        const data = await res.json();
        setOptions(data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const saveOption = async () => {
        if (!form.rewardType || !form.rewardValue) {
            alert("Fill all fields");
            return;
        }

        if (editingId) {
            await fetch(`/api/spin-options/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
        } else {
            await fetch("/api/spin-options", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
        }

        setForm({ rewardType: "", rewardValue: "", isActive: true, sortOrder: 0 });
        setEditingId(null);
        loadOptions();
    };

    const editOption = (opt) => {
        setForm({
            rewardType: opt.rewardType,
            rewardValue: opt.rewardValue,
            isActive: opt.isActive,
            sortOrder: opt.sortOrder
        });
        setEditingId(opt.id);
    };

    const deleteOption = async (id) => {
        if (!window.confirm("Delete this option?")) return;

        await fetch(`/api/spin-options/${id}`, {
            method: "DELETE",
        });

        loadOptions();
    };

    return (
        <div className="admin-spin-options">
            {/* Back Arrow */}
                        <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                            <FaArrowLeft />
                        </button>
            <h2>Spin Wheel Options</h2>

            <div className="option-form">
                <input
                    type="text"
                    name="rewardType"
                    placeholder="Reward Type"
                    value={form.rewardType}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="rewardValue"
                    placeholder="Value"
                    value={form.rewardValue}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="sortOrder"
                    placeholder="Sort Order"
                    value={form.sortOrder}
                    onChange={handleChange}
                />

                <button onClick={saveOption}>
                    {editingId ? "Update Option" : "Add Option"}
                </button>
            </div>

            <table className="spin-options-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Reward Type</th>
                        <th>Reward Value</th>
                        <th>Active</th>
                        <th>Order</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {options.map((opt) => (
                        <tr key={opt.id}>
                            <td>{opt.id}</td>
                            <td>{opt.rewardType}</td>
                            <td>{opt.rewardValue}</td>
                            <td>{opt.isActive ? "Yes" : "No"}</td>
                            <td>{opt.sortOrder}</td>
                            <td>
                                <button onClick={() => editOption(opt)}>Edit</button>
                                <button className="delete" onClick={() => deleteOption(opt.id)}>
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