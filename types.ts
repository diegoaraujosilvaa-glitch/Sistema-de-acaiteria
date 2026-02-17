
export enum PaymentMethod {
  CREDIT = 'Crédito',
  DEBIT = 'Débito',
  PIX = 'Pix',
  CASH = 'Dinheiro',
  POSTERIOR = 'Pagamento Posterior'
}

export enum DeliveryType {
  ON_SITE = 'No Local',
  PICKUP = 'Retirada',
  DELIVERY = 'Entrega'
}

export enum ProductCategory {
  ACAI_CREMES = 'Açais, cremes e sorvetes',
  SNACKS = 'Lanches',
  DRINKS = 'Bebidas'
}

export enum UnitType {
  UNIT = 'Unidade',
  WEIGHT = 'Peso (kg)'
}

export interface Product {
  id: string;
  name: string;
  price: number; // For weight, this is price per KG
  category: ProductCategory;
  unitType: UnitType;
}

export interface DeliveryFee {
  id: string;
  region: string;
  value: number;
}

export interface CartItem {
  product: Product;
  quantity: number; // Can be float for weight
  totalValue?: number; // Calculated specifically for weight entries
}

export type SaleStatus = 'pago' | 'pendente';

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  region?: string;
  timestamp: number;
  customerName?: string;
  status: SaleStatus;
}

export interface AppState {
  products: Product[];
  deliveryFees: DeliveryFee[];
  sales: Sale[];
}
