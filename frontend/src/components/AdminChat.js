import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminChat.css';

export default function AdminChat() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();
    const [newMessage, setNewMessage] = useState('');

    const adminEmail = 'kavya@gmail.com';

    // Fetch users list
    const fetchUsers = async () => {
        try {
            const res = await fetch('https://localhost:5001/api/chat/users');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    // Fetch chat with selected user
    const fetchMessages = async (userEmail) => {
        try {
            const res = await fetch(`https://localhost:5001/api/chat/admin/${userEmail}`);
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser);
            const interval = setInterval(() => fetchMessages(selectedUser), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgObj = {
            senderEmail: adminEmail,
            receiverEmail: selectedUser,
            message: newMessage
        };

        try {
            const res = await fetch('https://localhost:5001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msgObj)
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages(selectedUser);
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    return (
        <>
            <br></br>


            <div className="admin-chat-container">
                <div className="user-list">
                    {/* Back Arrow */}
                    <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                        <FaArrowLeft />
                    </button>
                    <h3>Users</h3>
                    {users.map((userEmail) => (
                        <div
                            key={userEmail}
                            className={`user-item ${selectedUser === userEmail ? 'active' : ''}`}
                            onClick={() => setSelectedUser(userEmail)}
                        >
                            {userEmail}
                        </div>
                    ))}
                </div>

                <div className="chat-window">
                    {selectedUser ? (
                        <>
                            <div className="chat-header">Chat with {selectedUser}</div>
                            <div className="chat-messages">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={msg.senderEmail === adminEmail ? 'my-message' : 'their-message'}
                                    >
                                        <p>{msg.message}</p>
                                        <span className="timestamp">
                                            {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSend} className="chat-form">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message"
                                />
                                <button type="submit">Send</button>
                            </form>
                        </>
                    ) : (
                        <div className="select-user-placeholder"><br/><br/>Select a user to start chatting</div>
                    )}
                </div>
            </div>
            <br></br>
        </>
    );
}
