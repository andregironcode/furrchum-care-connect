import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { MapPin, Check, AlertCircle } from 'lucide-react';

interface PinCodeInputProps<T extends FieldValues = FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  name: Path<T>;
  control: Control<T>;
  error?: string;
}

function PinCodeInput<T extends FieldValues = FieldValues>({
  label = "PIN Code",
  description,
  name,
  control,
  error,
  className,
  ...props
}: PinCodeInputProps<T>) {
  // Format and validation functions
  const formatPinCode = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Enforce exactly 6 digits for Indian PIN codes
    return digits.slice(0, 6);
  };
  
  const isValidPinCode = (pin: string) => {
    // Basic validation: must be exactly 6 digits
    return /^\d{6}$/.test(pin);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Determine validation state based on field value and dirty state
        const hasValue = !!field.value;
        const isDirty = fieldState.isDirty;
        
        let validState = false;
        let invalidState = false;
        
        if (hasValue && isDirty) {
          validState = isValidPinCode(field.value);
          invalidState = !validState && field.value.length > 0;
        }
        
        return (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <MapPin size={16} />
                </div>
                {validState && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                    <Check size={16} />
                  </div>
                )}
                {invalidState && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                    <AlertCircle size={16} />
                  </div>
                )}
                <Input
                  {...props}
                  value={field.value || ''}
                  onChange={(e) => {
                    const formattedValue = formatPinCode(e.target.value);
                    field.onChange(formattedValue);
                  }}
                  onBlur={field.onBlur}
                  maxLength={6}
                  inputMode="numeric"
                  className={`${className || ''} pl-10 ${validState ? 'pr-10 border-green-500 focus:border-green-500' : ''} ${invalidState ? 'pr-10 border-red-500 focus:border-red-500' : ''}`}
                  placeholder={props.placeholder || "Enter 6-digit PIN code"}
                  aria-invalid={invalidState}
                />
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {(fieldState.error || error) && (
              <FormMessage>{fieldState.error?.message || error}</FormMessage>
            )}
          </FormItem>
        );
      }}
    />
  );
}

export default PinCodeInput;
