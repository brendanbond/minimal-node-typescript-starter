export type ShopifyOrder = {
  id: number;
  created_at: string;
  customer: {
    id: number;
  };
};

export interface IShopifyOrderAPIResponse {
  order: ShopifyOrder;
}

export type ShopifyTenderTransaction = {
  id: number;
  order_id: number;
  amount: string;
  currency: string;
  user_id: number | null;
  test: boolean;
  processed_at: string;
  remote_reference: string;
  payment_details: {
    credit_card_number: string;
    credit_card_company: string;
  };
  payment_method: string;
};

export interface IShopifyTenderTransactionsResponse {
  tender_transactions: ShopifyTenderTransaction[];
}
