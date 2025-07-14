import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './MonthlyQuiz.css';

const questions = [
    {
        question: "Which author wrote '1984'?",
        options: ["George Orwell", "J.K. Rowling", "Ernest Hemingway"],
        answer: "George Orwell"
    },
    {
        question: "Which is a classic Indian epic?",
        options: ["Harry Potter", "Mahabharata", "The Hunger Games"],
        answer: "Mahabharata"
    },
    {
        question: "What's the term for books that explain facts?",
        options: ["Fiction", "Fantasy", "Non-fiction"],
        answer: "Non-fiction"
    },
    {
        question: "Which genre involves magical worlds?",
        options: ["Romance", "Science", "Fantasy"],
        answer: "Fantasy"
    },
    {
        question: "Who wrote 'Pride and Prejudice'?",
        options: ["Jane Austen", "Agatha Christie", "Dan Brown"],
        answer: "Jane Austen"
    }
];

export default function MonthlyQuiz() {
    const email = localStorage.getItem('email');
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [discount, setDiscount] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAnswer = (option) => {
        const isCorrect = option === questions[currentQ].answer;
        if (isCorrect) setScore(prev => prev + 1);

        if (currentQ + 1 < questions.length) {
            setCurrentQ(prev => prev + 1);
        } else {
            if (!email) {
                setError("Login required to submit quiz.");
                return;
            }

            fetch('https://localhost:5001/api/monthlyquiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, score })
            })
                .then(async res => {
                    if (!res.ok) {
                        const errorMsg = await res.text();
                        setError(errorMsg || "Quiz submission failed.");
                        return;
                    }

                    const data = await res.json();
                    if (data.success) {
                        setDiscount(data.discount);
                        setSubmitted(true);
                    } else {
                        setError("Quiz already taken this month.");
                    }
                })
                .catch(err => {
                    console.error(err);
                    setError("Submission failed due to server error.");
                });
        }
    };

    if (submitted) {
        return (
            <div className="quiz-finish">
                <h2>Quiz Completed!</h2>
                <p className='score'>Your score: {score}/5</p>
                {discount > 0 ? (
                    <p style={{ color: 'green' }}>Congrats! You earned ₹{discount} discount coupon.</p>
                ) : (
                    <p>Thanks for playing! Try again next month for a reward.</p>
                )}
            </div>
        );
    }

    return (
        <div className="quiz-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>{questions[currentQ].question}</h2>
            {questions[currentQ].options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)} className="quiz-btn">
                    {opt}
                </button>
            ))}
            {error && <p className="error">{error}</p>}
        </div>
    );
}
