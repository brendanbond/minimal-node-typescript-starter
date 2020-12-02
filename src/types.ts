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

export type Customer = {
  unVestedPoints: number;
  vestedPoints: number;
  redeemed: number[];
  orders: Order[];
};

export type GlobalCacheState = {
  customers: Customer[];
};
