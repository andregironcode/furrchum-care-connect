import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Phone } from 'lucide-react';

interface PhoneInputProps<T extends FieldValues = FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  name: Path<T>;
  control: Control<T>;
  error?: string;
}

export function PhoneInput<T extends FieldValues = FieldValues>({
  label,
  description,
  name,
  control,
  error,
  className,
  ...props
}: PhoneInputProps<T>) {
  const [focused, setFocused] = useState(false);

  // Format the phone number for display (e.g., (123) 456-7890)
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Enforce maximum 10 digits
    const trimmed = digits.slice(0, 10);
    
    // Format the phone number
    if (trimmed.length === 0) {
      return '';
    } else if (trimmed.length <= 3) {
      return `(${trimmed}`;
    } else if (trimmed.length <= 6) {
      return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
    } else {
      return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6, 10)}`;
    }
  };
  
  // Strips formatting for the actual value stored
  const unformatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, '');
  };
  
  // Validates phone number
  const isValidPhoneNumber = (value: string) => {
    const digits = unformatPhoneNumber(value);
    return digits.length === 10;
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Phone size={16} />
              </div>
              <Input
                {...props}
                value={focused ? field.value || '' : formatPhoneNumber(field.value || '')}
                onChange={(e) => {
                  // When user types, format the phone number
                  const rawValue = unformatPhoneNumber(e.target.value);
                  const formattedValue = formatPhoneNumber(rawValue);
                  
                  // Store the raw digits in the form state
                  field.onChange(formattedValue);
                }}
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                  setFocused(false);
                  field.onBlur();
                  
                  // Validate on blur
                  if (field.value && !isValidPhoneNumber(field.value)) {
                    // This will be caught by the form validation
                  }
                }}
                maxLength={14} // Formatted length (XXX) XXX-XXXX
                inputMode="tel"
                type="tel"
                className={`${className} pl-10`}
                placeholder={props.placeholder || "(555) 123-4567"}
                aria-invalid={!!fieldState.error}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {(fieldState.error || error) && (
            <FormMessage>{fieldState.error?.message || error}</FormMessage>
          )}
        </FormItem>
      )}
    />
  );
}

export default PhoneInput;
