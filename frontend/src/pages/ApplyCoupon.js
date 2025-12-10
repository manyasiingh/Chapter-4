// import React, { useState } from 'react';
// import './ApplyCoupon.css';

// export default function ApplyCoupon({ onApply, totalAmount }) {
//     const [code, setCode] = useState('');
//     const [message, setMessage] = useState('');
//     const [discount, setDiscount] = useState(0);

//     const applyCoupon = async () => {
//         const email = localStorage.getItem('email');
//         if (!code.trim()) {
//             setMessage('Please enter a coupon code.');
//             return;
//         }

//         try {
//             const res = await fetch(`/api/coupons/apply?code=${code.trim()}&totalAmount=${totalAmount}&email=${email}`);
//             const text = await res.text();

//             let data;
//             try {
//                 data = JSON.parse(text);
//             } catch (parseErr) {
//                 setMessage(`${text}`);
//                 setDiscount(0);
//                 onApply(0);
//                 return;
//             }

//             if (!res.ok) {
//                 setMessage(`${data}`);
//                 setDiscount(0);
//                 onApply(0);
//                 return;
//             }

//             if (data.discountAmount === 0 && data.message) {
//                 setMessage(`${data.message}`);
//                 setDiscount(0);
//                 onApply(0);
//             } else {
//                 setDiscount(data.discountAmount);
//                 setMessage(`Coupon applied! ₹${data.discountAmount} off`);
//                 onApply(data.discountAmount);
//             }
//         } catch (err) {
//             console.error('Coupon apply error:', err);
//             setMessage('Error applying coupon. Please try again.');
//             setDiscount(0);
//             onApply(0);
//         }
//     };

//     return (
//         <div className="apply-coupon">
//             <h4>Apply Coupon / Promo Code</h4>
//             <input
//                 type="text"
//                 value={code}
//                 onChange={(e) => setCode(e.target.value)}
//                 placeholder="Enter promo code"
//             />
//             <button onClick={applyCoupon}>Apply</button>
//             {message && (
//                 <p style={{ marginTop: '10px', color: message.startsWith('✅') ? 'green' : 'red' }}>
//                     {message}
//                 </p>
//             )}
//         </div>
//     );
// }