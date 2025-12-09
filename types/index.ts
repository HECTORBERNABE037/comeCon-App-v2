// ==========================================
// 1. CONSTANTES Y CONFIGURACIÓN (THEME)
// ==========================================

export const COLORS = {
  primary: '#FAA66A',          // Naranja principal 
  background: '#F7F7F7',       // Gris claro del fondo
  surface: '#F0F0F0',          // Gris de fondo de los inputs
  surfaceSecondary: '#EAEAEA', // Gris del contenedor del logo
  error: '#b00020',
  text: '#333333',             // Texto principal (oscuro)
  textSecondary: '#888888',    // Subtítulo
  placeholder: '#A0A0A0',      // Color del texto de placeholder
  white: '#FFFFFF',
};

export const FONT_SIZES = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 22,
  xxlarge: 32, 
};

// ==========================================
// 2. TIPOS BASE Y UTILIDADES
// ==========================================

export type ID = number | string;
export type UserRole = "cliente" | "administrador";

// Interfaz base para reducir repetición de 'id'
export interface BaseEntity {
  id: ID;
}

// ==========================================
// 3. ENTIDADES DE USUARIO Y PERFILES
// ==========================================

export interface Usuario extends BaseEntity {
  nombre: string;
  email: string;
  telefono?: string;
  role: UserRole;
  nickname?:string;
  gender?:string;
  country?:string;
  address?:string;
  image?:any;
  allowNotifications?:boolean;
  allowCamera?:boolean;
}

// Perfil compartido (base para Admin y Cliente si tienen campos iguales)
interface ProfileBase {
  fullName: string;
  nickname: string;
  email: string;
  phone: string;
  gender: string;
  country: string;
  address: string;
  image: any;
}

export interface AdminProfile extends ProfileBase {}
export interface ClientProfile extends ProfileBase {}

// Formularios de Perfil (Omitimos la imagen porque no se edita igual que el texto)
export interface AdminProfileFormData extends Omit<AdminProfile, 'image'> {}
export interface ClientProfileFormData extends Omit<ClientProfile, 'image'> {}


// ==========================================
// 4. AUTENTICACIÓN (FORMULARIOS)
// ==========================================

export interface LoginFormData {
  email: string; 
  password: string;
}

export interface RegisterFormData {
  name:string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  emailOrPhone: string;
}

export interface ResetCodeFormData {
  code: string;
}

export interface SetNewPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}


// ==========================================
// 5. CATÁLOGO Y PEDIDOS
// ==========================================

// Base para cualquier ítem vendible
interface ProductBase extends BaseEntity {
  title: string;
  subtitle: string;
  price: string;//<-- Precio normal del producto
  image: any;
  visible?: boolean;
}

export interface Platillo extends ProductBase {
  oldPrice?: string;
  promotionalPrice?: string;
  description?: string;
}

export interface Promocion extends ProductBase {
  promotionalPrice?: string;//<--precio promocional
  visible?: boolean;
}

export interface CartItem extends Platillo {
  quantity: number;
  date?: string; // Fecha de agregado (opcional)
}

export interface Order extends ProductBase {
  status: 'pending' | 'process' | 'completed' | 'cancelled';
  date?: string;
  deliveryTime?: string; 
  historyNotes?: string;
}

// Formularios de Gestión (Admin)
export interface ProductFormData {
  title: string;
  subtitle: string;
  price: string;
  description: string;
  visible?: boolean;
}

export interface PromotionFormData {
  promotionalPrice: string;
  startDate: string; 
  endDate: string;   
  visible?: boolean;
}

export interface OrderFormData {
  status: string;
  estimatedTime: string;
  comment: string;
}


// ==========================================
// 6. PAGOS
// ==========================================

export type PaymentMethod = 'cash' | 'card';

export interface CreditCard extends BaseEntity {
  number: string; 
  holderName: string;
  expiryDate: string;
  cvv: string;
  type: 'visa' | 'mastercard' | 'amex' | 'unknown';
}

export interface CardFormData {
  number: string;
  expiryDate: string;
  cvv: string;
  country: string;
  holderName: string;
}

// ==========================================
// 7. NAVEGACIÓN
// ==========================================

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  HomeAdmin: undefined;
  Register: undefined;
  ProductDetails: { platillo: Platillo };
  ForgotPassword: undefined;
  ResetCode: { emailOrPhone: string };
  SetNewPassword: { emailOrPhone: string };
  OrderTracking: undefined;
  AdminProfile: undefined;
  EditAdminProfile: undefined;
  ClientOrderTracking: undefined;
  ClientProfile: undefined;
  EditClientProfile: undefined;
  Cart: undefined;
  Checkout: undefined;
  AddCard: undefined;
};