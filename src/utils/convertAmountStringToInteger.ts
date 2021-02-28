export const convertAmountStringToInteger = (amount: string) => {
  const amountNumber = Number(amount);
  return amountNumber >= 0 ? Math.floor(amountNumber) : Math.ceil(amountNumber);
};
