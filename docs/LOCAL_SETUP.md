# Local development setup

If you see **MissingSecret** or **DATABASE_URL not found**, the app does not have a `.env.local` file yet (or the dev server was started before you created it).

## 1. Environment file

A starter `.env.local` should exist in the project root. If not, copy the example:

```bash
cp .env.example .env.local
```

Then set these **required** values:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` or `NEXTAUTH_SECRET` | At least 32 random characters — Auth.js will not start without one |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `ADMIN_EMAIL` | Used by `npm run db:seed` |
| `ADMIN_PASSWORD` | Used by `npm run db:seed` — pick a dev-only password |

Generate a secret (PowerShell):

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Paste the output into `AUTH_SECRET=` (or `NEXTAUTH_SECRET=`) in `.env.local`.

## 2. PostgreSQL

This project uses **PostgreSQL only** (not SQLite).

### Check if PostgreSQL is running (Windows)

Open PowerShell:

```powershell
Get-Service postgresql*
```

`Status` should be **Running**. On this machine the service is typically `postgresql-x64-13`.

If it is **Stopped**, start it:

```powershell
Start-Service postgresql-x64-13
```

(Set the service name from `Get-Service` if yours differs.)

---

### Option A — Local PostgreSQL (you already have v13 installed)

**Step 1 — Know your postgres password**

This is the password you chose when you installed PostgreSQL (user `postgres`).  
If you forgot it, reset it (Windows):

1. Open **Services** → stop `postgresql-x64-13`.
2. Edit `C:\Program Files\PostgreSQL\13\data\pg_hba.conf`.
3. Temporarily change the line for `127.0.0.1/32` from `scram-sha-256` to `trust`, save.
4. Start the service again.
5. Open **SQL Shell (psql)** from the Start menu (installed with PostgreSQL), press Enter for defaults until it asks for password (press Enter if trust mode).
6. Run:
   ```sql
   ALTER USER postgres PASSWORD 'YourNewDevPassword123';
   ```
7. Revert `pg_hba.conf` back to `scram-sha-256`, restart PostgreSQL.

**Step 2 — Create the `sunduza` database**

Open **SQL Shell (psql)** or run:

```powershell
& "C:\Program Files\PostgreSQL\13\bin\psql.exe" -U postgres -h localhost
```

Then:

```sql
CREATE DATABASE sunduza;
\q
```

**Step 3 — Set `.env.local`**

```env
DATABASE_URL=postgresql://postgres:YourNewDevPassword123@localhost:5432/sunduza
```

Use the real password from Step 1. No spaces. Special characters in passwords must be URL-encoded in the connection string.

**Step 4 — Verify**

```bash
npm run db:check
```

You should see `Database connection OK.`

If you see `Authentication failed`, the password in `DATABASE_URL` still does not match PostgreSQL.

---

### Option B — Neon (easiest if local setup is painful)

No local PostgreSQL required.

1. Sign up at [neon.tech](https://neon.tech).
2. Create a project → copy the **connection string** (starts with `postgresql://...`).
3. Paste it as `DATABASE_URL` in `.env.local`.
4. Run `npm run db:check`, then `npx prisma migrate dev`, then `npm run db:seed`.

## 3. Database migrate and seed

```bash
npm install
npx prisma generate
npm run db:check
npx prisma migrate dev
npm run db:seed
```

`npm run db:check` confirms PostgreSQL accepts the credentials in `DATABASE_URL` before you start the app.

Seeding requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`.

Default admin login after seed (if you use the starter `.env.local`):

- Email: `admin@sunduza.co.za`
- Password: value of `ADMIN_PASSWORD` in `.env.local`

## 4. Run the app

**Restart** the dev server after creating or editing `.env.local`:

```bash
npm run dev
```

Next.js only loads env files at startup.

## Quick checks

- `GET http://localhost:3000/api/v1/health` — should report database connected
- `GET http://localhost:3000/api/auth/session` — should return JSON, not 500
- Homepage featured projects — should load without Prisma errors
