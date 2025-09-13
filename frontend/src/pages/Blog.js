import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { faBookOpen, faStar, faTruck, faTags, faHeadset } from '@fortawesome/free-solid-svg-icons';
import './Blog.css';

const Blog = () => {
  const navigate = useNavigate(); 

  const handleExploreClick = () => {
    navigate('/books');
  };

  return (
    <div className="book-blog-container blog-page">
      <header className="blog-header">
        <h1>The Power of Reading: Why Books Transform Lives</h1>
        <p className="subtitle">And why our bookstore is your perfect reading partner</p>
      </header>

      <div className="blog-content">
        <section className="benefits-section">
          <h2><FontAwesomeIcon icon={faBookOpen} /> Why Reading Books is Essential</h2>

          <div className="benefit-card">
            <h3>Expand Your Knowledge</h3>
            <p>Books are gateways to unlimited knowledge. Whether you're interested in history, science, or personal development, reading exposes you to new ideas and perspectives that can change how you see the world.</p>
          </div>

          <div className="benefit-card">
            <h3>Boost Brain Power</h3>
            <p>Regular reading improves memory, enhances concentration, and reduces stress. Studies show that reading can even delay cognitive decline in later years.</p>
          </div>

          <div className="benefit-card">
            <h3>Develop Empathy</h3>
            <p>Fictional stories allow you to experience life through different characters' eyes, fostering understanding and compassion for people from diverse backgrounds.</p>
          </div>

          <div className="benefit-card">
            <h3>Improve Communication Skills</h3>
            <p>Regular readers develop richer vocabularies and better writing abilities, which can enhance both personal and professional relationships.</p>
          </div>
        </section>

        <section className="store-advantages">
          <h2><FontAwesomeIcon icon={faStar} /> Why Choose Our Bookstore?</h2>

          <div className="advantage-grid">
            <div className="advantage-card">
              <FontAwesomeIcon icon={faStar} className="advantage-icon" />
              <h3>Curated Selection</h3>
              <p>We carefully select only the highest quality books across all genres, saving you time from sifting through mediocre titles.</p>
            </div>

            <div className="advantage-card">
              <FontAwesomeIcon icon={faTruck} className="advantage-icon" />
              <h3>Fast Delivery</h3>
              <p>Get your books within 2-3 business days with our efficient shipping network across the country.</p>
            </div>

            <div className="advantage-card">
              <FontAwesomeIcon icon={faTags} className="advantage-icon" />
              <h3>Competitive Prices</h3>
              <p>Enjoy regular discounts, loyalty rewards, and special member-only deals that make reading affordable.</p>
            </div>

            <div className="advantage-card">
              <FontAwesomeIcon icon={faHeadset} className="advantage-icon" />
              <h3>Expert Recommendations</h3>
              <p>Our team of book enthusiasts provides personalized recommendations based on your reading preferences.</p>
            </div>
          </div>
        </section>

        <section className="testimonial-section">
          <h2>What Our Readers Say</h2>
          <div className="testimonial">
            <blockquote>
              "This bookstore completely changed my reading habits. Their monthly picks introduced me to genres I never would have tried otherwise!"
            </blockquote>
            <p>- Priya K., Loyal Customer for 5 years</p>
          </div>
        </section>

        <section className="call-to-action">
          <h2>Ready to Start Your Reading Journey?</h2>
          <p className='p'>Browse our collection today and discover your next favorite book!</p>
          <button onClick={handleExploreClick} className="cta-button">Explore Our Books</button>
        </section>
      </div>
    </div>
  );
};

export default Blog;