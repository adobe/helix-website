import { end } from './coverage.js';

export default async function teardown() {
  await end();
}
