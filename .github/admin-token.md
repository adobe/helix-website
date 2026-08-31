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

## 1. Get a browser auth token

API keys can only be minted by a request that is already authenticated with the `admin`
role, so start from a normal browser login.

1. Open <https://api.aem.live/auth/adobe> and sign in. (For the full list of identity
   providers, open <https://api.aem.live/login> and pick one.)
2. Once you land back on `api.aem.live`, open DevTools → **Application** → **Cookies** →
   `https://api.aem.live` and copy the value of the `auth_token` cookie.

If you already have the sidekick open on the site, the same token is on any request it
makes to `api.aem.live` — grab it from the **Network** tab instead.

```sh
export AUTH_TOKEN='<the auth_token cookie value>'
```

Check it worked. This prints your email and the token's remaining lifetime in seconds —
it is short-lived, which is exactly why it is not what goes into the repository secret:

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

`200` means you are done. If it returns `403`, the `publish` role was not enough: delete
the key and mint a new one with `"roles":["admin"]`.

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
