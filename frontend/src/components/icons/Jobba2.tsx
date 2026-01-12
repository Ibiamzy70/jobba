import React from 'react';

const JobbaLogoEmerald = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 80"
      className="h-12 w-auto"
    >
      <defs>
        <linearGradient id="premiumEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#047857', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="shineEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Icon */}
      <g>
        <rect
          x="10" y="20" width="40" height="40" rx="8"
          fill="url(#premiumEmerald)"
        />
        
        <rect
          x="-50" y="20" width="50" height="40"
          fill="url(#shineEmerald)"
          style={{ transform: 'skewX(-20deg)' }}
        >
          <animate
            attributeName="x"
            from="-50"
            to="180"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>
        
        <path 
          d="M 32 28 H 38 V 45 C 38 49 35.5 52 30 52 C 24.5 52 22 49 22 45 V 43 H 27 V 45 C 27 46.5 28 47 30 47 C 32 47 33 46.5 33 45 V 28 Z" 
          fill="white" 
        />
        
        <circle 
          cx="25" cy="31" r="2" 
          fill="white"
        >
          <animate
            attributeName="opacity"
            values="1;0.6;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
      
      {/* Text */}
      <text 
        x="65" y="48" 
        style={{
          fontFamily: "Inter, 'SF Pro Display', sans-serif",
          fontWeight: 900,
          fontSize: '32px',
          fill: '#ffffff',
          letterSpacing: '-1px'
        }}
      >
        Jobba
      </text>
      
      {/* PRO Chip */}
      <g transform="translate(185, 28)">
        <rect 
          x="0" y="0" width="50" height="24" rx="5" 
          fill="none" 
          stroke="#10b981" 
          strokeWidth="2"
        />
        
        <g stroke="#10b981" strokeWidth="2">
          <line x1="-3" y1="7" x2="0" y2="7">
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="-3" y1="17" x2="0" y2="17">
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="50" y1="7" x2="53" y2="7">
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="50" y1="17" x2="53" y2="17">
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </line>
        </g>
        
        <text 
          x="25" y="16" 
          textAnchor="middle"
          style={{
            fontFamily: "monospace",
            fontWeight: 800,
            fontSize: '10px',
            fill: '#10b981',
            letterSpacing: '1.5px'
          }}
        >
          PRO
        </text>
      </g>
    </svg>
  );
};

export default JobbaLogoEmerald;