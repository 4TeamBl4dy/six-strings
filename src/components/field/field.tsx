import React, { useState, useEffect, forwardRef, ForwardedRef } from "react";
import InputMask from "react-input-mask";
import { DataField } from "./styles";
import { InputProps as MuiInputProps, InputLabelProps as MuiInputLabelProps } from "@mui/material";

interface InputProps {
  id?: string
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  type?: React.InputHTMLAttributes<unknown>["type"];
  mask?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  maxLength?: number;
  sx?: React.CSSProperties;
  InputProps?: MuiInputProps;
  InputLabelProps?: MuiInputLabelProps;
  fullWidth?: boolean
  onClick?: () => void
}

export const Field: React.FC<InputProps> = forwardRef(
  (
    {
      id,
      label = "",
      placeholder = "",
      value: externalValue,
      onChange = () => {},
      required = false,
      disabled = false,
      error = false,
      helperText = "",
      type: propType = "text",
      mask = "",
      inputRef,
      maxLength,
      sx,
      InputProps,
      InputLabelProps,
      fullWidth
    }: InputProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const [internalValue, setInternalValue] = useState(externalValue || "");

    useEffect(() => {
      if (externalValue !== undefined) setInternalValue(externalValue);
    }, [externalValue]);

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setInternalValue(value);
      onChange(value);
    };

    const inputType =
      typeof externalValue === "number" && propType === "text"
        ? "number"
        : propType;

    if (!mask) {
      return (
        <DataField
          fullWidth={fullWidth}
          placeholder={placeholder}
          value={internalValue}
          onChange={handleOnChange}
          required={required}
          disabled={disabled}
          error={error}
          helperText={helperText}
          type={inputType}
          inputRef={inputRef}
          inputProps={{ maxLength }}
          sx={sx}
          label={label}
          InputProps={InputProps}
          InputLabelProps={InputLabelProps}
        />
      );
    }

    return (
      <InputMask
          id={id}
        mask={mask}
        value={internalValue}
        disabled={disabled}
        onChange={handleOnChange}
        required={required}
        type={inputType}
      >
        {(inputProps: any) => (
          <DataField
            fullWidth
            {...inputProps}
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            helperText={helperText}
            ref={inputRef}
            inputProps={{ maxLength }}
            sx={sx}
            InputProps={InputProps}
            InputLabelProps={InputLabelProps}
          />
        )}
      </InputMask>
    );
  },
);