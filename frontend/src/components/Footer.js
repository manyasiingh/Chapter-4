import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const { user } = useContext(AuthContext);
  const [contactInfo, setContactInfo] = useState({
    address: 'Loading address...',
    email: 'Loading email...',
    phone: 'Loading phone...'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('https://localhost:5001/api/contactinfo');
        if (response.ok) {
          const data = await response.json();
          setContactInfo({
            address: data.address || '123 Main Street, City, Country',
            email: data.email || 'contact@bookstore.com',
            phone: data.phone || '+123 456 7890'
          });
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
        // Fallback to default values
        setContactInfo({
          address: '123 Main Street, City, Country',
          email: 'contact@bookstore.com',
          phone: '+123 456 7890'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  if (isLoading) {
    return (
      <footer className="footer">
        <div className="footer-content">
          <p>Loading contact information...</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>BookStore Inc.</p>
        <p>{contactInfo.address}</p>
        <p>Email: {contactInfo.email} | Phone: {contactInfo.phone}</p>

        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/experiences">User Experiences</Link>

          {user && (
            <>
              <Link to="/share-experience">Share Experience</Link>
              <Link to="/book-quiz">Book Quiz</Link>
            </>
          )}
        </div>

        <p>&copy; {new Date().getFullYear()} BookStore. All rights reserved.</p>
      </div>
    </footer>
  );
}