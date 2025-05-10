import { styled } from '@mui/material/styles';
import { TextField, Select, MenuItem, SelectChangeEvent, InputBase } from '@mui/material';
import { ChangeEvent, ReactNode } from 'react';
import { theme } from 'src/theme';

// Стили для текстового поля
export const CustomTextFieldStyled = styled(TextField)({
  '& .MuiInputLabel-root': {
    fontSize: '14px',
    color: theme.palette.grey[500],
  },
  '& .MuiInputBase-input': {
    color: 'black !important',
    padding: '12px',
    fontSize: '14px',
  },
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '16px',
    width: '100%',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 0,
  },
});

// Стили для выпадающего списка
export const CustomSelectStyled = styled(Select)({
  fontSize: '14px',
  backgroundColor: theme.palette.secondary.main,
  borderRadius: '16px',
  '& .MuiSelect-select': {
    padding: '12px',
    color: 'black !important',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 0,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: 0,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 0,
  },
});

// Стили для поля выбора файла
export const CustomFileInputStyled = styled(InputBase)({
  backgroundColor: theme.palette.secondary.main,
  borderRadius: '16px',
  padding: '12px',
  fontSize: '14px',
  color: 'black !important',
  '& input': {
    cursor: 'pointer',
    opacity: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  '& .MuiInputBase-input': {
    cursor: 'pointer',
  },
});

interface CustomTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: string;
}

export const CustomTextField: React.FC<CustomTextFieldProps> = ({
  label,
  value,
  onChange,
  fullWidth = true,
  multiline = false,
  rows,
  type,
}) => {
  return (
    <CustomTextFieldStyled
      label={label}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      fullWidth={fullWidth}
      multiline={multiline}
      rows={rows}
      type={type}
      size="small"
    />
  );
};

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: Option[];
  multiple?: boolean;
  fullWidth?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  multiple = false,
  fullWidth = true,
}) => {
  const handleChange = (event: SelectChangeEvent<unknown>, child: ReactNode) => {
    const newValue = event.target.value as string | string[];
    onChange(newValue);
  };

  return (
    <CustomSelectStyled
      value={value}
      onChange={handleChange}
      displayEmpty
      multiple={multiple}
      fullWidth={fullWidth}
      size="small"
      renderValue={(selected: unknown): ReactNode => {
        const selectedValue = selected as string | string[];
        if (!selectedValue || (Array.isArray(selectedValue) && selectedValue.length === 0)) {
          return <em style={{ color: theme.palette.grey[500], fontSize: '14px' }}>{label}</em>;
        }
        if (Array.isArray(selectedValue)) {
          return selectedValue
            .map((val) => options.find((opt) => opt.value === val)?.label || val)
            .join(', ');
        }
        return options.find((opt) => opt.value === selectedValue)?.label || selectedValue;
      }}
    >
      {!multiple && <MenuItem value="" disabled><em>{label}</em></MenuItem>}
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </CustomSelectStyled>
  );
};

interface CustomFileInputProps {
  onChange: (file: File | null) => void;
}

export const CustomFileInput: React.FC<CustomFileInputProps> = ({ onChange }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <CustomFileInputStyled
      readOnly
      startAdornment={<span style={{ color: 'black', fontSize: '14px' }}>Выберите файл</span>}
      inputProps={{ type: 'file', accept: 'image/*' }}
      onChange={handleChange}
    />
  );
};