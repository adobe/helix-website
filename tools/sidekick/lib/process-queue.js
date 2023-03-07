/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Copy of: https://github.com/adobe/helix-shared/blob/main/packages/helix-shared-process-queue/src/process-queue.js

/**
 * Simple dequeing iterator.
 * @param queue
 * @returns {Generator<*, void, *>}
 */
function* dequeue(queue) {
  while (queue.length) {
    yield queue.shift();
  }
}

/**
 * Processes the given queue concurrently. The handler functions can add more items to the queue
 * if needed.
 *
 * @param {Iterable|Array} queue A list of tasks
 * @param {ProcessQueueHandler} fn A handler function `fn(task:any, queue:array, results:array)`
 * @param {number} [maxConcurrent = 8] Concurrency level
 * @returns {Promise<[]>} the results
 */
export async function processQueue(queue, fn, maxConcurrent = 8) {
  if (typeof queue !== 'object') {
    throw Error('invalid queue argument: iterable expected');
  }

  const running = [];
  const results = [];

  const handler = (entry) => {
    const task = fn(entry, queue, results);
    if (task?.then) {
      running.push(task);
      task
        .then((r) => {
          if (r !== undefined) {
            results.push(r);
          }
        })
        .catch(() => {})
        .finally(() => {
          running.splice(running.indexOf(task), 1);
        });
    } else if (task !== undefined) {
      results.push(task);
    }
  };

  const iter = Array.isArray(queue)
    ? dequeue(queue)
    : queue;
  if (!iter || !('next' in iter)) {
    throw Error('invalid queue argument: iterable expected');
  }

  for await (const value of iter) {
    while (running.length >= maxConcurrent) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.race(running);
    }
    handler(value);
  }
  // wait until remaining tasks have completed
  await Promise.all(running);
  return results;
}
