import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Review from '../components/Review';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa'; 
import { CartContext } from '../context/CartContext';  
import './BookDetail.css';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasLoggedView = useRef(false);
  const { addToCart } = useContext(CartContext); 
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBook(data);
        } else {
          setBook(null);
        }
      } catch (err) {
        console.error('Failed to fetch book', err);
      }
      setLoading(false);
    }
    fetchBook();
  }, [id]);

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!email || !book || hasLoggedView.current) return;

    axios.post('/api/RecentView', {
      email,
      bookId: book.id
    }).catch(err => console.error('Failed to save recent view:', err));

    hasLoggedView.current = true;
  }, [book]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(book); 
  };

  if (loading) return <p>Loading book...</p>;
  if (!book) return <p>Book not found.</p>;

  return (
    <div className="book-detail-container">
      <button className='back-button' onClick={() => navigate(-1)}>
        <FaArrowLeft />
        </button>

      <h2 className="book-title">{book.title}</h2>
      {book.coverImageUrl && (
        <img src={
    book.coverImageUrl?.startsWith('http')
      ? book.coverImageUrl
      : book.coverImageUrl?.startsWith('/')
        ? book.coverImageUrl
        : `/images/${book.coverImageUrl || 'default-book.jpg'}`
  }
  alt={book.title}
  className="book-image"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = '/images/default-book.jpg';
  }}
        />
      )}
      <p className='details'><strong>Author: </strong>{book.author || 'Unknown'}</p>
      <p className='details'><strong>Price: </strong>₹{book.price}</p>
      <p className='details'><strong>Description: </strong>{book.description}</p>
      <p className='details'><strong>Category: </strong>{book.category}</p>

      <div className='details'>
        {book.category === 'Medical' && <p><strong>Subject: </strong>{book.subject}</p>}
        {book.category === 'Fiction' && <p><strong>Genre: </strong>{book.genre}</p>}
        {book.category === 'Educational' && <p><strong>Course: </strong>{book.course}</p>}
        {book.category === 'Indian' && <p><strong>Language: </strong>{book.language}</p>}
      </div>
      <p className='details'><strong>Stock: </strong>{book.quantity}</p>

      <button
        className='addtocart'
        disabled={book.quantity === 0}
        onClick={handleAddToCart}
        style={{ marginTop: '10px' }}
      >
        {book.quantity === 0 ? 'Sold Out' : 'Add to Cart'}
      </button>

      <Review bookId={book.id} />
    </div>
  );
}