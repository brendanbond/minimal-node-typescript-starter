import { Request, Response } from 'express';
import dayjs from 'dayjs';

import { getCustomerEntry } from '../interactors';

export const handlePointsRequest = async (req: Request, res: Response) => {
  if (!req.params.customerId)
    return res.status(400).send('Bad request: customer ID cannot be null');

  const customerId = Number(req.params.customerId);

  const customerEntry = await getCustomerEntry(customerId);
  if (!customerEntry) {
    res.status(404).send('Customer not found');
  } else {
    const nextVestedOrder = customerEntry.orders.find(
      (order) => order.vested === false
    );
    const nextVestingDate = nextVestedOrder
      ? dayjs(nextVestedOrder.dateTimeCreated)
          .add(30, 'day')
          .format('YYYY-MM-DDTHH:mm:ssZ')
      : null;
    const response = {
      vestedPoints: customerEntry.vestedPoints,
      unVestedPoints: customerEntry.unVestedPoints,
      nextVestingDate,
    };
    res.status(200).json(response);
  }
};
