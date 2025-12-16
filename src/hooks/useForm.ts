import { useState } from 'react';

// T es un tipo genérico, representa la forma del formulario 
// ValidationRules es una función que recibe el formulario y devuelve un objeto de errores
export const useForm = <T extends Object>(
  initialState: T,
  validationRules: (formData: T) => Partial<Record<keyof T, string>>
) => {
  
  // estado de formulario 
  const [formData, setFormData] = useState<T>(initialState);
  
  // estado de errores 
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  // logica para actualizar 
  const updateFormData = (field: keyof T, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  //La logica  validación 
  const validate = (): boolean => {
    const tempErrors = validationRules(formData);
    setErrors(tempErrors);
    
    return Object.keys(tempErrors).length === 0;
  };

  // Devolvemos a la pantallas
  return {
    formData,
    errors,
    updateFormData,
    validate,
    setFormData
  };
};