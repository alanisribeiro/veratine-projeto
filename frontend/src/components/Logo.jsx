import React from 'react';
import '../styles/Logo.css';

export default function Logo({ variant = 'full', size = 'medium' }) {
  return (
    <div className={`logo-container logo-${variant} logo-${size}`}>
      {/* Logo Icon */}
      <svg
        className="logo-icon"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circle */}
        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1" opacity="0.3"/>

        {/* Center Flower */}
        <circle cx="32" cy="32" r="4" fill="currentColor"/>

        {/* Petal 1 - Top */}
        <ellipse cx="32" cy="16" rx="5" ry="8" fill="currentColor" opacity="0.9"/>

        {/* Petal 2 - Top Right */}
        <ellipse
          cx="41.6" cy="20.4" rx="5" ry="8"
          fill="currentColor" opacity="0.8"
          transform="rotate(60 41.6 20.4)"
        />

        {/* Petal 3 - Bottom Right */}
        <ellipse
          cx="41.6" cy="43.6" rx="5" ry="8"
          fill="currentColor" opacity="0.7"
          transform="rotate(120 41.6 43.6)"
        />

        {/* Petal 4 - Bottom */}
        <ellipse cx="32" cy="48" rx="5" ry="8" fill="currentColor" opacity="0.6"/>

        {/* Petal 5 - Bottom Left */}
        <ellipse
          cx="22.4" cy="43.6" rx="5" ry="8"
          fill="currentColor" opacity="0.7"
          transform="rotate(-120 22.4 43.6)"
        />

        {/* Petal 6 - Top Left */}
        <ellipse
          cx="22.4" cy="20.4" rx="5" ry="8"
          fill="currentColor" opacity="0.8"
          transform="rotate(-60 22.4 20.4)"
        />

        {/* Stem */}
        <path
          d="M 32 36 Q 30 42 28 50"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />

        {/* Leaf */}
        <ellipse
          cx="26" cy="44" rx="3" ry="6"
          fill="currentColor"
          opacity="0.4"
          transform="rotate(-30 26 44)"
        />
      </svg>

      {/* Text Logo */}
      {(variant === 'full' || variant === 'text') && (
        <div className="logo-text">
          <h1 className="logo-name">Veratine</h1>
          <span className="logo-tagline">Flores & Presentes</span>
        </div>
      )}
    </div>
  );
}
