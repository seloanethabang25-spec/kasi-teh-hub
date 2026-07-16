# Kasi Tech Hub Website

**KASI TECH HUB (PTY) LTD** — Empowering Communities Through Digital Skills  
*Skills That Open Doors*

A complete, modern, mobile-first static website for community digital skills training and technology services in Refilwe, Cullinan, Gauteng, South Africa.

**Live URL (GitHub Pages):**  
https://thabang97seloane.github.io/KASI-TECH-HUB/

---

## Features

- Fully responsive design (mobile, tablet, laptop, desktop)
- Sticky navigation + mobile hamburger menu
- Hero, About, Programmes, Services, Why Choose Us, Registration, Testimonials, FAQ, Contact
- Registration form with validation, honeypot spam protection, and rate limiting
- Reference numbers in format `KTH-2026-00001`
- EmailJS integration for owner notification + applicant confirmation
- Contact form with owner email notification
- Floating WhatsApp button
- Administrator dashboard (password-protected) with search, filters, status updates, CSV export
- Local storage fallback for registrations (works offline / on pure static hosting)
- Optional Supabase cloud storage
- Privacy Policy (POPIA) and Terms & Conditions
- SEO metadata, Open Graph, sitemap.xml, robots.txt
- Relative paths ready for GitHub Pages project site

---

## File structure

```
KASI-TECH-HUB/
├── index.html
├── registration.html
├── contact.html
├── privacy.html
├── terms.html
├── admin.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── registration.js
│   ├── contact.js
│   └── email-config.js      ← EDIT THIS FILE
├── images/
│   ├── logo.png
│   ├── hero-image.jpg
│   └── programme-images/
├── favicon.ico
├── sitemap.xml
├── robots.txt
└── README.md
```

---

## Quick start (local preview)

1. Open the folder in VS Code (or any editor).
2. Use a local server (recommended):

```bash
# Python
python3 -m http.server 8080

# or Node
npx serve .
```

3. Visit `http://localhost:8080`

> Opening `index.html` via `file://` works for layout, but EmailJS and some browser APIs work best over `http://`.

---

## Email notifications (configured)

**Owner inbox:** `thabangseloane97@gmail.com`  
Set in `js/email-config.js` as:

```js
const OWNER_EMAIL = "thabangseloane97@gmail.com";
const EMAIL_PROVIDER = "formsubmit";  // default – works on GitHub Pages
const SEND_STUDENT_CONFIRMATION = true;
```

Whenever a student registers, the website emails **thabangseloane97@gmail.com** with:

- Subject: `New Kasi Tech Hub Registration – [Full Name]`
- Reference number, date/time, contact details, programme, preferences, message, etc.

The student also receives an automatic confirmation email (FormSubmit autoresponse).

Contact-form messages are emailed to the same address.

### ★ One-time activation (required)

FormSubmit is already wired — **no API keys needed**. You only need to activate once:

1. Deploy the website (or open it live / on a public URL).
2. Submit **one test registration** (or contact form message).
3. Open **thabangseloane97@gmail.com** (check Inbox **and Spam/Promotions**).
4. Find the email from **FormSubmit** titled something like “Confirm your email”.
5. **Click the confirmation link** in that email.
6. After activation, every new registration is delivered automatically.

> Tip: Use a real student-style test email for the form’s Email field so you can also see the student confirmation.

### Optional: EmailJS instead / as well

If you prefer EmailJS, set in `js/email-config.js`:

```js
const EMAIL_PROVIDER = "emailjs"; // or "both"
const EMAILJS_PUBLIC_KEY = "...";
const EMAILJS_SERVICE_ID = "...";
const OWNER_TEMPLATE_ID = "...";
const CONFIRMATION_TEMPLATE_ID = "...";
```

Create templates at [https://www.emailjs.com/](https://www.emailjs.com/) with `to_email` set to `{{to_email}}` (code sends the owner address).

### Other config

| Variable | Notes |
|----------|--------|
| `OWNER_EMAIL` | **Already set** to `thabangseloane97@gmail.com` |
| `ADMIN_PASSWORD` | **Change this** before public launch |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Optional cloud DB |
| `WHATSAPP_NUMBER` | Already `27799491794` |

### Real contact details used on the site

- **Company:** KASI TECH HUB (PTY) LTD  
- **Address:** 1609 10th Street, Refilwe, Cullinan, Gauteng, South Africa  
- **Phone / WhatsApp:** 079 949 1794  
- **Email:** thabangseloane97@gmail.com  
- **Founder:** Thabang Seloane  

---

## Registration storage

### Default: browser localStorage

Registrations are saved in the visitor’s browser under the key `kth_registrations` and can be managed in **`admin.html`** on the **same browser** that received the submissions (or any browser where you import data).

This is ideal for demos and single-device admin use. For multi-device / permanent storage, use Supabase.

### Recommended: Supabase

1. Create a free project at [https://supabase.com](https://supabase.com)
2. Run this SQL in the SQL Editor:

```sql
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique not null,
  first_name text not null,
  surname text not null,
  email text not null,
  mobile_number text,
  whatsapp_number text,
  age_group text,
  gender text,
  residential_area text,
  highest_qualification text,
  employment_status text,
  selected_programme text,
  learning_method text,
  preferred_date text,
  preferred_time text,
  experience_level text,
  accessibility_requirements text,
  additional_message text,
  consent boolean default true,
  registration_status text default 'New',
  created_at timestamptz default now()
);

-- Enable Row Level Security and add policies appropriate for your setup.
-- For a simple public insert from the website (anon key):
alter table registrations enable row level security;

create policy "Allow public insert"
  on registrations for insert
  to anon
  with check (true);

-- Prefer a service-role backend for reads/deletes in production.
-- For a simple admin on the same key (less secure), you may add:
create policy "Allow public select"
  on registrations for select
  to anon
  using (true);

create policy "Allow public update"
  on registrations for update
  to anon
  using (true);

create policy "Allow public delete"
  on registrations for delete
  to anon
  using (true);
```

3. Copy **Project URL** and **anon public key** into `js/email-config.js`.

> **Security note:** Public anon policies that allow select/update/delete are convenient for a static site but not ideal for production. For stronger security, use Supabase Auth for the admin dashboard or a small serverless API.

### Other options

- Firebase Firestore  
- Airtable  
- Google Sheets (via Apps Script / secure API)  
- Formspree / Web3Forms as an alternative to EmailJS  

---

## Administrator dashboard

Open: **`admin.html`**

1. Default password is set in `js/email-config.js` as `ADMIN_PASSWORD`  
   **Change it before publishing.**
2. Login is stored in `sessionStorage` for the browser tab session only.
3. Capabilities:
   - View all registrations (localStorage)
   - Search by name, email, phone, reference
   - Filter by programme, status, date
   - Open full details
   - Mark as New / Contacted / Accepted / Completed / Cancelled
   - Export filtered results to CSV
   - Delete with confirmation
   - Stats totals and programme breakdown

`admin.html` is listed in `robots.txt` as `Disallow` and uses `noindex`.

---

## GitHub Pages deployment

Target: `https://thabang97seloane.github.io/KASI-TECH-HUB/`

All asset paths are **relative** (`css/style.css`, `js/main.js`, `images/logo.png`) so they work under the `/KASI-TECH-HUB/` base path.

### Option A — Upload via GitHub website

1. Create a GitHub account (if needed): https://github.com  
2. Create a new repository named **`KASI-TECH-HUB`** (public).  
3. Upload all files from this `KASI-TECH-HUB` folder to the repository root (not inside another nested folder).  
4. Go to **Settings → Pages**.  
5. Under **Source**, select **Deploy from a branch**.  
6. Branch: `main` (or `master`), folder: `/ (root)`.  
7. Save. After a minute, open:  
   https://thabang97seloane.github.io/KASI-TECH-HUB/

### Option B — Git command line

```bash
cd KASI-TECH-HUB
git init
git add .
git commit -m "Initial Kasi Tech Hub website"
git branch -M main
git remote add origin https://github.com/thabang97seloane/KASI-TECH-HUB.git
git push -u origin main
```

Then enable GitHub Pages as in Option A.

### Custom domain (optional)

In Pages settings, add your domain and create a `CNAME` file if required.

---

## Programme Register buttons

Each programme card’s **Register** button calls `kthSelectProgramme('Programme Name')`, which:

- Selects that programme in the registration form (same page), or  
- Navigates to `registration.html?programme=...` on other pages  

Service **Request Service** buttons prefill the contact form subject and message.

---

## Spam protection

- Hidden honeypot field (`website`) — bots that fill it get a fake success  
- Client-side rate limiting (30s registration / 20s contact) via localStorage  
- Required field + email/phone validation  

For stronger protection, add Google reCAPTCHA or Cloudflare Turnstile later.

---

## Browser support

Modern evergreen browsers: Chrome, Firefox, Safari, Edge (latest versions).  
Uses CSS Grid, Flexbox, and ES6 JavaScript.

---

## Brand colours

| Role | Colour |
|------|--------|
| Navy | `#0a1628` |
| Blue | `#1e6fd9` |
| Turquoise | `#00c2b8` |
| Green | `#22c55e` |
| Orange | `#f97316` |
| White / off-white | `#ffffff` / `#f7f9fc` |

---

## Credits

- **Designed and managed by Thabang Seloane**  
- **© 2026 Kasi Tech Hub (PTY) LTD. All rights reserved.**  
- Tagline: *Skills That Open Doors*  
- Slogan: *Empowering Communities Through Digital Skills*

---

## Support

For website or configuration help:

- WhatsApp: 079 949 1794  
- Email: thabangseloane97@gmail.com  
