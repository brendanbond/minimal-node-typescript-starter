import { Request, Response } from 'express';

import { getCustomerEntry } from '../interactors';
import { giftLevels } from '../data';

export const handleValidateRequest = async (req: Request, res: Response) => {
  const customerId = Number(req.params.customerId);
  console.log('customerId', customerId);
  if (!customerId)
    return res.status(400).send('Bad request: customer ID cannot be null');

  const collectionId = Number(req.query.collection);
  console.log('collectionId', collectionId);
  if (!collectionId)
    return res
      .status(400)
      .send('Bad request: collection query parameter cannot be null');

  const gift = giftLevels.find((gift) => gift.collectionId === collectionId);
  if (!gift)
    return res
      .status(404)
      .send(`Gift with collection ID ${collectionId} not found`);

  const customerEntry = await getCustomerEntry(customerId);
  if (!customerEntry) {
    res.status(404).send('Customer not found');
  } else {
    const response =
      customerEntry.vestedPoints >= gift.pointsNeeded &&
      collectionId === gift.collectionId;
    res.status(200).json(response);
  }
};
