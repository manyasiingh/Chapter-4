import React, { useEffect, useState } from "react";
import "./razorpay-fake.css";

export default function RazorpayFakeModal({
  amount,
  method,
  orderId,
  onClose,
  onSuccess
}) {
  const [view, setView] = useState(method === "UPI" ? "upi" : "card");
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });

  useEffect(() => {
    setView(method === "UPI" ? "upi" : "card");
  }, [method]);

  const startProcessing = () => {
    setProcessing(true);

    const pid = "pay_" + Math.random().toString(36).substr(2, 10).toUpperCase();

    setTimeout(() => {
      setProcessing(false);
      // ✅ Pass both paymentId and orderId back
      onSuccess({
        paymentId: pid,
        orderId: orderId
      });
    }, 1200);
  };

  const onCardPay = (e) => {
    e.preventDefault();
    if (card.number.replace(/\s/g, "").length < 12) return alert("Invalid card number");
    if (!card.cvv || card.cvv.length < 3) return alert("Invalid CVV");
    startProcessing();
  };

  const onUpiPay = () => {
    startProcessing();
  };

  return (
    <div className="rf-overlay">
      <div className="rf-modal">
        <header className="rf-header">
          <div className="rf-merchant">
            <div className="rf-logo">📚</div>
            <div>
              <div className="rf-merchant-name">My Book Store</div>
              <div className="rf-merchant-sub">Secured by Razorpay (mock)</div>
            </div>
          </div>
          <button className="rf-close" onClick={onClose}>✕</button>
        </header>

        <div className="rf-amount">
          <div className="rf-amount-left">
            <div className="rf-amount-label">Pay</div>
            <div className="rf-amount-value">₹{Number(amount).toFixed(2)}</div>
          </div>

          {/* Order ID Display */}
          <div className="rf-order-id">
            Order ID: <span className="rf-order-id-val">{orderId}</span>
          </div>
        </div>

        <nav className="rf-tabs">
          <button className={`rf-tab ${view === "upi" ? "active" : ""}`} onClick={() => setView("upi")}>UPI</button>
          <button className={`rf-tab ${view === "card" ? "active" : ""}`} onClick={() => setView("card")}>Card</button>
        </nav>

        <div className="rf-body">
          {processing ? (
            <div className="rf-processing">
              <div className="rf-spinner" />
              <div className="rf-processing-text">Processing payment…</div>
            </div>
          ) : (
            <>
              {view === "upi" && (
                <div className="rf-upi">
                  <div className="rf-upi-section">
                    <div className="rf-upi-left">
                      <div className="rf-qr-wrap">
                        <img
                          alt="qr"
                          className="rf-qr"
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=test@upi&pn=BookStore&am=${amount}`}
                        />
                      </div>
                    </div>
                    <div className="rf-upi-right">
                      <h4>Pay using UPI</h4>
                      <p>Scan with any UPI app and click confirm:</p>
                      <button className="rf-pay-btn" onClick={onUpiPay}>I have paid</button>
                    </div>
                  </div>
                </div>
              )}

              {view === "card" && (
                <form className="rf-card-form" onSubmit={onCardPay}>
                  <div className="rf-field">
                    <label>Card Number</label>
                    <input
                      placeholder="4111 1111 1111 1111"
                      value={card.number}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                        const spaced = raw.replace(/(.{4})/g, "$1 ").trim();
                        setCard({ ...card, number: spaced });
                      }}
                    />
                  </div>

                  <div className="rf-row">
                    <div className="rf-field small">
                      <label>Expiry</label>
                      <input 
                        placeholder="MM/YY"
                        value={card.expiry} 
                        onChange={(e) => setCard({ ...card, expiry: e.target.value })} 
                      />
                    </div>

                    <div className="rf-field small">
                      <label>CVV</label>
                      <input
                        type="password"
                        maxLength="4"
                        placeholder="123"
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      />
                    </div>
                  </div>

                  <div className="rf-field">
                    <label>Name on card</label>
                    <input 
                      placeholder="FirstName LastName" 
                      value={card.name} 
                      onChange={(e) => setCard({ ...card, name: e.target.value })} 
                    />
                  </div>

                  <button type="submit" className="rf-pay-btn">Pay ₹{amount}</button>
                </form>
              )}
            </>
          )}
        </div>

        {!processing && (
          <footer className="rf-footer">
            <div>Secure • Mock Checkout</div>
          </footer>
        )}
      </div>
    </div>
  );
}