import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AdminReviews.css';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [replyMap, setReplyMap] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const res = await fetch('https://localhost:5001/api/reviews');
        const data = await res.json();
        setReviews(data);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review?')) return;

        const res = await fetch(`https://localhost:5001/api/reviews/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) fetchReviews();
    };

    const handleReplyChange = (id, value) => {
        setReplyMap(prev => ({ ...prev, [id]: value }));
    };

    const submitReply = async (id) => {
        const reply = replyMap[id];
        if (!reply) return;

        const res = await fetch(`https://localhost:5001/api/reviews/${id}/reply`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reply)
        });

        if (res.ok) {
            fetchReviews();
            setReplyMap(prev => ({ ...prev, [id]: '' }));
        }
    };

    return (
        <div className="admin-reviews-container">
            {/* Back Arrow */}
            <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                <FaArrowLeft />
            </button>
            <h2>Manage User Reviews</h2>
            <table className="review-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th>Book</th>
                        <th>Image</th>
                        <th>Reply</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map(review => (
                        <tr key={review.id}>
                            <td>{review.email}</td>
                            <td>{'⭐'.repeat(review.rating)}</td>
                            <td>{review.comment}</td>
                            <td>{review.book?.title || 'N/A'}</td>
                            <td>
                                {review.imageUrl && (
                                    <img
                                        src={`https://localhost:5001/${review.imageUrl}`}
                                        alt="Review"
                                        width={70}
                                    />
                                )}
                            </td>
                            <td>
                                {review.adminReply ? (
                                    <p><strong>Admin:</strong> {review.adminReply}</p>
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Write reply..."
                                            value={replyMap[review.id] || ''}
                                            onChange={e => handleReplyChange(review.id, e.target.value)}
                                        />
                                        <br></br><br></br>
                                        <button className='reply' onClick={() => submitReply(review.id)}>
                                            Reply
                                        </button>
                                    </>
                                )}
                            </td>
                            <td>
                                <button onClick={() => handleDelete(review.id)} className="del-button">
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
