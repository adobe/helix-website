/*
 * Syncs YouTube chapter markers into the community feed sheet.
 *
 * Videos in the feed sheet are looked up via the YouTube Data API, their descriptions
 * are scanned for a chapter list, and the result is written back to a `Chapters` column
 * so the feed block can render deep links without calling YouTube at runtime.
 *
 * Reading and writing the sheet, previewing and publishing all go through the AEM Admin
 * API, so one admin API key covers the whole run.
 *
 * Run with `node tools/youtube-chapters/sync-chapters.js`; see the workflow of the same name
 * for the environment it expects.
 */

const AEM_ORIGIN = 'https://api.aem.live';
const YT_ORIGIN = 'https://www.googleapis.com/youtube/v3';

// YouTube looks up at most 50 video ids per videos.list call.
const YT_BATCH_SIZE = 50;

// A chapter list is only trustworthy when it opens the video and has some length to it,
// which is also what YouTube itself requires before it shows chapters on a video.
const MIN_CHAPTERS = 3;
const MAX_FIRST_CHAPTER_SECONDS = 1;

/** Timestamp at the start of the line: `01:23 Some title`, `[1:23] - Some title`. */
const LEADING_TIMESTAMP = /^\s*[[(]?(\d{1,3}:\d{2}(?::\d{2})?)[\])]?\s*[-–—:|.)]?\s+(\S.*?)\s*$/;
/** Timestamp at the end of the line: `Some title 01:23`, `Some title - (1:23)`. */
const TRAILING_TIMESTAMP = /^\s*(\S.*?)\s*[-–—:|([]*\s*[[(]?(\d{1,3}:\d{2}(?::\d{2})?)[\])]?\s*$/;

/** `mm:ss` or `hh:mm:ss` to a whole number of seconds. */
export function timeToSeconds(time) {
  const parts = time.split(':').map(Number);
  if (parts.some(Number.isNaN)) return null;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

/** `seconds` back to the `m:ss` / `h:mm:ss` form YouTube uses in descriptions. */
export function secondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const mmss = `${hours ? String(minutes).padStart(2, '0') : minutes}:${String(secs).padStart(2, '0')}`;
  return hours ? `${hours}:${mmss}` : mmss;
}

/**
 * Extracts a chapter list from a video description.
 *
 * Descriptions are free text, so a run of timestamped lines is only treated as chapters
 * when it behaves like one: it starts the video at 0:00, runs strictly forwards, and is
 * long enough that stray times ("live at 8:00 PDT") cannot masquerade as a chapter list.
 *
 * @returns {{seconds: number, title: string}[]} chapters, or `[]` when there are none
 */
export function parseChapters(description) {
  if (!description) return [];

  const chapters = [];
  description.split('\n').forEach((line) => {
    const match = line.match(LEADING_TIMESTAMP);
    const [time, title] = match
      ? [match[1], match[2]]
      : (line.match(TRAILING_TIMESTAMP) || []).slice(1).reverse();
    if (!time) return;

    const seconds = timeToSeconds(time);
    // Strictly increasing keeps a trailing "runtime 1:02:00" style line from joining the list.
    const previous = chapters[chapters.length - 1];
    if (seconds === null || (previous && seconds <= previous.seconds)) return;

    // Drop leading bullets/dashes the author used to lay the list out.
    const cleaned = title.replace(/^[-–—•*|:]+\s*/, '').replace(/\s+/g, ' ').trim();
    if (cleaned) chapters.push({ seconds, title: cleaned });
  });

  if (chapters.length < MIN_CHAPTERS) return [];
  if (chapters[0].seconds > MAX_FIRST_CHAPTER_SECONDS) return [];
  return chapters;
}

/** Serializes chapters into the `MM:SS Title` lines the feed block parses. */
export function formatChapters(chapters) {
  return chapters.map(({ seconds, title }) => `${secondsToTime(seconds)} ${title}`).join('\n');
}

/** The `v` parameter of a YouTube watch URL, or the last path segment of a short URL. */
export function getVideoId(url) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('v') || parsed.pathname.split('/').pop() || null;
  } catch {
    return null;
  }
}

/** Reads a required environment variable, failing loudly rather than sending an empty token. */
function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

/** `https://api.aem.live/{org}/sites/{site}/{route}{path}` */
function adminUrl({ org, site, route }, path) {
  return `${AEM_ORIGIN}/${org}/sites/${site}/${route}${path}`;
}

async function adminFetch(target, route, path, init = {}) {
  const url = adminUrl({ ...target, route }, path);
  const resp = await fetch(url, {
    ...init,
    headers: { ...init.headers, authorization: `token ${target.token}` },
  });
  if (!resp.ok) {
    throw new Error(`${init.method || 'GET'} ${url} failed: ${resp.status} ${resp.statusText}`);
  }
  return resp;
}

async function fetchSheet(target, path) {
  return (await adminFetch(target, 'source', path)).json();
}

async function saveSheet(target, path, json) {
  await adminFetch(target, 'source', path, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(json),
  });
}

/** Preview and publish the sheet so the change reaches the site. */
async function publish(target, path) {
  // Sequential: publishing a resource that has not been previewed yet is a no-op.
  for (const route of ['preview', 'live']) {
    // eslint-disable-next-line no-await-in-loop
    await adminFetch(target, route, path, { method: 'POST' });
  }
  return ['preview', 'live'];
}

/** Descriptions for `ids`, keyed by video id. Ids YouTube does not return are simply absent. */
async function fetchDescriptions(ids, apiKey) {
  const descriptions = new Map();

  for (let i = 0; i < ids.length; i += YT_BATCH_SIZE) {
    const batch = ids.slice(i, i + YT_BATCH_SIZE);
    const url = `${YT_ORIGIN}/videos?part=snippet&maxResults=${YT_BATCH_SIZE}`
      + `&id=${batch.join(',')}&key=${apiKey}`;
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(url);
    if (!resp.ok) {
      // eslint-disable-next-line no-await-in-loop
      throw new Error(`YouTube API request failed: ${resp.status} ${await resp.text()}`);
    }
    // eslint-disable-next-line no-await-in-loop
    const { items = [] } = await resp.json();
    items.forEach((item) => descriptions.set(item.id, item.snippet?.description || ''));
  }

  return descriptions;
}

/**
 * Writes a `Chapters` cell onto every row of `rows`, and reports which ones changed.
 * Rows whose video has no chapter list get an empty cell so the column stays uniform.
 */
function applyChapters(rows, descriptions) {
  const changed = [];

  rows.forEach((row) => {
    const id = getVideoId(row.URL);
    const description = id ? descriptions.get(id) : undefined;
    // Leave rows alone when YouTube did not answer for them - a deleted or private video
    // should not silently wipe chapters an author entered by hand.
    const chapters = description === undefined
      ? row.Chapters || ''
      : formatChapters(parseChapters(description));

    if (chapters !== (row.Chapters || '')) changed.push({ title: row.Title, chapters });
    row.Chapters = chapters;
  });

  return changed;
}

/** Keeps DA's stored column widths aligned with the columns actually present. */
function padColWidths(sheet) {
  const widths = sheet[':colWidths'];
  if (!Array.isArray(widths) || !sheet.data?.length) return;
  const columns = Object.keys(sheet.data[0]).length;
  while (widths.length < columns) widths.push(200);
}

async function main() {
  const apiKey = required('YOUTUBE_API_KEY');
  const target = {
    org: required('AEM_ORG'),
    site: required('AEM_SITE'),
    token: required('AEM_ADMIN_TOKEN'),
  };
  const sheetPath = required('SHEET_PATH');
  const sheetName = required('SHEET_NAME');
  const dryRun = process.env.DRY_RUN === 'true';

  const json = await fetchSheet(target, sheetPath);

  const sheet = json[':type'] === 'multi-sheet' ? json[sheetName] : json;
  const rows = sheet?.data;
  if (!Array.isArray(rows)) throw new Error(`Sheet "${sheetName}" not found in ${sheetPath}`);

  const ids = [...new Set(rows.map((row) => getVideoId(row.URL)).filter(Boolean))];
  console.log(`Looking up ${ids.length} videos from ${rows.length} rows in "${sheetName}"`);

  const descriptions = await fetchDescriptions(ids, apiKey);
  const missing = ids.filter((id) => !descriptions.has(id));
  if (missing.length) console.log(`YouTube returned nothing for ${missing.length} video(s): ${missing.join(', ')}`);

  const changed = applyChapters(rows, descriptions);
  const withChapters = rows.filter((row) => row.Chapters).length;
  console.log(`${withChapters} of ${rows.length} videos have chapters; ${changed.length} row(s) changed`);
  changed.forEach(({ title, chapters }) => {
    console.log(`  ${title}: ${chapters ? `${chapters.split('\n').length} chapters` : 'cleared'}`);
  });

  if (!changed.length) {
    console.log('Nothing to do.');
    return;
  }
  if (dryRun) {
    console.log('DRY_RUN is set, leaving the sheet untouched.');
    return;
  }

  padColWidths(sheet);
  await saveSheet(target, sheetPath, json);
  console.log(`Saved ${sheetPath} to the source bus`);

  const routes = await publish(target, sheetPath);
  console.log(`Published ${sheetPath} (${routes.join(', ')})`);
}

// Only run when invoked directly, so the parsing helpers stay importable from tests.
const isEntryPoint = typeof process !== 'undefined' && process.argv?.[1]
  && import.meta.url === `file://${process.argv[1]}`;

if (isEntryPoint) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
