/**
 * ============================================================
 * KASI TECH HUB – Contact Form Handler
 * Sends messages to OWNER_EMAIL (thabangseloane97@gmail.com)
 * via FormSubmit (primary) or EmailJS (optional)
 * ============================================================
 */

(function () {
  "use strict";

  const RATE_KEY = "kth_contact_last_submit";
  const RATE_LIMIT_MS = 20000;
  const CONTACT_STORAGE = "kth_contact_messages";

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");
    if (!form) return;

    if (
      typeof emailjs !== "undefined" &&
      typeof EMAILJS_PUBLIC_KEY !== "undefined" &&
      EMAILJS_PUBLIC_KEY &&
      EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY"
    ) {
      try {
        emailjs.init(EMAILJS_PUBLIC_KEY);
      } catch (err) {
        console.warn("EmailJS init warning:", err);
      }
    }

    form.addEventListener("submit", handleSubmit);

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.classList.contains("error")) validateField(field);
      });
    });

    if (typeof window.kthApplyUrlParams === "function") {
      window.kthApplyUrlParams();
    }
  });

  function getOwnerEmail() {
    return typeof OWNER_EMAIL !== "undefined" && OWNER_EMAIL
      ? OWNER_EMAIL
      : "thabangseloane97@gmail.com";
  }

  function getProvider() {
    return typeof EMAIL_PROVIDER !== "undefined" ? EMAIL_PROVIDER : "formsubmit";
  }

  function validateField(field) {
    if (!field.name || field.name === "website") return true;
    const value = (field.value || "").trim();
    let error = "";
    const required = field.hasAttribute("required");

    if (required && !value) {
      error = "This field is required.";
    } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Please enter a valid email address.";
    } else if (field.name === "phone" && value) {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 9) error = "Please enter a valid phone number.";
    }

    const errorEl = field.closest(".form-group")?.querySelector(".field-error");
    if (error) {
      field.classList.add("error");
      if (errorEl) {
        errorEl.textContent = error;
        errorEl.classList.add("show");
      }
      return false;
    }
    field.classList.remove("error");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("show");
    }
    return true;
  }

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      if (field.name === "website") return;
      if (!validateField(field)) valid = false;
    });
    return valid;
  }

  function isRateLimited() {
    const last = parseInt(localStorage.getItem(RATE_KEY) || "0", 10);
    return Date.now() - last < RATE_LIMIT_MS;
  }

  function showAlert(type, html) {
    const successEl = document.getElementById("contact-success");
    const errorEl = document.getElementById("contact-error");
    if (successEl) {
      successEl.classList.remove("show");
      successEl.innerHTML = "";
    }
    if (errorEl) {
      errorEl.classList.remove("show");
      errorEl.innerHTML = "";
    }
    if (type === "success" && successEl) {
      successEl.innerHTML = html;
      successEl.classList.add("show");
      successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else if (type === "error" && errorEl) {
      errorEl.innerHTML = html;
      errorEl.classList.add("show");
    }
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.classList.add("loading");
      btn.dataset.originalHtml = btn.innerHTML;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending…';
    } else {
      btn.disabled = false;
      btn.classList.remove("loading");
      if (btn.dataset.originalHtml) btn.innerHTML = btn.dataset.originalHtml;
    }
  }

  async function sendContactFormSubmit(data) {
    const owner = getOwnerEmail();
    const payload = {
      _subject: "Kasi Tech Hub Contact: " + data.subject,
      _template: "table",
      _captcha: "false",
      _replyto: data.email,
      name: data.name,
      email: data.email,
      phone: data.phone || "Not provided",
      subject: data.subject,
      message: data.message
    };

    try {
      const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(owner), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });
      const body = await res.json().catch(function () {
        return {};
      });
      if (res.ok || (res.status >= 200 && res.status < 300)) {
        return { ok: true, provider: "formsubmit", body: body };
      }
      return { ok: false, error: body, status: res.status };
    } catch (err) {
      console.error("FormSubmit contact failed:", err);
      return { ok: false, error: err };
    }
  }

  async function sendContactEmailJS(data) {
    const templateId =
      typeof CONTACT_TEMPLATE_ID !== "undefined" && CONTACT_TEMPLATE_ID !== "YOUR_CONTACT_TEMPLATE_ID"
        ? CONTACT_TEMPLATE_ID
        : typeof OWNER_TEMPLATE_ID !== "undefined" && OWNER_TEMPLATE_ID !== "YOUR_OWNER_TEMPLATE_ID"
          ? OWNER_TEMPLATE_ID
          : null;

    if (
      typeof emailjs === "undefined" ||
      !EMAILJS_PUBLIC_KEY ||
      EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY" ||
      !EMAILJS_SERVICE_ID ||
      EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" ||
      !templateId
    ) {
      return { ok: false, skipped: true };
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, templateId, {
        to_email: getOwnerEmail(),
        subject: "Kasi Tech Hub Contact: " + data.subject,
        first_name: data.name,
        surname: "",
        email: data.email,
        mobile_number: data.phone || "Not provided",
        whatsapp_number: data.phone || "Not provided",
        residential_area: "N/A",
        selected_programme: data.subject,
        employment_status: "N/A",
        learning_method: "N/A",
        preferred_date: "N/A",
        preferred_time: "N/A",
        experience_level: "N/A",
        accessibility_requirements: "N/A",
        additional_message: data.message,
        reference_number: "CONTACT-" + Date.now(),
        registration_date: new Date().toLocaleString("en-ZA"),
        age_group: "N/A",
        gender: "N/A",
        highest_qualification: "N/A"
      });
      return { ok: true, provider: "emailjs" };
    } catch (err) {
      console.error("Contact EmailJS failed:", err);
      return { ok: false, error: err };
    }
  }

  async function sendContactEmail(data) {
    const provider = getProvider();
    let result = { ok: false, skipped: true };

    if (provider === "formsubmit" || provider === "both") {
      result = await sendContactFormSubmit(data);
    }

    if (provider === "emailjs" || (provider === "both" && !result.ok)) {
      const ejs = await sendContactEmailJS(data);
      if (ejs.ok || provider === "emailjs") result = ejs;
    }

    return result;
  }

  function saveContactLocally(data) {
    try {
      const list = JSON.parse(localStorage.getItem(CONTACT_STORAGE) || "[]");
      list.unshift({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        id: "msg_" + Date.now(),
        created_at: new Date().toISOString()
      });
      localStorage.setItem(CONTACT_STORAGE, JSON.stringify(list));
    } catch (e) {
      console.warn("Could not store contact message locally", e);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('[type="submit"]');
    const fd = new FormData(form);

    if ((fd.get("website") || "").toString().trim()) {
      showAlert("success", "<strong>Message sent!</strong> We will get back to you soon.");
      form.reset();
      return;
    }

    if (isRateLimited()) {
      showAlert(
        "error",
        "<strong>Please wait.</strong> You recently sent a message. Wait a moment before trying again."
      );
      return;
    }

    if (!validateForm(form)) {
      showAlert("error", "<strong>Please complete all required fields correctly.</strong>");
      const firstError = form.querySelector(".error");
      if (firstError) firstError.focus();
      return;
    }

    const data = {
      name: (fd.get("name") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim().toLowerCase(),
      phone: (fd.get("phone") || "").toString().trim(),
      subject: (fd.get("subject") || "").toString().trim(),
      message: (fd.get("message") || "").toString().trim()
    };

    setLoading(submitBtn, true);

    try {
      saveContactLocally(data);
      const result = await sendContactEmail(data);
      localStorage.setItem(RATE_KEY, String(Date.now()));
      form.reset();
      form.querySelectorAll(".error").forEach(function (el) {
        el.classList.remove("error");
      });

      let note = "";
      if (result.ok) {
        note =
          "<br><small>Your message was emailed to " +
          escapeHtml(getOwnerEmail()) +
          ".</small>";
      } else {
        note =
          "<br><small>Your message was saved. For a faster response, WhatsApp 079 949 1794 or email thabangseloane97@gmail.com. " +
          "(If this is the first message on the live site, activate FormSubmit via the link sent to the owner inbox.)</small>";
      }

      showAlert(
        "success",
        "<strong>✓ Message sent successfully!</strong><br>Thank you, " +
          escapeHtml(data.name) +
          ". We have received your message and will respond as soon as possible." +
          note
      );
    } catch (err) {
      showAlert(
        "error",
        "<strong>Could not send message.</strong> Please try again or contact us directly on WhatsApp: 079 949 1794."
      );
    } finally {
      setLoading(submitBtn, false);
    }
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
})();
