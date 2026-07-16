/**
 * ============================================================
 * KASI TECH HUB – Main JavaScript
 * Navigation, animations, FAQ, smooth scroll, utilities
 * ============================================================
 */

(function () {
  "use strict";

  /* ---------- DOM Ready ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initSmoothScroll();
    initFAQ();
    initScrollAnimations();
    initHeaderScroll();
    initActiveNav();
    initYear();
  });

  /* ---------- Sticky header shadow ---------- */
  function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("scrolled", window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile Navigation ---------- */
  function initNav() {
    const hamburger = document.querySelector(".hamburger");
    const mobileNav = document.querySelector(".mobile-nav");
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("open");
      hamburger.classList.toggle("active", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("nav-open", isOpen);
    });

    // Close on link click
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("open")) {
        mobileNav.classList.remove("open");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
        hamburger.focus();
      }
    });
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const id = this.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          // Focus for accessibility
          if (!target.hasAttribute("tabindex")) {
            target.setAttribute("tabindex", "-1");
          }
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  /* ---------- FAQ Accordion ---------- */
  function initFAQ() {
    const items = document.querySelectorAll(".faq-item");
    items.forEach(function (item) {
      const btn = item.querySelector(".faq-question");
      if (!btn) return;

      btn.addEventListener("click", function () {
        const isActive = item.classList.contains("active");
        // Close all
        items.forEach(function (i) {
          i.classList.remove("active");
          const b = i.querySelector(".faq-question");
          if (b) b.setAttribute("aria-expanded", "false");
        });
        // Open clicked if it was closed
        if (!isActive) {
          item.classList.add("active");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------- Scroll reveal animations ---------- */
  function initScrollAnimations() {
    const els = document.querySelectorAll(".fade-up");
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Active nav link based on page ---------- */
  function initActiveNav() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";

    document.querySelectorAll(".nav-menu a, .mobile-nav a").forEach(function (link) {
      const href = link.getAttribute("href") || "";
      const linkPage = href.split("#")[0].split("/").pop();
      if (
        linkPage === page ||
        (page === "" && linkPage === "index.html") ||
        (page === "index.html" && (href === "index.html" || href === "./" || href === ""))
      ) {
        // Only mark non-hash main page links, or home
        if (!href.includes("#") || href.startsWith("index.html#") || href === "index.html") {
          if (href === "index.html" || href === page || (page === "index.html" && href.startsWith("index.html"))) {
            // handled below for sections
          }
        }
      }
    });

    // Highlight based on hash sections on homepage
    if (page === "index.html" || page === "" || page === "KASI-TECH-HUB") {
      const homeLinks = document.querySelectorAll('.nav-menu a[href="index.html"], .mobile-nav a[href="index.html"]');
      // leave default; section observer below
      initSectionObserver();
    }
  }

  function initSectionObserver() {
    const sections = document.querySelectorAll("section[id]");
    if (!sections.length || !("IntersectionObserver" in window)) return;

    const navLinks = document.querySelectorAll(".nav-menu a, .mobile-nav a");

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              const href = link.getAttribute("href") || "";
              const match =
                href === "#" + id ||
                href === "index.html#" + id ||
                href.endsWith("#" + id);
              link.classList.toggle("active", match);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (s) {
      observer.observe(s);
    });
  }

  /* ---------- Dynamic year ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Utility: programme preselect from URL or button ---------- */
  window.kthSelectProgramme = function (programmeName) {
    // Navigate to registration with programme query, or set on same page
    const form = document.getElementById("registration-form");
    const select = document.getElementById("selected_programme");

    if (select) {
      // Find matching option
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === programmeName) {
          select.selectedIndex = i;
          break;
        }
      }
      // Scroll to form
      const section = document.getElementById("registration");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
      select.focus();
      // Flash highlight
      select.style.boxShadow = "0 0 0 3px rgba(0, 194, 184, 0.4)";
      setTimeout(function () {
        select.style.boxShadow = "";
      }, 1500);
    } else {
      // Navigate to registration page with query param
      window.location.href =
        "registration.html?programme=" + encodeURIComponent(programmeName);
    }
  };

  /* ---------- Utility: request service ---------- */
  window.kthRequestService = function (serviceName) {
    const form = document.getElementById("contact-form");
    const subject = document.getElementById("contact_subject");
    const message = document.getElementById("contact_message");

    if (subject && message) {
      subject.value = "Service Request: " + serviceName;
      message.value =
        "Hello Kasi Tech Hub,\n\nI would like to request the following service: " +
        serviceName +
        ".\n\nPlease contact me with more information.\n\nThank you.";
      const section = document.getElementById("contact");
      if (section) section.scrollIntoView({ behavior: "smooth" });
      if (form) {
        const nameField = document.getElementById("contact_name");
        if (nameField) nameField.focus();
      }
    } else {
      window.location.href =
        "contact.html?service=" + encodeURIComponent(serviceName);
    }
  };

  /* ---------- Read URL params on registration / contact pages ---------- */
  window.kthApplyUrlParams = function () {
    const params = new URLSearchParams(window.location.search);
    const programme = params.get("programme");
    if (programme) {
      const select = document.getElementById("selected_programme");
      if (select) {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value === programme) {
            select.selectedIndex = i;
            break;
          }
        }
      }
    }
    const service = params.get("service");
    if (service) {
      const subject = document.getElementById("contact_subject");
      const message = document.getElementById("contact_message");
      if (subject) subject.value = "Service Request: " + service;
      if (message) {
        message.value =
          "Hello Kasi Tech Hub,\n\nI would like to request the following service: " +
          service +
          ".\n\nPlease contact me with more information.\n\nThank you.";
      }
    }
  };

  // Apply URL params if on a form page
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.kthApplyUrlParams);
  } else {
    window.kthApplyUrlParams();
  }
})();
