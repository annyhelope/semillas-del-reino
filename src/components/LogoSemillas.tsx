import React from 'react';

interface LogoSemillasProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const LogoSemillas: React.FC<LogoSemillasProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const scale = size === 'sm' ? 'h-9' : size === 'lg' ? 'h-16' : 'h-12';
  
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`} id="logo-semillas-del-reino">
      {/* Visual Vector Brand Logo replicating the business emblem */}
      <svg
        viewBox="0 0 420 180"
        className={`${scale} w-auto drop-shadow-sm overflow-visible`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo Semillas del Reino"
      >
        <defs>
          <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#D81B60" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Arching Rainbow behind */}
        <g opacity="0.95">
          {/* Magenta / Pink */}
          <path
            d="M 10 135 A 85 85 0 0 1 155 40"
            stroke="#E91E63"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          {/* Orange */}
          <path
            d="M 18 135 A 77 77 0 0 1 148 48"
            stroke="#FF9800"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          {/* Yellow */}
          <path
            d="M 26 135 A 69 69 0 0 1 141 56"
            stroke="#FFEB3B"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          {/* Green */}
          <path
            d="M 33 135 A 62 62 0 0 1 135 64"
            stroke="#4CAF50"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Cyan / Light Blue */}
          <path
            d="M 40 135 A 55 55 0 0 1 129 72"
            stroke="#00BCD4"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Deep Purple */}
          <path
            d="M 47 135 A 48 48 0 0 1 123 80"
            stroke="#7C4DFF"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Fluffy cloud at rainbow base */}
        <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))">
          <ellipse cx="140" cy="88" rx="20" ry="14" fill="url(#cloudGrad)" />
          <ellipse cx="152" cy="85" rx="15" ry="12" fill="#FFFFFF" />
          <ellipse cx="132" cy="90" rx="14" ry="10" fill="#FFFFFF" />
        </g>

        {/* Text "Semillas" with bold bubbly styling & white outer contour */}
        <g filter="url(#textGlow)">
          {/* White outline backdrop */}
          <text
            x="75"
            y="108"
            fontFamily="'Fredoka', cursive, sans-serif"
            fontSize="72"
            fontWeight="700"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="10"
            strokeLinejoin="round"
            letterSpacing="-1.5"
          >
            Semillas
          </text>

          {/* Deep Magenta Fill */}
          <text
            x="75"
            y="108"
            fontFamily="'Fredoka', cursive, sans-serif"
            fontSize="72"
            fontWeight="700"
            fill="#E6007A"
            letterSpacing="-1.5"
          >
            Semillas
          </text>
        </g>

        {/* Subtitle "Del Reino" */}
        {showSubtitle && (
          <g>
            <text
              x="130"
              y="152"
              fontFamily="'Fredoka', cursive, sans-serif"
              fontSize="40"
              fontWeight="700"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinejoin="round"
              letterSpacing="1"
            >
              Del Reino
            </text>
            <text
              x="130"
              y="152"
              fontFamily="'Fredoka', cursive, sans-serif"
              fontSize="40"
              fontWeight="700"
              fill="#0891B2"
              letterSpacing="1"
            >
              Del Reino
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
