import { Request, Response, NextFunction } from 'express';
import { writeCustomerEntry } from '../interactors';

export const handleRedeemRequest = async (req: Request, res: Response) => {
  const {
    body: { id, giftId },
  } = req;
  const customerEntry = res.locals.customerEntry;

  if (!id || !giftId || !customerEntry)
    return res
      .status(500)
      .send(
        'Error during redeem request - lost customer object or request params'
      );

  writeCustomerEntry(id, {
    ...customerEntry,
    redeemed: [...customerEntry.redeemed, giftId],
  })
    .then(() => {
      return res.sendStatus(200);
    })
    .catch((err) => {
      return res.status(500).send(err);
    });
  //TODO: generate discount
};
