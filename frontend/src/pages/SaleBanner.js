import React, { useEffect, useState } from 'react';
import './SaleBanner.css';

export default function SaleBanner() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await fetch('/api/saleevent/active');
        if (res.ok) {
          const data = await res.json();
          setSales(data); 
        }
      } catch (err) {
        console.error('Error fetching sale:', err);
      }
    };

    fetchSale();
  }, []);

  if (!sales || sales.length === 0) return null;

  return (
    <div className="sale-banner-container">
      {sales.map((sale) => (
        <div className="sale-banner" key={sale.id}>
          <h2>{sale.title || 'Limited Time Offer'} 🎉</h2>
          <p><strong>Discount:</strong> {sale.discountPercentage}% off</p>
          <p>
            <strong>Valid:</strong> {new Date(sale.startDate).toLocaleDateString('en-GB')} — {new Date(sale.endDate).toLocaleDateString('en-GB')}
          </p>
        </div>
      ))}
    </div>
  );
}