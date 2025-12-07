import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import "./SpinWheel.css";

export default function SpinWheel({ userEmail }) {
    const email = userEmail;

    const [options, setOptions] = useState([]);            // ⬅ DYNAMIC LABELS
    const [reward, setReward] = useState(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [labelRadius, setLabelRadius] = useState(0);
    const [winnerIndex, setWinnerIndex] = useState(null);
    const wheelRef = useRef(null);

    // Weekend logic
    const [isWeekend, setIsWeekend] = useState(false);
    const [hasSpunThisWeekend, setHasSpunThisWeekend] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");

    // ------------ SAFE FETCH FUNCTION ------------
    const safeJSON = async (res) => {
        const text = await res.text();
        if (!text || text.trim() === "") return null;
        try {
            return JSON.parse(text);
        } catch {
            return null;
        }
    };

    // ------------ GET ADMIN OPTIONS ------------
    const loadOptions = async () => {
        try {
            const res = await fetch("https://localhost:5001/api/spin-options");
            const data = await safeJSON(res);

            if (Array.isArray(data)) {
                const active = data
                    .filter(o => o.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder);

                setOptions(active);
            }
        } catch (err) {
            console.error("Error loading spin options:", err);
        }
    };

    // ------------ Check server-side unused reward ------------
    const checkServerReward = async () => {
        try {
            const res = await fetch(
                `https://localhost:5001/api/spin/unused/${encodeURIComponent(email)}`
            );
            if (!res.ok) return null;
            return await safeJSON(res);
        } catch (err) {
            console.error("Error checking unused reward:", err);
            return null;
        }
    };

    // Detect weekend + load admin options
    useEffect(() => {
        loadOptions();

        const today = new Date().getDay();
        const weekend = today === 0 || today === 1;
        setIsWeekend(weekend);

        const stored = localStorage.getItem(`spinWeekendUsed_${email}`);
        if (stored === "yes") setHasSpunThisWeekend(true);

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        checkServerReward().then((serverReward) => {
            if (serverReward) {
                setHasSpunThisWeekend(true);
            }
        });

        return () => clearInterval(interval);
    }, [email]);

    // Timer
    const updateTimer = () => {
        const now = new Date();
        let nextSat = new Date();

        nextSat.setHours(0, 0, 0, 0);
        nextSat.setDate(nextSat.getDate() + ((6 - nextSat.getDay() + 7) % 7));

        const diff = nextSat - now;

        if (diff <= 0) {
            setTimeLeft("Available Now!");
            return;
        }

        const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
        const minutes = String(Math.floor((diff / 60000) % 60)).padStart(2, "0");
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

        setTimeLeft(`${hours}:${minutes}:${seconds}`);
    };

    // Compute label positions
    useEffect(() => {
        const computeRadius = () => {
            if (!wheelRef.current) return;
            const rect = wheelRef.current.getBoundingClientRect();
            const wheelSize = Math.min(rect.width, rect.height);
            const r = Math.round((wheelSize / 2) * 0.56);
            setLabelRadius(r);
        };
        computeRadius();
        window.addEventListener("resize", computeRadius);
        return () => window.removeEventListener("resize", computeRadius);
    }, []);

    // Map backend reward → index in options array
    const mapBackendRewardToIndex = (data) => {
        if (!data || !options.length) return -1;

        return options.findIndex(
            o =>
                o.rewardType.toLowerCase() === data.rewardType.toLowerCase() &&
                o.rewardValue.toLowerCase() === data.rewardValue.toLowerCase()
        );
    };

    // ============================
    // SPIN FUNCTION
    // ============================
    const handleSpin = async () => {
        if (isSpinning) return;

        if (!isWeekend) {
            alert("Spin & Win is available only on Saturday and Monday!");
            return;
        }

        if (hasSpunThisWeekend) {
            alert("You have already used your spin this weekend.");
            return;
        }

        if (options.length === 0) {
            alert("Spin wheel is not configured by admin.");
            return;
        }

        setReward(null);
        setWinnerIndex(null);
        setIsSpinning(true);

        let data = null;

        try {
            const res = await fetch(
                `https://localhost:5001/api/spin/spin/${encodeURIComponent(email)}`,
                { method: "POST" }
            );
            if (res.ok) data = await safeJSON(res);
        } catch (err) {
            console.error("Spin API error:", err);
        }

        let targetIndex = mapBackendRewardToIndex(data);

        if (targetIndex === -1) {
            targetIndex = Math.floor(Math.random() * options.length);
            data = {
                rewardType: options[targetIndex].rewardType,
                rewardValue: options[targetIndex].rewardValue
            };
        }

        const sliceAngle = 360 / options.length;
        const sliceCenter = sliceAngle / 2 + targetIndex * sliceAngle;

        const fullTurns = Math.floor(Math.random() * 3) + 3;
        const offset = Math.random() * 20 - 10;

        const finalRot = fullTurns * 360 + (360 - sliceCenter) + offset;

        if (wheelRef.current) {
            wheelRef.current.style.transition = "transform 0s";
            wheelRef.current.style.transform = "rotate(0deg)";

            requestAnimationFrame(() => {
                wheelRef.current.style.transition =
                    "transform 3s cubic-bezier(.22,.9,.25,1)";
                wheelRef.current.style.transform = `rotate(${finalRot}deg)`;
            });
        }

        const onEnd = () => {
            setWinnerIndex(targetIndex);
            setReward(data);

            localStorage.setItem(`spinWeekendUsed_${email}`, "yes");
            setHasSpunThisWeekend(true);

            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

            setIsSpinning(false);
            wheelRef.current.removeEventListener("transitionend", onEnd);
        };

        wheelRef.current.addEventListener("transitionend", onEnd);
    };

    const labelTransform = (i) => {
        const angle = (360 / options.length) * i + (360 / options.length) / 2;
        return `rotate(${angle}deg) translateY(-${labelRadius}px) rotate(${-angle}deg)`;
    };

    return (
        <div className="spin-container">
            <div className="wheel-wrapper">
                <div className={`top-pointer ${isSpinning ? "tick" : ""}`} />

                <div ref={wheelRef} className="wheel">
                    {options.map((opt, i) => (
                        <div
                            key={i}
                            className={`label ${winnerIndex === i ? "winner" : ""}`}
                            style={{
                                transform: labelTransform(i),
                                color: opt.color || "#000"
                            }}
                        >
                            {/* {opt.rewardType} - {opt.rewardValue} */}
                            {opt.rewardValue}
                        </div>
                    ))}
                </div>
            </div>

            {/* BUTTON LOGIC */}
            {isWeekend && hasSpunThisWeekend ? (
                <button className="disabled-button" disabled>
                    Already Used This Weekend
                </button>
            ) : !isWeekend ? (
                <button className="disabled-button" disabled>
                    Spin Opens This Weekend
                </button>
            ) : (
                <button className="spin-button" onClick={handleSpin} disabled={isSpinning}>
                    {isSpinning ? "Spinning..." : "Spin & Win 🎡"}
                </button>
            )}

            {(!isWeekend || hasSpunThisWeekend) && (
                <div className="timer-box">
                    <p>Next Spin Available In:</p>
                    <h2>{timeLeft}</h2>
                </div>
            )}

            {reward && (
                <div className="reward-modal">
                    <div className="reward-card">
                        <button
                            className="close-x"
                            onClick={() => {
                                setReward(null);
                                setWinnerIndex(null);
                            }}
                        >
                            ✕
                        </button>

                        <h2>Congratulations!</h2>
                        <p className="big-reward">
                            {reward.rewardType} : {reward.rewardValue}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}