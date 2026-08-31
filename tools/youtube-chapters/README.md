# YouTube chapter sync

`sync-chapters.js` keeps the `Chapters` column of the community feed sheet in step with
the chapter lists Adobe's video team writes into YouTube video descriptions. It runs from
the **Sync YouTube Chapters** workflow (`.github/workflows/youtube-chapters.yml`) every
morning, and can be triggered by hand from the Actions tab.

Each run:

1. reads `/community-feeds.json` from Document Authoring,
2. looks the `youtube` sheet's video ids up against the YouTube Data API,
3. extracts a chapter list from each description,
4. writes the result back as a `Chapters` column and previews and publishes the sheet.

Nothing is written when no chapter list changed, so a quiet run is a no-op.

The `feed` block reads the same column at render time — it never calls YouTube — and shows
the chapters as a collapsible list of deep links under each recording card. Authors can
fill the column in by hand too; the format is one `MM:SS Title` line per chapter, and a
manual edit survives until the video's own description gains a chapter list.

## What counts as a chapter list

Video descriptions are free text, so a run of timestamped lines is only accepted when it
behaves like a chapter list: it starts the video at `0:00`, runs strictly forwards, and has
at least three entries. That is close to what YouTube itself requires before it shows
chapters, and it keeps incidental times ("live July 9th at 8:00 PDT") out of the column.

## Required secrets

The workflow fails fast with a pointer here if any of these is missing.

### `YOUTUBE_API_KEY`

A YouTube Data API v3 key, used server-side only.

1. In the [Google Cloud console](https://console.cloud.google.com/), pick or create a project.
2. Under **APIs & Services → Library**, enable **YouTube Data API v3**.
3. Under **Credentials**, create an **API key**.
4. Restrict it to the YouTube Data API v3 (an application restriction is not useful here,
   as GitHub-hosted runners have no fixed IP).

A full run costs 3 of the 10,000 units in the default daily quota: `videos.list` is one
unit per call, and the script batches 50 videos per call.

### `DA_TOKEN`

An Adobe IMS access token that may write to the DA project. DA verifies IMS tokens
directly, so this must be a **server-to-server** credential rather than a personal login.

1. In the [Adobe Developer Console](https://developer.adobe.com/console), create a project
   and add an **OAuth Server-to-Server** credential.
2. Note the client id, client secret, and the technical account's email address.
3. In DA, add that email to the `adobe` org's permissions sheet with `write` on
   `/aem-website/community-feeds.json` (or on `/aem-website/+**`).
4. Exchange the credential for a token:

   ```sh
   curl -X POST https://ims-na1.adobelogin.com/ims/token/v3 \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=client_credentials&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&scope=openid,AdobeID,aem.frontend.all,read_organizations,additional_info.projectedProductContext,read_pc.dma_aem_ams"
   ```

IMS access tokens expire (24 hours by default), so a stored token will need renewing. If
these runs are meant to keep going unattended, store `DA_CLIENT_ID` and `DA_CLIENT_SECRET`
instead and have the workflow mint a token per run.

### `AEM_LIVE_ADMIN_TOKEN`

Already configured for the **Track Publishes** workflow, and reused here to preview and
publish the sheet. It needs the `publish` role on the `adobe/aem-website` site — note that
this is a different site than the `adobe/helix-website` one Track Publishes reads logs
from, so the existing token may need its scope widened.

## Running it locally

```sh
DRY_RUN=true \
DA_ORG=adobe DA_SITE=aem-website \
SHEET_PATH=/community-feeds.json SHEET_NAME=youtube \
DA_TOKEN=... YOUTUBE_API_KEY=... \
node tools/youtube-chapters/sync-chapters.js
```

`DRY_RUN=true` reports what would change and touches nothing.
