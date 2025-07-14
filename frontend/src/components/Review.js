import React, { useEffect, useState } from 'react';
import { FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import './Review.css';

export default function Review({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewImage, setReviewImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [showReviews, setShowReviews] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [votedReviews, setVotedReviews] = useState(new Set());
  const email = localStorage.getItem('email');

  useEffect(() => {
    if (showReviews && bookId) {
      fetch(`https://localhost:5001/api/reviews/book/${bookId}`)
        .then(res => res.json())
        .then(setReviews)
        .catch(err => console.error("Error fetching reviews:", err));
    }
  }, [showReviews, bookId]);

  const handleVote = async (reviewId, isHelpful) => {
    if (votedReviews.has(reviewId)) {
      alert("You've already voted on this review");
      return;
    }

    try {
      const res = await fetch(`https://localhost:5001/api/reviews/${reviewId}/vote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isHelpful),
      });

      if (res.ok) {
        const updatedReview = await res.json();
        setReviews(reviews.map(r =>
          r.id === reviewId ? updatedReview : r
        ));
        setVotedReviews(new Set(votedReviews).add(reviewId));
      } else {
        alert("Failed to submit vote");
      }
    } catch (err) {
      console.error("Vote submission failed:", err);
    }
  };

  const handleReviewSubmit = async () => {
    if (!comment || rating === 0) {
      alert("Please select a rating and enter a comment.");
      return;
    }

    const formData = new FormData();
    formData.append("bookId", bookId);
    formData.append("email", email);
    formData.append("rating", rating);
    formData.append("comment", comment);
    if (reviewImage) {
      formData.append("imageFile", reviewImage);
    }

    try {
      const res = await fetch('https://localhost:5001/api/reviews', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setComment('');
        setRating(0);
        setReviewImage(null);
        setPreview('');
      } else {
        alert("Failed to submit review");
      }
    } catch (err) {
      console.error("Review submission failed:", err);
    }
  };

  return (
    <div className="review-container">
      <button
        className="toggle-review-btn"
        onClick={() => setShowReviews(!showReviews)}
      >
        {showReviews ? 'Hide Reviews' : 'Show Reviews'}
      </button>

      {showReviews && (
        <>
          <h3>Ratings & Reviews</h3>

          <ul className="review-list">
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.map(r => (
                <li key={r.id} className="review-item">
                  <strong>{r.email}</strong>
                  <div className="stars">
                    {[...Array(r.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p>{r.comment}</p>

                  {r.imageUrl && (
                    <div className="review-image-wrapper">
                      <img
                        src={`https://localhost:5001/${r.imageUrl}`}
                        alt="Review"
                        className="review-image"
                      />
                    </div>
                  )}

                  <div>
                    {/* Admin Reply */}
                    {r.adminReply && (
                      <div className="admin-reply">
                        <strong>Admin Reply:</strong>
                        <p>{r.adminReply}</p>
                      </div>
                    )}
                  </div>

                  <div className="helpful-section">
                    <span>Was this review helpful?</span>
                    <button
                      onClick={() => handleVote(r.id, true)}
                      disabled={votedReviews.has(r.id)}
                    >
                      <FaThumbsUp /> {r.helpfulCount}
                    </button>
                    <button
                      onClick={() => handleVote(r.id, false)}
                      disabled={votedReviews.has(r.id)}
                    >
                      <FaThumbsDown /> {r.notHelpfulCount}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          {email && (
            <div className="review-form">
              <h4>Leave a Review</h4>

              <div className="star-input">
                {[1, 2, 3, 4, 5].map(star => (
                  <label
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={star}
                      checked={rating === star}
                      onChange={() => setRating(star)}
                    />
                    <FaStar color={star <= (hoverRating || rating) ? "#f5c518" : "#ccc"} />
                  </label>
                ))}
              </div>

              <textarea
                placeholder="Your thoughts..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setReviewImage(file);
                  setPreview(URL.createObjectURL(file));
                }}
              />
              {preview && (
                <div className="preview-wrapper">
                  <img src={preview} alt="Preview" width="120" />
                </div>
              )}

              <button onClick={handleReviewSubmit}>Submit Review</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}