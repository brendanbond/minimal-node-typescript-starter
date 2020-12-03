import { Request, Response } from 'express';
import dayjs from 'dayjs';

import { getCustomerEntry, getOrderEntry } from '../interactors';
import { Customer } from '../types';
import { constants } from '../data';

const calculateNextOrderVestingDate = async (customerEntry: Customer) => {
  const nextUnvestedOrderId = customerEntry.unVestedOrderIds[0];
  let nextUnvestedOrderEntry;
  if (nextUnvestedOrderId) {
    nextUnvestedOrderEntry = await getOrderEntry(nextUnvestedOrderId);
  }
  if (nextUnvestedOrderEntry) {
    const orderCreatedAt = dayjs(nextUnvestedOrderEntry.dateTimeCreated);
    return orderCreatedAt
      .add(constants.vestTimeAmount, constants.vestTimeUnit)
      .format('YYYY-MM-DDTHH:mm:ssZ');
  }
  return null;
};

export const handlePointsRequest = async (req: Request, res: Response) => {
  if (!req.params.customerId)
    return res.status(400).send('Bad request: customer ID cannot be null');

  const customerId = Number(req.params.customerId);

  const customerEntry = await getCustomerEntry(customerId);
  if (!customerEntry) {
    res.status(404).send('Customer not found');
  } else {
    const nextOrderVestingDate = await calculateNextOrderVestingDate(
      customerEntry
    );
    const response = {
      vestedPoints: customerEntry.vestedPoints,
      unVestedPoints: customerEntry.unVestedPoints,
      nextOrderVestingDate,
    };
    res.status(200).json(response);
  }
};
