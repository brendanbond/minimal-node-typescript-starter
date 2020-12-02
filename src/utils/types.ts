export interface IShopifyOrdersQueryResponseItem {
  id: number;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  subtotal_price: string;
  refunds: {
    refund_line_items: { quantity: number; subtotal: number }[];
  }[];
  customer: {
    id: number;
  };
}