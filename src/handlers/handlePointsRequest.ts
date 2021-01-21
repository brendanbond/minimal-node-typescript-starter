import { Request, Response } from 'express';
import dayjs from 'dayjs';

import { getCustomerEntry, getOrderEntry } from '../interactors';
import { CustomerEntry } from '../types';
import { constants } from '../data';

const getNextOrderIdAndDateToVest = async (customerEntry: CustomerEntry) => {
  if (customerEntry.unVestedOrderIds) {
    const nextUnVestedOrderId = customerEntry.unVestedOrderIds[0];
    let nextUnvestedOrderEntry;
    if (nextUnVestedOrderId) {
      nextUnvestedOrderEntry = await getOrderEntry(nextUnVestedOrderId);
    }
    if (nextUnvestedOrderEntry) {
      const orderCreatedAt = dayjs(nextUnvestedOrderEntry.dateTimeCreated);
      return [
        nextUnVestedOrderId,
        orderCreatedAt
          .add(constants.vestTimeAmount, constants.vestTimeUnit)
          .format('YYYY-MM-DDTHH:mm:ssZ'),
      ];
    }
  }
  return [null, null];
};

export const handlePointsRequest = async (req: Request, res: Response) => {
  if (!req.params.customerId)
    return res.status(400).send('Bad request: customer ID cannot be null');

  const customerId = Number(req.params.customerId);

  const customerEntry = await getCustomerEntry(customerId);
  if (!customerEntry) {
    const response = {
      vestedPoints: 0,
      unVestedPoints: 0,
      nextOrderIdToVest: null,
      nextOrderVestingDate: null,
      redeemed: [],
    };
    res.status(200).json(response);
  } else {
    const [
      nextOrderIdToVest,
      nextOrderVestingDate,
    ] = await getNextOrderIdAndDateToVest(customerEntry);
    // TODO: type these responses
    const response = {
      vestedPoints: customerEntry.vestedPoints,
      unVestedPoints: customerEntry.unVestedPoints,
      nextOrderIdToVest,
      nextOrderVestingDate,
      gifts: customerEntry.gifts,
    };
    res.status(200).json(response);
  }
};
