import { useState } from 'react';

export const useMultiStepForm = <T,>(initialData: T, validateFns: Record<number, (data: T) => boolean>) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    const validateFn = validateFns[step];
    if (!validateFn) return true;
    return validateFn(formData);
  };

  const nextStep = (): boolean => {
    if (validateCurrentStep()) {
      setStep((prev) => prev + 1);
      return true;
    }
    return false;
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const resetForm = () => {
    setStep(1);
    setFormData(initialData);
    setErrors({});
  };

  const setError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  return {
    step,
    formData,
    errors,
    setFormData,
    handleChange,
    nextStep,
    prevStep,
    resetForm,
    setError,
  };
};
