export interface DemoOrderCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface DemoOrderInputItem {
  productId: string;
  quantity: number;
}

export interface DemoOrderInput {
  customer: DemoOrderCustomerInput;
  items: DemoOrderInputItem[];
  discountCode?: string | null;
}

export type DemoOrderStatus = "pending" | "confirmed" | "cancelled" | "partially_cancelled";

export interface DemoOrderCancellation {
  reason: string;
  cancelledAt: string;
}

export interface DemoOrderReceiptItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  remainingStock: number;
}

export interface DemoOrderReceipt {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalItems: number;
  subtotal: number;
  discountCode?: string | null;
  discountAmount: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  items: DemoOrderReceiptItem[];
}

export interface DemoOrderReportItem {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  remainingStock: number;
  /** Order-level subtotal used for proportional deduction calc */
  subtotal: number;
  /** Order-level discount amount */
  discountAmount: number;
  /** Order-level shipping fee */
  shippingFee: number;
}

export interface DemoOrderLookupOrderItem extends DemoOrderReceiptItem {
  itemStatus: DemoOrderStatus;
  cancelReason?: string | null;
  cancelledAt?: string | null;
}

export interface DemoOrderLookupOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalItems: number;
  subtotal: number;
  discountCode?: string | null;
  discountAmount: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  status: DemoOrderStatus;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  userId?: string | null;
  items: DemoOrderLookupOrderItem[];
}
