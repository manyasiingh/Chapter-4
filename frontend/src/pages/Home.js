import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import BookCard from '../components/BookCard';
import SaleBanner from './SaleBanner';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    fetch('https://localhost:5001/api/books/trending')
      .then(res => res.json())
      .then(data => setTrending(data))
      .catch(err => console.error('Error fetching trending books:', err));
  }, []);

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!email) return;

    fetch(`https://localhost:5001/api/RecentView/${email}`)
      .then(res => res.json())
      .then(data => setRecentBooks(data))
      .catch(err => console.error('Error loading recent views:', err));
  }, [])

  return (
    <div className="home-container">
      <SaleBanner />
      <h1>Welcome to BookStore</h1>
      <h3>Trending Books</h3>

      <div className="trending-grid">
        {trending.map(book => (
          <BookCard key={book.id} book={book} onAddToCart={addToCart} />
        ))}
      </div>
      <br></br>
      <br></br>
      {user && (
        <>
          <Link to="/monthly-quiz" className="quiz-link">
            Take Monthly Book Quiz & Win Discounts!
          </Link>
        </>
      )}
      <br></br>
      <br></br>
      <h2>Recently Viewed Books</h2>
      <br></br>
      <div className="book-list">
        {recentBooks.map(book => (
          <BookCard key={book.id} book={book} onAddToCart={addToCart} />
        ))}
        {recentBooks.length === 0 && (
          <p style={{ color: '#2e3c50' }}>No recently viewed books.</p>
        )}
      </div>
    </div>
  );
}
