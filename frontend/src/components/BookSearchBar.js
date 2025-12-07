import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import './BookSearchBar.css';

export default function BookSearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [filter, setFilter] = useState('title');
  const [loadingImage, setLoadingImage] = useState(false);
  const navigate = useNavigate();

  // -----------------------------------
  // TEXT SEARCH
  // -----------------------------------
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.trim().length === 0) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `https://localhost:5001/api/books/search?query=${query}&filter=${filter}`
        );

        if (res.ok) {
          const data = await res.json();
          setSuggestions(data || []);
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

  // -----------------------------------
  // IMAGE SEARCH
  // -----------------------------------
  const handleImageSearch = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoadingImage(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("https://localhost:5001/api/books/search-by-image", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
        alert("No matching book found.");
      }

    } catch (err) {
      console.error("Image search error:", err);
      alert("Error processing the image.");
    }

    setLoadingImage(false);
  };

  // -----------------------------------
  // HANDLE DROPDOWN CHANGE
  // -----------------------------------
  const handleFilterChange = (e) => {
    const value = e.target.value;

    if (value === "image") {
      document.getElementById("imageInput").click(); // open file picker
      setFilter("title"); // reset dropdown after use
    } else {
      setFilter(value);
    }
  };

  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <div className="book-search-bar">

      <div className="search-bar-container">

        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />

          <input
            type="text"
            className="input"
            placeholder={`Search by ${filter}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* DROPDOWN WITH IMAGE OPTION */}
        <select
          className="search-filter"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="image">Image</option>
        </select>

        {/* HIDDEN FILE INPUT */}
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          hidden
          onChange={handleImageSearch}
        />

      </div>

      {loadingImage && (
        <p style={{ marginTop: "10px", color: "#555" }}>
          Processing image...
        </p>
      )}

      {suggestions?.length > 0 && (
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
