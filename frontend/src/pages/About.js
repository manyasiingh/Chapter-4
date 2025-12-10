import React, { useEffect, useState } from 'react';
import './About.css';

export default function About() {
  const [content, setContent] = useState({});

  useEffect(() => {
    fetch('/api/aboutcontent')
      .then(res => res.json())
      .then(data => {
        const sectionData = {};
        data.forEach(item => {
          sectionData[item.section] = item.content;
        });
        setContent(sectionData);
      })
      .catch(err => console.error("Error fetching about content:", err));
  }, []);

  return (
    <div className="about-container">
      <h1>About Us</h1>
      <section className="about-section" dangerouslySetInnerHTML={{ __html: content.AboutUs }} />

      <h2>Our Team</h2>
      <section className="about-section" dangerouslySetInnerHTML={{ __html: content.Team }} />

      <h2>Terms & Conditions</h2>
      <section className="about-section" dangerouslySetInnerHTML={{ __html: content.Terms }} />

      <h2>Privacy Policy</h2>
      <section className="about-section" dangerouslySetInnerHTML={{ __html: content.Privacy }} />
    </div>
  );
}
