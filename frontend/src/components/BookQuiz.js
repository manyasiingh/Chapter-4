import React, { useState } from 'react';
import './BookQuiz.css';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function BookQuiz() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({
        theme: '',
        genre: '',
        story: ''
    });

    const questions = [
        {
            key: 'theme',
            question: "Do you prefer:",
            options: [
                { label: "Modern themes", value: "modern" },
                { label: "Classic literature", value: "classic" }
            ]
        },
        {
            key: 'genre',
            question: "Which genre appeals more to you?",
            options: [
                { label: "Fiction", value: "Fiction" },
                { label: "Medical", value: "Medical" },
                { label: "Educational", value: "Educational" },
                { label: "Indian", value: "Indian" }
            ]
        },
        {
            key: 'story',
            question: "Do you enjoy deep storytelling or fast-paced plots?",
            options: [
                { label: "Deep storytelling", value: "deep" },
                { label: "Fast-paced plots", value: "fast" }
            ]
        }
    ];


    const handleAnswer = (value) => {
        const currentKey = questions[step].key;
        const updated = { ...answers, [currentKey]: value };
        setAnswers(updated);

        if (step + 1 < questions.length) {
            setStep(step + 1);
        } else {
            const query = new URLSearchParams(updated).toString();
            navigate(`/quiz-results?${query}`);
        }
    };

    const current = questions[step];

    return (
        <div className="quiz-container">
            {/* Back Arrow */}
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h1>Quiz</h1>
            <h2 className='quiz' style={{color:"#2e3c50"}}>{current.question}</h2>
            {current.options.map((opt, idx) => (
                <button key={idx} className="quiz-btn" onClick={() => handleAnswer(opt.value)}>
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
