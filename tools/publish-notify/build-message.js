/*
 * Builds the Slack message announcing a publish.
 *
 * Track Publishes dispatches the path and the publisher for every resource that goes live.
 * This turns that into a sentence naming who published, and who wrote it when that is
 * somebody else - a routine split here, where one person authors and another publishes.
 *
 * Slack only notifies on the `<@U012AB3CD>` id form, so emails are resolved to ids when a
 * bot token is available; without one the message still reads correctly, it just does not
 * ping anyone.
 */

const SLACK_API = 'https://slack.com/api';
const AEM_ORIGIN = 'https://api.aem.live';

/** Extensions that represent a page rather than a data or media file. */
const PAGE_EXTENSIONS = ['.md', '.html'];

/** `/docs/foo.md` -> `/docs/foo`, leaving anything that is not a page alone. */
export function toPagePath(path) {
  const ext = PAGE_EXTENSIONS.find((e) => path.endsWith(e));
  // Strip only a trailing extension - a plain replace would also eat `/using.md-files`.
  return ext ? path.slice(0, -ext.length) : null;
}

/** The source-bus path for a published resource, where pages are stored as `.html`. */
export function toSourcePath(path) {
  const page = toPagePath(path);
  return page ? `${page}.html` : path;
}

/** `msagolj@adobe.com` -> `msagolj`, the readable fallback when there is no Slack id. */
export function toHandle(email) {
  return `@${String(email || '').split('@')[0]}`;
}

/**
 * Renders the message. `publisher` and `author` are already-formatted mentions or handles;
 * `author` is only mentioned when it differs from the publisher, since the common case is
 * one person doing both and repeating them reads like noise.
 */
export function formatMessage({
  publisher, author, path, url,
}) {
  const what = url ? `<${url}|${toPagePath(path)}>` : `\`${path}\``;
  const who = publisher ? `${publisher} published` : 'Just published:';
  const by = author && author !== publisher ? `, authored by ${author}` : '';
  return `${who} ${what}${by}`;
}

/** The Slack id for an email, or null when it cannot be resolved. */
async function slackIdForEmail(email, token) {
  if (!token || !email) return null;
  try {
    const resp = await fetch(`${SLACK_API}/users.lookupByEmail?email=${encodeURIComponent(email)}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    return body.ok ? body.user.id : null;
  } catch {
    // A lookup failure must not cost us the notification.
    return null;
  }
}

/** A Slack mention when the id resolves, otherwise a plain readable handle. */
async function mention(email, token) {
  if (!email || email === 'unknown') return null;
  const id = await slackIdForEmail(email, token);
  return id ? `<@${id}>` : toHandle(email);
}

/** Who last edited the document, per the source bus version history. */
export async function lookupAuthor({
  org, site, path, token,
}) {
  if (!token) return null;
  try {
    const url = `${AEM_ORIGIN}/${org}/sites/${site}/source${toSourcePath(path)}/.versions`;
    const resp = await fetch(url, { headers: { authorization: `token ${token}` } });
    if (!resp.ok) return null;
    const versions = await resp.json();
    // Versions are ordered oldest to newest.
    return versions[versions.length - 1]?.['doc-last-modified-by'] || null;
  } catch {
    return null;
  }
}

async function main() {
  const path = process.env.PUBLISH_PATH;
  if (!path) throw new Error('Missing PUBLISH_PATH');

  const slackToken = process.env.SLACK_BOT_TOKEN;
  const publisherEmail = process.env.PUBLISHER;
  const authorEmail = await lookupAuthor({
    org: process.env.AEM_ORG,
    site: process.env.AEM_SITE,
    path,
    token: process.env.AEM_ADMIN_TOKEN,
  });

  const page = toPagePath(path);
  const text = formatMessage({
    publisher: await mention(publisherEmail, slackToken),
    author: await mention(authorEmail, slackToken),
    path,
    url: page ? `${process.env.SITE_URL || 'https://www.aem.live'}${page}` : null,
  });

  process.stdout.write(`${text}\n`);
  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import('node:fs');
    appendFileSync(process.env.GITHUB_OUTPUT, `text<<SLACK_EOF\n${text}\nSLACK_EOF\n`);
  }
}

const isEntryPoint = typeof process !== 'undefined' && process.argv?.[1]
  && import.meta.url === `file://${process.argv[1]}`;

if (isEntryPoint) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}
