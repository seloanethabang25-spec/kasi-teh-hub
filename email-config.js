/**
 * ============================================================
 * KASI TECH HUB – Email Configuration
 * ============================================================
 * Registration & contact emails are sent to the owner address
 * below whenever a student registers or submits the contact form.
 *
 * PRIMARY METHOD: FormSubmit (works on GitHub Pages – no API keys)
 * FALLBACK:       EmailJS (optional – fill in keys if preferred)
 *
 * ★ ONE-TIME ACTIVATION (required once):
 *   After the FIRST registration or contact submission from the
 *   live website, FormSubmit will email thabangseloane97@gmail.com
 *   with a confirmation link. Click that link to activate delivery.
 *   After activation, every new registration is emailed automatically.
 * ============================================================
 */

/**
 * Owner inbox – ALL registration & contact notifications go here.
 * Change this one value if the business email ever changes.
 */
const OWNER_EMAIL = "thabangseloane97@gmail.com";

/**
 * Email delivery method:
 *   "formsubmit" – recommended default (no signup, works on static sites)
 *   "emailjs"    – use only after you add EmailJS keys below
 *   "both"       – try FormSubmit first, then EmailJS
 */
const EMAIL_PROVIDER = "formsubmit";

/** Enable / disable automatic student confirmation message */
const SEND_STUDENT_CONFIRMATION = true;

/* ---------- Optional EmailJS (leave as-is unless you use EmailJS) ---------- */
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const OWNER_TEMPLATE_ID = "YOUR_OWNER_TEMPLATE_ID";
const CONFIRMATION_TEMPLATE_ID = "YOUR_CONFIRMATION_TEMPLATE_ID";
const CONTACT_TEMPLATE_ID = "YOUR_CONTACT_TEMPLATE_ID";

/* ---------- Optional Supabase cloud storage ---------- */
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

/**
 * Admin dashboard password (change before production!)
 */
const ADMIN_PASSWORD = "KasiTechHub2026!";

/** WhatsApp business number (South Africa format without +) */
const WHATSAPP_NUMBER = "27799491794";

/** Business phone for tel: links */
const BUSINESS_PHONE = "0799491794";

/** Business contact email (same as owner by default) */
const BUSINESS_EMAIL = "thabangseloane97@gmail.com";
