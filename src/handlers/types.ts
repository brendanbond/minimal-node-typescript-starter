import { Request } from 'express';

export interface INewOrderWebhookRequest extends Request {
  body: {
    id: number;
    order_number: number;
    created_at: string;
    updated_at: string;
    subtotal_price: string;
    discount_codes: string[];
    customer: {
      id: number;
    };
    line_items: {
      product_id: number;
    }[];
  };
}
export interface ICancelOrderWebhookRequest extends Request {
  body: {
    id: number;
    order_number: number;
    subtotal_price: string;
    updated_at: string;
    customer: { id: number };
  };
}
export interface IRefundOrderWebhookRequest extends Request {
  body: {
    order_id: number;
    refund_line_items: { quantity: number; subtotal: number }[];
  };
}

export interface IRedeemRequest extends Request {
  body: {
    customerId: number;
    available: boolean;
    productId: number;
    price: number;
    selectedVariants: {
      variantId: number;
      giftLevel: number;
    }[];
  };
}
