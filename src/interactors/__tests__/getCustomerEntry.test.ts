import redis from 'redis';
import { getCustomerEntry } from '../getCustomerEntry';

const store = redis.createClient();
store.set('customer:123456', JSON.stringify({ id: 1, name: 'brendan' }));

it('Returns nothing if key does not exist', async () => {
  const idThatDoesNotExist = 456789;
  const result = await getCustomerEntry(idThatDoesNotExist);
  expect(result).toBe(null);
});

it('Returns object if key does not exist', async () => {
  const idThatDoesExist = 123456;
  const result = await getCustomerEntry(idThatDoesExist);
  expect(result).toEqual({ id: 1, name: 'brendan' });
});

store.set('customer:7890', 'I am not a JSON string');
test('Throws correct error is entry is malformed JSON', () => {
  const idThatExists = 7890;
  return expect(getCustomerEntry(idThatExists)).rejects.toContain('Error while parsing JSON for customer id 7890');
});
