export const constants: {
  vestTimeAmount: number;
  vestTimeUnit: 'second' | 'minute' | 'day';
} = {
  vestTimeUnit: 'minute',
  vestTimeAmount: 15,
};

export const ROOT_ENDPOINT = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_API_PASSWORD}@${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/${process.env.SHOPIFY_API_VERSION}`;
