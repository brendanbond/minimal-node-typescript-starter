export type Customer = {
  unVestedPoints: number;
  vestedPoints: number;
  redeemed: number[];
  orders: Order[];
};

export enum EventType {
  OrderPlaced = 'OrderPlaced',
  OrderCancelled = 'OrderCancelled',
  OrderRefunded = 'OrderRefunded',
  CacheRebuild = 'CacheRebuild',
}

type Event = {
  type: EventType;
  netPoints: number;
};

export type Order = {
  id: number;
  dateTimeCreated: string;
  vested: boolean;
  events: Event[];
};

export type GlobalCacheState = {
  customers: Customer[];
};

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
