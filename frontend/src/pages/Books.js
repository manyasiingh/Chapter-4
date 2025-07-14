import React, { useEffect, useState } from 'react';
import BookCard from '../components/BookCard';
import './Books.css';
import { FaArrowLeft } from 'react-icons/fa';

export default function Books() {

  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortOption, setSortOption] = useState('default');

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState('Sort');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100]);

  useEffect(() => {
    fetch('https://localhost:5001/api/books')
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setFilteredBooks(data);
      })
      .catch(err => console.error('Error fetching books:', err));
  }, []);

  const uniqueCategories = ['All', ...new Set(books.map(book => book.category || 'Uncategorized'))];
  const uniqueAuthors = ['All', ...new Set(books.map(book => book.author || 'Unknown'))];

  const applyFilters = () => {
    let filtered = books.filter(book => {
      const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
      const matchesAuthor = selectedAuthor === 'All' || book.author === selectedAuthor;
      const matchesPrice = book.price >= priceRange[0] && book.price <= priceRange[1];

      return matchesCategory && matchesAuthor && matchesPrice;
    });

    filtered = sortBooks(filtered, sortOption);
    setFilteredBooks(filtered);
    setShowFilterPanel(false);
  };

  const resetCurrentTab = () => {
    let updatedSort = sortOption;
    let updatedCategory = selectedCategory;
    let updatedAuthor = selectedAuthor;
    let updatedPrice = [...priceRange];

    switch (activeFilterType) {
      case 'Sort':
        updatedSort = 'default';
        setSortOption(updatedSort);
        break;
      case 'Category':
        updatedCategory = 'All';
        setSelectedCategory(updatedCategory);
        break;
      case 'Author':
        updatedAuthor = 'All';
        setSelectedAuthor(updatedAuthor);
        break;
      case 'Price Range':
        updatedPrice = [0, 100];
        setPriceRange(updatedPrice);
        break;
      default:
        break;
    }

    setTimeout(() => {
      const filtered = books.filter(book => {
        const matchesCategory = updatedCategory === 'All' || book.category === updatedCategory;
        const matchesAuthor = updatedAuthor === 'All' || book.author === updatedAuthor;
        const matchesPrice = book.price >= updatedPrice[0] && book.price <= updatedPrice[1];
        return matchesCategory && matchesAuthor && matchesPrice;
      });

      setFilteredBooks(sortBooks(filtered, updatedSort));
      setShowFilterPanel(false);
    }, 0);
  };

  const clearAllFilters = () => {
    const defaultCategory = 'All';
    const defaultAuthor = 'All';
    const defaultPriceRange = [0, 100];
    const defaultSort = 'default';

    setSelectedCategory(defaultCategory);
    setSelectedAuthor(defaultAuthor);
    setPriceRange(defaultPriceRange);
    setSortOption(defaultSort);

    setTimeout(() => {
      const filtered = books.filter(book => {
        const matchesCategory = defaultCategory === 'All' || book.category === defaultCategory;
        const matchesAuthor = defaultAuthor === 'All' || book.author === defaultAuthor;
        const matchesPrice = book.price >= defaultPriceRange[0] && book.price <= defaultPriceRange[1];
        return matchesCategory && matchesAuthor && matchesPrice;
      });

      setFilteredBooks(sortBooks(filtered, defaultSort));
      setShowFilterPanel(false);
    }, 0);
  };

  const sortBooks = (booksToSort, option) => {
    const sorted = [...booksToSort];

    switch (option) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'author-asc':
        return sorted.sort((a, b) => a.author.localeCompare(b.author));
      case 'author-desc':
        return sorted.sort((a, b) => b.author.localeCompare(a.author));
      case 'available-asc': 
        return sorted.sort((a, b) => a.quantity - b.quantity);
      case 'available-desc':
        return sorted.sort((a, b) => b.quantity - a.quantity);
      default:
        return sorted;
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const groupedBooks = filteredBooks.reduce((acc, book) => {
    const category = book.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(book);
    return acc;
  }, {});

  return (
    <div className="books-container">
      <h2>All Books</h2>

      {Object.entries(groupedBooks).map(([category, booksInCategory]) => (
        <div key={category} className="category-section">
          <h3 className="category-title">{category}</h3>
          <div className="book-list">
            {booksInCategory.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      ))}

      {!showFilterPanel && (
        <div className="filter-button-wrapper">
          <button className="filter-btn" onClick={() => setShowFilterPanel(true)}>
            Filter
          </button>
        </div>
      )}

      {showFilterPanel && (
        <div className="filter-panel">
          {/* Back arrow */}
          <div
            className="filter-back"
            onClick={() => setShowFilterPanel(false)}
          >
            <FaArrowLeft />
          </div>

          <div className="filter-left">
            {['Sort', 'Category', 'Author', 'Price Range'].map(type => (
              <button
                key={type}
                className={activeFilterType === type ? 'active' : ''}
                onClick={() => setActiveFilterType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="filter-right">
            {activeFilterType === 'Sort' && (
              <div className="sort-group">
                <label>Sort By</label>
                <select
                  value={sortOption}
                  onChange={handleSortChange}
                  className="sort-select"
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="title-asc">Title: A-Z</option>
                  <option value="title-desc">Title: Z-A</option>
                  <option value="author-asc">Author: A-Z</option>
                  <option value="author-desc">Author: Z-A</option>
                  <option value="available-asc">Availability: Low to High</option>
                  <option value="available-desc">Availability: High to Low</option>
                </select>
              </div>
            )}

            {activeFilterType === 'Category' && (
              <div className="filter-group">
                <label>Select Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {uniqueCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {activeFilterType === 'Author' && (
              <div className="filter-group">
                <label>Select Author</label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                >
                  {uniqueAuthors.map((auth, idx) => (
                    <option key={idx} value={auth}>{auth}</option>
                  ))}
                </select>
              </div>
            )}

            {activeFilterType === 'Price Range' && (
              <div className="filter-group">
                <label>Enter Price Range (₹)</label>
                <div className="price-inputs">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    min="0"
                  />
                  <span> to </span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    min={priceRange[0]}
                  />
                </div>
              </div>
            )}

            <div className="filter-actions">
              <button onClick={resetCurrentTab} className="reset-btn">
                Reset {activeFilterType}
              </button>
              <button onClick={clearAllFilters} className="reset-btn">
                Clear All
              </button>
              <button onClick={applyFilters} className="apply-btn">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredBooks.length === 0 && (
        <p className='no found'>No books match your filters.</p>
      )}
    </div>
  );
}
