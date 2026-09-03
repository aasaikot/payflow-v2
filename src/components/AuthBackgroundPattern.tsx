import React from 'react';

interface AuthBackgroundPatternProps {
  variant?: 'fullscreen' | 'modal';
  className?: string;
}

export const AuthBackgroundPattern: React.FC<AuthBackgroundPatternProps> = ({
  variant = 'fullscreen',
  className = '',
}) => {
  if (variant === 'modal') {
    return (
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
        aria-hidden="true"
      >
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#008F5B]/15 dark:bg-[#008F5B]/25 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#10E594]/12 dark:bg-[#10E594]/15 rounded-full blur-2xl" />

        <svg
          className="absolute inset-0 w-full h-full opacity-40 dark:opacity-30"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <defs>
            {/* Dot Grid Pattern */}
            <pattern
              id="modal-dot-grid"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="0.85"
                className="fill-[#008F5B]/30 dark:fill-[#10E594]/30"
              />
            </pattern>
            {/* Linear Gradient for Waves */}
            <linearGradient id="modal-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#008F5B" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#10E594" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#008F5B" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Dot Grid Fill */}
          <rect width="100%" height="100%" fill="url(#modal-dot-grid)" />

          {/* Abstract Security & Flow Curves */}
          <path
            d="M-20,60 C80,30 140,110 240,70 C320,35 380,95 440,50"
            stroke="url(#modal-wave-grad)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <path
            d="M-10,240 C100,200 180,290 290,230 C370,185 410,260 460,210"
            stroke="url(#modal-wave-grad)"
            strokeWidth="1"
            opacity="0.7"
          />

          {/* Micro Data Nodes */}
          <circle cx="85%" cy="25%" r="2.5" className="fill-[#008F5B] dark:fill-[#10E594]" opacity="0.6" />
          <circle cx="15%" cy="75%" r="2" className="fill-[#10E594]" opacity="0.7" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Atmospheric Ambient Glow Orbs */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-[#008F5B]/15 dark:bg-[#008F5B]/22 rounded-full blur-3xl transition-opacity duration-700" />
      <div className="absolute top-1/3 -right-24 w-88 h-88 bg-[#10E594]/12 dark:bg-[#10E594]/15 rounded-full blur-3xl transition-opacity duration-700" />
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-[#008F5B]/12 dark:bg-[#008F5B]/18 rounded-full blur-3xl transition-opacity duration-700" />

      {/* 2. Precision Graphical SVG Layer */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          {/* Micro Dot Matrix Grid */}
          <pattern
            id="auth-micro-dots"
            x="0"
            y="0"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="2"
              cy="2"
              r="0.8"
              className="fill-[#008F5B]/25 dark:fill-[#10E594]/30"
            />
          </pattern>

          {/* Diagonal Isometric Cross Hatch Pattern */}
          <pattern
            id="auth-grid-lines"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 56 0 L 0 0 0 56"
              fill="none"
              stroke="#008F5B"
              strokeWidth="0.5"
              className="stroke-[#008F5B]/10 dark:stroke-[#10E594]/15"
              strokeDasharray="2 4"
            />
          </pattern>

          {/* Gradients for Flow Curves */}
          <linearGradient id="auth-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#008F5B" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#10E594" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#007A4D" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="auth-grad-secondary" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10E594" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#008F5B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#008F5B" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* 2a. Background Dot Matrix Base */}
        <rect width="100%" height="100%" fill="url(#auth-micro-dots)" />

        {/* 2b. Structural Grid Lines */}
        <rect width="100%" height="100%" fill="url(#auth-grid-lines)" opacity="0.6" />

        {/* 2c. Architectural Alignment Guide Lines */}
        <line x1="0" y1="18%" x2="100%" y2="18%" className="stroke-[#008F5B]/15 dark:stroke-[#10E594]/20" strokeWidth="0.75" strokeDasharray="6 8" />
        <line x1="0" y1="52%" x2="100%" y2="52%" className="stroke-[#008F5B]/12 dark:stroke-[#10E594]/15" strokeWidth="0.75" strokeDasharray="6 8" />
        <line x1="0" y1="84%" x2="100%" y2="84%" className="stroke-[#008F5B]/15 dark:stroke-[#10E594]/20" strokeWidth="0.75" strokeDasharray="6 8" />
        
        <line x1="16%" y1="0" x2="16%" y2="100%" className="stroke-[#008F5B]/12 dark:stroke-[#10E594]/15" strokeWidth="0.75" strokeDasharray="6 8" />
        <line x1="84%" y1="0" x2="84%" y2="100%" className="stroke-[#008F5B]/12 dark:stroke-[#10E594]/15" strokeWidth="0.75" strokeDasharray="6 8" />

        {/* 2d. Precision Coordinate Markers (+) */}
        <g className="stroke-[#008F5B]/35 dark:stroke-[#10E594]/40" strokeWidth="1">
          {/* Top Left Marker */}
          <line x1="16%" y1="18%" x2="16%" y2="18%" />
          <path d="M 16% 18% m -5 0 l 10 0 m -5 -5 l 0 10" />
          {/* Top Right Marker */}
          <path d="M 84% 18% m -5 0 l 10 0 m -5 -5 l 0 10" />
          {/* Bottom Left Marker */}
          <path d="M 16% 84% m -5 0 l 10 0 m -5 -5 l 0 10" />
          {/* Bottom Right Marker */}
          <path d="M 84% 84% m -5 0 l 10 0 m -5 -5 l 0 10" />
        </g>

        {/* 2e. Harmonic Flow Curves (Fintech & Salary Growth Trajectories) */}
        <path
          d="M-40,140 C120,80 260,220 440,130 C600,50 720,180 880,110 C1020,50 1180,160 1340,90"
          stroke="url(#auth-grad-primary)"
          strokeWidth="1.6"
          strokeDasharray="4 4"
        />
        <path
          d="M-50,340 C140,280 280,420 480,310 C640,220 780,370 960,280 C1100,210 1240,330 1400,240"
          stroke="url(#auth-grad-secondary)"
          strokeWidth="1.4"
          strokeDasharray="3 5"
        />
        <path
          d="M-30,580 C150,510 320,660 520,560 C700,470 850,610 1040,520 C1200,440 1320,560 1450,480"
          stroke="url(#auth-grad-primary)"
          strokeWidth="1.2"
          opacity="0.8"
        />

        {/* 2f. Delicate Geometric Data Nodes */}
        <g>
          {/* Node 1 */}
          <circle cx="28%" cy="16%" r="3.5" className="fill-[#008F5B] dark:fill-[#10E594]" opacity="0.6" />
          <circle cx="28%" cy="16%" r="7" className="stroke-[#008F5B]/30 dark:stroke-[#10E594]/40" strokeWidth="1" fill="none" />
          
          {/* Node 2 */}
          <circle cx="72%" cy="32%" r="3" className="fill-[#10E594]" opacity="0.7" />
          <circle cx="72%" cy="32%" r="6" className="stroke-[#10E594]/30" strokeWidth="1" fill="none" />

          {/* Node 3 */}
          <circle cx="20%" cy="68%" r="3" className="fill-[#008F5B] dark:fill-[#10E594]" opacity="0.5" />
          <circle cx="82%" cy="76%" r="3.5" className="fill-[#10E594]" opacity="0.6" />
          <circle cx="82%" cy="76%" r="8" className="stroke-[#10E594]/25" strokeWidth="1" fill="none" />
        </g>
      </svg>
    </div>
  );
};
