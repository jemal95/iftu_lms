
import React from 'react';

interface SignatureProps {
  className?: string;
  color?: string;
}

export const Signature: React.FC<SignatureProps> = ({ className = "w-32 h-20", color = "#2563eb" }) => {
  return (
    <svg 
      viewBox="0 0 100 80" 
      className={className} 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top loop and vertical stroke */}
      <path d="M50 15 C35 15, 30 35, 50 35 C65 35, 70 15, 50 15 Z" />
      <path d="M50 15 L45 75" />
      
      {/* Middle scribbles/loops mimicking the photo */}
      <path d="M35 45 C40 40, 55 40, 60 45 C65 50, 45 55, 40 50 C35 45, 50 40, 65 42" />
      <path d="M42 55 C45 52, 60 52, 63 55 C66 58, 48 62, 45 58 C42 54, 55 52, 68 54" />
      
      {/* Right side loop/bracket */}
      <path d="M60 30 C75 30, 75 60, 65 70" />
      
      {/* Small tick mark */}
      <path d="M48 65 L55 62" />
    </svg>
  );
};
