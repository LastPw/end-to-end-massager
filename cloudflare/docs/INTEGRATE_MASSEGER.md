# Integrate Gateway With Pakeger

This gateway should sit in front of the app and proxy all traffic to the
upstream server. It will inject `/static/behavior.js` into HTML and send
behavior events to `/api/behavior`.

## Recommended topology

Client -> Cloudflare -> Nginx (TLS) -> Gateway (port 8000) -> App (port 3000/3001)

## Run the gateway

1) Create a venv and install requirements:

```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2) Run the gateway:

```
set UPSTREAM_BASE_URL=http://127.0.0.1:8080
set CHALLENGE_SECRET=change-me
uvicorn app.main:app --port 8000
```

## Nginx proxy (example)

Serve TLS at Nginx and proxy to the gateway:

```
location / {
  proxy_pass http://127.0.0.1:8000;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $remote_addr;
}
```

## Notes

- The gateway now allows `/api/*` to reach the upstream app.
- Gateway admin lives at `/admin` on the gateway port.
- Behavior events are stored in `cloudflare/data/behavior.db`.
