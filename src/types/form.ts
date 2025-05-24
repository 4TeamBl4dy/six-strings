import React from 'react'; // For React.CSSProperties

// Option type for select components
export interface Option {
  value: string;
  label: string;
}

// Props for CustomTextField component
export interface CustomTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: string;
  sx?: React.CSSProperties; // Using React.CSSProperties for sx props
  // Consider adding other common TextFieldProps like error, helperText if needed globally
}

// Props for CustomSelect component
export interface CustomSelectProps {
  label: string;
  value: string | string[]; // Can be single or multiple selection
  onChange: (value: string | string[]) => void;
  options: Option[];
  multiple?: boolean;
  fullWidth?: boolean;
  sx?: React.CSSProperties;
}

// Props for CustomFileInput component
export interface CustomFileInputProps {
  onChange: (file: File | null) => void;
  // Potentially add label, sx, fullWidth etc. if needed
}
