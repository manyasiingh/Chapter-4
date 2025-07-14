import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import './BookSearchBar.css';

export default function BookSearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [filter, setFilter] = useState('title');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length === 0) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(`https://localhost:5001/api/books/search?query=${query}&filter=${filter}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, filter]);

  const handleSelect = (bookId) => {
    navigate(`/book/${bookId}`);
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="book-search-bar">
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className='input'
            placeholder={`Search by ${filter}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="search-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
        </select>
      </div>

      {suggestions.length > 0 && (
        <ul className="suggestion-list">
          {suggestions.map((book) => (
            <li key={book.id} onClick={() => handleSelect(book.id)}>
              {book.title} by {book.author}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}