import { customAlphabet } from 'nanoid';

export const nanoid = (length: number) =>
  customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    length
  );
