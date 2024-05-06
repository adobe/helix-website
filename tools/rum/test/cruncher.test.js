import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DataChunks } from '../cruncher.js';

describe('DataChunks', () => {
  it('chunks', async () => {
    const d = new DataChunks();
    assert.ok(d);
  });
});
