import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FaShoppingBag, FaShoppingCart, FaMoon, FaSun, FaHeart } from 'react-icons/fa';
import BookSearchBar from './BookSearchBar';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cartItems, refreshCart } = useContext(CartContext);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const role = localStorage.getItem('role');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      const email = localStorage.getItem("email");
      if (email) {
        refreshCart(email);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [refreshCart]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Chapter 4</Link>
      </div>

      <ul className="navbar-links">
        {role === 'User' && (
          <>
            <li><Link to="/">Home</Link></li>
          </>
        )}
        <li><Link to="/books">Books</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/spin" className="nav-link">🎡 Spin & Win</Link></li>
        <li className="navbar-search"><BookSearchBar /></li>

        {/* Admin Dashboard link */}
        {user && role === 'Admin' && (
          <li><Link to="/admin/dashboard">Dashboard</Link></li>
        )}

        {user && role === 'User' && (
          <>
            <li className="icon-links">
              <Link to="/wishlist" className="icon-link" title="Wishlist">
                <FaHeart style={{ color: 'red' }} />
              </Link>
              <Link to="/order-history" className="icon-link" title="Order History">
                <FaShoppingBag />
              </Link>
              <Link to="/cart" className="icon-link" title="Cart">
                <FaShoppingCart />
                {cartItems?.length > 0 && (
                  <span className="cart-count">{cartItems.length}</span>
                )}
              </Link>
            </li>
            <li>
              <Link to="/profile" className="icon-link" title="Profile">Profile</Link>
            </li>
          </>
        )}

        {user && (
          <li className="dark-mode-toggle" title="Toggle Dark Mode" onClick={toggleDarkMode}>
            {darkMode ? <FaSun size={18} color="#FFD700" /> : <FaMoon size={18} />}
          </li>
        )}

        {!user ? (
          <>
            <li className="navbar-login"><Link to="/login">Login</Link></li>
            <li className="navbar-login"><Link to="/signup">Sign Up</Link></li>
          </>
        ) : (
          <>
            <li className="navbar-logout">
              <button onClick={logout}>Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
