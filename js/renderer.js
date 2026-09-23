// Renders dynamic content from JSON files
const Renderer = (() => {
  async function loadJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error("Not found");
      return await res.json();
    } catch (e) {
      console.warn("Failed to load", path, e);
      return null;
    }
  }

  function renderSkills(skills) {
    const el = document.getElementById("skillsContainer");
    if (!el) return;
    el.innerHTML = skills
      .map(
        (group) => `
      <div class="skill-group">
        <h4>${group.category}</h4>
        <div class="skill-tags">
          ${group.items.map((i) => `<span class="skill-tag">${i}</span>`).join("")}
        </div>
      </div>
    `,
      )
      .join("");
  }

  function renderTimeline(containerId, items, type) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = items
      .map((item) => {
        if (type === "exp") {
          return `
          <div class="timeline-item reveal">
            <h4>${item.role}</h4>
            <div class="meta">${item.company} · ${item.location} · ${item.period}</div>
            <ul>${item.points.map((p) => `<li>${p}</li>`).join("")}</ul>
          </div>`;
        }
        return `
        <div class="timeline-item reveal">
          <h4>${item.degree}</h4>
          <div class="meta">${item.school} · ${item.location} · ${item.period}</div>
          <p style="color:var(--text-muted);font-size:14px;">${item.details}</p>
        </div>`;
      })
      .join("");
  }

  function renderProjects(projects) {
    const grid = document.getElementById("projectsGrid");
    const filterBar = document.getElementById("filterBar");
    if (!grid) return;

    const allTechs = ["All", ...new Set(projects.flatMap((p) => p.tech))];
    if (filterBar) {
      filterBar.innerHTML = allTechs
        .map(
          (t) =>
            `<button class="filter-btn ${t === "All" ? "active" : ""}" data-filter="${t}">${t}</button>`,
        )
        .join("");
    }

    grid.innerHTML = projects
      .map(
        (p) => `
      <article class="project-card reveal" data-tech="${p.tech.join(",")}">
        <div class="project-image">
          <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.style.display='none'" />
          <div class="project-overlay">
            ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener" aria-label="Live"><i class="fas fa-external-link-alt"></i></a>` : ""}
            ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>` : ""}
          </div>
        </div>
        <div class="project-body">
          <h3>${p.title}</h3>
          <div class="subtitle">${p.subtitle}</div>
          <p>${p.description}</p>
          <div class="project-tech">${p.tech.map((t) => `<span class="tech-tag">${t}</span>`).join("")}</div>
        </div>
      </article>
    `,
      )
      .join("");
  }

  function renderMocks(mocks) {
    const el = document.getElementById("mocksGrid");
    if (!el) return;
    el.innerHTML = mocks
      .map(
        (m) => `
      <div class="mock-card reveal">
        <img src="${m.image}" alt="${m.title}" loading="lazy" />
        <div class="mock-body">
          <h4>${m.title}</h4>
          <p>${m.description}</p>
        </div>
      </div>
    `,
      )
      .join("");
  }

  function renderPDFs(pdfs) {
    const el = document.getElementById("pdfsGrid");
    if (!el) return;
    el.innerHTML = pdfs
      .map(
        (p) => `
      <a class="pdf-card reveal" href="${p.file}" download>
        <div class="pdf-icon"><i class="fas fa-file-pdf"></i></div>
        <div class="pdf-body">
          <h4>${p.title}</h4>
          <p>${p.description}</p>
          <span class="pdf-download">Download <i class="fas fa-arrow-down"></i></span>
        </div>
      </a>
    `,
      )
      .join("");
  }

  async function init() {
    const [profile, projects, mocks, pdfs] = await Promise.all([
      loadJSON("data/profile.json"),
      loadJSON("data/projects.json"),
      loadJSON("data/mocks.json"),
      loadJSON("data/pdfs.json"),
    ]);

    if (profile) {
      const bio = document.getElementById("bioText");
      if (bio) bio.textContent = profile.bio;
      const tag = document.getElementById("tagline");
      if (tag) tag.textContent = profile.tagline;
      const res = document.getElementById("downloadResume");
      if (res && profile.resume) res.href = profile.resume;

      renderSkills(profile.skills);
      renderTimeline("experienceContainer", profile.experience, "exp");
      renderTimeline("educationContainer", profile.education, "edu");

      // ⭐ NEW: dispatch roles to main.js
      document.dispatchEvent(
        new CustomEvent("profileReady", { detail: profile }),
      );
    }

    if (projects) renderProjects(projects.projects);
    if (mocks) renderMocks(mocks.mocks);
    if (pdfs) renderPDFs(pdfs.pdfs);

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const f = btn.dataset.filter;
        document.querySelectorAll(".project-card").forEach((card) => {
          const show = f === "All" || card.dataset.tech.includes(f);
          card.style.display = show ? "" : "none";
        });
      });
    });

    document.dispatchEvent(new Event("contentLoaded"));
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Renderer.init);
