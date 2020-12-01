import { Request } from 'express';

export interface INewOrderWebhookRequest extends Request {
  body: {
    id: number;
    order_number: number;
    created_at: string;
    updated_at: string;
    subtotal_price: string;
    customer: {
      id: number;
    };
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
    id: number;
    order_number: number;
    refund_line_items: { quantity: number; subtotal: number }[];
    updated_at: string;
    customer: { id: number };
  };
}
