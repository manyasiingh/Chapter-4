// import React, { useEffect, useState } from 'react';
// import './LiveChat.css';
// import { FaComments, FaTimes } from 'react-icons/fa';

// export default function LiveChat({ userEmail }) {
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [isOpen, setIsOpen] = useState(false);

//     const fetchMessages = async () => {
//         try {
//             const res = await fetch(`https://localhost:5001/api/chat/${userEmail}`);
//             if (res.ok) {
//                 const data = await res.json();
//                 setMessages(data);
//             }
//         } catch (error) {
//             console.error('Error fetching messages:', error);
//         }
//     };

//     useEffect(() => {
//         if (!userEmail) return;
//         fetchMessages();
//         const interval = setInterval(fetchMessages, 3000);
//         return () => clearInterval(interval);
//     }, [userEmail]);

//     const handleSend = async (e) => {
//         e.preventDefault();
//         if (!newMessage.trim()) return;

//         const msgObj = {
//             senderEmail: userEmail,
//             receiverEmail: 'kavya@gmail.com',
//             message: newMessage
//         };

//         try {
//             const res = await fetch('https://localhost:5001/api/chat', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(msgObj)
//             });

//             if (res.ok) {
//                 setNewMessage('');
//                 fetchMessages();
//             }
//         } catch (error) {
//             console.error('Error sending message:', error);
//         }
//     };

//     return (
//         <div className="floating-chat-wrapper">
//             {isOpen ? (
//                 <div className="chat-box">
//                     <div className="chat-header">
//                         <span>Live Chat</span>
//                         <button onClick={() => setIsOpen(false)}><FaTimes /></button>
//                     </div>
//                     <div className="chat-messages">
//                         {messages.map((msg) => (
//                             <div key={msg.id} className={msg.senderEmail === userEmail ? 'my-message' : 'their-message'}>
//                                 <p>{msg.message}</p>
//                                 <span className="timestamp">
//                                     {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                     <form onSubmit={handleSend} className="chat-form">
//                         <input
//                             type="text"
//                             value={newMessage}
//                             onChange={(e) => setNewMessage(e.target.value)}
//                             placeholder="Type a message"
//                         />
//                         <button type="submit">Send</button>
//                     </form>
//                 </div>
//             ) : (
//                 <button className="open-chat-btn" onClick={() => setIsOpen(true)}>
//                     <FaComments size={24} />
//                 </button>
//             )}
//         </div>
//     );
// }
import React, { useEffect, useState } from 'react';
import './LiveChat.css';
import { FaComments, FaTimes } from 'react-icons/fa';

export default function LiveChat({ userEmail }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`https://localhost:5001/api/chat/${userEmail}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        if (!userEmail) return;
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [userEmail]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await sendMessage(newMessage);
        setNewMessage('');
    };

    const handleSendDefault = async (text) => {
        await sendMessage(text);
    };

    const sendMessage = async (text) => {
        const msgObj = {
            senderEmail: userEmail,
            receiverEmail: 'kavya@gmail.com',
            message: text
        };

        try {
            const res = await fetch('https://localhost:5001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msgObj)
            });

            if (res.ok) {
                fetchMessages();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="floating-chat-wrapper">
            {isOpen ? (
                <div className="chat-box">
                    <div className="chat-header">
                        <span>Live Chat</span>
                        <button onClick={() => setIsOpen(false)}><FaTimes /></button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={msg.senderEmail === userEmail ? 'my-message' : 'their-message'}>
                                <p>{msg.message}</p>
                                <span className="timestamp">
                                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Default FAQ buttons */}
                    {messages.length === 0 && (
                        <div className="chat-quick-questions">
                            <p>Quick Questions:</p>
                            <button onClick={() => handleSendDefault("fiction")}>Fiction</button>
                            <button onClick={() => handleSendDefault("how to add experience")}>How to add experience</button>
                            <button onClick={() => handleSendDefault("how to return order")}>How to return order</button>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="chat-form">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message"
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            ) : (
                <button className="open-chat-btn" onClick={() => setIsOpen(true)}>
                    <FaComments size={24} />
                </button>
            )}
        </div>
    );
}
