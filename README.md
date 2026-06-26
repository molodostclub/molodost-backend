# molodost-api

Minimal Express service for **form submissions** on [molodost.club](https://molodost.club).

CMS content lives in [molodost-frontend](https://github.com/molodostclub/molodost-frontend).  
This repo sends mail via **nodemailer** (Yandex SMTP) and optional WhatsApp (Whapi).

## Structure

```
server/
  index.mjs                      # Express app, health + routes
  form-request.mjs               # Form handler (SMTP + WhatsApp)
  email-templates.mjs            # User confirmation email builder
  user-confirmation-email.html.tpl
  load-env.mjs                   # Loads .env.local / .env in dev
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/form-requests` | Form handler |
| `POST` | `/api/form-request` | Alias |
| `GET` | `/_health` | Healthcheck |

## Local development

```bash
cp .env.example .env.local
# fill SMTP_USER, SMTP_PASS, WHAPI_TOKEN

npm install
npm run dev
```

Frontend (same machine):

```bash
# molodost-frontend/.env.local
FORM_API_URL=http://127.0.0.1:1337
npm run dev
```

## Production (one server, two containers)

Both containers on Docker network `molodost_net`:

- **API:** `molodost-backend` — port `1337`, env `SMTP_*`, `WHAPI_TOKEN`
- **Frontend:** `molodost_frontend` — env `FORM_API_URL=http://molodost-backend:1337`

Browser → `POST /api/form-request` (Next.js proxy) → `POST http://molodost-backend:1337/api/form-requests` → SMTP.
