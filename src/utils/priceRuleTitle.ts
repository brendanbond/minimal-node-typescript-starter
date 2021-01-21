// price rule string schema - LOYALTY(|GIFT1)(|GIFT2)(|GIFT3)|<random string>
import { v4 as uuid } from 'uuid';

export const generateEncodedPriceRuleTitle = (giftLevelIds: number[]) => {
  if (giftLevelIds.length === 0) {
    throw new Error('No gift indexes given when requesting price rule title');
  }
  let string = 'LOYALTY';
  giftLevelIds.forEach((giftLevelId) => {
    string = string + `|GIFT${giftLevelId}`;
  });
  return `${string}|${uuid()}`;
};

export const decodePriceRuleTitle = (title: string) => {
  const [firstElement, ...restElements] = title.split('|');
  if (firstElement !== 'LOYALTY') {
    throw new Error('not a valid loyalty price rule title');
  }
  let giftsToRedeem: number[] = [];
  restElements.forEach((element) => {
    switch (element) {
      case 'GIFT1':
        giftsToRedeem.push(1);
      case 'GIFT2':
        giftsToRedeem.push(2);
      case 'GIFT3':
        giftsToRedeem.push(3);
    }
  });
  if (giftsToRedeem.length === 0) {
    throw new Error('not a valid loyalty price rule title');
  } else return giftsToRedeem;
};
