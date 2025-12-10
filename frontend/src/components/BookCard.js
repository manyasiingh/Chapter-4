import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './BookCard.css';

export default function BookCard({ book }) {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const email = localStorage.getItem('email');

  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!email) return;
      const res = await fetch(`/api/wishlist/${email}`);
      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.some(item => item.bookId === book.id));
      }
    };
    fetchWishlistStatus();
  }, [book.id, email]);

  const toggleWishlist = async () => {
    if (!email) {
      alert('Please log in to use the wishlist.');
      return;
    }

    if (isWishlisted) {
      await fetch(`/api/wishlist/${email}/${book.id}`, {
        method: 'DELETE'
      });
      setIsWishlisted(false);
    } else {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, bookId: book.id })
      });

      if (res.ok) {
        setIsWishlisted(true);
      } else {
        alert('Already in wishlist.');
      }
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(book);
  };

  return (
    <div className="book-card">
      <div onClick={() => navigate(`/book/${book.id}`)} className='cur'>
        <img
          src={
            book.coverImageUrl?.startsWith('http')
              ? book.coverImageUrl
              : `/${book.coverImageUrl}`
          }
          alt={book.title}
          className="book-image"
        />
        <h3>{book.title}</h3>
        <h4>{book.author}</h4>
        <p>₹{book.price}</p>
        <p>In Stock: {book.quantity}</p>
      </div>
      <button
        onClick={() => {
          toggleWishlist();
        }}
        className={`wishlist-icon ${isWishlisted ? 'selected' : ''}`}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        ♥
      </button>
      <button
        disabled={book.quantity === 0}
        onClick={() => handleAddToCart(book.id)}>
        {book.quantity === 0 ? 'Sold Out' : 'Add to Cart'}
      </button>
    </div>
  );
}