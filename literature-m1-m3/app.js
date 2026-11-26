(() => {
  const DATA = window.LIT_DATA;
  const STORAGE_KEY = "benjawan_lit_m1m3_v1";

  const defaultProgress = {
    studentName: "นักเรียนคนเก่ง",
    studentGrade: "ม.1",
    avatar: "🦉",
    soundEnabled: true,
    stars: 0,
    quizBest: 0,
    matchCleared: 0,
    timelineCleared: [],
    detectiveCleared: 0,
    learnedVocabIds: []
  };

  let progress = loadProgress();

  const viewState = {
    route: "home", // home | media | detail | games | certificate
    mediaGrade: "all",
    mediaSearch: "",
    detailTopicId: null,
    erawanStep: 0,
    gameGrade: "all",
    activeGame: null, // null | quiz | vocab | timeline | detective
    lightbox: { open: false, list: [], index: 0, zoom: 100 }
  };

  // Game runtime state
  const gameState = {
    quiz: null,
    vocab: null,
    timeline: null,
    detective: null
  };

  let audioCtx = null;

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultProgress };
      const parsed = JSON.parse(raw);
      return {
        ...defaultProgress,
        ...parsed,
        timelineCleared: Array.isArray(parsed.timelineCleared) ? parsed.timelineCleared : [],
        learnedVocabIds: Array.isArray(parsed.learnedVocabIds) ? parsed.learnedVocabIds : []
      };
    } catch {
      return { ...defaultProgress };
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    syncHeader();
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function gradeLabel(g) {
    if (g === "m1") return "ม.1";
    if (g === "m2") return "ม.2";
    if (g === "m3") return "ม.3";
    return "ม.1–ม.3";
  }

  // Web Audio API Sound Effects
  function playTone(freq, duration = 0.12, type = "sine", delay = 0) {
    if (!progress.soundEnabled) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const start = audioCtx.currentTime + delay;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch {
      // Ignore audio restriction errors
    }
  }

  function sfxClick() {
    playTone(540, 0.06, "triangle");
  }

  function sfxGood() {
    playTone(523.25, 0.1, "sine", 0);
    playTone(659.25, 0.12, "sine", 0.07);
    playTone(783.99, 0.16, "sine", 0.14);
  }

  function sfxBad() {
    playTone(260, 0.14, "sawtooth", 0);
    playTone(195, 0.18, "sawtooth", 0.1);
  }

  function sfxCelebrate() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => playTone(f, 0.18, "triangle", idx * 0.08));
    spawnConfetti();
  }

  function spawnConfetti() {
    const icons = ["⭐", "✨", "🎉", "🌸", "🏆", "💫"];
    for (let i = 0; i < 18; i++) {
      const el = document.createElement("span");
      el.className = "confetti-piece";
      el.textContent = icons[i % icons.length];
      el.style.left = `${10 + Math.random() * 80}vw`;
      el.style.top = `${10 + Math.random() * 45}vh`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1250);
    }
  }

  function speakThai(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "th-TH";
      utter.rate = 0.95;
      const voices = window.speechSynthesis.getVoices();
      const thVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("th"));
      if (thVoice) utter.voice = thVoice;
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore speech errors
    }
  }

  function getRankTitle(stars) {
    if (stars >= 60) return "ปราชญ์วรรณคดีไทย 👑";
    if (stars >= 35) return "จอมยุทธ์อักษร ⚔️";
    if (stars >= 15) return "ยุวชนวรรณคดี 📚";
    return "นักอ่านฝึกหัด 🌱";
  }

  function syncHeader() {
    document.getElementById("headerStars").textContent = progress.stars;
    document.getElementById("headerAvatar").textContent = progress.avatar;
    document.getElementById("headerStudentName").textContent = progress.studentName;
    const soundBtn = document.getElementById("soundBtn");
    soundBtn.innerHTML = progress.soundEnabled ? "🔊 <span>เสียง</span>" : "🔇 <span>ปิดเสียง</span>";

    const routeForNav = viewState.route === "detail" ? "media" : viewState.route;
    document.querySelectorAll("[data-route]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.route === routeForNav);
    });
  }

  function navigate(route, opts = {}) {
    sfxClick();
    viewState.route = route;
    if (opts.mediaGrade) viewState.mediaGrade = opts.mediaGrade;
    if (opts.gameGrade) viewState.gameGrade = opts.gameGrade;
    if (opts.detailTopicId) {
      viewState.detailTopicId = opts.detailTopicId;
      viewState.erawanStep = 0;
    }
    if (opts.activeGame !== undefined) viewState.activeGame = opts.activeGame;
    syncHeader();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ===== Lightbox / Presentation Viewer =====
  function openLightbox(list, startIndex = 0) {
    sfxClick();
    viewState.lightbox = { open: true, list, index: startIndex, zoom: 100 };
    renderLightbox();
  }

  function renderLightbox() {
    const modal = document.getElementById("posterModal");
    if (!viewState.lightbox.open || !viewState.lightbox.list.length) {
      modal.classList.add("hidden");
      return;
    }
    modal.classList.remove("hidden");
    const { list, index, zoom } = viewState.lightbox;
    const item = list[index];
    document.getElementById("pmTitle").textContent = item.title || item.caption || "สื่อภาพวรรณคดีไทย";
    document.getElementById("pmCounter").textContent = `${index + 1} / ${list.length}`;
    document.getElementById("pmCaption").textContent = item.category ? `${item.category} — ${item.title}` : (item.caption || item.title || "");
    document.getElementById("pmZoomResetBtn").textContent = `${zoom}%`;

    const img = document.getElementById("pmImage");
    const stage = document.getElementById("pmStage");
    img.src = item.src;
    img.alt = item.title || item.caption || "สื่อภาพวรรณคดี";
    if (zoom === 100) {
      stage.classList.remove("zoomed");
      img.style.width = "";
      img.style.maxHeight = "82vh";
      img.style.maxWidth = "100%";
    } else {
      stage.classList.add("zoomed");
      img.style.maxHeight = "none";
      img.style.maxWidth = "none";
      img.style.width = `${zoom}%`;
    }
  }

  function stepLightbox(delta) {
    if (!viewState.lightbox.open) return;
    const len = viewState.lightbox.list.length;
    viewState.lightbox.index = (viewState.lightbox.index + delta + len) % len;
    viewState.lightbox.zoom = 100;
    sfxClick();
    renderLightbox();
  }

  function zoomLightbox(delta) {
    if (!viewState.lightbox.open) return;
    const next = Math.min(225, Math.max(100, viewState.lightbox.zoom + delta));
    viewState.lightbox.zoom = next;
    renderLightbox();
  }

  function closeLightbox() {
    viewState.lightbox.open = false;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    renderLightbox();
  }

  // ===== Render Views =====
  function render() {
    const main = document.getElementById("appMain");
    if (viewState.route === "home") {
      main.innerHTML = renderHomeView();
    } else if (viewState.route === "media") {
      main.innerHTML = renderMediaView();
    } else if (viewState.route === "detail") {
      main.innerHTML = renderDetailView();
    } else if (viewState.route === "games") {
      main.innerHTML = renderGamesView();
    } else if (viewState.route === "certificate") {
      main.innerHTML = renderCertificateView();
    }
  }

  function renderHomeView() {
    const gradeCardsHtml = DATA.GRADES.map(
      (g) => `
      <article class="grade-card ${g.accentClass}">
        <div class="grade-thumbs">
          <button type="button" class="grade-thumb-btn" data-open-single="${escapeHtml(g.cover)}" data-single-title="ปก${escapeHtml(g.title)}">
            <img src="${escapeHtml(g.cover)}" alt="ปก${escapeHtml(g.title)}" />
          </button>
          <button type="button" class="grade-thumb-btn" data-open-single="${escapeHtml(g.toc)}" data-single-title="สารบัญ${escapeHtml(g.title)}">
            <img src="${escapeHtml(g.toc)}" alt="สารบัญ${escapeHtml(g.title)}" />
          </button>
        </div>
        <div>
          <span class="grade-pill">${escapeHtml(g.label)} • ${escapeHtml(g.themeName)} • ${g.topicCount} เรื่องสำคัญ</span>
          <h3>${escapeHtml(g.title)}</h3>
          <p>${escapeHtml(g.subtitle)}</p>
        </div>
        <div class="grade-card-actions">
          <button type="button" class="cta-btn btn-soft" data-go-media="${escapeHtml(g.id)}">📖 ดูสื่อ ${escapeHtml(g.label)}</button>
          <button type="button" class="cta-btn btn-primary" data-quick-quiz="${escapeHtml(g.id)}">🎯 ควิซ ${escapeHtml(g.label)}</button>
        </div>
      </article>`
    ).join("");

    return `
      <section class="hero-grid">
        <div>
          <span class="hero-badge">✨ สื่อการสอน + เกมออนไลน์ วิชาภาษาไทย (ม.1–ม.3)</span>
          <h2 class="hero-title">อาณาจักรวรรณคดีไทย ม.1–ม.3</h2>
          <p class="hero-desc">
            รวบรวมโปสเตอร์สรุปเนื้อหา ศัพทานุกรม และ Mind Mapping ครบทั้ง 24 แผ่น พร้อมโหมดสอนขึ้นจอและเกมฝึกทักษะ 4 ด่านสำหรับนักเรียนห้องเรียนครูเบ็ญจวรรณ
          </p>
          <div class="hero-stats">
            <span class="stat-chip">🖼️ 24 สื่อภาพอินโฟกราฟิก</span>
            <span class="stat-chip">📚 15 เรื่องเด่น ม.1–ม.3</span>
            <span class="stat-chip">🎮 4 เกมฝึกทักษะ</span>
            <span class="stat-chip">📝 45 ข้อสอบ &amp; 54 คำศัพท์</span>
          </div>
          <div class="hero-actions">
            <button type="button" class="cta-btn btn-primary" id="heroMediaBtn">📚 เปิดคลังสื่อภาพ &amp; สอนขึ้นจอ</button>
            <button type="button" class="cta-btn btn-secondary" id="heroGamesBtn">🎮 เข้าโซนเกมวรรณคดี</button>
          </div>
        </div>
        <div class="hero-poster-wrap" id="heroCoverPoster" title="คลิกเพื่อขยายดูภาพปกรวม">
          <img src="images/cover-all.jpg" alt="สรุปวรรณคดี ชั้น ม.1 - ม.3" />
          <span class="poster-zoom-hint">🔍 คลิกขยายดูภาพ</span>
        </div>
      </section>

      <div class="section-heading">
        <h2><span>🧭</span> เลือกสำรวจตามระดับชั้น (ปก + สารบัญ + เนื้อหาครบชุด)</h2>
      </div>
      <section class="grades-grid">
        ${gradeCardsHtml}
      </section>

      <div class="section-heading">
        <h2><span>🎮</span> ทางลัดเข้า 4 เกมวรรณคดีหรรษา</h2>
        <button type="button" class="pill-btn" data-route-jump="games">ดูโซนเกมทั้งหมด →</button>
      </div>
      ${renderGameCardsGrid()}
    `;
  }

  function renderGameCardsGrid() {
    const games = [
      {
        id: "quiz",
        emoji: "⚔️",
        bg: "bg-q",
        title: "1. ศึกชิงจ้าววรรณคดี",
        desc: "ตอบคำถาม 4 ตัวเลือก 10 ข้อต่อรอบ พร้อมระบบ Combo และคำอธิบายเฉลยละเอียด",
        meta: `สถิติสูงสุด: ${progress.quizBest}/10`
      },
      {
        id: "vocab",
        emoji: "🃏",
        bg: "bg-v",
        title: "2. จับคู่ศัพทานุกรม & แฟลชการ์ด",
        desc: "ทายความหมายคำศัพท์วรรณคดี 54 คำ พร้อมปุ่มฟังเสียงอ่านภาษาไทย",
        meta: `พิชิตแล้ว: ${progress.matchCleared} รอบ`
      },
      {
        id: "timeline",
        emoji: "🧭",
        bg: "bg-t",
        title: "3. เรียงร้อยลำดับเหตุการณ์",
        desc: "เรียงลำดับเหตุการณ์และเส้นทางเดินเรือ 6 ภารกิจสำคัญจากสื่อภาพ",
        meta: `สำเร็จ: ${progress.timelineCleared.length}/6 ภารกิจ`
      },
      {
        id: "detective",
        emoji: "🔎",
        bg: "bg-d",
        title: "4. นักสืบวรรณคดี",
        desc: "อ่านคำใบ้ทีละข้อแล้วทายชื่อเรื่องหรือตัวละคร ยิ่งตอบไว ยิ่งได้ดาวเยอะ!",
        meta: `ไขคดีแล้ว: ${progress.detectiveCleared} คดี`
      }
    ];

    return `
      <section class="games-grid">
        ${games
          .map(
            (g) => `
          <article class="game-hub-card">
            <div class="game-emoji ${g.bg}">${g.emoji}</div>
            <h3>${g.title}</h3>
            <p>${g.desc}</p>
            <div class="game-meta-row">
              <span>${g.meta}</span>
            </div>
            <button type="button" class="cta-btn btn-navy" data-launch-game="${g.id}">เริ่มเล่นเลย ▶</button>
          </article>`
          )
          .join("")}
      </section>
    `;
  }

  function renderMediaView() {
    const gFilter = viewState.mediaGrade;
    const q = viewState.mediaSearch.trim().toLowerCase();

    const coverList = DATA.ALL_POSTERS.filter(
      (p) => (p.category === "ปกรวม" || p.category === "ปก / สารบัญ") && (gFilter === "all" || p.grade === gFilter || p.grade === "all")
    );

    const topics = DATA.TOPICS.filter((t) => {
      if (gFilter !== "all" && t.grade !== gFilter) return false;
      if (q) {
        const hay = `${t.title} ${t.subtitle} ${t.author} ${t.summary} ${t.verseForm}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return `
      <div class="section-heading" style="margin-top:4px;">
        <h2><span>📚</span> คลังสื่อภาพ &amp; สรุปวรรณคดี ม.1–ม.3 (ครบ 24 แผ่น)</h2>
        <button type="button" class="cta-btn btn-secondary" id="presentAllBtn">🖥️ โหมดพรีเซนต์ขึ้นจอ (24 ภาพ)</button>
      </div>

      <div class="filter-bar">
        <div class="filter-pills">
          ${[
            { id: "all", label: "ทั้งหมด (15 เรื่อง)" },
            { id: "m1", label: "ม.1 (5 เรื่อง)" },
            { id: "m2", label: "ม.2 (6 เรื่อง)" },
            { id: "m3", label: "ม.3 (4 เรื่อง)" }
          ]
            .map(
              (f) => `<button type="button" class="filter-pill ${gFilter === f.id ? "active" : ""}" data-media-grade="${f.id}">${f.label}</button>`
            )
            .join("")}
        </div>
        <input
          type="search"
          id="mediaSearchInput"
          class="search-input"
          placeholder="ค้นหาชื่อเรื่อง, ผู้แต่ง, คำประพันธ์..."
          value="${escapeHtml(viewState.mediaSearch)}"
        />
      </div>

      ${
        !q
          ? `
        <h3 style="margin:0 0 10px; color:#153c5c;">🖼️ ภาพปกและสารบัญประจำชั้น (${coverList.length} แผ่น)</h3>
        <div class="cover-strip">
          ${coverList
            .map(
              (p) => `
            <button type="button" class="mini-poster-card" data-open-poster-src="${escapeHtml(p.src)}">
              <img src="${escapeHtml(p.src)}" alt="${escapeHtml(p.title)}" />
              <span>${escapeHtml(p.title)}</span>
            </button>`
            )
            .join("")}
        </div>
      `
          : ""
      }

      <h3 style="margin:6px 0 12px; color:#153c5c;">📖 เรื่องสำคัญในบทเรียน (${topics.length} เรื่อง)</h3>
      <section class="topics-grid">
        ${
          topics.length
            ? topics
                .map(
                  (t) => `
              <article class="topic-card">
                <div class="topic-poster-box" data-open-poster-src="${escapeHtml(t.posters[0].src)}">
                  <img src="${escapeHtml(t.posters[0].src)}" alt="${escapeHtml(t.title)}" />
                  <span class="topic-grade-tag tag-${escapeHtml(t.grade)}">${gradeLabel(t.grade)}</span>
                  <span class="topic-poster-count">🖼️ ${t.posters.length} ภาพ</span>
                </div>
                <div class="topic-body">
                  <h3>${t.icon} ${escapeHtml(t.title)}</h3>
                  <div class="topic-meta"><strong>ผู้แต่ง:</strong> ${escapeHtml(t.author)}</div>
                  <div class="topic-meta"><strong>คำประพันธ์:</strong> ${escapeHtml(t.verseForm)}</div>
                  <p class="topic-summary">${escapeHtml(t.summary)}</p>
                  <div class="topic-actions">
                    <button type="button" class="cta-btn btn-soft" data-open-poster-src="${escapeHtml(t.posters[0].src)}">🔍 ขยายดูภาพ</button>
                    <button type="button" class="cta-btn btn-mint" data-open-detail="${escapeHtml(t.id)}">📖 อ่านสรุป</button>
                    <button type="button" class="cta-btn btn-primary full-span" data-topic-quiz="${escapeHtml(t.id)}">🎯 ติวข้อสอบเรื่องนี้</button>
                  </div>
                </div>
              </article>`
                )
                .join("")
            : `<div class="box-card" style="grid-column:1/-1; text-align:center;">ไม่พบเรื่องที่ตรงกับคำค้นหา "${escapeHtml(viewState.mediaSearch)}"</div>`
        }
      </section>
    `;
  }

  function renderDetailView() {
    const topic = DATA.TOPICS.find((t) => t.id === viewState.detailTopicId) || DATA.TOPICS[0];
    const erawanHtml = topic.erawanStats
      ? `
        <div class="erawan-explorer">
          <h4 style="margin:0 0 6px; color:#9d174d;">🐘 สำรวจความมหัศจรรย์ทวีคูณเจ็ดของช้างเอราวัณ (คลิกทีละขั้น)</h4>
          <div class="erawan-steps">
            ${topic.erawanStats
              .map(
                (st, idx) => `
              <button type="button" class="erawan-step-btn ${viewState.erawanStep === idx ? "active" : ""}" data-erawan-step="${idx}">
                <div style="font-size:1.3rem;">${st.icon}</div>
                <div style="font-weight:700; font-size:0.84rem;">${escapeHtml(st.step)}</div>
                <div style="font-size:0.8rem;">${escapeHtml(st.count)}</div>
              </button>`
              )
              .join("")}
          </div>
          <div class="erawan-detail-box">
            <strong>${escapeHtml(topic.erawanStats[viewState.erawanStep].step)}:</strong>
            ${escapeHtml(topic.erawanStats[viewState.erawanStep].count)} (เลขไทย: ${escapeHtml(topic.erawanStats[viewState.erawanStep].thaiNum)}) — ${escapeHtml(topic.erawanStats[viewState.erawanStep].formula)}
          </div>
        </div>`
      : "";

    return `
      <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; margin-bottom:16px;">
        <button type="button" class="cta-btn btn-soft" id="backToMediaBtn">← กลับคลังสื่อภาพ</button>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="cta-btn btn-primary" data-topic-quiz="${escapeHtml(topic.id)}">🎯 ทำควิซเรื่องนี้</button>
          <button type="button" class="cta-btn btn-secondary" data-open-poster-src="${escapeHtml(topic.posters[0].src)}">🖥️ เปิดโหมดขยายเต็มจอ</button>
        </div>
      </div>

      <div class="detail-layout">
        <div class="detail-poster-stack">
          ${topic.posters
            .map(
              (p) => `
            <div class="detail-poster-card" data-open-poster-src="${escapeHtml(p.src)}">
              <img src="${escapeHtml(p.src)}" alt="${escapeHtml(p.caption)}" />
              <div class="detail-poster-caption">🔍 ${escapeHtml(p.caption)} (คลิกเพื่อซูม)</div>
            </div>`
            )
            .join("")}
        </div>

        <div class="detail-info-section">
          <div>
            <span class="grade-pill tag-${escapeHtml(topic.grade)}" style="display:inline-block; margin-bottom:6px;">วรรณคดี ${gradeLabel(topic.grade)}</span>
            <h2 style="margin:0 0 4px; color:#153c5c;">${topic.icon} ${escapeHtml(topic.title)}</h2>
            <p style="margin:0; color:#475569;">${escapeHtml(topic.subtitle)}</p>
          </div>

          <div class="box-card" style="padding:14px; background:#f8fafc; box-shadow:none;">
            <div><strong>ผู้แต่ง:</strong> ${escapeHtml(topic.author)}</div>
            <div><strong>ลักษณะคำประพันธ์:</strong> ${escapeHtml(topic.verseForm)}</div>
          </div>

          <div class="detail-block">
            <h4>📝 เรื่องย่อ / สาระสำคัญ</h4>
            <p style="margin:0;">${escapeHtml(topic.summary)}</p>
          </div>

          ${erawanHtml}

          <div class="detail-block">
            <h4>⭐ จุดเน้นออกสอบบ่อย</h4>
            <ul class="detail-list">
              ${topic.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
            </ul>
          </div>

          <div class="detail-block">
            <h4>👥 ตัวละคร / บุคคลสำคัญ</h4>
            <div class="char-grid">
              ${topic.characters
                .map(
                  (c) => `
                <div class="char-item">
                  <strong>${escapeHtml(c.name)}</strong>
                  <span style="font-size:0.88rem; color:#475569;">${escapeHtml(c.role)}</span>
                </div>`
                )
                .join("")}
            </div>
          </div>

          <div class="detail-block">
            <h4>💡 ข้อคิดและคุณค่าที่ได้รับ</h4>
            <ul class="detail-list">
              ${topic.morals.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}
            </ul>
          </div>

          ${
            topic.vocab && topic.vocab.length
              ? `
            <div class="detail-block">
              <h4>📖 คำศัพท์สำคัญประจำเรื่อง</h4>
              <div class="char-grid">
                ${topic.vocab
                  .map(
                    (v) => `
                  <div class="char-item" style="background:#fffbeb; border-color:#fcd34d;">
                    <strong>${escapeHtml(v.word)}</strong>
                    <span style="font-size:0.88rem;">${escapeHtml(v.meaning)}</span>
                  </div>`
                  )
                  .join("")}
              </div>
            </div>`
              : ""
          }
        </div>
      </div>
    `;
  }

  // ===== Games View & 4 Games =====
  function renderGamesView() {
    if (!viewState.activeGame) {
      return `
        <div class="section-heading" style="margin-top:4px;">
          <h2><span>🎮</span> โซนเกมวรรณคดีไทย ม.1–ม.3 (4 เกมสุดสนุก)</h2>
        </div>

        <div class="box-card" style="margin-bottom:20px;">
          <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
            <div>
              <strong style="font-family:'Mali',sans-serif; font-size:1.05rem; color:#153c5c;">เลือกระดับชั้นที่ต้องการท้าทาย:</strong>
              <div style="font-size:0.88rem; color:#475569;">เล่นจบแต่ละด่านรับ ⭐ ดาวสะสมเพื่อปลดล็อกตำแหน่งบนเกียรติบัตร</div>
            </div>
            <div class="filter-pills">
              ${[
                { id: "all", label: "รวม ม.1–ม.3" },
                { id: "m1", label: "เฉพาะ ม.1" },
                { id: "m2", label: "เฉพาะ ม.2" },
                { id: "m3", label: "เฉพาะ ม.3" }
              ]
                .map(
                  (g) => `<button type="button" class="filter-pill ${viewState.gameGrade === g.id ? "active" : ""}" data-game-grade="${g.id}">${g.label}</button>`
                )
                .join("")}
            </div>
          </div>
        </div>

        ${renderGameCardsGrid()}
      `;
    }

    if (viewState.activeGame === "quiz") return renderQuizGame();
    if (viewState.activeGame === "vocab") return renderVocabGame();
    if (viewState.activeGame === "timeline") return renderTimelineGame();
    if (viewState.activeGame === "detective") return renderDetectiveGame();
    return "";
  }

  // --- Game 1: Quiz ---
  function startQuiz(grade = viewState.gameGrade, topicId = null) {
    let pool = DATA.QUIZ_QUESTIONS.filter((q) => (grade === "all" || q.grade === grade) && (!topicId || q.topicId === topicId));
    if (pool.length < 4 && topicId) {
      const extra = DATA.QUIZ_QUESTIONS.filter((q) => q.topicId !== topicId && (grade === "all" || q.grade === grade));
      pool = [...pool, ...shuffle(extra)];
    }
    const questions = shuffle(pool).slice(0, Math.min(10, pool.length));
    gameState.quiz = {
      grade,
      topicId,
      questions,
      index: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      selected: null,
      finished: false
    };
    viewState.route = "games";
    viewState.activeGame = "quiz";
    syncHeader();
    render();
  }

  function renderQuizGame() {
    const st = gameState.quiz;
    if (!st) {
      startQuiz(viewState.gameGrade);
      return "";
    }

    if (st.finished) {
      const total = st.questions.length;
      const pct = Math.round((st.score / total) * 100);
      return `
        <div class="game-shell box-card" style="text-align:center;">
          <div style="font-size:3rem;">🏆</div>
          <h2 style="color:#153c5c; margin:6px 0;">จบการประลอง ศึกชิงจ้าววรรณคดี!</h2>
          <p style="font-size:1.15rem; margin:6px 0;">ทำได้ <strong>${st.score} / ${total} ข้อ</strong> (${pct}%) • Combo สูงสุด ${st.maxCombo} 🔥</p>
          <p style="color:#b45309; font-weight:700;">ได้รับ +${st.earnedStars} ⭐ ดาวสะสม</p>
          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:18px;">
            <button type="button" class="cta-btn btn-primary" id="quizRetryBtn">🔄 เล่นอีกครั้ง</button>
            <button type="button" class="cta-btn btn-soft" id="backToGamesBtn">← กลับหน้าโซนเกม</button>
            <button type="button" class="cta-btn btn-secondary" data-route-jump="certificate">🏆 ดูเกียรติบัตร</button>
          </div>
        </div>
      `;
    }

    const q = st.questions[st.index];
    const pct = Math.round(((st.index + (st.selected !== null ? 1 : 0)) / st.questions.length) * 100);

    return `
      <div class="game-shell">
        <div class="game-topbar">
          <button type="button" class="cta-btn btn-soft" id="backToGamesBtn">← ออกจากเกม</button>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <span class="pill-btn">ระดับ: ${gradeLabel(st.grade)}</span>
            <span class="pill-btn">ข้อที่ ${st.index + 1}/${st.questions.length}</span>
            <span class="pill-btn stars-pill">คะแนน: ${st.score} ${st.combo >= 2 ? `• 🔥 x${st.combo}` : ""}</span>
          </div>
        </div>

        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>

        <div class="box-card">
          <span class="grade-pill tag-${escapeHtml(q.grade)}" style="display:inline-block;">${gradeLabel(q.grade)}</span>
          <div class="quiz-question-text">${escapeHtml(q.q)}</div>
          <div class="choices-grid">
            ${q.choices
              .map((c, idx) => {
                let cls = "choice-btn";
                if (st.selected !== null) {
                  if (idx === q.answer) cls += " correct";
                  else if (idx === st.selected) cls += " wrong";
                }
                return `<button type="button" class="${cls}" data-quiz-choice="${idx}" ${st.selected !== null ? "disabled" : ""}>${["ก", "ข", "ค", "ง"][idx]}. ${escapeHtml(c)}</button>`;
              })
              .join("")}
          </div>

          ${
            st.selected !== null
              ? `
            <div class="feedback-banner ${st.selected === q.answer ? "ok" : "bad"}">
              <div style="font-family:'Mali',sans-serif; font-weight:700; margin-bottom:4px;">
                ${st.selected === q.answer ? "✅ ถูกต้อง เก่งมาก!" : "❌ ยังไม่ถูกต้องนะคะ"}
              </div>
              <div>${escapeHtml(q.explain)}</div>
              <div style="margin-top:12px;">
                <button type="button" class="cta-btn btn-navy" id="quizNextBtn">
                  ${st.index + 1 < st.questions.length ? "ข้อถัดไป →" : "ดูผลคะแนน 🏆"}
                </button>
              </div>
            </div>`
              : ""
          }
        </div>
      </div>
    `;
  }

  // --- Game 2: Vocab Match & Flashcards ---
  function startVocab(grade = viewState.gameGrade, mode = "match") {
    const pool = DATA.VOCAB_LIST.filter((v) => grade === "all" || v.grade === grade);
    const pairs = shuffle(pool).slice(0, 6);
    const cards = shuffle(pool);
    gameState.vocab = {
      grade,
      mode,
      pairs,
      leftItems: shuffle(pairs.map((p) => ({ id: p.id, text: p.word, topic: p.topic }))),
      rightItems: shuffle(pairs.map((p) => ({ id: p.id, text: p.meaning }))),
      selectedLeft: null,
      matchedIds: [],
      wrongPair: null,
      mistakes: 0,
      startTime: Date.now(),
      finished: false,
      flashCards: cards,
      flashIndex: 0,
      flipped: false
    };
    viewState.route = "games";
    viewState.activeGame = "vocab";
    syncHeader();
    render();
  }

  function renderVocabGame() {
    const st = gameState.vocab;
    if (!st) {
      startVocab(viewState.gameGrade, "match");
      return "";
    }

    const modeSwitcher = `
      <div class="filter-pills" style="margin-bottom:14px;">
        <button type="button" class="filter-pill ${st.mode === "match" ? "active" : ""}" data-vocab-mode="match">🧩 โหมดจับคู่คำศัพท์</button>
        <button type="button" class="filter-pill ${st.mode === "flash" ? "active" : ""}" data-vocab-mode="flash">🃏 โหมดแฟลชการ์ดฝึกจำ</button>
      </div>
    `;

    if (st.mode === "flash") {
      const card = st.flashCards[st.flashIndex];
      const isLearned = progress.learnedVocabIds.includes(card.id);
      return `
        <div class="game-shell">
          <div class="game-topbar">
            <button type="button" class="cta-btn btn-soft" id="backToGamesBtn">← ออกจากเกม</button>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <span class="pill-btn">ระดับ: ${gradeLabel(st.grade)}</span>
              <span class="pill-btn">ใบที่ ${st.flashIndex + 1}/${st.flashCards.length}</span>
              <span class="pill-btn stars-pill">จำได้แล้ว: ${progress.learnedVocabIds.length}/${DATA.VOCAB_LIST.length}</span>
            </div>
          </div>

          ${modeSwitcher}

          <div class="box-card" style="text-align:center;">
            <div class="flashcard-stage">
              <div class="flashcard-inner ${st.flipped ? "flipped" : ""}" id="flashcardBox">
                <span class="grade-pill tag-${escapeHtml(card.grade)}" style="margin-bottom:10px;">${gradeLabel(card.grade)} • ${escapeHtml(card.topic)}</span>
                ${
                  !st.flipped
                    ? `
                  <h2 style="font-size:2rem; margin:6px 0; color:#153c5c;">${escapeHtml(card.word)}</h2>
                  <p style="color:#475569; margin:0;">👆 คลิกที่การ์ดเพื่อพลิกดูความหมาย</p>
                `
                    : `
                  <h3 style="font-size:1.25rem; margin:6px 0; color:#9d174d;">${escapeHtml(card.word)}</h3>
                  <p style="font-size:1.15rem; font-weight:600; color:#1e293b; margin:4px 0;">"${escapeHtml(card.meaning)}"</p>
                `
                }
              </div>
            </div>

            <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin-top:12px;">
              <button type="button" class="cta-btn btn-soft" id="flashPrevBtn">◀ ก่อนหน้า</button>
              <button type="button" class="cta-btn btn-soft" id="flashSpeakBtn">🔊 ฟังเสียงอ่าน</button>
              <button type="button" class="cta-btn ${isLearned ? "btn-mint" : "btn-primary"}" id="flashMarkBtn">
                ${isLearned ? "✓ จำคำนี้ได้แล้ว" : "⭐ ทำเครื่องหมายว่าจำได้"}
              </button>
              <button type="button" class="cta-btn btn-soft" id="flashNextBtn">ถัดไป ▶</button>
            </div>
          </div>
        </div>
      `;
    }

    if (st.finished) {
      const secs = Math.max(1, Math.round((st.endTime - st.startTime) / 1000));
      return `
        <div class="game-shell box-card" style="text-align:center;">
          <div style="font-size:3rem;">🎉</div>
          <h2 style="color:#153c5c; margin:6px 0;">จับคู่ศัพทานุกรมสำเร็จครบ 6 คู่!</h2>
          <p style="font-size:1.08rem;">ใช้เวลา ${secs} วินาที • ตอบพลาด ${st.mistakes} ครั้ง</p>
          <p style="color:#b45309; font-weight:700;">ได้รับ +${st.earnedStars} ⭐ ดาวสะสม</p>
          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:16px;">
            <button type="button" class="cta-btn btn-primary" id="vocabNewRoundBtn">🔄 เล่นชุดคำใหม่</button>
            <button type="button" class="cta-btn btn-soft" id="backToGamesBtn">← กลับหน้าโซนเกม</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="game-shell">
        <div class="game-topbar">
          <button type="button" class="cta-btn btn-soft" id="backToGamesBtn">← ออกจากเกม</button>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <span class="pill-btn">ระดับ: ${gradeLabel(st.grade)}</span>
            <span class="pill-btn stars-pill">จับคู่แล้ว: ${st.matchedIds.length}/6</span>
            <span class="pill-btn">พลาด: ${st.mistakes}</span>
          </div>
        </div>

        ${modeSwitcher}

        <div class="box-card">
          <p style="margin:0 0 14px; font-weight:600; color:#153c5c;">
            📌 แตะเลือก <strong>คำศัพท์ฝั่งซ้าย</strong> แล้วจับคู่กับ <strong>ความหมายฝั่งขวา</strong> ให้ครบ 6 คู่
          </p>
          <div class="match-grid">
            <div class="match-col">
              ${st.leftItems
                .map((item) => {
                  const matched = st.matchedIds.includes(item.id);
                  const selected = st.selectedLeft === item.id;
                  const shake = st.wrongPair && st.wrongPair.left === item.id;
                  return `<button type="button" class="match-card ${matched ? "matched" : ""} ${selected ? "selected" : ""} ${shake ? "shake" : ""}" data-match-left="${escapeHtml(item.id)}" ${matched ? "disabled" : ""}><strong>${escapeHtml(item.text)}</strong><div style="font-size:0.78rem; color:#64748b;">${escapeHtml(item.topic)}</div></button>`;
                })
                .join("")}
            </div>
            <div class="match-col">
              ${st.rightItems
                .map((item) => {
                  const matched = st.matchedIds.includes(item.id);
                  const shake = st.wrongPair && st.wrongPair.right === item.id;
                  return `<button type="button" class="match-card ${matched ? "matched" : ""} ${shake ? "shake" : ""}" data-match-right="${escapeHtml(item.id)}" ${matched ? "disabled" : ""}>${escapeHtml(item.text)}</button>`;
                })
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- Game 3: Timeline Sequencing ---
  function startTimeline(missionId = null) {
    const candidates = DATA.TIMELINE_MISSIONS.filter((m) => viewState.gameGrade === "all" || m.grade === viewState.gameGrade);
    const mission = DATA.TIMELINE_MISSIONS.find((m) => m.id === missionId) || candidates[0] || DATA.TIMELINE_MISSIONS[0];
    const items = mission.steps.map((text, idx) => ({ idx, text }));
    gameState.timeline = {
      mission,
      pool: shuffle(items),
      slots: Array(mission.steps.length).fill(null),
      checked: false,
      allCorrect: false
    };
    viewState.route = "games";
    viewState.activeGame = "timeline";
    syncHeader();
    render();
  }

  function renderTimelineGame() {
    const st = gameState.timeline;
    if (!st) {
      startTimeline();
      return "";
    }

    const missionPills = DATA.TIMELINE_MISSIONS.map(
      (m) => `
      <button type="button" class="filter-pill ${st.mission.id === m.id ? "active" : ""}" data-tl-mission="${escapeHtml(m.id)}">
        ${progress.timelineCleared.includes(m.id) ? "✅ " : ""}${escapeHtml(m.title)} (${gradeLabel(m.grade)})
      </button>`
    ).join("");

    const allPlaced = st.slots.every((s) => s !== null);

    return `
      <div class="game-shell">
        <div class="game-topbar">
          <button type="button" class="cta-btn btn-soft" id="backToGamesBtn">← ออกจากเกม</button>
          <span class="pill-btn stars-pill">ภารกิจสำเร็จ: ${progress.timelineCleared.length}/${DATA.TIMELINE_MISSIONS.length}</span>
        </div>

        <div class="filter-pills" style="margin-bottom:14px;">${missionPills}</div>

        <div class="box-card">
          <h3 style="margin:0 0 4px; color:#153c5c;">🧭 ${escapeHtml(st.mission.title)}</h3>
          <p style="margin:0 0 14px; color:#475569;">${escapeHtml(st.mission.subtitle)}</p>

          <div class="timeline-columns">
            <div>
              <h4 style="margin:0 0 8px; color:#153c5c;">1) เหตุการณ์ที่รอจัดเรียง (คลิกเพื่อใส่ช่อง)</h4>
              ${
                st.pool.length
                  ? st.pool
                      .map(
                        (item) => `
                    <button type="button" class="tl-pool-card" data-tl-pick="${item.idx}">
                      <span>➕</span>
                      <span>${escapeHtml(item.text)}</span>
                    </button>`
                      )
                      .join("")
                  : `<div style="padding:14px; border-radius:14px; background:#f0fdf4; color:#065f46; font-weight:700;">จัดวางเหตุการณ์ลงช่องครบแล้ว กดปุ่ม "ตรวจคำตอบ" ด้านล่างได้เลย!</div>`
              }
            </div>

            <div>
              <h4 style="margin:0 0 8px; color:#153c5c;">2) ลำดับเหตุการณ์ของคุณ (คลิกช่องเพื่อนำออก)</h4>
              ${st.slots
                .map((slot, pos) => {
                  let cls = "tl-slot";
                  if (slot) cls += " filled";
                  if (st.checked && slot) {
                    cls += slot.idx === pos ? " is-right" : " is-wrong";
                  }
                  return `
                    <button type="button" class="${cls}" data-tl-slot="${pos}" ${!slot || st.allCorrect ? "disabled" : ""}>
                      <span class="tl-num">${pos + 1}</span>
                      <span>${slot ? escapeHtml(slot.text) : "ว่างอยู่ — คลิกเหตุการณ์ฝั่งซ้ายมาวาง"}</span>
                    </button>`;
                })
                .join("")}
            </div>
          </div>

          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px;">
            <button type="button" class="cta-btn btn-primary" id="tlCheckBtn" ${!allPlaced || st.allCorrect ? "disabled" : ""}>✅ ตรวจคำตอบ</button>
            <button type="button" class="cta-btn btn-soft" id="tlResetBtn">🔄 สลับใหม่</button>
          </div>

          ${
            st.checked
              ? `
            <div class="feedback-banner ${st.allCorrect ? "ok" : "bad"}">
              ${
                st.allCorrect
                  ? `<strong>🎉 ยอดเยี่ยมมาก! เรียงลำดับเหตุการณ์ถูกต้องครบทุกขั้น!</strong> (ได้รับ +3 ⭐ ดาวสะสม)`
                  : `<strong>💡 ยังมีบางตำแหน่งสลับกันอยู่นะคะ</strong> ช่องสีแดงคือตำแหน่งที่ยังไม่ตรง ลองคลิกนำออกแล้วจัดเรียงใหม่ได้เลย`
              }
            </div>`
              : ""
          }
        </div>
      </div>
    `;
  }

  // --- Game 4: Literary Detective ---
  function startDetective(grade = viewState.gameGrade) {
    const pool = DATA.DETECTIVE_CASES.filter((c) => grade === "all" || c.grade === grade);
    const cases = shuffle(pool).slice(0, Math.min(6, pool.length));
    gameState.detective = {
      grade,
      cases,
      index: 0,
      clueLevel: 1,
      selected: null,
      scoreStars: 0,
      solvedCount: 0,
      finished: false
    };
    viewState.route = "games";
    viewState.activeGame = "detective";
    syncHeader();
    render();
  }

  function renderDetectiveGame() {
    const st = gameState.detective;
    if (!st) {
      startDetective(viewState.gameGrade);
      return "";
    }

    if (st.finished) {
      return `
        <div class="game-shell box-card" style="text-align:center;">
          <div style="font-size:3rem;">🕵️‍♀️</div>
          <h2 style="color:#153c5c; margin:6px 0;">ปิดแฟ้มคดีนักสืบวรรณคดีเรียบร้อย!</h2>
          <p style="font-size:1.12rem;">ไขคดีสำเร็จ <strong>${st.solvedCount} / ${st.cases.length} คดี</strong></p>
          <p style="color:#b45309; font-weight:700;">ได้รับ +${st.scoreStars} ⭐ ดาวสะสม</p>
          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:16px;">
            <button type="button" class="cta-btn btn-primary" id="detRetryBtn">🔄 สืบคดีรอบใหม่</button>
            <button type="button" class="cta-btn btn-soft" id="backToGamesBtn">← กลับหน้าโซนเกม</button>
          </div>
        </div>
      `;
    }

    const c = st.cases[st.index];
    const potentialStars = 4 - st.clueLevel;
    const topicRef = DATA.TOPICS.find((t) => t.id === c.topicId);

    return `
      <div class="game-shell">
        <div class="game-topbar">
          <button type="button" class="cta-btn btn-soft" id="backToGamesBtn">← ออกจากเกม</button>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <span class="pill-btn">ระดับ: ${gradeLabel(st.grade)}</span>
            <span class="pill-btn">คดีที่ ${st.index + 1}/${st.cases.length}</span>
            <span class="pill-btn stars-pill">รางวัลรอบนี้: ${potentialStars} ⭐</span>
          </div>
        </div>

        <div class="box-card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
            <span class="grade-pill tag-${escapeHtml(c.grade)}">${gradeLabel(c.grade)}</span>
            ${
              st.clueLevel < 3 && st.selected === null
                ? `<button type="button" class="pill-btn" id="detMoreClueBtn">💡 ขอคำใบ้เพิ่ม (เปิดเบาะแสที่ ${st.clueLevel + 1})</button>`
                : ""
            }
          </div>

          <h3 style="margin:0 0 10px; color:#153c5c;">🔎 เบาะแสประจำคดี:</h3>
          ${c.clues
            .slice(0, st.clueLevel)
            .map((clue, i) => `<div class="clue-card"><strong>เบาะแสที่ ${i + 1}:</strong> ${escapeHtml(clue)}</div>`)
            .join("")}

          <h4 style="margin:14px 0 10px; color:#153c5c;">คำตอบคือเรื่องหรือตัวละครใด?</h4>
          <div class="choices-grid">
            ${c.options
              .map((opt) => {
                let cls = "choice-btn";
                if (st.selected !== null) {
                  if (opt === c.answerTitle) cls += " correct";
                  else if (opt === st.selected) cls += " wrong";
                }
                return `<button type="button" class="${cls}" data-det-opt="${escapeHtml(opt)}" ${st.selected !== null ? "disabled" : ""}>${escapeHtml(opt)}</button>`;
              })
              .join("")}
          </div>

          ${
            st.selected !== null
              ? `
            <div class="feedback-banner ${st.selected === c.answerTitle ? "ok" : "bad"}">
              <div style="font-family:'Mali',sans-serif; font-weight:700; margin-bottom:4px;">
                ${
                  st.selected === c.answerTitle
                    ? `✅ ปิดคดีสำเร็จ! รับ +${potentialStars} ⭐`
                    : `❌ ยังไม่ตรง — คำตอบคือ "${escapeHtml(c.answerTitle)}"`
                }
              </div>
              <div>${escapeHtml(c.fact)}</div>
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px;">
                <button type="button" class="cta-btn btn-navy" id="detNextBtn">
                  ${st.index + 1 < st.cases.length ? "คดีถัดไป →" : "สรุปผลงานนักสืบ 🏆"}
                </button>
                ${
                  topicRef
                    ? `<button type="button" class="cta-btn btn-soft" data-open-poster-src="${escapeHtml(topicRef.posters[0].src)}">🖼️ ดูสื่อภาพเรื่องนี้</button>`
                    : ""
                }
              </div>
            </div>`
              : ""
          }
        </div>
      </div>
    `;
  }

  // ===== Certificate View =====
  function renderCertificateView() {
    const now = new Date();
    const thaiDate = now.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
    const rank = getRankTitle(progress.stars);

    return `
      <div class="cert-wrapper">
        <div class="box-card no-print" style="margin-bottom:18px;">
          <h2 style="margin:0 0 10px; color:#153c5c;">🏆 สรุปความก้าวหน้า &amp; เกียรติบัตรออนไลน์</h2>
          <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
            <span class="pill-btn stars-pill">⭐ ดาวสะสมทั้งหมด: ${progress.stars} ดาว</span>
            <span class="pill-btn">🏅 ระดับเกียรติยศ: ${escapeHtml(rank)}</span>
            <span class="pill-btn">⚔️ สถิติควิซสูงสุด: ${progress.quizBest}/10</span>
            <span class="pill-btn">🧭 ภารกิจเรียงเหตุการณ์: ${progress.timelineCleared.length}/6</span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr auto; gap:10px; align-items:end;">
            <div class="form-field" style="margin:0;">
              <label for="certNameInput">ชื่อบนเกียรติบัตร</label>
              <input type="text" id="certNameInput" value="${escapeHtml(progress.studentName)}" />
            </div>
            <div class="form-field" style="margin:0;">
              <label for="certGradeSelect">ระดับชั้น</label>
              <select id="certGradeSelect">
                <option value="ม.1" ${progress.studentGrade === "ม.1" ? "selected" : ""}>ม.1</option>
                <option value="ม.2" ${progress.studentGrade === "ม.2" ? "selected" : ""}>ม.2</option>
                <option value="ม.3" ${progress.studentGrade === "ม.3" ? "selected" : ""}>ม.3</option>
              </select>
            </div>
            <button type="button" class="cta-btn btn-primary" id="printCertBtn">🖨️ พิมพ์ / บันทึก PDF เกียรติบัตร</button>
          </div>
        </div>

        <section class="certificate-paper">
          <img src="../assets/logo-kruneung.png" alt="ตราห้องเรียนครูเบ็ญจวรรณ" class="cert-crest" />
          <div style="font-family:'Mali',sans-serif; font-weight:700; color:#b45309; font-size:0.98rem;">
            ห้องเรียนภาษาไทย ครูเบ็ญจวรรณ • โรงเรียนวัดราษฎร์บำรุง สพป.สระบุรี เขต 2
          </div>
          <h2 style="font-size:2rem; color:#153c5c; margin:8px 0 4px;">เกียรติบัตรเชิดชูเกียรติ</h2>
          <p style="margin:0 0 10px; color:#475569;">ขอมอบเกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า</p>
          <div class="cert-name">${progress.avatar} ${escapeHtml(progress.studentName)}</div>
          <div style="font-weight:700; color:#1e527c; margin-bottom:10px;">นักเรียนระดับชั้น ${escapeHtml(progress.studentGrade)}</div>
          <p style="max-width:620px; margin:0 auto 14px; font-size:1.05rem;">
            ได้ศึกษาและผ่านการฝึกทักษะในชุดสื่อการเรียนรู้ <strong>"อาณาจักรวรรณคดีไทย ม.1–ม.3"</strong>
            ด้วยความมุ่งมั่นตั้งใจ สะสมดาวได้ <strong>${progress.stars} ดาว</strong> และได้รับเกียรติยศระดับ
            <strong>${escapeHtml(rank)}</strong>
          </p>
          <div style="color:#475569; font-size:0.95rem;">ให้ไว้ ณ วันที่ ${escapeHtml(thaiDate)}</div>

          <div class="cert-signatures">
            <div>
              <div style="font-family:'Mali',sans-serif; font-weight:700; color:#153c5c; margin-top:16px;">นางสาวเบ็ญจวรรณ สิงห์กุล</div>
              <div style="font-size:0.86rem; color:#475569;">ครูผู้สอนวิชาภาษาไทย • วิทยฐานะครูชำนาญการ</div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  // ===== Event Delegation =====
  document.addEventListener("click", (e) => {
    const t = e.target;

    const routeBtn = t.closest("[data-route], [data-route-jump]");
    if (routeBtn) {
      const targetRoute = routeBtn.dataset.route || routeBtn.dataset.routeJump;
      if (targetRoute === "games") viewState.activeGame = null;
      navigate(targetRoute);
      return;
    }

    if (t.closest("#brandHomeBtn")) {
      navigate("home");
      return;
    }

    if (t.closest("#soundBtn")) {
      progress.soundEnabled = !progress.soundEnabled;
      saveProgress();
      return;
    }

    if (t.closest("#starsBtn")) {
      navigate("certificate");
      return;
    }

    if (t.closest("#profileBtn")) {
      openProfileModal();
      return;
    }

    if (t.closest("#heroMediaBtn")) {
      navigate("media");
      return;
    }

    if (t.closest("#heroGamesBtn")) {
      viewState.activeGame = null;
      navigate("games");
      return;
    }

    if (t.closest("#heroCoverPoster")) {
      openLightbox(DATA.ALL_POSTERS, 0);
      return;
    }

    const singleBtn = t.closest("[data-open-single]");
    if (singleBtn) {
      const src = singleBtn.dataset.openSingle;
      const idx = DATA.ALL_POSTERS.findIndex((p) => p.src === src);
      if (idx >= 0) openLightbox(DATA.ALL_POSTERS, idx);
      else openLightbox([{ src, title: singleBtn.dataset.singleTitle || "สื่อภาพ" }], 0);
      return;
    }

    const posterBtn = t.closest("[data-open-poster-src]");
    if (posterBtn) {
      const src = posterBtn.dataset.openPosterSrc;
      const idx = DATA.ALL_POSTERS.findIndex((p) => p.src === src);
      openLightbox(DATA.ALL_POSTERS, idx >= 0 ? idx : 0);
      return;
    }

    if (t.closest("#presentAllBtn")) {
      openLightbox(DATA.ALL_POSTERS, 0);
      return;
    }

    const goMediaBtn = t.closest("[data-go-media]");
    if (goMediaBtn) {
      navigate("media", { mediaGrade: goMediaBtn.dataset.goMedia });
      return;
    }

    const mediaGradeBtn = t.closest("[data-media-grade]");
    if (mediaGradeBtn) {
      sfxClick();
      viewState.mediaGrade = mediaGradeBtn.dataset.mediaGrade;
      render();
      return;
    }

    const detailBtn = t.closest("[data-open-detail]");
    if (detailBtn) {
      navigate("detail", { detailTopicId: detailBtn.dataset.openDetail });
      return;
    }

    if (t.closest("#backToMediaBtn")) {
      navigate("media");
      return;
    }

    const erawanBtn = t.closest("[data-erawan-step]");
    if (erawanBtn) {
      sfxClick();
      viewState.erawanStep = Number(erawanBtn.dataset.erawanStep);
      render();
      return;
    }

    const quickQuizBtn = t.closest("[data-quick-quiz]");
    if (quickQuizBtn) {
      sfxClick();
      startQuiz(quickQuizBtn.dataset.quickQuiz);
      return;
    }

    const topicQuizBtn = t.closest("[data-topic-quiz]");
    if (topicQuizBtn) {
      sfxClick();
      const topic = DATA.TOPICS.find((x) => x.id === topicQuizBtn.dataset.topicQuiz);
      startQuiz(topic ? topic.grade : "all", topic ? topic.id : null);
      return;
    }

    const gameGradeBtn = t.closest("[data-game-grade]");
    if (gameGradeBtn) {
      sfxClick();
      viewState.gameGrade = gameGradeBtn.dataset.gameGrade;
      render();
      return;
    }

    const launchBtn = t.closest("[data-launch-game]");
    if (launchBtn) {
      sfxClick();
      const g = launchBtn.dataset.launchGame;
      if (g === "quiz") startQuiz(viewState.gameGrade);
      else if (g === "vocab") startVocab(viewState.gameGrade, "match");
      else if (g === "timeline") startTimeline();
      else if (g === "detective") startDetective(viewState.gameGrade);
      return;
    }

    if (t.closest("#backToGamesBtn")) {
      sfxClick();
      viewState.activeGame = null;
      render();
      return;
    }

    // Quiz choices
    const qChoice = t.closest("[data-quiz-choice]");
    if (qChoice && gameState.quiz && gameState.quiz.selected === null) {
      const idx = Number(qChoice.dataset.quizChoice);
      const st = gameState.quiz;
      const q = st.questions[st.index];
      st.selected = idx;
      if (idx === q.answer) {
        st.score++;
        st.combo++;
        st.maxCombo = Math.max(st.maxCombo, st.combo);
        sfxGood();
      } else {
        st.combo = 0;
        sfxBad();
      }
      render();
      return;
    }

    if (t.closest("#quizNextBtn") && gameState.quiz) {
      const st = gameState.quiz;
      sfxClick();
      if (st.index + 1 < st.questions.length) {
        st.index++;
        st.selected = null;
      } else {
        st.finished = true;
        st.earnedStars = Math.max(1, Math.round(st.score / 2));
        progress.stars += st.earnedStars;
        progress.quizBest = Math.max(progress.quizBest, st.score);
        saveProgress();
        if (st.score >= 7) sfxCelebrate();
      }
      render();
      return;
    }

    if (t.closest("#quizRetryBtn") && gameState.quiz) {
      startQuiz(gameState.quiz.grade, gameState.quiz.topicId);
      return;
    }

    // Vocab game
    const vModeBtn = t.closest("[data-vocab-mode]");
    if (vModeBtn && gameState.vocab) {
      sfxClick();
      gameState.vocab.mode = vModeBtn.dataset.vocabMode;
      render();
      return;
    }

    const leftBtn = t.closest("[data-match-left]");
    if (leftBtn && gameState.vocab) {
      sfxClick();
      gameState.vocab.selectedLeft = leftBtn.dataset.matchLeft;
      gameState.vocab.wrongPair = null;
      render();
      return;
    }

    const rightBtn = t.closest("[data-match-right]");
    if (rightBtn && gameState.vocab && gameState.vocab.selectedLeft) {
      const st = gameState.vocab;
      const rightId = rightBtn.dataset.matchRight;
      if (st.selectedLeft === rightId) {
        st.matchedIds.push(rightId);
        st.selectedLeft = null;
        sfxGood();
        if (st.matchedIds.length === st.pairs.length) {
          st.finished = true;
          st.endTime = Date.now();
          st.earnedStars = st.mistakes <= 2 ? 4 : 2;
          progress.stars += st.earnedStars;
          progress.matchCleared += 1;
          saveProgress();
          sfxCelebrate();
        }
      } else {
        st.mistakes += 1;
        st.wrongPair = { left: st.selectedLeft, right: rightId };
        st.selectedLeft = null;
        sfxBad();
      }
      render();
      return;
    }

    if (t.closest("#vocabNewRoundBtn") && gameState.vocab) {
      startVocab(gameState.vocab.grade, "match");
      return;
    }

    if (t.closest("#flashcardBox") && gameState.vocab) {
      sfxClick();
      gameState.vocab.flipped = !gameState.vocab.flipped;
      render();
      return;
    }

    if (t.closest("#flashPrevBtn") && gameState.vocab) {
      const len = gameState.vocab.flashCards.length;
      gameState.vocab.flashIndex = (gameState.vocab.flashIndex - 1 + len) % len;
      gameState.vocab.flipped = false;
      sfxClick();
      render();
      return;
    }

    if (t.closest("#flashNextBtn") && gameState.vocab) {
      const len = gameState.vocab.flashCards.length;
      gameState.vocab.flashIndex = (gameState.vocab.flashIndex + 1) % len;
      gameState.vocab.flipped = false;
      sfxClick();
      render();
      return;
    }

    if (t.closest("#flashSpeakBtn") && gameState.vocab) {
      const card = gameState.vocab.flashCards[gameState.vocab.flashIndex];
      speakThai(`${card.word} หมายถึง ${card.meaning}`);
      return;
    }

    if (t.closest("#flashMarkBtn") && gameState.vocab) {
      const card = gameState.vocab.flashCards[gameState.vocab.flashIndex];
      if (!progress.learnedVocabIds.includes(card.id)) {
        progress.learnedVocabIds.push(card.id);
        progress.stars += 1;
        saveProgress();
        sfxGood();
      }
      render();
      return;
    }

    // Timeline game
    const tlMissionBtn = t.closest("[data-tl-mission]");
    if (tlMissionBtn) {
      sfxClick();
      startTimeline(tlMissionBtn.dataset.tlMission);
      return;
    }

    const tlPick = t.closest("[data-tl-pick]");
    if (tlPick && gameState.timeline) {
      const st = gameState.timeline;
      const idx = Number(tlPick.dataset.tlPick);
      const emptyPos = st.slots.findIndex((s) => s === null);
      if (emptyPos >= 0) {
        const poolIdx = st.pool.findIndex((p) => p.idx === idx);
        if (poolIdx >= 0) {
          const [picked] = st.pool.splice(poolIdx, 1);
          st.slots[emptyPos] = picked;
          st.checked = false;
          sfxClick();
          render();
        }
      }
      return;
    }

    const tlSlot = t.closest("[data-tl-slot]");
    if (tlSlot && gameState.timeline) {
      const st = gameState.timeline;
      const pos = Number(tlSlot.dataset.tlSlot);
      if (st.slots[pos] && !st.allCorrect) {
        st.pool.push(st.slots[pos]);
        st.slots[pos] = null;
        st.checked = false;
        sfxClick();
        render();
      }
      return;
    }

    if (t.closest("#tlCheckBtn") && gameState.timeline) {
      const st = gameState.timeline;
      st.checked = true;
      st.allCorrect = st.slots.every((s, pos) => s && s.idx === pos);
      if (st.allCorrect) {
        if (!progress.timelineCleared.includes(st.mission.id)) {
          progress.timelineCleared.push(st.mission.id);
        }
        progress.stars += 3;
        saveProgress();
        sfxCelebrate();
      } else {
        sfxBad();
      }
      render();
      return;
    }

    if (t.closest("#tlResetBtn") && gameState.timeline) {
      sfxClick();
      startTimeline(gameState.timeline.mission.id);
      return;
    }

    // Detective game
    if (t.closest("#detMoreClueBtn") && gameState.detective) {
      sfxClick();
      gameState.detective.clueLevel = Math.min(3, gameState.detective.clueLevel + 1);
      render();
      return;
    }

    const detOpt = t.closest("[data-det-opt]");
    if (detOpt && gameState.detective && gameState.detective.selected === null) {
      const st = gameState.detective;
      const c = st.cases[st.index];
      st.selected = detOpt.dataset.detOpt;
      if (st.selected === c.answerTitle) {
        const gained = 4 - st.clueLevel;
        st.scoreStars += gained;
        st.solvedCount += 1;
        sfxGood();
      } else {
        sfxBad();
      }
      render();
      return;
    }

    if (t.closest("#detNextBtn") && gameState.detective) {
      const st = gameState.detective;
      sfxClick();
      if (st.index + 1 < st.cases.length) {
        st.index += 1;
        st.clueLevel = 1;
        st.selected = null;
      } else {
        st.finished = true;
        progress.stars += st.scoreStars;
        progress.detectiveCleared += st.solvedCount;
        saveProgress();
        if (st.solvedCount >= 4) sfxCelebrate();
      }
      render();
      return;
    }

    if (t.closest("#detRetryBtn") && gameState.detective) {
      startDetective(gameState.detective.grade);
      return;
    }

    if (t.closest("#printCertBtn")) {
      sfxClick();
      window.print();
      return;
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.id === "mediaSearchInput") {
      viewState.mediaSearch = e.target.value;
      render();
      const input = document.getElementById("mediaSearchInput");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
    if (e.target.id === "certNameInput") {
      progress.studentName = e.target.value.trim() || "นักเรียนคนเก่ง";
      saveProgress();
      const nameEl = document.querySelector(".cert-name");
      if (nameEl) nameEl.textContent = `${progress.avatar} ${progress.studentName}`;
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.id === "certGradeSelect") {
      progress.studentGrade = e.target.value;
      saveProgress();
      render();
    }
  });

  // Lightbox Controls
  document.getElementById("pmPrevBtn").addEventListener("click", () => stepLightbox(-1));
  document.getElementById("pmNextBtn").addEventListener("click", () => stepLightbox(1));
  document.getElementById("pmZoomInBtn").addEventListener("click", () => zoomLightbox(25));
  document.getElementById("pmZoomOutBtn").addEventListener("click", () => zoomLightbox(-25));
  document.getElementById("pmZoomResetBtn").addEventListener("click", () => {
    viewState.lightbox.zoom = 100;
    renderLightbox();
  });
  document.getElementById("pmFullscreenBtn").addEventListener("click", () => {
    const modal = document.getElementById("posterModal");
    if (!document.fullscreenElement) modal.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  });
  document.getElementById("pmCloseBtn").addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (!viewState.lightbox.open) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") stepLightbox(-1);
    else if (e.key === "ArrowRight") stepLightbox(1);
  });

  // Profile Modal
  let tempAvatar = progress.avatar;
  function openProfileModal() {
    tempAvatar = progress.avatar;
    document.getElementById("profStudentName").value = progress.studentName;
    document.getElementById("profStudentGrade").value = progress.studentGrade;
    document.querySelectorAll(".avatar-choice-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.avatar === tempAvatar);
    });
    document.getElementById("profileModal").classList.remove("hidden");
  }

  document.getElementById("avatarChoices").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-avatar]");
    if (!btn) return;
    tempAvatar = btn.dataset.avatar;
    document.querySelectorAll(".avatar-choice-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.avatar === tempAvatar);
    });
  });

  document.getElementById("profCancelBtn").addEventListener("click", () => {
    document.getElementById("profileModal").classList.add("hidden");
  });

  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    progress.studentName = document.getElementById("profStudentName").value.trim() || "นักเรียนคนเก่ง";
    progress.studentGrade = document.getElementById("profStudentGrade").value;
    progress.avatar = tempAvatar;
    saveProgress();
    document.getElementById("profileModal").classList.add("hidden");
    sfxGood();
    render();
  });

  // Initialize
  syncHeader();
  render();
})();
