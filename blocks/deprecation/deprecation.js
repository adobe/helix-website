import { decorateLegacyFeatureLifecycle } from '../feature-lifecycle/feature-lifecycle.js';

/**
 * Legacy block: replaces itself with the feature-lifecycle block and keeps its text as the notice.
 */
export default async function decorate(block) {
  await decorateLegacyFeatureLifecycle(block, 'deprecation');
}
