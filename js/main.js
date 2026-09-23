// UI interactions
(function () {
  // Loader
  window.addEventListener("load", () => {
    setTimeout(
      () => document.getElementById("loader")?.classList.add("hidden"),
      300,
    );
  });

  // Navbar scroll
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav?.classList.toggle("scrolled", window.scrollY > 50);
  });

  // Mobile menu
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");
  menuBtn?.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    navLinks.classList.toggle("open");
  });
  navLinks?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      menuBtn?.classList.remove("active");
      navLinks?.classList.remove("open");
    }),
  );

  // Active nav on scroll
  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    document.querySelectorAll(".nav-link").forEach((l) => {
      l.classList.toggle("active", l.getAttribute("href") === "#" + current);
    });
  });

  // Typing effect
  // ===== Typing effect (roles loaded from profile.json) =====
  let roles = ["Front-End Developer"]; // fallback
  const typing = document.getElementById("typing");
  let roleIdx = 0,
    charIdx = 0,
    deleting = false,
    typingStarted = false;

  function startTyping() {
    if (typingStarted || !typing) return;
    typingStarted = true;
    roleIdx = 0;
    charIdx = 0;
    deleting = false;
    type();
  }

  function type() {
    if (!typing || !roles.length) return;
    const current = roles[roleIdx];
    typing.textContent = deleting
      ? current.substring(0, charIdx--)
      : current.substring(0, charIdx++);

    if (!deleting && charIdx === current.length + 1) {
      deleting = true;
      setTimeout(type, 1600);
      return;
    }
    if (deleting && charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
    }
    setTimeout(type, deleting ? 50 : 100);
  }

  // Listen for profile data from renderer.js
  document.addEventListener("profileReady", (e) => {
    const r = e.detail?.roles;
    if (Array.isArray(r) && r.length) roles = r.filter(Boolean);
    startTyping();
  });

  // Fallback: start with default roles if profile didn't load in 1s
  setTimeout(startTyping, 1000);

  // Reveal on scroll
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  function observeReveals() {
    document
      .querySelectorAll(".reveal:not(.visible)")
      .forEach((el) => io.observe(el));
  }
  observeReveals();
  document.addEventListener("contentLoaded", observeReveals);

  // Counter animation
  const counters = document.querySelectorAll(".stat-num");
  const cObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target;
          const target = parseFloat(el.dataset.count);
          const isFloat = target % 1 !== 0;
          let current = 0;
          const step = target / 50;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = isFloat ? current.toFixed(2) : Math.floor(current);
          }, 24);
          cObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 },
  );
  counters.forEach((c) => cObserver.observe(c));

  // Contact form (mailto fallback)
  document.getElementById("contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const subject = encodeURIComponent(
      `Portfolio contact from ${fd.get("name")}`,
    );
    const body = encodeURIComponent(
      `${fd.get("message")}\n\nFrom: ${fd.get("email")}`,
    );
    window.location.href = `mailto:fitsum.tibebe.dev@gmail.com?subject=${subject}&body=${body}`;
  });

  // Year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
