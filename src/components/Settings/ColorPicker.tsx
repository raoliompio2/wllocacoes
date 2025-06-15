import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover } from '@mui/material';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="flex items-center space-x-3">
      <div
        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 shadow-sm hover:shadow-md transition-shadow"
        style={{ backgroundColor: color }}
        onClick={handleClick}
        role="button"
        aria-label={`Escolher cor para ${label}`}
      />
      <span className="text-sm font-medium">{label}</span>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            borderRadius: '0.5rem',
            padding: '1rem',
          },
        }}
      >
        <div className="p-2">
          <HexColorPicker color={color} onChange={onChange} />
          <div className="mt-2 text-center">
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default ColorPicker;