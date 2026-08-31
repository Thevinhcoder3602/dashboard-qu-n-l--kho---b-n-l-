import React, { useRef, useLayoutEffect } from 'react';
import { formatNumberWithDots, parseNumberFromDots } from '../utils/formatters';

interface PriceInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | undefined | null;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '0',
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number | null>(null);

  const displayValue =
    value === 0 || value === undefined || value === null ? '' : formatNumberWithDots(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawVal = input.value;
    const currentCursor = input.selectionStart || 0;

    // Count how many digits existed before the cursor position in raw text
    const textBeforeCursor = rawVal.slice(0, currentCursor);
    const digitsBeforeCursor = textBeforeCursor.replace(/\D/g, '').length;

    const numericValue = parseNumberFromDots(rawVal);
    const formatted = numericValue === 0 ? '' : formatNumberWithDots(numericValue);

    // Calculate new cursor position in the formatted string
    let newCursor = 0;
    let digitCount = 0;

    for (let i = 0; i < formatted.length; i++) {
      if (digitCount === digitsBeforeCursor) {
        break;
      }
      if (/\d/.test(formatted[i])) {
        digitCount++;
      }
      newCursor = i + 1;
    }

    cursorRef.current = newCursor;
    onChange(numericValue);
  };

  useLayoutEffect(() => {
    if (inputRef.current && cursorRef.current !== null) {
      const targetPos = Math.min(cursorRef.current, inputRef.current.value.length);
      inputRef.current.setSelectionRange(targetPos, targetPos);
      cursorRef.current = null;
    }
  }, [displayValue]);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
};
