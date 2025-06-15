import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

interface PriceFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
}

const PriceField: React.FC<PriceFieldProps> = ({
  value,
  onChange,
  label,
  required = false,
}) => {
  return (
    <TextField
      label={label}
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      required={required}
      InputProps={{
        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
      }}
      className="mb-4"
    />
  );
};

export default PriceField;