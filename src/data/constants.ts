export const constants: {
  vestTimeAmount: number;
  vestTimeUnit: 'second' | 'minute' | 'day';
} = {
  vestTimeUnit: 'second',
  vestTimeAmount: 20,
};

export const ROOT_ENDPOINT = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_API_PASSWORD}@${process.env.SHOPIFY_STORE_NAME}.myshopify.com/admin/api/${process.env.SHOPIFY_API_VERSION}`;
