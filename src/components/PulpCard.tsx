'use client';

import { useMemo } from 'react';

// --- FIX: Add new optional props for border colors ---
interface PulpCardProps {
  href: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  width?: number;
  outerBorderColor?: string;
  innerBorderColor?: string;
  hoverOuterBorderColor?: string; // New!
  hoverInnerBorderColor?: string; // New!
}

export default function PulpCard({ 
  href, 
  imageUrl, 
  title, 
  subtitle, 
  width = 332,
  // Default colors are now sepia tones
  outerBorderColor = '#777777',
  innerBorderColor = '#999999',
  // Default hover colors
  hoverOuterBorderColor = '#1e3a8a',
  hoverInnerBorderColor = '#14b8a6'
}: PulpCardProps) {
  
  const aspectRatio = 382 / 332;
  const height = width * aspectRatio;
  const svgPathData = "M171.849487,0.62008667 C61.106486,0.62008667 4.25030518,22.9333954 1.28094482,67.5600128 L1.28094482,339.582947 L38.0202637,339.582947 L38.0202637,380.88269 L171.849487,380.88269 L288.591064,380.88269 L288.591064,339.582947 L330.2677,339.582947 L330.2677,67.5600128 C335.39856,22.9333954 282.592489,0.62008667 171.849487,0.62008667 Z";
  const strokePadding = 40; 
  const uniquePatternId = useMemo(() => `pattern-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
   <a 
      href={href} 
      className="group relative transition-transform duration-300 ease-in-out hover:scale-105 block"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        // We define our colors as CSS variables here
        '--outer-border-color': outerBorderColor,
        '--inner-border-color': innerBorderColor,
        '--hover-outer-border-color': hoverOuterBorderColor,
        '--hover-inner-border-color': hoverInnerBorderColor,
       } as React.CSSProperties}
    >
      
      <svg
        width="100%" 
        height="100%" 
        viewBox={`${-strokePadding} ${-strokePadding} ${332 + (strokePadding * 2)} ${382 + (strokePadding * 2)}`}
        className="drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300"
      >
        <defs>
          <pattern id={uniquePatternId} patternUnits="userSpaceOnUse" width={332} height={382}>
            <image href={imageUrl} x="0" y="0" width={332} height={382} preserveAspectRatio="xMidYMid slice" />
          </pattern>
        </defs>
        
       {/* Default State Borders */}
        <g className="opacity-100 group-hover:opacity-0 transition-opacity duration-500">
            <path d={svgPathData} stroke="var(--outer-border-color)" strokeWidth="50" fill="none" />
            <path d={svgPathData} stroke="var(--inner-border-color)" strokeWidth="35" fill="none" />
        </g>

        {/* Hover State Borders (Invisible by default) */}
        <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <path d={svgPathData} stroke="var(--hover-outer-border-color)" strokeWidth="50" fill="none" />
             <path d={svgPathData} stroke="var(--hover-inner-border-color)" strokeWidth="35" fill="none" />
        </g>
        
        <path d={svgPathData} fill={`url(#${uniquePatternId})`} className="grayscale group-hover:grayscale-0 transition-all duration-500" />
        
        <text
          x="40%" y="80%"
          dominantBaseline="text-bottom" textAnchor="middle"
          className="text-6xl font-bold text-stone-100 fill-current drop-shadow-md opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 ease-in-out select-none"
          style={{ fontFamily: 'Mythshire' }}
        >
          {title}
        </text>
      </svg>

           
      
      <p className="text-1xl w-full text-center text-gray-900 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
      style={{ fontFamily: 'Georgia' }}>
        {subtitle}
      </p>
    </a>
  );
}