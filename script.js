(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const progress = document.querySelector(".scroll-progress span");
  const heroArt = document.querySelector(".hero-art");
  const yearNodes = document.querySelectorAll("[data-current-year]");
  const revealNodes = document.querySelectorAll("[data-reveal]");
  const navLinks = Array.from(document.querySelectorAll('.primary-nav a[href^="#"]'));
  const sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  yearNodes.forEach(function (node) { node.textContent = new Date().getFullYear(); });

  function setMenu(open) {
    if (!header || !menuToggle) return;
    header.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () { setMenu(!header.classList.contains("menu-open")); });
  }

  if (primaryNav) {
    primaryNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && header && header.classList.contains("menu-open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) setMenu(false);
  });

  function updateScrollState() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
    if (progress) progress.style.transform = "scaleX(" + Math.min(Math.max(ratio, 0), 1) + ")";
    if (heroArt && !reducedMotion) {
      document.documentElement.style.setProperty("--hero-shift", Math.min(window.scrollY * 0.07, 60) + "px");
    }
  }

  let scrollTicking = false;
  window.addEventListener("scroll", function () {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(function () {
      updateScrollState();
      scrollTicking = false;
    });
  }, { passive: true });
  updateScrollState();

  if (revealNodes.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealNodes.forEach(function (node) { node.classList.add("is-visible"); });
    } else {
      const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      revealNodes.forEach(function (node) { revealObserver.observe(node); });
    }
  }

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-38% 0px -48% 0px", threshold: 0 });
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  const copyButton = document.querySelector(".copy-email");
  const copyStatus = document.querySelector(".copy-status");

  function fallbackCopy(text) {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  }

  if (copyButton) {
    copyButton.addEventListener("click", async function () {
      const email = copyButton.dataset.email || "hello@rehanshaikh.dev";
      let copied = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
          copied = true;
        } else {
          copied = fallbackCopy(email);
        }
      } catch (error) {
        copied = fallbackCopy(email);
      }
      if (copyStatus) copyStatus.textContent = copied ? "Copied — see you soon." : "Select the email above.";
      copyButton.firstChild.textContent = copied ? "Copied " : "Copy email ";
      window.setTimeout(function () {
        if (copyStatus) copyStatus.textContent = "";
        copyButton.firstChild.textContent = "Copy email ";
      }, 2800);
    });
  }
})();
