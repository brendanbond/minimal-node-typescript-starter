import { Request } from 'express';

export interface INewOrderWebhookRequest extends Request {
  body: {
    id: number;
    order_number: number;
    created_at: string;
    updated_at: string;
    subtotal_price: string;
    discount_codes: { code: string }[];
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
    selectedVariants: {
      variantId: number;
      giftLevel: number;
    }[];
  };
}

enum PaymentMethod {
  CreditCard = 'credit_card',
  Cash = 'cash',
  AndroidPay = 'android_pay',
  ApplePay = 'apple_pay',
  GooglePay = 'google_pay',
  SamsungPay = 'samsung_pay',
  ShopifyPay = 'shopify_pay',
  Amazon = 'amazon',
  Klarna = 'klarna',
  Paypal = 'paypal',
  Unknown = 'unknown',
  Other = 'other',
}

export interface ITenderTransactionWebhookRequest extends Request {
  body: {
    readonly id: number;
    readonly order_id: number;
    readonly amount: string;
    readonly currency: string;
    readonly user_id: number;
    readonly test: boolean;
    readonly processed_at: string;
    readonly remote_reference: string;
    readonly payment_details: {
      credit_card_number: string;
      credit_card_company: string;
    };
    readonly payment_method: PaymentMethod;
  };
}
