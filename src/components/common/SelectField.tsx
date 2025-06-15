import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectProps,
  Button,
} from '@mui/material';
import { Plus } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<SelectProps, 'onChange'> {
  options: Option[];
  label: string;
  onChange: (value: string) => void;
  onAddNew?: () => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
  options,
  label,
  onChange,
  onAddNew,
  value,
  ...props
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={label}
          onChange={(e) => onChange(e.target.value as string)}
          {...props}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {onAddNew && (
        <Button
          onClick={onAddNew}
          variant="outlined"
          className="min-w-[48px] h-[56px]"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default SelectField;