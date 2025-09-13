import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './AdminBookList.css';

export default function AdminBookList() {
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks().finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);


  const fetchBooks = async () => {
    try {
      const res = await fetch('https://localhost:5001/api/books');
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error(err);
      setStatus('Failed to fetch books');
    }
  };

  useEffect(() => {
    fetchBooks().finally(() => setLoading(false));
  }, []);


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`https://localhost:5001/api/books/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setBooks(prev => prev.filter(book => book.id !== id));
        setStatus('Book deleted successfully');
      } else {
        setStatus('Failed to delete book');
      }
    } catch (err) {
      console.error(err);
      setStatus('Error deleting book');
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="admin-books-container">
      {/* Back Arrow */}
      <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
        <FaArrowLeft />
      </button>
      <h2>Manage Books</h2>
      <Link to="/admin/books/add" className="add-book-btn">+ Add New Book</Link>

      {status && <p className="status-msg">{status}</p>}

      <div className="book-table-wrapper">
        {loading ? <p>Loading books...</p> : (
          <table className="book-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Trending</th>
                <th>Title</th>
                <th>Author</th>
                <th>Price</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Pages</th>
                <th>Story Type</th>
                <th>Theme Type</th>
                {/* <th>Quantity</th> */}
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td>
                    {book.coverImageUrl ? (
                      <img
                        src={book.coverImageUrl?.startsWith('http')
                          ? book.coverImageUrl
                          : `https://localhost:5001/${book.coverImageUrl}`}
                        alt={book.title}
                        className="book-thumb"
                      />
                    ) : 'N/A'}
                  </td>
                  <td>{book.isTrending
                    ? <span className="trending-badge"> Yes </span>
                    : <span className="not-trending"> No </span>}
                  </td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>₹{book.price ? book.price.toFixed(2) : '0.00'}</td>
                  <td>{book.category}</td>
                  <td className={book.quantity === 0 ? 'out-of-stock' : ''}>
                    {book.quantity}
                  </td>
                  <td>{book.pageCount}</td>
                  <td>{book.storyType}</td>
                  <td>{book.themeType}</td>
                  <td>
                    <Link to={`/admin/books/edit/${book.id}`} className="edit-btn">Edit</Link>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(book.id)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {books.length === 0 && <p>No books found.</p>}
      </div>
    </div>
  );
}
