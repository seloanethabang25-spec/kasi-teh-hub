/**
 * ============================================================
 * KASI TECH HUB – Registration Form Handler
 * Validation · FormSubmit email to owner · Local storage · Rate limit
 * ============================================================
 *
 * Owner notification email: OWNER_EMAIL (thabangseloane97@gmail.com)
 * Student confirmation: autoresponse via FormSubmit (when enabled)
 */

(function () {
  "use strict";

  const STORAGE_KEY = "kth_registrations";
  const RATE_KEY = "kth_last_submit";
  const RATE_LIMIT_MS = 30000;
  const COUNTER_KEY = "kth_reg_counter";

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registration-form");
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
        if (field.classList.contains("error")) {
          validateField(field);
        }
      });
    });

    if (typeof window.kthApplyUrlParams === "function") {
      window.kthApplyUrlParams();
    }
  });

  function generateReference() {
    const year = new Date().getFullYear();
    let counter = parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10) + 1;
    localStorage.setItem(COUNTER_KEY, String(counter));
    return "KTH-" + year + "-" + String(counter).padStart(5, "0");
  }

  function getFormData(form) {
    const fd = new FormData(form);
    return {
      first_name: (fd.get("first_name") || "").toString().trim(),
      surname: (fd.get("surname") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim().toLowerCase(),
      mobile_number: (fd.get("mobile_number") || "").toString().trim(),
      whatsapp_number: (fd.get("whatsapp_number") || "").toString().trim(),
      age_group: (fd.get("age_group") || "").toString(),
      gender: (fd.get("gender") || "").toString(),
      residential_area: (fd.get("residential_area") || "").toString().trim(),
      highest_qualification: (fd.get("highest_qualification") || "").toString().trim(),
      employment_status: (fd.get("employment_status") || "").toString(),
      selected_programme: (fd.get("selected_programme") || "").toString(),
      learning_method: (fd.get("learning_method") || "").toString(),
      preferred_date: (fd.get("preferred_date") || "").toString(),
      preferred_time: (fd.get("preferred_time") || "").toString(),
      experience_level: (fd.get("experience_level") || "").toString(),
      accessibility_requirements: (fd.get("accessibility_requirements") || "").toString().trim(),
      additional_message: (fd.get("additional_message") || "").toString().trim(),
      consent: fd.get("consent") === "on" || fd.get("consent") === "true",
      website: (fd.get("website") || "").toString().trim()
    };
  }

  function validateField(field) {
    const name = field.name;
    if (!name || name === "website") return true;

    const value = (field.value || "").trim();
    let error = "";
    const required = field.hasAttribute("required") || field.getAttribute("aria-required") === "true";

    if (required && !value) {
      error = "This field is required.";
    } else if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Please enter a valid email address.";
    } else if ((name === "mobile_number" || name === "whatsapp_number") && value) {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 15) {
        error = "Please enter a valid phone number.";
      }
    } else if (name === "consent" && field.type === "checkbox" && !field.checked) {
      error = "You must provide consent to register.";
    }

    const errorEl = field.closest(".form-group, .checkbox-group")?.querySelector(".field-error");
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

  function setRateLimit() {
    localStorage.setItem(RATE_KEY, String(Date.now()));
  }

  function saveRegistration(record) {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      list.unshift(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      console.error("Storage error:", err);
      return false;
    }
  }

  async function saveToSupabase(record) {
    if (
      typeof SUPABASE_URL === "undefined" ||
      !SUPABASE_URL ||
      SUPABASE_URL === "YOUR_SUPABASE_URL" ||
      typeof SUPABASE_ANON_KEY === "undefined" ||
      SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY"
    ) {
      return { ok: false, skipped: true };
    }

    try {
      const res = await fetch(SUPABASE_URL + "/rest/v1/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          reference_number: record.reference_number,
          first_name: record.first_name,
          surname: record.surname,
          email: record.email,
          mobile_number: record.mobile_number,
          whatsapp_number: record.whatsapp_number,
          age_group: record.age_group,
          gender: record.gender,
          residential_area: record.residential_area,
          highest_qualification: record.highest_qualification,
          employment_status: record.employment_status,
          selected_programme: record.selected_programme,
          learning_method: record.learning_method,
          preferred_date: record.preferred_date,
          preferred_time: record.preferred_time,
          experience_level: record.experience_level,
          accessibility_requirements: record.accessibility_requirements,
          additional_message: record.additional_message,
          consent: record.consent,
          registration_status: record.registration_status,
          created_at: record.created_at
        })
      });
      return { ok: res.ok, status: res.status };
    } catch (err) {
      console.warn("Supabase save failed:", err);
      return { ok: false, error: err };
    }
  }

  function getOwnerEmail() {
    return typeof OWNER_EMAIL !== "undefined" && OWNER_EMAIL
      ? OWNER_EMAIL
      : "thabangseloane97@gmail.com";
  }

  function getProvider() {
    return typeof EMAIL_PROVIDER !== "undefined" ? EMAIL_PROVIDER : "formsubmit";
  }

  function studentConfirmationText(record) {
    return (
      "Dear " +
      record.first_name +
      ",\n\n" +
      "Thank you for registering with Kasi Tech Hub.\n\n" +
      "We have successfully received your registration for " +
      record.selected_programme +
      ".\n" +
      "Your reference number is " +
      record.reference_number +
      ".\n\n" +
      "A member of our team will contact you with further information about the training schedule, venue, requirements, and next steps.\n\n" +
      "Kind regards,\n\n" +
      "Kasi Tech Hub\n" +
      "Empowering Communities Through Digital Skills\n" +
      "WhatsApp: 079 949 1794\n" +
      "Email: thabangseloane97@gmail.com"
    );
  }

  /**
   * FormSubmit → emails OWNER_EMAIL (thabangseloane97@gmail.com)
   * Works on GitHub Pages without API keys.
   * First submission ever requires clicking the activation link in Gmail.
   */
  async function sendOwnerEmailFormSubmit(record) {
    const owner = getOwnerEmail();
    const subject =
      "New Kasi Tech Hub Registration – " + record.first_name + " " + record.surname;

    const payload = {
      _subject: subject,
      _template: "table",
      _captcha: "false",
      _replyto: record.email,
      name: record.first_name + " " + record.surname,
      email: record.email,
      reference_number: record.reference_number,
      registration_date: record.created_at_display || record.created_at,
      first_name: record.first_name,
      surname: record.surname,
      mobile_number: record.mobile_number,
      whatsapp_number: record.whatsapp_number,
      residential_area: record.residential_area,
      selected_programme: record.selected_programme,
      employment_status: record.employment_status,
      learning_method: record.learning_method,
      preferred_date: record.preferred_date || "Not specified",
      preferred_time: record.preferred_time || "Not specified",
      experience_level: record.experience_level,
      age_group: record.age_group,
      gender: record.gender || "Not specified",
      highest_qualification: record.highest_qualification || "Not specified",
      accessibility_requirements: record.accessibility_requirements || "None",
      additional_message: record.additional_message || "None",
      message:
        "NEW REGISTRATION\n" +
        "Reference: " +
        record.reference_number +
        "\n" +
        "Name: " +
        record.first_name +
        " " +
        record.surname +
        "\n" +
        "Email: " +
        record.email +
        "\n" +
        "Mobile: " +
        record.mobile_number +
        "\n" +
        "WhatsApp: " +
        record.whatsapp_number +
        "\n" +
        "Area: " +
        record.residential_area +
        "\n" +
        "Programme: " +
        record.selected_programme +
        "\n" +
        "Employment: " +
        record.employment_status +
        "\n" +
        "Learning method: " +
        record.learning_method +
        "\n" +
        "Preferred date: " +
        (record.preferred_date || "Not specified") +
        "\n" +
        "Preferred time: " +
        (record.preferred_time || "Not specified") +
        "\n" +
        "Experience: " +
        record.experience_level +
        "\n" +
        "Accessibility: " +
        (record.accessibility_requirements || "None") +
        "\n" +
        "Message: " +
        (record.additional_message || "None")
    };

    // Student confirmation autoresponse (FormSubmit emails the student)
    if (typeof SEND_STUDENT_CONFIRMATION === "undefined" || SEND_STUDENT_CONFIRMATION) {
      payload._autoresponse = studentConfirmationText(record);
    }

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

      if (res.ok && (body.success === "true" || body.success === true || res.status === 200)) {
        return { ok: true, provider: "formsubmit" };
      }

      // FormSubmit often returns success message even on first activation
      if (res.status >= 200 && res.status < 300) {
        return { ok: true, provider: "formsubmit", note: body.message || "" };
      }

      console.error("FormSubmit owner email failed:", res.status, body);
      return { ok: false, error: body, status: res.status };
    } catch (err) {
      console.error("FormSubmit network error:", err);
      return { ok: false, error: err };
    }
  }

  async function sendOwnerEmailEmailJS(record) {
    if (
      typeof emailjs === "undefined" ||
      !EMAILJS_PUBLIC_KEY ||
      EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY" ||
      !EMAILJS_SERVICE_ID ||
      EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" ||
      !OWNER_TEMPLATE_ID ||
      OWNER_TEMPLATE_ID === "YOUR_OWNER_TEMPLATE_ID"
    ) {
      return { ok: false, skipped: true };
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, OWNER_TEMPLATE_ID, {
        to_email: getOwnerEmail(),
        subject:
          "New Kasi Tech Hub Registration – " + record.first_name + " " + record.surname,
        reference_number: record.reference_number,
        registration_date: record.created_at_display || record.created_at,
        first_name: record.first_name,
        surname: record.surname,
        email: record.email,
        mobile_number: record.mobile_number,
        whatsapp_number: record.whatsapp_number,
        residential_area: record.residential_area,
        selected_programme: record.selected_programme,
        employment_status: record.employment_status,
        learning_method: record.learning_method,
        preferred_date: record.preferred_date || "Not specified",
        preferred_time: record.preferred_time || "Not specified",
        experience_level: record.experience_level,
        accessibility_requirements: record.accessibility_requirements || "None",
        additional_message: record.additional_message || "None",
        age_group: record.age_group,
        gender: record.gender || "Not specified",
        highest_qualification: record.highest_qualification || "Not specified"
      });
      return { ok: true, provider: "emailjs" };
    } catch (err) {
      console.error("EmailJS owner email failed:", err);
      return { ok: false, error: err };
    }
  }

  async function sendConfirmationEmailEmailJS(record) {
    if (
      typeof emailjs === "undefined" ||
      !EMAILJS_PUBLIC_KEY ||
      EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY" ||
      !EMAILJS_SERVICE_ID ||
      EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" ||
      !CONFIRMATION_TEMPLATE_ID ||
      CONFIRMATION_TEMPLATE_ID === "YOUR_CONFIRMATION_TEMPLATE_ID"
    ) {
      return { ok: false, skipped: true };
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, CONFIRMATION_TEMPLATE_ID, {
        to_email: record.email,
        to_name: record.first_name + " " + record.surname,
        first_name: record.first_name,
        selected_programme: record.selected_programme,
        reference_number: record.reference_number
      });
      return { ok: true, provider: "emailjs" };
    } catch (err) {
      console.error("EmailJS confirmation failed:", err);
      return { ok: false, error: err };
    }
  }

  /** Route emails according to EMAIL_PROVIDER */
  async function sendAllEmails(record) {
    const provider = getProvider();
    let ownerResult = { ok: false, skipped: true };
    let confirmResult = { ok: false, skipped: true };

    if (provider === "formsubmit" || provider === "both") {
      ownerResult = await sendOwnerEmailFormSubmit(record);
      // FormSubmit _autoresponse handles student confirmation
      if (ownerResult.ok && (typeof SEND_STUDENT_CONFIRMATION === "undefined" || SEND_STUDENT_CONFIRMATION)) {
        confirmResult = { ok: true, provider: "formsubmit-autoresponse" };
      }
    }

    if (provider === "emailjs" || (provider === "both" && !ownerResult.ok)) {
      const o = await sendOwnerEmailEmailJS(record);
      if (o.ok || provider === "emailjs") ownerResult = o;
      confirmResult = await sendConfirmationEmailEmailJS(record);
    }

    if (provider === "both" && ownerResult.ok && confirmResult.skipped) {
      confirmResult = await sendConfirmationEmailEmailJS(record);
    }

    return { ownerResult: ownerResult, confirmResult: confirmResult };
  }

  function showAlert(type, html) {
    const successEl = document.getElementById("reg-success");
    const errorEl = document.getElementById("reg-error");
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
      errorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.classList.add("loading");
      btn.dataset.originalHtml = btn.innerHTML;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Submitting…';
    } else {
      btn.disabled = false;
      btn.classList.remove("loading");
      if (btn.dataset.originalHtml) {
        btn.innerHTML = btn.dataset.originalHtml;
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('[type="submit"]');
    const data = getFormData(form);

    if (data.website) {
      showAlert(
        "success",
        "<strong>Registration received!</strong> Thank you. We will contact you shortly."
      );
      form.reset();
      return;
    }

    if (isRateLimited()) {
      showAlert(
        "error",
        "<strong>Please wait.</strong> You recently submitted a registration. Wait about 30 seconds before trying again."
      );
      return;
    }

    if (!validateForm(form)) {
      showAlert(
        "error",
        "<strong>Please fix the errors below.</strong> All required fields must be completed correctly."
      );
      const firstError = form.querySelector(".error");
      if (firstError) firstError.focus();
      return;
    }

    setLoading(submitBtn, true);
    showAlert("error", "");

    const now = new Date();
    const record = {
      id: "reg_" + now.getTime() + "_" + Math.random().toString(36).slice(2, 8),
      reference_number: generateReference(),
      first_name: data.first_name,
      surname: data.surname,
      email: data.email,
      mobile_number: data.mobile_number,
      whatsapp_number: data.whatsapp_number || data.mobile_number,
      age_group: data.age_group,
      gender: data.gender,
      residential_area: data.residential_area,
      highest_qualification: data.highest_qualification,
      employment_status: data.employment_status,
      selected_programme: data.selected_programme,
      learning_method: data.learning_method,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
      experience_level: data.experience_level,
      accessibility_requirements: data.accessibility_requirements,
      additional_message: data.additional_message,
      consent: data.consent,
      registration_status: "New",
      created_at: now.toISOString(),
      created_at_display: now.toLocaleString("en-ZA", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    };

    try {
      const saved = saveRegistration(record);
      if (!saved) {
        throw new Error("Could not save registration. Please try again.");
      }

      await saveToSupabase(record);

      const emailResults = await sendAllEmails(record);
      const ownerResult = emailResults.ownerResult;
      const confirmResult = emailResults.confirmResult;

      setRateLimit();
      form.reset();

      form.querySelectorAll(".error").forEach(function (el) {
        el.classList.remove("error");
      });
      form.querySelectorAll(".field-error").forEach(function (el) {
        el.classList.remove("show");
        el.textContent = "";
      });

      let emailNote = "";
      if (ownerResult.ok) {
        emailNote =
          "<br><small>A notification has been sent to Kasi Tech Hub (" +
          escapeHtml(getOwnerEmail()) +
          "). You should also receive a confirmation email shortly — please check your inbox and spam folder.</small>";
      } else if (ownerResult.skipped) {
        emailNote =
          "<br><small>Your registration was saved. Please also WhatsApp us on 079 949 1794 to confirm.</small>";
      } else {
        emailNote =
          "<br><small>Your registration was saved on this device. If our team does not reply soon, WhatsApp 079 949 1794 or email thabangseloane97@gmail.com. " +
          "(If this is the first submission on the live site, the owner must click FormSubmit’s activation link in Gmail.)</small>";
      }

      showAlert(
        "success",
        "<div><strong>✓ Registration successful!</strong><br>" +
          "Thank you, " +
          escapeHtml(record.first_name) +
          ". We have received your registration for <strong>" +
          escapeHtml(record.selected_programme) +
          "</strong>.<br><br>" +
          'Your reference number: <span class="ref-number">' +
          escapeHtml(record.reference_number) +
          "</span><br>" +
          "Please keep this reference for your records. A member of our team will contact you with further information." +
          emailNote +
          "</div>"
      );

      // Log for debugging
      console.info("Registration email results:", {
        owner: ownerResult,
        confirmation: confirmResult,
        ownerInbox: getOwnerEmail()
      });
    } catch (err) {
      console.error(err);
      showAlert(
        "error",
        "<strong>Submission failed.</strong> " +
          (err.message ||
            "Something went wrong. Please try again or contact us on WhatsApp: 079 949 1794.")
      );
    } finally {
      setLoading(submitBtn, false);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  window.kthGetRegistrations = function () {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  };

  window.kthSaveRegistrations = function (list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };
})();
