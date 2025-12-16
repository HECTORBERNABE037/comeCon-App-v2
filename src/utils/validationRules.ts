import { ForgotPasswordFormData, LoginFormData, RegisterFormData, ResetCodeFormData, 
  SetNewPasswordFormData,
  ProductFormData,
  PromotionFormData,
  OrderFormData,
  CardFormData
} from '../../types';

// Reglas para el Login
export const validateLogin = (formData: LoginFormData) => {
    let tempErrors: { email?: string, password?: string } = {};

    if (!formData.email.trim()) {
        tempErrors.email = "El correo es requerido.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        tempErrors.email = "El formato del correo no es válido.";
    }

    if (!formData.password.trim()) {
        tempErrors.password = "La contraseña es requerida.";
    }else if(formData.password.length<8){
        tempErrors.password = "La contraseña requiere minimo 8 caracteres.";
    }else if(!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)){
        tempErrors.password = "La contraseña debe tener al menos una letra y un numero"
    }
    return tempErrors;
};

// Reglas para el Registro
export const validateRegister = (formData: RegisterFormData) => {
    let tempErrors: { name?:string ,email?: string, phone?: string, password?: string, confirmPassword?: string } = {};

    if (!formData.name.trim()) {
        tempErrors.name = "El nombre es requerido.";
    } else if (formData.name.length < 5) {
        tempErrors.name = "Ingresa un nombre valido.";
    }

    if (!formData.email.trim()) {
        tempErrors.email = "El correo es requerido.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        tempErrors.email = "El formato del correo no es válido.";
    }

    if (!formData.phone.trim()) {
        tempErrors.phone = "El teléfono es requerido.";
    } else if (formData.phone.length !== 10) {
        tempErrors.phone = "El teléfono debe tener 10 dígitos.";
    }

    if (!formData.password.trim()) {
        tempErrors.password = "La contraseña es requerida.";
    } else if (formData.password.length < 8) {
        tempErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }else if(!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)){
        tempErrors.password = "La contraseña debe tener al menos una letra y un numero"
    }
    if (!formData.confirmPassword.trim()) {
        tempErrors.confirmPassword = "Por favor, confirma la contraseña.";
    } else if (formData.password !== formData.confirmPassword) {
        tempErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    return tempErrors;
};

//reglas para recuperar contrasena
export const validateForgotPassword = (formData: ForgotPasswordFormData) => {
  let tempErrors: { emailOrPhone?: string } = {};

  if (!formData.emailOrPhone.trim()) {
    tempErrors.emailOrPhone = "El campo es requerido.";
  } else {
    const isValidEmail = /\S+@\S+\.\S+/.test(formData.emailOrPhone);
    const isValidPhone = /^\d{10,15}$/.test(formData.emailOrPhone.replace(/\D/g, ""));

    if (!isValidEmail && !isValidPhone) {
      tempErrors.emailOrPhone = "Ingresa un correo o teléfono válido.";
    }
  }

  return tempErrors;
};

// Reglas para el C0digo de Reseteo
export const validateResetCode = (formData: ResetCodeFormData) => {
  let tempErrors: { code?: string } = {}; 
  // Validamos que exista y tenga longitud exacta de 4
  if (!formData.code.trim()) {
    tempErrors.code = "El código es requerido.";
  } else if (formData.code.length !== 4) {
    tempErrors.code = "El código debe tener 4 dígitos.";
  }

  return tempErrors;
};


// Reglas para Establecer Nueva Contraseña
export const validateSetNewPassword = (formData: SetNewPasswordFormData) => {
  let tempErrors: { newPassword?: string, confirmPassword?: string } = {};

  if (!formData.newPassword.trim()) {
    tempErrors.newPassword = "La contraseña es requerida.";
  } else if (formData.newPassword.length < 8) {
    tempErrors.newPassword = "La contraseña debe tener al menos 8 caracteres.";
  } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.newPassword)) { 
    tempErrors.newPassword = "Debe tener al menos una letra y un número.";
  }

  if (!formData.confirmPassword.trim()) {
    tempErrors.confirmPassword = "Por favor, confirma la contraseña.";
  } else if (formData.newPassword !== formData.confirmPassword) {
    tempErrors.confirmPassword = "Las contraseñas no coinciden.";
  }

  return tempErrors;
};

//formulario de edicion para el platillo
export const validateProductForm = (formData: ProductFormData) => {
  let tempErrors: Partial<Record<keyof ProductFormData, string>> = {};

  if (!formData.title.trim()) {
    tempErrors.title = "El nombre del producto es requerido.";
  }
  if (!formData.subtitle.trim()) {
    tempErrors.subtitle = "El subtítulo es requerido.";
  }
  if (!formData.price.trim()) {
    tempErrors.price = "El precio es requerido.";
  } else if (isNaN(Number(formData.price))) {
    tempErrors.price = "El precio debe ser un número válido.";
  }
  if (formData.description.length > 100) {
    tempErrors.description = "La descripción no puede exceder los 100 caracteres.";
  }

  return tempErrors;
};

//Modal de promocion en HomeAdmin
export const validatePromotionForm = (formData: PromotionFormData, currentPrice: number) => {
  let tempErrors: Partial<Record<keyof PromotionFormData, string>> = {};

  // 1. Validar Precio Promocional
  if (!formData.promotionalPrice.trim()) {
    tempErrors.promotionalPrice = "El precio promocional es requerido.";
  } else if (isNaN(Number(formData.promotionalPrice))) {
    tempErrors.promotionalPrice = "Debe ser un número válido.";
  } else if (Number(formData.promotionalPrice) >= currentPrice) {
    tempErrors.promotionalPrice = "La oferta debe ser menor al precio normal.";
  }

  // 2. Validar Fechas (Formato simple YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!formData.startDate.trim()) {
    tempErrors.startDate = "Fecha de inicio requerida.";
  } else if (!dateRegex.test(formData.startDate)) {
    tempErrors.startDate = "Formato inválido (YYYY-MM-DD).";
  }

  if (!formData.endDate.trim()) {
    tempErrors.endDate = "Fecha fin requerida.";
  } else if (!dateRegex.test(formData.endDate)) {
    tempErrors.endDate = "Formato inválido (YYYY-MM-DD).";
  }

  return tempErrors;
};

//Validacion para modal de ordenes recibidas (En proceso)
export const validateOrderForm = (formData: OrderFormData) => {
  let tempErrors: Partial<Record<keyof OrderFormData, string>> = {};

  if (!formData.status.trim()) {
    tempErrors.status = "El estatus es requerido.";
  }

  if (!formData.estimatedTime.trim()) {
    tempErrors.estimatedTime = "La hora estimada es requerida.";
  }

  if (formData.comment.length > 100) {
    tempErrors.comment = "El comentario no puede exceder los 100 caracteres.";
  }

  return tempErrors;
};

// TARJETA DE CRÉDITO 
export const validateCardForm = (formData: CardFormData) => {
  let tempErrors: Partial<Record<keyof CardFormData, string>> = {};

  // Número de tarjeta (simulamos validación básica de longitud)
  if (!formData.number.trim()) {
    tempErrors.number = "Número de tarjeta requerido.";
  } else if (formData.number.replace(/\s/g, '').length < 15) {
    tempErrors.number = "Número de tarjeta inválido (min 15 dígitos).";
  }

  // Fecha Expiración (MM/YY)
  if (!formData.expiryDate.trim()) {
    tempErrors.expiryDate = "Requerido.";
  } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
    tempErrors.expiryDate = "Formato inválido (MM/YY).";
  }

  // CVV
  if (!formData.cvv.trim()) {
    tempErrors.cvv = "Requerido.";
  } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
    tempErrors.cvv = "CVV inválido.";
  }

  // País/Divisa
  if (!formData.country.trim()) {
    tempErrors.country = "Divisa requerida.";
  }

  return tempErrors;
};