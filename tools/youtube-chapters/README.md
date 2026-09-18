# YouTube chapter sync

`sync-chapters.js` keeps the `Chapters` column of the community feed sheet in step with
the chapter lists Adobe's video team writes into YouTube video descriptions. It runs from
the **Sync YouTube Chapters** workflow (`.github/workflows/youtube-chapters.yml`) every
morning, and can be triggered by hand from the Actions tab.

Each run:

1. reads `/community-feeds.json` from the source bus,
2. looks the `youtube` sheet's video ids up against the YouTube Data API,
3. extracts a chapter list from each description,
4. writes the result back as a `Chapters` column, then previews and publishes the sheet.

Nothing is written when no chapter list changed, so a quiet run is a no-op.

## Where a row's chapters came from

A second column, `ChaptersSource`, records the provenance of each `Chapters` cell, and it
decides what a run is allowed to overwrite:

| `ChaptersSource` | Meaning | What a run does |
| --- | --- | --- |
| `youtube` | Lifted from the video's own description | Kept in sync, and cleared if the author removes the Topics block |
| `generated` | Derived from the video transcript | Left alone, unless the description gains a Topics block |
| `manual` | Typed into the sheet by an author | Left alone, unless the description gains a Topics block |
| empty | No chapters | Filled in if the description gains a Topics block |

Without this the sync would be destructive: most recordings have no Topics block, so a run
would write an empty cell over chapters that came from anywhere else. The author's own
description always wins when it has chapters - it is the most direct statement of intent -
but silence in a description is not an instruction to delete someone else's work.

The `feed` block reads the same column at render time — it never calls YouTube — and shows
the chapters as a collapsible list of deep links under each recording card. Authors can
fill the column in by hand too; the format is one `MM:SS Title` line per chapter. Set
`ChaptersSource` to `manual` when you do, so a later run does not clear it.

## What counts as a chapter list

Video descriptions are free text, so a run of timestamped lines is only accepted when it
behaves like a chapter list: it starts the video at `0:00`, runs strictly forwards, and has
at least three entries. That is close to what YouTube itself requires before it shows
chapters, and it keeps incidental times ("live July 9th at 8:00 PDT") out of the column.

## Required secrets

The workflow fails fast with a pointer here if either is missing.

### `AEM_LIVE_ADMIN_TOKEN`

An admin API key for the AEM Admin API at `https://api.aem.live`. Reading the sheet,
writing it back, previewing and publishing all go through that one API, so this single key
covers the whole run.

It is the same secret **Track Publishes** uses. To mint or rotate it, follow
[`.github/admin-token.md`](../../.github/admin-token.md).

The key needs to read and write source documents as well as preview and publish. Verify it
before relying on a scheduled run:

```sh
curl -s -o /dev/null -w '%{http_code}\n' \
  https://api.aem.live/adobe/sites/aem-website/source/community-feeds.json \
  -H "authorization: token $API_KEY"
```

`200` means the key can read the sheet. If it returns `403`, mint one with a broader role —
the runbook covers that.

### `YOUTUBE_API_KEY`

A YouTube Data API v3 key, used server-side only.

1. In the [Google Cloud console](https://console.cloud.google.com/), pick or create a project.
2. Under **APIs & Services → Library**, enable **YouTube Data API v3**.
3. Under **Credentials**, create an **API key**.
4. Restrict it to the YouTube Data API v3 (an application restriction is not useful here,
   as GitHub-hosted runners have no fixed IP).

A full run costs 3 of the 10,000 units in the default daily quota: `videos.list` is one
unit per call, and the script batches 50 videos per call.

## Running it locally

```sh
DRY_RUN=true \
AEM_ORG=adobe AEM_SITE=aem-website \
SHEET_PATH=/community-feeds.json SHEET_NAME=youtube \
AEM_ADMIN_TOKEN=... YOUTUBE_API_KEY=... \
node tools/youtube-chapters/sync-chapters.js
```

`DRY_RUN=true` reports what would change and touches nothing.
