import React, { useState, useEffect } from 'react';
import './Faq.css';
import {
  faChevronDown,
  faChevronUp,
  faPaperPlane,
  faQuestionCircle,
  faThumbsUp,
  faThumbsDown
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const predefinedFaqs = [
  {
    question: 'What is BookStore?',
    answer: 'BookStore is an online platform offering a wide variety of books across genres, including medical, fiction, and educational titles.'
  },
  {
    question: 'How can I place an order?',
    answer: 'Simply browse the books, add them to your cart, go to checkout, provide delivery details, and confirm payment.'
  },
  {
    question: 'How do I track my order?',
    answer: 'After placing an order, you can view its status in your profile under the "Order History" section.'
  },
  {
    question: 'What is the return or cancellation policy?',
    answer: 'You can cancel your order from the profile page before it is shipped. If already shipped, returns are accepted under certain conditions.'
  },
  {
    question: 'Do you offer international shipping?',
    answer: 'Currently, we only offer shipping within India. Stay tuned for global delivery options soon.'
  },
];

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [userQuestions, setUserQuestions] = useState([]);
  const [error, setError] = useState('');
  const [votedQuestions, setVotedQuestions] = useState(new Set());

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) setEmail(storedEmail);

    fetch('https://localhost:5001/api/faq/all')
      .then(res => res.json())
      .then(data => setUserQuestions(data))
      .catch(err => console.error('Error fetching user FAQs:', err));
  }, [submitted]);

  const toggleAnswer = index => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const validateEmail = (email) => {
    const validDomains = ['@gmail.com', '@yahoo.in'];
    return validDomains.some(domain => email.endsWith(domain));
  };

  const submitQuestion = () => {
    setError('');

    if (!userQuestion.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!email) {
      setError('User email not found. Please login again.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please use a valid email (@gmail.com or @yahoo.in)');
      return;
    }

    fetch('https://localhost:5001/api/faq/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, questionText: userQuestion }),
    })
      .then(() => {
        setUserQuestion('');
        setSubmitted(prev => !prev);
      })
      .catch(err => {
        console.error('Error submitting question:', err);
        setError('Failed to submit question. Please try again.');
      });
  };

  const handleQuestionVote = async (questionId, isHelpful) => {
    if (votedQuestions.has(questionId)) {
      alert("You've already voted on this question");
      return;
    }

    try {
      const res = await fetch(`https://localhost:5001/api/faq/${questionId}/vote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isHelpful),
      });

      if (res.ok) {
        const updatedQuestion = await res.json();
        setUserQuestions(userQuestions.map(q =>
          q.id === questionId ? updatedQuestion : q
        ));
        setVotedQuestions(new Set(votedQuestions).add(questionId));
      } else {
        alert("Failed to submit vote");
      }
    } catch (err) {
      console.error("Vote submission failed:", err);
    }
  };

  return (
    <div className="faq-container">
      <h2><FontAwesomeIcon icon={faQuestionCircle} /> Frequently Asked Questions</h2>

      {/* Predefined FAQs */}
      {predefinedFaqs.map((faq, idx) => (
        <div key={idx} className="faq-item">
          <div className="faq-question" onClick={() => toggleAnswer(idx)}>
            {faq.question}
            <FontAwesomeIcon icon={activeIndex === idx ? faChevronUp : faChevronDown} />
          </div>
          {activeIndex === idx && <div className="faq-answer">{faq.answer}</div>}
        </div>
      ))}

      {/* User Questions */}
      {userQuestions.length > 0 && (
        <>
          <h3>Community Questions</h3>
          {userQuestions.map((q) => (
            <div key={q.id} className="faq-item user-question">
              <div className="faq-question">
                <FontAwesomeIcon icon={faQuestionCircle} /> {q.questionText}
              </div>
              <div className="faq-meta">
                Submitted by: {q.email} on {new Date(q.askedAt).toLocaleDateString()}
              </div>

              {/* Admin Answer */}
              {q.answerText ? (
                <div className="faq-answer answered-by-admin">
                  <strong>Answer:</strong> {q.answerText}
                  {q.answeredAt && (
                    <div className="answer-date">
                      Answered on: {new Date(q.answeredAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="faq-answer waiting-for-answer">
                  <em>(Waiting for admin response...)</em>
                </div>
              )}

              {/* Vote Buttons */}
              <div className="helpful-section">
                <span>Was this question helpful?</span>
                <button
                  onClick={() => handleQuestionVote(q.id, true)}
                  disabled={votedQuestions.has(q.id)}
                  className={votedQuestions.has(q.id) ? 'voted' : ''}
                >
                  <FontAwesomeIcon icon={faThumbsUp} /> {q.helpfulCount}
                </button>
                <button
                  onClick={() => handleQuestionVote(q.id, false)}
                  disabled={votedQuestions.has(q.id)}
                  className={votedQuestions.has(q.id) ? 'voted' : ''}
                >
                  <FontAwesomeIcon icon={faThumbsDown} /> {q.notHelpfulCount}
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Ask Question Form */}
      <div className="ask-question-form">
        <h3>Ask a Question</h3>
        {error && <div className="error-message">{error}</div>}
        <textarea
          placeholder="Type your question here..."
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          required
        />
        <button onClick={submitQuestion}>
          <FontAwesomeIcon icon={faPaperPlane} /> Submit Question
        </button>
      </div>
    </div>
  );
}