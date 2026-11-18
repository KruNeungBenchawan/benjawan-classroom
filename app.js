(() => {
  const STORAGE_KEY = "benjawan_classroom_data_v4";

  const TYPE_LABELS = {
    onet: "เว็บติวสอบ / O-NET",
    gdrive: "Google Drive",
    pdf: "PDF",
    canva: "Canva / สไลด์",
    video: "วิดีโอ",
    doc: "เอกสาร Word / Docs",
    sheet: "ตาราง / Sheets",
    link: "ลิงก์เว็บ"
  };

  const CATEGORY_ICONS = {
    all: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    "lesson-plans": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    worksheets: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>`,
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    exams: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    documents: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
  };

  const TYPE_ICONS = {
    onet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    gdrive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14"><polygon points="12 2 2 19 22 19 12 2"/></svg>`,
    pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    canva: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14"><rect x="3" y="3" width="18" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="8" y1="13" x2="16" y2="13"/></svg>`,
    sheet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
  };

  let state = {
    data: loadData(),
    teacherMode: false,
    activeCategory: "all",
    searchQuery: "",
    subjectFilter: "all",
    gradeFilter: "all",
    yearFilter: "all",
    sortBy: "newest",
    viewMode: "grid"
  };

  // DOM Elements
  const el = {
    teacherModeBtn: document.getElementById("teacherModeBtn"),
    teacherModeLabel: document.getElementById("teacherModeLabel"),
    teacherToolbar: document.getElementById("teacherToolbar"),
    addResourceBtn: document.getElementById("addResourceBtn"),
    addAnnouncementBtn: document.getElementById("addAnnouncementBtn"),
    editProfileBtn: document.getElementById("editProfileBtn"),
    exportDataBtn: document.getElementById("exportDataBtn"),
    exportDataJsBtn: document.getElementById("exportDataJsBtn"),
    importDataInput: document.getElementById("importDataInput"),
    resetDataBtn: document.getElementById("resetDataBtn"),

    profileAvatar: document.getElementById("profileAvatar"),
    profileRole: document.getElementById("profileRole"),
    profileName: document.getElementById("profileName"),
    profileSchool: document.getElementById("profileSchool"),
    profileBio: document.getElementById("profileBio"),
    statTotal: document.getElementById("statTotal"),
    statCategories: document.getElementById("statCategories"),
    statSubjects: document.getElementById("statSubjects"),

    announcementCount: document.getElementById("announcementCount"),
    announcementList: document.getElementById("announcementList"),

    categoryTabs: document.getElementById("categoryTabs"),
    searchInput: document.getElementById("searchInput"),
    subjectFilter: document.getElementById("subjectFilter"),
    gradeFilter: document.getElementById("gradeFilter"),
    yearFilter: document.getElementById("yearFilter"),
    sortSelect: document.getElementById("sortSelect"),
    gridViewBtn: document.getElementById("gridViewBtn"),
    listViewBtn: document.getElementById("listViewBtn"),

    resultsSummary: document.getElementById("resultsSummary"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    resourcesContainer: document.getElementById("resourcesContainer"),
    emptyState: document.getElementById("emptyState"),
    emptyResetBtn: document.getElementById("emptyResetBtn"),

    // Modals & Forms
    resourceModal: document.getElementById("resourceModal"),
    resourceModalTitle: document.getElementById("resourceModalTitle"),
    resourceForm: document.getElementById("resourceForm"),
    resId: document.getElementById("resId"),
    resTitle: document.getElementById("resTitle"),
    resCategory: document.getElementById("resCategory"),
    resType: document.getElementById("resType"),
    resSubject: document.getElementById("resSubject"),
    resGrade: document.getElementById("resGrade"),
    resUrl: document.getElementById("resUrl"),
    resDescription: document.getElementById("resDescription"),
    resPinned: document.getElementById("resPinned"),
    subjectSuggestions: document.getElementById("subjectSuggestions"),
    gradeSuggestions: document.getElementById("gradeSuggestions"),

    announcementModal: document.getElementById("announcementModal"),
    announcementForm: document.getElementById("announcementForm"),
    annTitle: document.getElementById("annTitle"),
    annContent: document.getElementById("annContent"),
    annDate: document.getElementById("annDate"),

    profileModal: document.getElementById("profileModal"),
    profileForm: document.getElementById("profileForm"),
    profName: document.getElementById("profName"),
    profRole: document.getElementById("profRole"),
    profSchool: document.getElementById("profSchool"),
    profBio: document.getElementById("profBio"),

    footerYear: document.getElementById("footerYear"),
    toast: document.getElementById("toast"),
    sidebarNav: document.getElementById("sidebarNav"),
    viewHome: document.getElementById("viewHome"),
    viewResources: document.getElementById("viewResources"),
    heroExploreBtn: document.getElementById("heroExploreBtn")
  };

  function cloneDefaultData() {
    return JSON.parse(JSON.stringify(window.DEFAULT_CLASSROOM_DATA));
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return cloneDefaultData();
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.resources) || !Array.isArray(parsed.categories)) {
        return cloneDefaultData();
      }
      // Ensure newly added O-NET default resources appear even if localStorage existed
      const defaults = cloneDefaultData();
      const existingIds = new Set(parsed.resources.map((r) => r.id));
      ["onet-m3-2569", "onet-p6-2569"].forEach((id) => {
        if (!existingIds.has(id)) {
          const item = defaults.resources.find((r) => r.id === id);
          if (item) parsed.resources.unshift(item);
        }
      });
      // Auto-migrate old placeholder profile to official profile
      if (parsed.profile && (parsed.profile.name === "ครูเบ็ญจวรรณ" || parsed.profile.school === "โรงเรียนตัวอย่างวิทยาคม")) {
        parsed.profile = defaults.profile;
      }
      return parsed;
    } catch {
      return cloneDefaultData();
    }
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function sanitizeUrl(url) {
    try {
      const parsed = new URL(url, window.location.href);
      if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "file:") {
        return parsed.href;
      }
    } catch {
      // invalid URL
    }
    return "#";
  }

  function formatThaiDate(isoDate) {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  let toastTimer;
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.classList.add("hidden");
    }, 2800);
  }

  function openModal(modalEl) {
    modalEl.classList.remove("hidden");
  }

  function closeModal(modalEl) {
    modalEl.classList.add("hidden");
  }

  function getCategoryName(catId) {
    const found = state.data.categories.find((c) => c.id === catId);
    return found ? found.name : "อื่นๆ";
  }

  function getUniqueValues(field) {
    const set = new Set();
    state.data.resources.forEach((r) => {
      const val = (r[field] || "").trim();
      if (val) set.add(val);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "th"));
  }

  function renderProfileAndStats() {
    const { profile, resources, categories } = state.data;
    el.profileName.textContent = profile.name || "ครูเบ็ญจวรรณ";
    el.profileRole.textContent = profile.role || "ครูผู้สอน";
    el.profileSchool.textContent = profile.school || "";
    el.profileBio.textContent = profile.bio || "";
    el.profileAvatar.textContent = profile.avatarText || (profile.name || "ครู").slice(0, 6);

    const uniqueSubjects = getUniqueValues("subject");
    el.statTotal.textContent = resources.length;
    el.statCategories.textContent = categories.length;
    el.statSubjects.textContent = uniqueSubjects.length;
  }

  function renderAnnouncements() {
    const items = [...(state.data.announcements || [])].sort((a, b) =>
      (b.date || "").localeCompare(a.date || "")
    );
    el.announcementCount.textContent = `${items.length} ประกาศ`;

    if (items.length === 0) {
      el.announcementList.innerHTML = `<li class="announcement-item"><p class="announcement-body">ยังไม่มีประกาศข่าวสารในขณะนี้</p></li>`;
      return;
    }

    el.announcementList.innerHTML = items
      .map(
        (ann) => `
      <li class="announcement-item">
        <div class="announcement-top">
          <span class="announcement-title">${escapeHtml(ann.title)}</span>
          <span class="announcement-date">${escapeHtml(formatThaiDate(ann.date))}</span>
        </div>
        ${ann.content ? `<p class="announcement-body">${escapeHtml(ann.content)}</p>` : ""}
        ${
          state.teacherMode
            ? `<button class="announcement-del" type="button" data-del-ann="${escapeHtml(ann.id)}">ลบประกาศนี้</button>`
            : ""
        }
      </li>`
      )
      .join("");
  }

  function renderCategoryTabs() {
    const counts = { all: state.data.resources.length };
    state.data.categories.forEach((c) => {
      counts[c.id] = state.data.resources.filter((r) => r.category === c.id).length;
    });

    const tabs = [
      { id: "all", name: "ทั้งหมด" },
      ...state.data.categories
    ];

    el.categoryTabs.innerHTML = tabs
      .map(
        (tab) => `
      <button
        type="button"
        role="tab"
        aria-selected="${state.activeCategory === tab.id}"
        class="cat-tab ${state.activeCategory === tab.id ? "active" : ""}"
        data-cat="${escapeHtml(tab.id)}"
      >
        <span class="cat-icon" aria-hidden="true">${CATEGORY_ICONS[tab.id] || CATEGORY_ICONS.documents}</span>
        <span>${escapeHtml(tab.name)}</span>
        <span class="cat-count">${counts[tab.id] || 0}</span>
      </button>`
      )
      .join("");
  }

  function renderFilterOptions() {
    const subjects = getUniqueValues("subject");
    const grades = getUniqueValues("grade");

    const prevSub = state.subjectFilter;
    el.subjectFilter.innerHTML =
      `<option value="all">ทุกรายวิชา</option>` +
      subjects.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
    el.subjectFilter.value = subjects.includes(prevSub) ? prevSub : "all";
    state.subjectFilter = el.subjectFilter.value;

    const prevGrade = state.gradeFilter;
    el.gradeFilter.innerHTML =
      `<option value="all">ทุกระดับชั้น</option>` +
      grades.map((g) => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join("");
    el.gradeFilter.value = grades.includes(prevGrade) ? prevGrade : "all";
    state.gradeFilter = el.gradeFilter.value;

    const years = getUniqueValues("year");
    const prevYear = state.yearFilter;
    if (el.yearFilter) {
      el.yearFilter.innerHTML =
        `<option value="all">ทุกปีการศึกษา</option>` +
        years.map((y) => `<option value="${escapeHtml(y)}">ปีการศึกษา ${escapeHtml(y)}</option>`).join("");
      el.yearFilter.value = years.includes(prevYear) ? prevYear : "all";
      state.yearFilter = el.yearFilter.value;
    }

    // Populate modal datalists & category select
    el.subjectSuggestions.innerHTML = subjects.map((s) => `<option value="${escapeHtml(s)}">`).join("");
    el.gradeSuggestions.innerHTML = grades.map((g) => `<option value="${escapeHtml(g)}">`).join("");
    el.resCategory.innerHTML = state.data.categories
      .map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`)
      .join("");
  }

  function getFilteredResources() {
    const q = state.searchQuery.trim().toLowerCase();

    const filtered = state.data.resources.filter((item) => {
      if (state.activeCategory !== "all" && item.category !== state.activeCategory) return false;
      if (state.subjectFilter !== "all" && (item.subject || "") !== state.subjectFilter) return false;
      if (state.gradeFilter !== "all" && (item.grade || "") !== state.gradeFilter) return false;
      if (state.yearFilter !== "all" && (item.year || "") !== state.yearFilter) return false;

      if (q) {
        const haystack = [
          item.title,
          item.description,
          item.subject,
          item.grade,
          getCategoryName(item.category),
          TYPE_LABELS[item.type] || ""
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (state.sortBy === "oldest") return (a.date || "").localeCompare(b.date || "");
      if (state.sortBy === "title") return (a.title || "").localeCompare(b.title || "", "th");
      return (b.date || "").localeCompare(a.date || "");
    });

    return filtered;
  }

  function renderResources() {
    const items = getFilteredResources();
    const hasFilters =
      state.activeCategory !== "all" ||
      state.subjectFilter !== "all" ||
      state.gradeFilter !== "all" ||
      state.yearFilter !== "all" ||
      state.searchQuery.trim() !== "";

    el.clearFiltersBtn.classList.toggle("hidden", !hasFilters);
    el.resultsSummary.textContent = `แสดง ${items.length} รายการ (จากทั้งหมด ${state.data.resources.length} รายการ)`;

    el.resourcesContainer.className = state.viewMode === "list" ? "resources-list" : "resources-grid";

    if (items.length === 0) {
      el.resourcesContainer.innerHTML = "";
      el.emptyState.classList.remove("hidden");
      return;
    }

    el.emptyState.classList.add("hidden");
    el.resourcesContainer.innerHTML = items
      .map((item) => {
        const safeUrl = sanitizeUrl(item.url);
        const typeKey = TYPE_LABELS[item.type] ? item.type : "link";
        const typeLabel = TYPE_LABELS[typeKey];
        const typeIcon = TYPE_ICONS[typeKey] || TYPE_ICONS.link;
        const catName = getCategoryName(item.category);

        return `
        <article class="resource-card ${item.pinned ? "pinned" : ""}">
          <div class="res-main">
            <div class="res-top">
              <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                <span class="res-cat-badge">${escapeHtml(catName)}</span>
                ${item.pinned ? `<span class="res-pin-tag">ปักหมุด</span>` : ""}
              </div>
              <span class="res-type-badge type-${escapeHtml(typeKey)}">
                ${typeIcon}
                <span>${escapeHtml(typeLabel)}</span>
              </span>
            </div>
            <h3 class="res-title">${escapeHtml(item.title)}</h3>
            ${item.description ? `<p class="res-desc">${escapeHtml(item.description)}</p>` : ""}
            <div class="res-tags">
              ${item.subject ? `<span class="tag">วิชา: ${escapeHtml(item.subject)}</span>` : ""}
              ${item.grade ? `<span class="tag">ระดับ: ${escapeHtml(item.grade)}</span>` : ""}
            </div>
          </div>
          <div class="res-footer">
            <span class="res-date">${escapeHtml(formatThaiDate(item.date))}</span>
            <div class="res-actions">
              ${
                state.teacherMode
                  ? `
                <button class="btn btn-ghost btn-sm" type="button" data-edit-res="${escapeHtml(item.id)}">แก้ไข</button>
                <button class="btn btn-danger-ghost btn-sm" type="button" data-del-res="${escapeHtml(item.id)}">ลบ</button>
              `
                  : ""
              }
              <a class="btn btn-primary btn-sm" href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">
                เปิดดูเอกสาร
              </a>
            </div>
          </div>
        </article>`;
      })
      .join("");
  }

  function renderAll() {
    renderProfileAndStats();
    renderAnnouncements();
    renderCategoryTabs();
    renderFilterOptions();
    renderResources();
  }

  function toggleTeacherMode() {
    state.teacherMode = !state.teacherMode;
    el.teacherModeBtn.classList.toggle("active", state.teacherMode);
    el.teacherToolbar.classList.toggle("hidden", !state.teacherMode);
    el.teacherModeLabel.textContent = state.teacherMode ? "ออกจากโหมดครู" : "โหมดครูผู้สอน";
    renderAnnouncements();
    renderResources();
    showToast(state.teacherMode ? "เปิดโหมดครูผู้สอนแล้ว" : "กลับสู่มุมมองผู้เยี่ยมชม");
  }

  function resetFilters() {
    state.activeCategory = "all";
    state.subjectFilter = "all";
    state.gradeFilter = "all";
    state.yearFilter = "all";
    state.searchQuery = "";
    el.searchInput.value = "";
    renderCategoryTabs();
    renderFilterOptions();
    renderResources();
  }

  function switchStageView(navType, cat = "all") {
    if (el.sidebarNav) {
      el.sidebarNav.querySelectorAll(".nav-item[data-nav]").forEach((n) => {
        const match = n.dataset.nav === navType && (navType === "home" || n.dataset.cat === cat);
        n.classList.toggle("active", match);
      });
    }

    if (navType === "home") {
      el.viewHome.classList.remove("hidden");
      el.viewResources.classList.add("hidden");
    } else {
      el.viewHome.classList.add("hidden");
      el.viewResources.classList.remove("hidden");
      state.activeCategory = cat;
      renderCategoryTabs();
      renderResources();
    }
  }

  // Event Listeners
  el.teacherModeBtn.addEventListener("click", toggleTeacherMode);

  if (el.sidebarNav) {
    el.sidebarNav.addEventListener("click", (e) => {
      const btn = e.target.closest(".nav-item[data-nav]");
      if (!btn) return;
      switchStageView(btn.dataset.nav, btn.dataset.cat || "all");
    });
  }

  if (el.heroExploreBtn) {
    el.heroExploreBtn.addEventListener("click", () => {
      switchStageView("resources", "all");
    });
  }

  el.categoryTabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.activeCategory = btn.dataset.cat;
    renderCategoryTabs();
    renderResources();
  });

  el.searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderResources();
  });

  el.subjectFilter.addEventListener("change", (e) => {
    state.subjectFilter = e.target.value;
    renderResources();
  });

  el.gradeFilter.addEventListener("change", (e) => {
    state.gradeFilter = e.target.value;
    renderResources();
  });

  if (el.yearFilter) {
    el.yearFilter.addEventListener("change", (e) => {
      state.yearFilter = e.target.value;
      renderResources();
    });
  }

  el.sortSelect.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderResources();
  });

  el.gridViewBtn.addEventListener("click", () => {
    state.viewMode = "grid";
    el.gridViewBtn.classList.add("active");
    el.listViewBtn.classList.remove("active");
    renderResources();
  });

  el.listViewBtn.addEventListener("click", () => {
    state.viewMode = "list";
    el.listViewBtn.classList.add("active");
    el.gridViewBtn.classList.remove("active");
    renderResources();
  });

  el.clearFiltersBtn.addEventListener("click", resetFilters);
  el.emptyResetBtn.addEventListener("click", resetFilters);

  // Add Resource
  el.addResourceBtn.addEventListener("click", () => {
    el.resourceModalTitle.textContent = "เพิ่มสื่อการสอน / เอกสาร";
    el.resourceForm.reset();
    el.resId.value = "";
    openModal(el.resourceModal);
  });

  // Edit / Delete Resource
  el.resourcesContainer.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit-res]");
    if (editBtn) {
      const id = editBtn.dataset.editRes;
      const item = state.data.resources.find((r) => r.id === id);
      if (!item) return;

      el.resourceModalTitle.textContent = "แก้ไขสื่อการสอน / เอกสาร";
      el.resId.value = item.id;
      el.resTitle.value = item.title || "";
      el.resCategory.value = item.category || state.data.categories[0]?.id || "";
      el.resType.value = item.type || "gdrive";
      el.resSubject.value = item.subject || "";
      el.resGrade.value = item.grade || "";
      el.resUrl.value = item.url || "";
      el.resDescription.value = item.description || "";
      el.resPinned.checked = Boolean(item.pinned);
      openModal(el.resourceModal);
      return;
    }

    const delBtn = e.target.closest("[data-del-res]");
    if (delBtn) {
      const id = delBtn.dataset.delRes;
      if (!confirm("ต้องการลบสื่อ/เอกสารรายการนี้ใช่หรือไม่?")) return;
      state.data.resources = state.data.resources.filter((r) => r.id !== id);
      saveData();
      renderAll();
      showToast("ลบรายการเรียบร้อยแล้ว");
    }
  });

  el.resourceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = el.resId.value;
    const payload = {
      id: id || `res-${Date.now()}`,
      title: el.resTitle.value.trim(),
      category: el.resCategory.value,
      type: el.resType.value,
      subject: el.resSubject.value.trim(),
      grade: el.resGrade.value.trim(),
      url: el.resUrl.value.trim(),
      description: el.resDescription.value.trim(),
      pinned: el.resPinned.checked,
      date: new Date().toISOString().slice(0, 10)
    };

    if (id) {
      const idx = state.data.resources.findIndex((r) => r.id === id);
      if (idx !== -1) {
        payload.date = state.data.resources[idx].date || payload.date;
        state.data.resources[idx] = payload;
      }
      showToast("แก้ไขข้อมูลเรียบร้อยแล้ว");
    } else {
      state.data.resources.unshift(payload);
      showToast("เพิ่มสื่อ/เอกสารใหม่เรียบร้อยแล้ว");
    }

    saveData();
    closeModal(el.resourceModal);
    renderAll();
  });

  // Announcements
  el.addAnnouncementBtn.addEventListener("click", () => {
    el.announcementForm.reset();
    el.annDate.value = new Date().toISOString().slice(0, 10);
    openModal(el.announcementModal);
  });

  el.announcementForm.addEventListener("submit", (e) => {
    e.preventDefault();
    state.data.announcements.unshift({
      id: `ann-${Date.now()}`,
      title: el.annTitle.value.trim(),
      content: el.annContent.value.trim(),
      date: el.annDate.value || new Date().toISOString().slice(0, 10)
    });
    saveData();
    closeModal(el.announcementModal);
    renderAnnouncements();
    showToast("เผยแพร่ประกาศเรียบร้อยแล้ว");
  });

  el.announcementList.addEventListener("click", (e) => {
    const delBtn = e.target.closest("[data-del-ann]");
    if (!delBtn) return;
    const id = delBtn.dataset.delAnn;
    state.data.announcements = state.data.announcements.filter((a) => a.id !== id);
    saveData();
    renderAnnouncements();
    showToast("ลบประกาศเรียบร้อยแล้ว");
  });

  // Profile Edit
  el.editProfileBtn.addEventListener("click", () => {
    const { profile } = state.data;
    el.profName.value = profile.name || "";
    el.profRole.value = profile.role || "";
    el.profSchool.value = profile.school || "";
    el.profBio.value = profile.bio || "";
    openModal(el.profileModal);
  });

  el.profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = el.profName.value.trim();
    state.data.profile = {
      ...state.data.profile,
      name,
      role: el.profRole.value.trim(),
      school: el.profSchool.value.trim(),
      bio: el.profBio.value.trim(),
      avatarText: name.slice(0, 6) || "ครู"
    };
    saveData();
    closeModal(el.profileModal);
    renderProfileAndStats();
    showToast("บันทึกข้อมูลครูผู้สอนแล้ว");
  });

  // Export / Import / Reset
  el.exportDataBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `classroom-benjawan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("ดาวน์โหลดไฟล์สำรองข้อมูลแล้ว");
  });

  if (el.exportDataJsBtn) {
    el.exportDataJsBtn.addEventListener("click", () => {
      const content = `// ข้อมูลเว็บไซต์ ห้องเรียนครูเบ็ญจวรรณ\nwindow.DEFAULT_CLASSROOM_DATA = ${JSON.stringify(state.data, null, 2)};\n`;
      const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.js";
      a.click();
      URL.revokeObjectURL(url);
      showToast("ดาวน์โหลดไฟล์ data.js สำหรับอัปโหลดขึ้นเว็บแล้ว");
    });
  }

  el.importDataInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        if (!imported.resources || !imported.categories || !imported.profile) {
          throw new Error("Invalid schema");
        }
        state.data = imported;
        saveData();
        resetFilters();
        renderAll();
        showToast("นำเข้าข้อมูลเรียบร้อยแล้ว");
      } catch {
        alert("ไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ JSON ที่สำรองจากเว็บไซต์นี้");
      } finally {
        el.importDataInput.value = "";
      }
    };
    reader.readAsText(file);
  });

  el.resetDataBtn.addEventListener("click", () => {
    if (!confirm("ต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่? (ข้อมูลที่เพิ่มเองจะหายไป)")) return;
    localStorage.removeItem(STORAGE_KEY);
    state.data = cloneDefaultData();
    resetFilters();
    renderAll();
    showToast("รีเซ็ตข้อมูลกลับเป็นค่าเริ่มต้นแล้ว");
  });

  // Modal Close Handlers
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.closeModal);
      if (target) closeModal(target);
    });
  });

  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop").forEach((m) => closeModal(m));
    }
  });

  // Init
  el.footerYear.textContent = new Date().getFullYear() + 543;
  renderAll();
})();
