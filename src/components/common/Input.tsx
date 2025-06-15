import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  const { themePreferences } = useTheme();
  const colors = themePreferences.mode === 'light' ? themePreferences.lightColors : themePreferences.darkColors;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full
            px-3 py-2
            bg-surface
            border border-gray-300
            text-text
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          style={{
            borderRadius: `${themePreferences.borderRadius}px`,
          }}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;