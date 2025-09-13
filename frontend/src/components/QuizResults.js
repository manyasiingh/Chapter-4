import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './QuizResults.css';

export default function QuizResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const genre = params.get('genre');
    const theme = params.get('theme');
    const story = params.get('story');

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const email = localStorage.getItem('email');

    useEffect(() => {
        if (genre && theme && story) {
            fetch(`https://localhost:5001/api/books/match?genre=${genre}&theme=${theme}&story=${story}`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch books');
                    return res.json();
                })
                .then(data => setBooks(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [genre, theme, story]);

    const handleAddToCart = async (bookId) => {
        if (!email) {
            alert('Please log in to add items to your cart.');
            navigate('/login');
            return;
        }

        try {
            const res = await fetch(`https://localhost:5001/api/cartitems`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, bookId, quantity: 1 }),
            });

            if (res.ok) {
                alert('Book added to cart!');
            } else {
                const msg = await res.text();
                alert('Failed to add to cart: ' + msg);
            }
        } catch (err) {
            console.error('Add to cart error:', err);
            alert('Error adding to cart.');
        }
    };

    return (
        <div className="results-page">
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <h2>Recommended Books</h2>

            {loading ? (
                <p>Loading recommendations...</p>
            ) : books.length === 0 ? (
                <p>No matches found for your quiz preferences.</p>
            ) : (
                <div className="book-grid">
                    {books.map(book => (
                        <div
                            className="book-card clickable"
                            key={book.id}
                            onClick={() => navigate(`/book/${book.id}`)}
                        >
                            <img
                                src={
                                    book.coverImageUrl.startsWith('http')
                                        ? book.coverImageUrl
                                        : `https://localhost:5001/${book.coverImageUrl}`
                                }
                                alt={book.title}
                                className="book-cover"
                            />
                            <h4><strong>Title:</strong> {book.title}</h4>
                            <p><strong>Author:</strong> {book.author}</p>
                            <p><strong>Price:</strong> ₹{book.price}</p>
                            <p><strong>Category:</strong> {book.category}</p>
                            <button
                                className="add-to-cart-btn"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent navigating to details
                                    handleAddToCart(book.id);
                                }}
                                disabled={book.quantity === 0}
                            >
                                {book.quantity === 0 ? 'Sold Out' : 'Add to Cart'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}