import React, { useEffect, useState } from 'react';
import './RecentView.css';

export default function RecentlyViewedBooks() {
  const [recentBooks, setRecentBooks] = useState([]);
  const email = localStorage.getItem('email');

  useEffect(() => {
    const fetchRecentViews = async () => {
      try {
        const res = await fetch(`/api/recentviews/user/${email}`);
        if (res.ok) {
          const data = await res.json();
          setRecentBooks(data);
        }
      } catch (err) {
        console.error('Failed to fetch recent views:', err);
      }
    };

    if (email) fetchRecentViews();
  }, [email]);

  if (recentBooks.length === 0) {
    return <p>No recently viewed books.</p>;
  }

  return (
    <div className="recent-view-container">
      <div className="recent-grid">
        {recentBooks.map(view => (
          <div className="recent-book-card" key={view.id}>
            <img src={view.book.imageUrl} alt={view.book.title} />
            <p>{view.book.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
