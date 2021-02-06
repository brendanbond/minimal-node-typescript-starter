export type OrderEntry = {
  id: number;
  customerId: number;
  dateTimeCreated: string;
  netPoints: number;
};

export enum GiftRedemptionStatus {
  PENDING = 'PENDING', // in the cart
  TRANSACTING = 'TRANSACTING', // gone to the checkout page
  REDEEMED = 'REDEEMED', // order using the relevant discount code has been processed
}

export type GiftStatus = {
  giftLevelId: number;
  status: GiftRedemptionStatus;
  priceRuleId: number | null; // the price rule (currently) assigned which redeems this gift
};

export type CustomerEntry = {
  unVestedPoints: number;
  vestedPoints: number;
  gifts: GiftStatus[];
  unVestedOrderIds: number[];
  vestedOrderIds: number[];
  currentPriceRuleId: number | null; // users may only have one price rule in the wild at a time
  vip: boolean;
  onApproval: boolean;
};

export interface ITargetVariant {
  variantId: number;
  giftLevelId: number;
}
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
