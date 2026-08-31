# Rotating `AEM_LIVE_ADMIN_TOKEN`

`AEM_LIVE_ADMIN_TOKEN` is the admin API key the workflows in this directory use to talk to
the AEM Admin API at `https://api.aem.live`. **Track Publishes** reads the publish log with
it every five minutes and dispatches the events that **Log Publish** turns into Slack
notifications.

Admin API keys are JWTs and expire — the default is a year. When the key lapses every run
fails with a `401`, and publish notifications stop silently, so **Track Publishes** checks
the expiry up front and warns a week ahead.

The steps below take about two minutes. Everything happens against
`org=adobe`, `site=aem-website` — note that the site is *not* named after this GitHub repo;
see the site alias warning in `CLAUDE.md`.

## 0. Check you have the `admin` role

API keys can only be minted by a request that already holds the `admin` role on
`adobe`, and that is a different, higher bar than being able to publish. If you can preview
and publish the site, or even read its config, that is *not* enough. A mint attempt without
it fails with:

```
HTTP/2 403
x-error: [admin] not authorized
```

Role mapping for this site lives in the org config (`adobe`), not the site config — the
site's own `access` block is empty — so ask whoever administers the `adobe` org to grant it,
or to mint the key for you with the request in step 2.

## 1. Get a browser auth token

Start from a normal browser login.

1. Open <https://api.aem.live/auth/adobe> and sign in. (For the full list of identity
   providers, open <https://api.aem.live/login> and pick one.)
2. Once you land back on `api.aem.live`, open DevTools → **Application** → **Cookies** →
   `https://api.aem.live` and copy the value of the `auth_token` cookie.

If you already have the sidekick open on the site, the same token is on any request it
makes to `api.aem.live` — grab it from the **Network** tab instead.

```sh
export AUTH_TOKEN='<the auth_token cookie value>'
```

Check it worked. This prints your email and the token's remaining lifetime in seconds
(about a day) — short-lived, which is exactly why it is not what goes into the repository
secret:

```sh
curl -s https://api.aem.live/profile -H "cookie: auth_token=$AUTH_TOKEN"
```

## 2. Mint the API key

```sh
curl -s -X POST \
  https://api.aem.live/adobe/sites/aem-website/config/apiKeys.json \
  -H "cookie: auth_token=$AUTH_TOKEN" \
  -H 'content-type: application/json' \
  -d '{"description":"GitHub Actions - track publishes","roles":["publish"]}'
```

The response's `value` is the key. **It is never stored by the service and cannot be
retrieved again** — copy it now.

```sh
export API_KEY='<the value from the response>'
```

## 3. Check the key actually works

The role a given endpoint needs is not documented yet, so verify rather than assume. This
is the exact call **Track Publishes** makes:

```sh
curl -s -o /dev/null -w '%{http_code}\n' \
  "https://api.aem.live/adobe/sites/aem-website/log?since=15m" \
  -H "authorization: token $API_KEY"
```

`200` means you are done. If it returns `403`, the roles you asked for were not enough:
delete the key and mint a new one with a broader set. The chapter sync in
`tools/youtube-chapters/` additionally writes to `/{org}/sites/{site}/source/{path}`, so
check that too if you are minting one key for both workflows.

```sh
# only if you need to start over
curl -s -X DELETE \
  https://api.aem.live/adobe/sites/aem-website/config/apiKeys/<id>.json \
  -H "cookie: auth_token=$AUTH_TOKEN"
```

## 4. Store it

Settings → Secrets and variables → Actions → `AEM_LIVE_ADMIN_TOKEN` → **Update secret**.

Then run **Track Publishes** manually from the Actions tab and confirm it goes green.

## Listing and cleaning up keys

Listing returns metadata only, never the key itself, so it is safe to run any time:

```sh
curl -s https://api.aem.live/adobe/sites/aem-website/config/apiKeys.json \
  -H "cookie: auth_token=$AUTH_TOKEN"
```

Delete keys you have replaced — a key stays valid until its expiry or until it is deleted.
