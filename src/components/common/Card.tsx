import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  const { themePreferences } = useTheme();

  return (
    <div
      className={`
        bg-surface
        shadow-md
        ${hoverable ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      style={{
        borderRadius: `${themePreferences.borderRadius}px`,
      }}
    >
      {children}
    </div>
  );
};

export default Card;