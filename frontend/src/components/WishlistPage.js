import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './WishlistPage.css';

export default function WishlistPage() {
    const email = localStorage.getItem('email');
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const removeFromWishlist = async (bookId) => {
        await fetch(`/api/wishlist/${email}/${bookId}`, { method: 'DELETE' });
        setWishlist(prev => prev.filter(item => item.bookId !== bookId));
    };

    useEffect(() => {
        const fetchWishlist = async () => {
            const res = await fetch(`/api/wishlist/${email}`);
            const data = await res.json();
            setWishlist(data);
        };
        fetchWishlist();
    }, [email]);

    return (
        <div className="wishlist-page">
            <button className="back-button" onClick={() => navigate(-1)}><FaArrowLeft /></button>
            <h2>My Wishlist</h2>
            {wishlist.length === 0 ? (
                <p className='p'>Your wishlist is empty.</p>
            ) : (
                <ul>
                    {wishlist.map(item => (
                        <li key={item.id}>
                            <h4 className='p'>{item.book.title}</h4>
                            <p className='p'>Author: {item.book.author}</p>
                            <p className='p'>Price: ₹{item.book.price}</p>
                            <button className='rm' onClick={() => removeFromWishlist(item.bookId)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}