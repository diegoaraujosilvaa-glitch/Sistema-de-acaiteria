
import React from 'react';

interface LogoProps {
  className?: string;
  crossOrigin?: "anonymous" | "use-credentials" | "";
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", crossOrigin, style }) => {
  return (
    <img 
      src="https://i.postimg.cc/PLWxXG2n/Design-sem-nome.png" 
      alt="Logo Quero Mais Açaí" 
      className={`${className} object-cover`}
      crossOrigin={crossOrigin}
      style={style}
    />
  );
};
