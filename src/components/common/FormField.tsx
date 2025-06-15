import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface FormFieldProps extends Omit<TextFieldProps, 'onChange'> {
  onChange: (value: string) => void;
}

const FormField: React.FC<FormFieldProps> = ({ onChange, ...props }) => {
  return (
    <TextField
      {...props}
      fullWidth
      onChange={(e) => onChange(e.target.value)}
      variant="outlined"
      className="mb-4"
    />
  );
};

export default FormField;