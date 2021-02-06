import { Request, Response } from 'express';
import { constants } from '../data';

export const handleConstantsRequest = (req: Request, res: Response) => {
  res.json(constants);
};
