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
  id: number;
  unVestedPoints: number;
  vestedPoints: number;
  gifts: GiftStatus[];
  unVestedOrderIds: number[];
  vestedOrderIds: number[];
  transactionIds: number[];
  currentPriceRuleId: number | null; // users may only have one price rule in the wild at a time
  vip: boolean;
  onApproval: boolean;
};

export type TransactionEntry = {
  id: number;
  orderId: number;
  amount: string;
  processedAt: string;
  processedForPoints: boolean;
};
export interface ITargetVariant {
  variantId: number;
  giftLevelId: number;
}
