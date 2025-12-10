import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminFaq.css';

export default function AdminFaq() {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        refreshQuestions();
    }, []);

    const refreshQuestions = async () => {
        const updated = await fetch('/api/faq/all').then(res => res.json());
        setQuestions(updated);
    };

    const handleAnswerChange = (id, value) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (id) => {
        const answer = answers[id];
        if (!answer) return alert("Answer cannot be empty");

        const res = await fetch(`/api/faq/${id}/answer`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answer)
        });

        if (res.ok) {
            alert("Answer submitted");
            setAnswers(prev => ({ ...prev, [id]: '' }));
            refreshQuestions();
        } else {
            alert("Failed to submit answer");
        }
    };

    const handleDelete = async (id, isAnswered) => {
        const confirmMsg = isAnswered
            ? "Are you sure you want to delete this answered question?"
            : "Are you sure you want to delete this unanswered question?";
        if (!window.confirm(confirmMsg)) return;

        const res = await fetch(`/api/faq/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            alert("Deleted");
            refreshQuestions();
        } else {
            alert("Failed to delete");
        }
    };

    return (
        <div className="admin-faq-container">
            {/* Back Arrow */}
            <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                <FaArrowLeft />
            </button>
            <h2>Manage FAQ Questions</h2>
            {questions.map(q => (
                <div key={q.id} className="faq-question-card">
                    <p className='ans'><b>Q :</b> {q.questionText}</p>
                    <p><i className='em'>From :</i> {q.email || "Anonymous"} | <i className='em'>Asked on:</i> {new Date(q.askedAt).toLocaleString()}</p>

                    {q.answerText ? (
                        <div className="answered-section">
                            <p className='ans'><b>Answer :</b><span className='span'> {q.answerText}</span></p>
                            <p><i className='em'>Answered on :</i> {new Date(q.answeredAt).toLocaleString()}</p>
                            <button
                                className="delete answered-delete"
                                onClick={() => handleDelete(q.id, true)}
                            >
                                Delete 
                            </button>
                        </div>
                    ) : (
                        <div className="answer-form">
                            <textarea
                                placeholder="Write your answer here..."
                                value={answers[q.id] || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            />
                            <button className="submit" onClick={() => handleSubmit(q.id)}>Submit</button>
                            <button className="delete" onClick={() => handleDelete(q.id, false)}>Delete</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}