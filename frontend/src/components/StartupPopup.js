import React, { useState, useEffect } from 'react';
import { FaTimes, FaBookOpen, FaGift, FaShippingFast } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import './StartupPopup.css';

export default function StartupPopup() {
    const [show, setShow] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [popupSetting, setPopupSetting] = useState(null);

    useEffect(() => {
        const fetchPopupSetting = async () => {
            const res = await fetch('https://localhost:5001/api/PopupSettings');
            const data = await res.json();
            const setting = Array.isArray(data) ? data.find(s => s.isEnabled) : null;

            if (setting && !sessionStorage.getItem('popupShown')) {
                setPopupSetting(setting);
                setShowConfetti(true);
                fireConfetti();
                setTimeout(() => setShow(true), 300);
                sessionStorage.setItem('popupShown', 'true');
            }
        };

        fetchPopupSetting();
    }, []);

    const fireConfetti = () => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 10000 });
        setTimeout(() => {
            confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 }, zIndex: 10000 });
            confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 }, zIndex: 10000 });
        }, 250);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => setShow(false), 300);
    };

    if (!show || !popupSetting) return null;

    return (
        <>
            <div className={`confetti-container ${showConfetti ? 'active' : ''}`}></div>

            <div className={`popup-overlay ${isClosing ? 'closing' : ''}`}>
                <div className={`popup-box ${isClosing ? 'closing' : ''}`}>
                    <button className="close-btn" onClick={handleClose}>
                        <FaTimes />
                    </button>

                    <div className="popup-header">
                        <div className="book-icon"><FaBookOpen /></div>
                        <h2>{popupSetting.title}</h2>
                        <p className="rainbow-text">{popupSetting.subtitle}</p>
                    </div>

                    <div className="benefits-grid">
                        <div className="benefit-item">
                            <div className="benefit-icon pulse"><FaGift /></div>
                            <h3>Exclusive Welcome Offer</h3>
                            <p>{popupSetting.offerText}</p>
                        </div>
                        <div className="benefit-item">
                            <div className="benefit-icon pulse"><FaShippingFast /></div>
                            <h3>Fast Delivery</h3>
                            <p>{popupSetting.deliveryText}</p>
                        </div>
                    </div>

                    <button className="cta-btn bounce" onClick={handleClose}>
                        Start Exploring
                    </button>

                    <div className="popup-footer">
                        <span>No spam, just great books!</span>
                    </div>
                </div>
            </div>
        </>
    );
}