import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminContactQueries.css';

export default function AdminContactQueries() {
    const [queries, setQueries] = useState([]);
    const [error, setError] = useState('');
    const [replies, setReplies] = useState({});
    const navigate = useNavigate();

    const fetchQueries = async () => {
        try {
            const res = await fetch('https://localhost:5001/api/contactqueries');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setQueries(data);
        } catch (err) {
            setError('Could not load contact queries.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this query?')) return;

        try {
            const res = await fetch(`https://localhost:5001/api/contactqueries/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setQueries(queries.filter(q => q.id !== id));
            } else {
                alert('Failed to delete query.');
            }
        } catch {
            alert('Network error.');
        }
    };

    const handleReplyChange = (id, value) => {
        setReplies(prev => ({ ...prev, [id]: value }));
    };

    const submitReply = async (id) => {
        const replyText = replies[id];
        if (!replyText || replyText.trim() === '') {
            alert('Reply cannot be empty.');
            return;
        }

        try {
            const res = await fetch(`https://localhost:5001/api/contactqueries/${id}/reply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(replyText)
            });

            if (res.ok) {
                alert('Reply submitted!');
                setReplies(prev => ({ ...prev, [id]: '' }));
                fetchQueries(); // refresh with updated data
            } else {
                alert('Failed to submit reply.');
            }
        } catch {
            alert('Network error while sending reply.');
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    return (
        <div className="admin-contact-queries">
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>Contact Queries</h2>
            {error && <p className="error">{error}</p>}
            {queries.length === 0 ? (
                <p>No queries submitted yet.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Message</th>
                            <th>Reply</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queries.map(query => (
                            <tr key={query.id}>
                                <td>{query.name}</td>
                                <td>{query.mobileNumber}</td>
                                <td>{query.email}</td>
                                <td>{query.queryText}</td>
                                <td>
                                    {query.replyText ? (
                                        <span style={{ color: 'green' }}>{query.replyText}</span>
                                    ) : (
                                        <div>
                                            <textarea
                                                value={replies[query.id] || ''}
                                                onChange={(e) => handleReplyChange(query.id, e.target.value)}
                                                rows={2}
                                                placeholder="Write reply..."
                                            />
                                            <button className='submit-btn' onClick={() => submitReply(query.id)}>Send</button>
                                        </div>
                                    )}
                                </td>
                                <td>{new Date(query.submittedAt).toLocaleString()}</td>
                                <td>
                                    <button className="delete-btn" onClick={() => handleDelete(query.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}



// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaArrowLeft } from 'react-icons/fa';
// import './AdminContactQueries.css';

// export default function AdminContactQueries() {
//     const [queries, setQueries] = useState([]);
//     const [error, setError] = useState('');
//     const navigate = useNavigate();

//     const fetchQueries = async () => {
//         try {
//             const res = await fetch('https://localhost:5001/api/contactqueries');
//             if (!res.ok) throw new Error('Failed to fetch');
//             const data = await res.json();
//             setQueries(data);
//         } catch (err) {
//             setError('Could not load contact queries.');
//         }
//     };

//     const handleDelete = async (id) => {
//         if (!window.confirm('Are you sure you want to delete this query?')) return;

//         try {
//             const res = await fetch(`https://localhost:5001/api/contactqueries/${id}`, {
//                 method: 'DELETE',
//             });
//             if (res.ok) {
//                 setQueries(queries.filter(q => q.id !== id));
//             } else {
//                 alert('Failed to delete query.');
//             }
//         } catch {
//             alert('Network error.');
//         }
//     };

//     useEffect(() => {
//         fetchQueries();
//     }, []);

//     return (
//         <div className="admin-contact-queries">
//             <button className="back-button" onClick={() => navigate(-1)}>
//                 <FaArrowLeft />
//             </button>
//             <h2>Contact Queries</h2>
//             {error && <p className="error">{error}</p>}
//             {queries.length === 0 ? (
//                 <p>No queries submitted yet.</p>
//             ) : (
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Name</th>
//                             <th>Mobile</th>
//                             <th>Email</th>
//                             <th>Message</th>
//                             <th>Submitted At</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {queries.map(query => (
//                             <tr key={query.id}>
//                                 <td>{query.name}</td>
//                                 <td>{query.mobileNumber}</td>
//                                 <td>{query.email}</td>
//                                 <td>{query.queryText}</td>
//                                 <td>{new Date(query.submittedAt).toLocaleString()}</td>
//                                 <td>
//                                     <button className="delete-btn" onClick={() => handleDelete(query.id)}>Delete</button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// }
