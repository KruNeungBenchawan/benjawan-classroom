// ระบบควบคุมเว็บแอปบทเรียนสำเร็จรูป เรื่อง "คำคล้องจอง"
const App = (() => {
  const STORAGE_KEY = 'thai_rhyme_p2_progress_v1';

  let state = {
    currentTab: 'home',
    studentName: 'น้องคนเก่ง',
    avatarId: 'cat',
    stars: 0,
    completedLessons: [],     // ['lesson-1', ...]
    lessonQuizDone: {},       // { 'lesson-1': true }
    flippedCards: [],         // ['fc-1', ...]
    worksheetScores: {},      // { 'ws-1': { score: 8, total: 8, answers: [...] } }
    gameRecords: {
      bubble: { completedLevels: [], highScore: 0 },
      train: { completedAndPassed: false, bestScore: 0 },
      poet: { completedAndPassed: false, bestScore: 0 }
    },
    unlockedBadges: []
  };

  // Sub-view states
  let activeLessonIndex = 0;
  let activeMediaSubTab = 'flashcards'; // 'flashcards' | 'lab' | 'finder'
  let activeFlashcardCategory = 'ทั้งหมด';
  let activeWorksheetIndex = 0;
  let currentWsAnswers = {}; // { 'ws-1': { 0: 1, 1: 2, ... } }
  let currentWsSubmitted = {}; // { 'ws-1': true/false }
  let printWithAnswers = false;

  // Game states
  let activeGameId = 'bubble'; // 'bubble' | 'train' | 'poet'
  let bubbleState = {
    levelIndex: 0,
    selectedLeft: null,
    matchedPairs: [],
    shuffledRight: [],
    mistakes: 0
  };
  let trainState = {
    stageIndex: 0,
    score: 0,
    answered: false,
    selectedOption: null,
    finished: false
  };
  let poetState = {
    quizIndex: 0,
    score: 0,
    answered: false,
    selectedOption: null,
    finished: false
  };

  function getInitialState() {
    return {
      currentTab: 'home',
      studentName: 'น้องคนเก่ง',
      avatarId: 'cat',
      stars: 0,
      completedLessons: [],
      lessonQuizDone: {},
      flippedCards: [],
      worksheetScores: {},
      gameRecords: {
        bubble: { completedLevels: [], highScore: 0 },
        train: { completedAndPassed: false, bestScore: 0 },
        poet: { completedAndPassed: false, bestScore: 0 }
      },
      unlockedBadges: []
    };
  }

  // ล้างค่าสถิติเดิมทุกครั้งที่เปิดเข้าเว็บใหม่ เพื่อให้เริ่มรอบใหม่เสมอ
  function loadState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    state = getInitialState();
    currentWsAnswers = {};
    currentWsSubmitted = {};
  }

  function saveState() {
    updateHeaderUI();
  }

  function addStars(amount, reasonText = '') {
    state.stars += amount;
    saveState();
    checkAndUnlockBadges(true);
    if (reasonText) {
      showToast(`⭐ +${amount} ดาว! ${reasonText}`);
    }
  }

  function checkAndUnlockBadges(notify = true) {
    const newlyUnlocked = [];

    // 1. เรียนเนื้อหาครบ
    if (
      state.completedLessons.length >= APP_DATA.lessons.length &&
      !state.unlockedBadges.includes('badge-lesson')
    ) {
      state.unlockedBadges.push('badge-lesson');
      newlyUnlocked.push('นักอ่านคำคล้องจอง 🎓');
    }

    // 2. เปิดบัตรคำอย่างน้อย 4 ใบ
    if (
      state.flippedCards.length >= 4 &&
      !state.unlockedBadges.includes('badge-media')
    ) {
      state.unlockedBadges.push('badge-media');
      newlyUnlocked.push('นักสำรวจบัตรคำ 🃏');
    }

    // 3. ทำใบงานผ่านอย่างน้อย 1 ชุด (คะแนน >= 5)
    const hasPassedWs = Object.values(state.worksheetScores).some(w => w && w.score >= 5);
    if (hasPassedWs && !state.unlockedBadges.includes('badge-ws')) {
      state.unlockedBadges.push('badge-ws');
      newlyUnlocked.push('แชมป์ใบงานคำคล้องจอง 📝');
    }

    // 4. เกมลูกโป่ง
    if (
      state.gameRecords.bubble.completedLevels &&
      state.gameRecords.bubble.completedLevels.length >= 1 &&
      !state.unlockedBadges.includes('badge-bubble')
    ) {
      state.unlockedBadges.push('badge-bubble');
      newlyUnlocked.push('มือโปรจับคู่ลูกโป่ง 🎈');
    }

    // 5. เกมรถไฟ
    if (
      state.gameRecords.train.bestScore >= 4 &&
      !state.unlockedBadges.includes('badge-train')
    ) {
      state.unlockedBadges.push('badge-train');
      newlyUnlocked.push('นายสถานีรถไฟคำคล้องจอง 🚂');
    }

    // 6. เกมกวีตัวน้อย
    if (
      state.gameRecords.poet.bestScore >= 4 &&
      !state.unlockedBadges.includes('badge-poet')
    ) {
      state.unlockedBadges.push('badge-poet');
      newlyUnlocked.push('กวีเอกคนเก่ง 👑');
    }

    if (newlyUnlocked.length > 0) {
      saveState();
      if (notify) {
        SoundSystem.playFanfare();
        showToast(`🏅 ปลดล็อกเหรียญรางวัลใหม่: ${newlyUnlocked.join(', ')}`);
      }
    }
  }

  function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'animate-pop bg-indigo-950 text-white px-5 py-3 rounded-2xl shadow-xl border-2 border-amber-400 font-kid text-sm md:text-base flex items-center gap-2';
    el.innerHTML = `<span>✨</span><span>${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  function getAvatarObj() {
    return APP_DATA.avatars.find(a => a.id === state.avatarId) || APP_DATA.avatars[0];
  }

  function updateHeaderUI() {
    const avatar = getAvatarObj();
    const avatarEl = document.getElementById('header-avatar');
    const nameEl = document.getElementById('header-student-name');
    const starEl = document.getElementById('header-stars');
    const soundBtn = document.getElementById('header-sound-btn');

    if (avatarEl) avatarEl.textContent = avatar.emoji;
    if (nameEl) nameEl.textContent = state.studentName;
    if (starEl) starEl.textContent = state.stars;
    if (soundBtn) {
      soundBtn.innerHTML = SoundSystem.isSoundEnabled()
        ? '🔊 <span class="hidden lg:inline">เสียงเปิด</span>'
        : '🔇 <span class="hidden lg:inline">ปิดเสียง</span>';
    }

    // Update active nav pills
    document.querySelectorAll('[data-nav-tab]').forEach(btn => {
      const tab = btn.getAttribute('data-nav-tab');
      if (tab === state.currentTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // เปลี่ยนหน้าแท็บหลัก
  function navigate(tab, subParam = null) {
    SoundSystem.playClick();
    state.currentTab = tab;
    if (tab === 'lessons' && typeof subParam === 'number') {
      activeLessonIndex = subParam;
    }
    if (tab === 'worksheets' && typeof subParam === 'number') {
      activeWorksheetIndex = subParam;
    }
    if (tab === 'games' && typeof subParam === 'string') {
      activeGameId = subParam;
    }
    updateHeaderUI();
    renderMainContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderMainContent() {
    const main = document.getElementById('app-main');
    if (!main) return;

    switch (state.currentTab) {
      case 'home':
        main.innerHTML = renderHomeView();
        break;
      case 'lessons':
        main.innerHTML = renderLessonsView();
        break;
      case 'media':
        main.innerHTML = renderMediaView();
        break;
      case 'worksheets':
        main.innerHTML = renderWorksheetsView();
        break;
      case 'games':
        main.innerHTML = renderGamesView();
        break;
      case 'certificate':
        main.innerHTML = renderCertificateView();
        break;
      case 'parents':
        main.innerHTML = renderParentsView();
        break;
      default:
        main.innerHTML = renderHomeView();
    }
  }

  // ==========================================
  // VIEW 1: หน้าแรก (HOME)
  // ==========================================
  function renderHomeView() {
    const avatar = getAvatarObj();
    const totalLessons = APP_DATA.lessons.length;
    const doneLessons = state.completedLessons.length;
    const totalWs = APP_DATA.worksheets.length;
    const doneWs = Object.keys(state.worksheetScores).length;
    const badgeCount = state.unlockedBadges.length;

    return `
      <div class="space-y-6 md:space-y-8">
        <!-- Hero Banner -->
        <section class="kid-card bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-4 sm:p-6 md:p-8 border-indigo-300 relative overflow-hidden">
          <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-6">
            <div class="space-y-2.5 sm:space-y-3 text-center lg:text-left max-w-2xl w-full">
              <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-kid">
                <span>✨ บทเรียนสำเร็จรูป วิชาภาษาไทย เรื่อง คำคล้องจอง</span>
              </div>
              <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                ตะลุยโลก <span class="text-amber-300 underline decoration-wavy decoration-amber-300">คำคล้องจอง</span> แสนสนุก!
              </h1>
              <p class="text-indigo-100 text-sm sm:text-base md:text-lg leading-relaxed">
                เรียนรู้คำคล้องจอง 1 พยางค์, 2 พยางค์, 3 พยางค์ และบทร้อยกรองแสนสนุก
                พร้อมเสียงอ่านธรรมชาติ สื่อบัตรคำ ใบงานตรวจอัตโนมัติ และเกมฝึกทักษะครบชุด!
              </p>
              <div class="pt-1 sm:pt-2 grid grid-cols-1 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
                <button onclick="App.navigate('lessons', 0)" class="kid-btn bg-amber-400 hover:bg-amber-300 text-slate-900 px-5 py-3 text-base sm:text-lg border-amber-600 w-full sm:w-auto">
                  🚀 เริ่มเรียนบทที่ 1 เลย!
                </button>
                <button onclick="App.navigate('games', 'bubble')" class="kid-btn bg-white/95 hover:bg-white text-indigo-700 px-5 py-3 text-sm sm:text-base border-indigo-200 w-full sm:w-auto">
                  🎮 เข้าสู่ห้องเกมหรรษา
                </button>
                <button onclick="App.openProfileModal()" class="kid-btn bg-indigo-800/70 hover:bg-indigo-800 text-white px-4 py-2.5 sm:py-3 text-xs sm:text-sm border-indigo-400 w-full sm:w-auto">
                  ${avatar.emoji} ตั้งค่าชื่อ / เสียงอ่าน
                </button>
              </div>
            </div>

            <!-- Chibi Mascot + Student Progress Summary Card -->
            <div class="flex flex-col sm:flex-row lg:flex-col items-center gap-3 w-full lg:w-80 shrink-0">
              <div class="relative bg-white/95 rounded-3xl p-2 border-4 border-pink-300 shadow-xl flex items-center gap-3 w-full">
                <img src="chibi-games.jpg" alt="การ์ตูน Chibi คำคล้องจองหรรษา" class="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-200 shrink-0" />
                <div class="text-slate-800 min-w-0">
                  <div class="inline-block bg-pink-100 text-pink-700 font-kid font-bold text-xs px-2.5 py-0.5 rounded-full mb-1">🌟 ห้องเรียน Chibi</div>
                  <div class="font-kid font-bold text-sm text-indigo-950 leading-snug">มาเก็บดาวสะสมให้ครบทุกด่านเลยนะ!</div>
                </div>
              </div>
              <div class="bg-white/95 text-slate-800 rounded-3xl p-4 sm:p-5 w-full shadow-xl border-4 border-amber-300">
              <div class="flex items-center gap-3 pb-3 border-b border-slate-200">
                <button onclick="App.openProfileModal()" class="text-3xl sm:text-4xl bg-amber-100 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 border-amber-300 hover:scale-105 transition shrink-0">
                  ${avatar.emoji}
                </button>
                <div class="min-w-0">
                  <div class="text-xs text-slate-500 font-medium">สมุดพกของคนเก่ง</div>
                  <div class="font-kid font-bold text-base sm:text-lg text-indigo-900 truncate">${escapeHtml(state.studentName)}</div>
                  <div class="inline-flex items-center gap-1 text-amber-600 font-bold text-xs sm:text-sm">
                    ⭐ สะสมได้ ${state.stars} ดาว
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2 pt-3 text-center">
                <div class="bg-indigo-50 rounded-xl p-2">
                  <div class="text-xs text-slate-500">บทเรียน</div>
                  <div class="font-kid font-bold text-indigo-700 text-base sm:text-lg">${doneLessons}/${totalLessons}</div>
                </div>
                <div class="bg-pink-50 rounded-xl p-2">
                  <div class="text-xs text-slate-500">ใบงาน</div>
                  <div class="font-kid font-bold text-pink-600 text-base sm:text-lg">${doneWs}/${totalWs}</div>
                </div>
                <div class="bg-amber-50 rounded-xl p-2">
                  <div class="text-xs text-slate-500">เหรียญ</div>
                  <div class="font-kid font-bold text-amber-600 text-base sm:text-lg">${badgeCount}/${APP_DATA.badges.length}</div>
                </div>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <button onclick="App.navigate('certificate')" class="kid-btn bg-emerald-500 hover:bg-emerald-400 text-white py-2 text-xs sm:text-sm">
                  🏆 เกียรติบัตร
                </button>
                <button onclick="App.resetAllProgress()" class="kid-btn bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-300 py-2 text-xs sm:text-sm">
                  🔄 เริ่มรอบใหม่
                </button>
              </div>
            </div>
            </div>
          </div>
        </section>

        <!-- 4 Main Learning Zones (2x2 Grid on Mobile/Tablet, 4 cols on Desktop) -->
        <section>
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <h2 class="text-lg sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span>🗺️</span> แผนที่การเรียนรู้ครบวงจร (เลือกกิจกรรมได้เลย)
            </h2>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <!-- Zone 1: Lessons -->
            <div onclick="App.navigate('lessons')" class="kid-card kid-card-interactive p-3.5 sm:p-6 cursor-pointer border-indigo-200 bg-gradient-to-b from-white to-indigo-50/60 flex flex-col justify-between">
              <div>
                <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-indigo-100 text-2xl sm:text-3xl flex items-center justify-center mb-2.5 sm:mb-4 border-2 border-indigo-200">
                  📖
                </div>
                <span class="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">ส่วนที่ 1 • เนื้อหา</span>
                <h3 class="text-base sm:text-xl font-bold text-indigo-950 mt-1.5 sm:mt-2">บทเรียนคำคล้องจอง</h3>
                <p class="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-3 sm:line-clamp-none">
                  ครบทั้ง 1 พยางค์, 2 พยางค์, 3 พยางค์ และบทร้อยกรอง พร้อมเสียงอ่าน
                </p>
              </div>
              <div class="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-indigo-100 flex items-center justify-between text-indigo-700 font-kid font-bold text-xs sm:text-sm">
                <span>${doneLessons}/${totalLessons} บท</span>
                <span>เข้าเรียน →</span>
              </div>
            </div>

            <!-- Zone 2: Teaching Media -->
            <div onclick="App.navigate('media')" class="kid-card kid-card-interactive p-3.5 sm:p-6 cursor-pointer border-amber-200 bg-gradient-to-b from-white to-amber-50/60 flex flex-col justify-between">
              <div>
                <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 text-2xl sm:text-3xl flex items-center justify-center mb-2.5 sm:mb-4 border-2 border-amber-200">
                  🃏
                </div>
                <span class="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">ส่วนที่ 2 • สื่อการสอน</span>
                <h3 class="text-base sm:text-xl font-bold text-amber-950 mt-1.5 sm:mt-2">บัตรคำ & ห้องทดลอง</h3>
                <p class="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-3 sm:line-clamp-none">
                  บัตรคำ 3 มิติพลิกดูคำคล้องจอง และเครื่องมือตรวจคู่คำแบบโต้ตอบ
                </p>
              </div>
              <div class="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-amber-100 flex items-center justify-between text-amber-700 font-kid font-bold text-xs sm:text-sm">
                <span>${APP_DATA.flashcards.length} ชุด</span>
                <span>เปิดสื่อ →</span>
              </div>
            </div>

            <!-- Zone 3: Worksheets -->
            <div onclick="App.navigate('worksheets')" class="kid-card kid-card-interactive p-3.5 sm:p-6 cursor-pointer border-pink-200 bg-gradient-to-b from-white to-pink-50/60 flex flex-col justify-between">
              <div>
                <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-pink-100 text-2xl sm:text-3xl flex items-center justify-center mb-2.5 sm:mb-4 border-2 border-pink-200">
                  📝
                </div>
                <span class="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-pink-100 text-pink-700 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">ส่วนที่ 3 • ใบงาน</span>
                <h3 class="text-base sm:text-xl font-bold text-pink-950 mt-1.5 sm:mt-2">ใบงาน & พิมพ์ A4</h3>
                <p class="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-3 sm:line-clamp-none">
                  แบบฝึกหัด 4 ชุด 32 ข้อ ทำบนเว็บตรวจทันที หรือสั่งพิมพ์กระดาษ A4
                </p>
              </div>
              <div class="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-pink-100 flex items-center justify-between text-pink-700 font-kid font-bold text-xs sm:text-sm">
                <span>${doneWs}/${totalWs} ชุด</span>
                <span>ทำใบงาน →</span>
              </div>
            </div>

            <!-- Zone 4: Games -->
            <div onclick="App.navigate('games')" class="kid-card kid-card-interactive p-3.5 sm:p-6 cursor-pointer border-emerald-200 bg-gradient-to-b from-white to-emerald-50/60 flex flex-col justify-between">
              <div>
                <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 text-2xl sm:text-3xl flex items-center justify-center mb-2.5 sm:mb-4 border-2 border-emerald-200">
                  🎮
                </div>
                <span class="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">ส่วนที่ 4 • เกม</span>
                <h3 class="text-base sm:text-xl font-bold text-emerald-950 mt-1.5 sm:mt-2">3 เกมหรรษา</h3>
                <p class="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-3 sm:line-clamp-none">
                  เกมจับคู่ลูกโป่ง เกมต่อขบวนรถไฟ และเกมกวีตัวน้อยต่อกลอนสั้นๆ
                </p>
              </div>
              <div class="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-emerald-100 flex items-center justify-between text-emerald-700 font-kid font-bold text-xs sm:text-sm">
                <span>3 เกมสนุก</span>
                <span>เล่นเกม →</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Lesson Cards -->
        <section class="kid-card p-4 sm:p-6 border-slate-200">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-slate-800">📚 สารบัญบทเรียนเรื่องคำคล้องจอง</h2>
              <p class="text-xs sm:text-sm text-slate-500">ผู้ปกครองและคุณครูสามารถเลือกเปิดทีละบทให้นักเรียนฟังเสียงและฝึกสังเกตคำสัมผัสได้เลยครับ</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            ${APP_DATA.lessons.map((lesson, idx) => {
              const isDone = state.completedLessons.includes(lesson.id);
              return `
                <div onclick="App.navigate('lessons', ${idx})" class="p-4 rounded-2xl border-2 ${isDone ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/60'} hover:border-indigo-400 cursor-pointer transition flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between">
                      <span class="text-2xl">${lesson.icon}</span>
                      ${isDone
                        ? '<span class="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">✅ เรียนแล้ว</span>'
                        : '<span class="text-xs font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">บทที่ ' + lesson.number + '</span>'
                      }
                    </div>
                    <h4 class="font-bold text-slate-800 mt-2">${lesson.title}</h4>
                    <p class="text-xs text-slate-500 mt-1">${lesson.subtitle}</p>
                  </div>
                  <div class="mt-3 text-xs font-kid font-bold text-indigo-600">คลิกเพื่อเข้าบทเรียน →</div>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <!-- Badges & Parent Guide Banner -->
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <div class="lg:col-span-2 kid-card p-4 sm:p-6">
            <h3 class="text-lg sm:text-xl font-bold text-slate-800 mb-3">🏅 ตู้โชว์เหรียญรางวัลของคนเก่ง</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
              ${APP_DATA.badges.map(b => {
                const unlocked = state.unlockedBadges.includes(b.id);
                return `
                  <div class="p-3 rounded-2xl border-2 flex items-center gap-3 ${unlocked ? 'border-amber-300 bg-amber-50/70' : 'border-slate-200 bg-slate-100 opacity-60'}">
                    <div class="text-3xl ${unlocked ? '' : 'grayscale'}">${b.icon}</div>
                    <div>
                      <div class="font-kid font-bold text-sm text-slate-800">${b.title}</div>
                      <div class="text-xs text-slate-500">${b.desc}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="kid-card p-4 sm:p-6 bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-200 flex flex-col justify-between">
            <div>
              <div class="inline-flex items-center gap-1.5 bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                👨‍👩‍👧 สำหรับผู้ปกครองและคุณครู
              </div>
              <h3 class="text-lg sm:text-xl font-bold text-slate-800">คู่มือผู้ปกครอง & เฉลยใบงาน</h3>
              <p class="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                ดูเทคนิคการช่วยทบทวนเรื่องคำคล้องจองให้ลูกเข้าใจง่าย ตรวจดูคะแนนรายใบงาน และเปิดดูเฉลยละเอียดครบทั้ง 4 ชุด
              </p>
            </div>
            <button onclick="App.navigate('parents')" class="mt-4 kid-btn bg-sky-600 hover:bg-sky-500 text-white py-3 px-4 w-full text-sm">
              📊 เปิดมุมผู้ปกครองและดูผลคะแนน
            </button>
          </div>
        </section>
      </div>
    `;
  }

  // ==========================================
  // VIEW 2: บทเรียนความรู้ (LESSONS)
  // ==========================================
  function renderLessonsView() {
    const lesson = APP_DATA.lessons[activeLessonIndex] || APP_DATA.lessons[0];
    const isCompleted = state.completedLessons.includes(lesson.id);
    const quizDone = !!state.lessonQuizDone[lesson.id];

    return `
      <div class="space-y-4 sm:space-y-6">
        <!-- Lesson Selector Bar (2x2 Grid on Mobile, Flex row on Desktop) -->
        <div class="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div class="grid grid-cols-2 lg:flex lg:flex-wrap gap-2">
            ${APP_DATA.lessons.map((l, idx) => {
              const active = idx === activeLessonIndex;
              const done = state.completedLessons.includes(l.id);
              return `
                <button onclick="App.selectLesson(${idx})" class="kid-btn px-2.5 sm:px-4 py-2 text-xs sm:text-sm justify-start lg:justify-center ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-800'
                    : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 border-slate-300'
                }">
                  <span class="shrink-0">${l.icon}</span>
                  <span class="truncate">บทที่ ${l.number}: ${l.title}</span>
                  ${done ? '<span class="ml-auto lg:ml-1 shrink-0">✅</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Lesson Main Card -->
        <div class="kid-card p-4 sm:p-6 md:p-8 border-indigo-200 space-y-5 sm:space-y-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b-2 border-dashed border-slate-200">
            <div>
              <div class="inline-flex items-center gap-2 text-xs font-bold uppercase bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                บทเรียนที่ ${lesson.number} จาก ${APP_DATA.lessons.length}
              </div>
              <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-950 mt-2 flex items-center gap-2">
                <span>${lesson.icon}</span>
                <span>${lesson.title}</span>
              </h2>
              <p class="text-xs sm:text-sm md:text-base text-slate-600 mt-1">${lesson.subtitle}</p>
            </div>
            <button onclick="SoundSystem.speakThai('${escapeQuotes(lesson.title + ' ' + lesson.summary)}')" class="kid-btn bg-amber-400 hover:bg-amber-300 text-slate-900 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm w-full md:w-auto shrink-0">
              🔊 ฟังคำอธิบายบทเรียน
            </button>
          </div>

          <!-- Summary Box -->
          <div class="bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
            <div class="text-2xl sm:text-3xl shrink-0">💡</div>
            <div>
              <div class="font-kid font-bold text-indigo-900 text-base sm:text-lg">สรุปหลักการสำคัญ</div>
              <p class="text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed mt-1">${lesson.summary}</p>
            </div>
          </div>

          <!-- Lesson-specific content -->
          ${lesson.keyRules ? renderLesson1Rules(lesson.keyRules) : ''}
          ${lesson.chains ? renderLesson2Chains(lesson.chains) : ''}
          ${lesson.threeSylChains ? renderLesson3Chains(lesson.threeSylChains) : ''}
          ${lesson.poems ? renderLesson4Poems(lesson.poems) : ''}

          <!-- Tip Box -->
          <div class="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm md:text-base text-amber-900 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <span>${lesson.tipBox}</span>
            <button onclick="SoundSystem.speakThai('${escapeQuotes(lesson.tipBox)}')" class="kid-btn bg-white hover:bg-amber-100 text-amber-900 px-3 py-1.5 text-xs shrink-0 border-amber-300 w-full sm:w-auto">
              🔊 ฟังเทคนิค
            </button>
          </div>

          <!-- Mini Check or Mark Complete -->
          ${lesson.miniCheck ? renderLessonMiniCheck(lesson, quizDone) : ''}

          <!-- Bottom Navigation -->
          <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              ${activeLessonIndex > 0 ? `
                <button onclick="App.selectLesson(${activeLessonIndex - 1})" class="kid-btn bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2.5 text-sm w-full sm:w-auto">
                  ← บทก่อนหน้า
                </button>
              ` : ''}
            </div>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              ${!isCompleted ? `
                <button onclick="App.completeCurrentLesson()" class="kid-btn bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-3 text-sm sm:text-base w-full sm:w-auto">
                  ✅ บันทึกว่าเรียนจบบทนี้แล้ว (+5 ดาว)
                </button>
              ` : `
                <span class="inline-flex items-center justify-center gap-1.5 bg-emerald-100 text-emerald-800 font-kid font-bold px-4 py-2 rounded-xl text-sm">
                  ✅ เรียนจบบทนี้เรียบร้อยแล้ว!
                </span>
              `}
              ${activeLessonIndex < APP_DATA.lessons.length - 1 ? `
                <button onclick="App.selectLesson(${activeLessonIndex + 1})" class="kid-btn bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 text-sm sm:text-base w-full sm:w-auto">
                  บทต่อไป →
                </button>
              ` : `
                <button onclick="App.navigate('worksheets', 0)" class="kid-btn bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 text-sm sm:text-base w-full sm:w-auto">
                  ไปทำใบงานกันเลย! 📝
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderLesson1Rules(rules) {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${rules.map(rule => `
          <div class="bg-white rounded-2xl border-2 border-slate-200 p-5 space-y-4 shadow-sm">
            <div class="flex items-start gap-3">
              <span class="text-3xl">${rule.icon}</span>
              <div>
                <h3 class="font-bold text-lg text-slate-800">${rule.title}</h3>
                <p class="text-sm text-slate-600">${rule.desc}</p>
              </div>
            </div>
            <div class="space-y-3">
              ${rule.examples.map(ex => `
                <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                  <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span class="font-bold text-indigo-700">${ex.vowel} • ${ex.ending}</span>
                    <button onclick="SoundSystem.speakThai('${ex.words.join(' , ')}')" class="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1">
                      🔊 ฟังชุดคำ
                    </button>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    ${ex.words.map(w => `
                      <button onclick="SoundSystem.speakThai('${w}')" class="kid-btn bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 px-3.5 py-1.5 text-base">
                        ${w} 🔊
                      </button>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderLesson2Chains(chains) {
    return `
      <div class="space-y-5">
        <div class="text-sm font-bold text-pink-700 bg-pink-50 border border-pink-200 px-4 py-2.5 rounded-xl">
          👀 สังเกตสีเดียวกัน: พยางค์ท้ายของคำหน้า จะมีสีเดียวกับพยางค์แรกของคำถัดไป (คลิกที่คำเพื่อฟังเสียงอ่านได้ทุกคำ!)
        </div>
        ${chains.map(chain => {
          const allWordsText = chain.items.map(it => it.syl1 + it.syl2).join(' , ');
          return `
            <div class="bg-white rounded-2xl border-2 border-pink-200 p-5 space-y-4 shadow-sm">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 class="font-bold text-lg text-slate-800">${chain.title}</h3>
                  <span class="text-xs text-slate-500">${chain.pattern}</span>
                </div>
                <button onclick="SoundSystem.speakThai('${allWordsText}')" class="kid-btn bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 text-xs">
                  🔊 ฟังทั้งขบวน
                </button>
              </div>

              <div class="flex flex-wrap items-center gap-3 py-2">
                ${chain.items.map((item, idx) => {
                  const linkColors = ['linked-pink', 'linked-blue', 'linked-amber'];
                  const prevColor = idx > 0 ? linkColors[(idx - 1) % linkColors.length] : '';
                  const nextColor = item.linkNext ? linkColors[idx % linkColors.length] : '';
                  return `
                    <div class="flex items-center gap-2">
                      <button onclick="SoundSystem.speakThai('${item.syl1}${item.syl2}')" class="bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 rounded-2xl p-3 flex flex-col items-center gap-1.5 transition">
                        <span class="text-2xl">${item.emoji}</span>
                        <div class="flex items-center gap-1">
                          <span class="syllable-box ${prevColor}">${item.syl1}</span>
                          <span class="syllable-box ${nextColor}">${item.syl2}</span>
                        </div>
                      </button>
                      ${item.linkNext ? `<span class="text-2xl font-bold text-pink-500">🔗</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="text-xs md:text-sm bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl border border-slate-200">
                🎯 <strong>คู่พยางค์ที่คล้องจองกัน:</strong> ${chain.note}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderLesson3Chains(chains) {
    return `
      <div class="space-y-5">
        <div class="text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
          🌈 สังเกตพยางค์ที่ไฮไลต์สี: พยางค์ที่ 3 (ท้ายสุด) ของกลุ่มคำหน้า จะคล้องจองกับพยางค์แรกของกลุ่มคำถัดไป!
        </div>
        ${chains.map(chain => {
          const fullSpeech = chain.groups.map(g => g.syllables.join('')).join(' , ');
          return `
            <div class="bg-white rounded-2xl border-2 border-amber-200 p-5 space-y-4 shadow-sm">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h3 class="font-bold text-lg text-slate-800">${chain.title}</h3>
                <button onclick="SoundSystem.speakThai('${fullSpeech}')" class="kid-btn bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 text-xs">
                  🔊 ฟังต่อเนื่องทั้งชุด
                </button>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                ${chain.groups.map((grp, gIdx) => {
                  const wordStr = grp.syllables.join('');
                  return `
                    <div class="flex items-center gap-2">
                      <button onclick="SoundSystem.speakThai('${wordStr}')" class="bg-slate-50 hover:bg-amber-50/40 border-2 border-slate-300 rounded-2xl p-3 flex flex-col items-center gap-1.5">
                        <span class="text-2xl">${grp.emoji}</span>
                        <div class="flex items-center gap-1">
                          ${grp.syllables.map((syl, sIdx) => {
                            let cls = '';
                            if (sIdx === grp.highlightStart) cls = 'linked-pink';
                            if (sIdx === grp.highlightEnd) cls = 'linked-amber';
                            return `<span class="syllable-box ${cls}">${syl}</span>`;
                          }).join('')}
                        </div>
                      </button>
                      ${gIdx < chain.groups.length - 1 ? `<span class="text-xl font-bold text-amber-500">➡️</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="text-xs md:text-sm bg-amber-50/60 text-slate-700 px-3.5 py-2 rounded-xl border border-amber-200">
                🎯 <strong>จุดสัมผัสคล้องจอง:</strong> ${chain.explanation}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderLesson4Poems(poems) {
    return `
      <div class="space-y-6">
        <div class="text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
          🎵 คลิกปุ่ม "อ่านบทร้อยกรอง" เพื่อฟังจังหวะคำคล้องจอง หรือคลิกทีละวรรคเพื่อฝึกอ่านตามได้เลย!
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          ${poems.map(poem => {
            const fullPlain = poem.lines.map(l => l.plain).join(' , ');
            return `
              <div class="bg-white rounded-2xl border-2 border-emerald-200 p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div class="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span class="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">${poem.category}</span>
                      <h3 class="font-bold text-lg text-slate-800 mt-1">${poem.title}</h3>
                    </div>
                  </div>

                  <div class="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-x-3 gap-y-2 text-base font-kid">
                    ${poem.lines.map(line => `
                      <button onclick="SoundSystem.speakThai('${line.plain}')" class="text-left hover:bg-white p-1.5 rounded-lg transition border border-transparent hover:border-slate-200">
                        ${line.text}
                      </button>
                    `).join('')}
                  </div>

                  <div class="mt-4 space-y-1">
                    <div class="text-xs font-bold text-slate-500">🔗 คู่คำคล้องจองในบทนี้:</div>
                    ${poem.rhymePairs.map(rp => `
                      <div class="text-xs text-slate-700 bg-emerald-50/70 px-2.5 py-1 rounded-lg">• ${rp}</div>
                    `).join('')}
                  </div>
                </div>

                <button onclick="SoundSystem.speakThai('${fullPlain}')" class="mt-4 w-full kid-btn bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-sm">
                  🔊 ฟังเสียงอ่านทั้งบท
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderLessonMiniCheck(lesson, quizDone) {
    const mc = lesson.miniCheck;
    return `
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border-2 border-indigo-200 space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-kid font-bold text-lg text-indigo-950">🎯 คำถามชวนคิดประจำบท (ตอบถูกรับ +3 ดาว)</h4>
          ${quizDone ? '<span class="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">✅ ตอบถูกต้องแล้ว</span>' : ''}
        </div>
        <p class="font-bold text-slate-800">${mc.question}</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${mc.options.map((opt, oIdx) => `
            <button onclick="App.answerLessonMiniCheck('${lesson.id}', ${oIdx})" class="kid-btn bg-white hover:bg-indigo-100 text-slate-800 border-indigo-200 py-3 px-4 text-base">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div id="mini-check-feedback-${lesson.id}" class="hidden rounded-xl p-3 text-sm font-medium"></div>
      </div>
    `;
  }

  function selectLesson(idx) {
    SoundSystem.playClick();
    activeLessonIndex = idx;
    renderMainContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function answerLessonMiniCheck(lessonId, selectedIdx) {
    const lesson = APP_DATA.lessons.find(l => l.id === lessonId);
    if (!lesson || !lesson.miniCheck) return;
    const mc = lesson.miniCheck;
    const feedbackEl = document.getElementById(`mini-check-feedback-${lessonId}`);

    if (selectedIdx === mc.answerIndex) {
      SoundSystem.playCorrect();
      if (!state.lessonQuizDone[lessonId]) {
        state.lessonQuizDone[lessonId] = true;
        addStars(3, 'ตอบคำถามท้ายบทถูกต้อง!');
      }
      if (!state.completedLessons.includes(lessonId)) {
        state.completedLessons.push(lessonId);
        saveState();
        checkAndUnlockBadges(true);
      }
      if (feedbackEl) {
        feedbackEl.className = 'rounded-xl p-3 text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 block';
        feedbackEl.innerHTML = `🎉 ${mc.explanation}`;
      }
    } else {
      SoundSystem.playWrong();
      if (feedbackEl) {
        feedbackEl.className = 'rounded-xl p-3 text-sm font-bold bg-rose-100 text-rose-800 border border-rose-300 block';
        feedbackEl.innerHTML = `❌ ยังไม่ใช่นะจ๊ะ ลองสังเกตเสียงสระและตัวสะกดของคำท้ายสุดอีกครั้งนะ!`;
      }
    }
  }

  function completeCurrentLesson() {
    const lesson = APP_DATA.lessons[activeLessonIndex];
    if (!lesson) return;
    if (!state.completedLessons.includes(lesson.id)) {
      SoundSystem.playFanfare();
      state.completedLessons.push(lesson.id);
      addStars(5, `เรียนจบบทที่ ${lesson.number} แล้ว!`);
      renderMainContent();
    }
  }

  // ==========================================
  // VIEW 3: สื่อการสอน (TEACHING MEDIA)
  // ==========================================
  function renderMediaView() {
    const categories = ['ทั้งหมด', '1 พยางค์', '1 พยางค์ (ตัวสะกดไม่ตรงตัว)', '2 พยางค์', '3 พยางค์'];
    const filteredCards = activeFlashcardCategory === 'ทั้งหมด'
      ? APP_DATA.flashcards
      : APP_DATA.flashcards.filter(c => c.category === activeFlashcardCategory);

    return `
      <div class="space-y-6">
        <!-- Media Sub-navigation -->
        <div class="kid-card p-5 border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span>🃏</span> คลังสื่อการสอนคำคล้องจอง
            </h2>
            <p class="text-sm text-slate-600">
              สื่อบัตรคำ 3 มิติพร้อมเสียงอ่าน และห้องทดลองตรวจสอบคู่คำคล้องจองสำหรับครูและผู้ปกครองเปิดสอนเด็กๆ
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button onclick="App.setMediaSubTab('flashcards')" class="kid-btn px-4 py-2.5 text-sm ${activeMediaSubTab === 'flashcards' ? 'bg-amber-500 text-slate-950 border-amber-700' : 'bg-white text-slate-700 border-slate-300'}">
              🃏 บัตรคำพลิกได้ (${APP_DATA.flashcards.length} ชุด)
            </button>
            <button onclick="App.setMediaSubTab('lab')" class="kid-btn px-4 py-2.5 text-sm ${activeMediaSubTab === 'lab' ? 'bg-amber-500 text-slate-950 border-amber-700' : 'bg-white text-slate-700 border-slate-300'}">
              🔬 ห้องทดลองตรวจคำคล้องจอง
            </button>
            <button onclick="App.setMediaSubTab('builder')" class="kid-btn px-4 py-2.5 text-sm ${activeMediaSubTab === 'builder' ? 'bg-amber-500 text-slate-950 border-amber-700' : 'bg-white text-slate-700 border-slate-300'}">
              🎨 กระดานแต่งคำคล้องจองหรรษา
            </button>
          </div>
        </div>

        ${activeMediaSubTab === 'flashcards' ? `
          <!-- Category Filter -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-bold text-slate-600 mr-1">เลือกหมวดบัตรคำ:</span>
            ${categories.map(cat => `
              <button onclick="App.setFlashcardCategory('${cat}')" class="px-3.5 py-1.5 rounded-full text-xs font-kid font-bold transition border ${
                activeFlashcardCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-indigo-50'
              }">
                ${cat}
              </button>
            `).join('')}
          </div>

          <div class="text-xs text-slate-500">
            💡 <strong>วิธีใช้สื่อบัตรคำ:</strong> คลิกที่บัตรคำเพื่อ <strong>พลิกดูชุดคำคล้องจอง</strong> ด้านหลัง และกดปุ่ม 🔊 เพื่อฟังเสียงอ่านออกเสียงชัดเจน
          </div>

          <!-- Flashcard Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${filteredCards.map(card => {
              const isFlipped = state.flippedCards.includes(card.id);
              return `
                <div id="fc-card-${card.id}" class="flashcard-container h-64 cursor-pointer" onclick="App.toggleFlipCard('${card.id}')">
                  <div class="flashcard-inner h-full">
                    <!-- Front -->
                    <div class="flashcard-front kid-card border-amber-300 bg-gradient-to-b from-white to-amber-50/60 justify-between">
                      <div class="w-full flex items-center justify-between text-xs">
                        <span class="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">${card.category}</span>
                        <span class="text-slate-400 font-kid">คลิกเพื่อพลิกบัตร 🔄</span>
                      </div>
                      <div class="text-center my-auto">
                        <div class="text-5xl mb-2">${card.frontEmoji}</div>
                        <div class="text-3xl font-kid font-bold text-indigo-950">${card.frontWord}</div>
                        <div class="text-xs text-indigo-600 font-bold mt-1">${card.vowelInfo}</div>
                      </div>
                      <div class="w-full flex justify-center">
                        <button onclick="event.stopPropagation(); SoundSystem.speakThai('${card.frontWord}')" class="kid-btn bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 text-xs">
                          🔊 ฟังเสียงคำว่า "${card.frontWord}"
                        </button>
                      </div>
                    </div>

                    <!-- Back -->
                    <div class="flashcard-back kid-card border-indigo-400 bg-gradient-to-b from-indigo-900 to-indigo-950 text-white justify-between">
                      <div class="w-full flex items-center justify-between text-xs">
                        <span class="text-amber-300 font-bold">คำที่คล้องจองกับ "${card.frontWord}"</span>
                        <span class="text-indigo-200">พลิกกลับ 🔄</span>
                      </div>
                      <div class="flex flex-wrap justify-center gap-1.5 my-2">
                        ${card.rhymes.map(r => `
                          <button onclick="event.stopPropagation(); SoundSystem.speakThai('${r}')" class="bg-white/15 hover:bg-amber-400 hover:text-slate-950 text-white font-kid font-bold px-3 py-1 rounded-xl text-sm transition border border-white/25">
                            ${r} 🔊
                          </button>
                        `).join('')}
                      </div>
                      <div class="w-full bg-white/10 rounded-xl p-2 text-center">
                        <div class="text-[11px] text-indigo-200">ตัวอย่างคำคล้องจองต่อเนื่อง:</div>
                        <div class="font-kid font-bold text-amber-300 text-sm">${card.sentence}</div>
                      </div>
                      <button onclick="event.stopPropagation(); SoundSystem.speakThai('${card.frontWord} , คล้องจองกับ , ${card.rhymes.join(' , ')}')" class="w-full kid-btn bg-amber-400 hover:bg-amber-300 text-slate-950 py-1.5 text-xs">
                        🔊 ฟังคำคล้องจองทั้งหมด
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        ${activeMediaSubTab === 'lab' ? `
          <!-- Rhyme Lab View -->
          <div class="kid-card p-6 border-indigo-200 space-y-5">
            <div>
              <h3 class="text-xl font-bold text-indigo-950">🔬 ห้องทดลองสังเกตคู่คำคล้องจอง (ทำไมถึงคล้องจอง หรือไม่คล้องจอง?)</h3>
              <p class="text-sm text-slate-600 mt-1">
                คลิกปุ่มฟังเสียงและดูเหตุผลอธิบายทีละคู่ ช่วยให้นักเรียนไม่สับสนเรื่องสระเสียงสั้น-ยาว และมาตราตัวสะกด
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${APP_DATA.rhymePairsLab.map(item => `
                <div class="p-5 rounded-2xl border-2 ${item.isRhyme ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'} space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold px-3 py-1 rounded-full ${item.isRhyme ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                      ${item.isRhyme ? '✅ คล้องจองกัน' : '❌ ไม่คล้องจองกัน'}
                    </span>
                    <button onclick="SoundSystem.speakThai('${item.wordA} กับ ${item.wordB}')" class="kid-btn bg-white text-slate-700 border-slate-300 px-3 py-1 text-xs">
                      🔊 ฟังเสียงคู่คำ
                    </button>
                  </div>
                  <div class="flex items-center justify-center gap-4 py-2">
                    <div class="bg-white px-4 py-2.5 rounded-xl border-2 border-slate-200 font-kid font-bold text-xl text-slate-800">
                      ${item.wordA} <span class="text-xs text-indigo-600">(${item.highlightA})</span>
                    </div>
                    <span class="text-2xl">${item.isRhyme ? '🔗' : '⚡'}</span>
                    <div class="bg-white px-4 py-2.5 rounded-xl border-2 border-slate-200 font-kid font-bold text-xl text-slate-800">
                      ${item.wordB} <span class="text-xs text-pink-600">(${item.highlightB})</span>
                    </div>
                  </div>
                  <p class="text-sm text-slate-700 bg-white/80 p-3 rounded-xl border border-slate-200">
                    💡 <strong>เหตุผล:</strong> ${item.reason}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${activeMediaSubTab === 'builder' ? renderChainBuilderMedia() : ''}
      </div>
    `;
  }

  function renderChainBuilderMedia() {
    const prebuiltChains = [
      { title: 'ชุดที่ 1: คำคล้องจอง 1 พยางค์', words: ['กา', 'ขา', 'มา', 'นา', 'ตา', 'ปลา'] },
      { title: 'ชุดที่ 2: คำคล้องจอง 2 พยางค์ (ชุดผลไม้และธรรมชาติ)', words: ['แตงโม', 'โตไว', 'ใบไม้', 'ไข่ดาว', 'สาวสวย'] },
      { title: 'ชุดที่ 3: คำคล้องจอง 3 พยางค์ (ชุดเด็กดี)', words: ['ตื่นแต่เช้า', 'เข้าห้องเรียน', 'เพียรศึกษา', 'พาก้าวหน้า'] }
    ];
    return `
      <div class="kid-card p-6 border-amber-300 space-y-5">
        <div>
          <h3 class="text-xl font-bold text-amber-950">🎨 กระดานฝึกอ่านและแต่งโซ่คำคล้องจองร่วมกับผู้ปกครอง</h3>
          <p class="text-sm text-slate-600 mt-1">
            คลิกที่คำทีละคำเพื่อฝึกออกเสียงตามจังหวะ หรือกดปุ่ม "ฟังทั้งแถว" เพื่อฟังเสียงสัมผัสต่อเนื่อง
          </p>
        </div>
        <div class="space-y-4">
          ${prebuiltChains.map(c => `
            <div class="p-4 rounded-2xl bg-amber-50/50 border-2 border-amber-200 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="font-kid font-bold text-slate-800">${c.title}</div>
                <button onclick="SoundSystem.speakThai('${c.words.join(' , ')}')" class="kid-btn bg-amber-500 text-slate-950 px-4 py-1.5 text-xs">
                  🔊 ฟังทั้งแถว
                </button>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                ${c.words.map((w, idx) => `
                  <div class="flex items-center gap-2">
                    <button onclick="SoundSystem.speakThai('${w}')" class="kid-btn bg-white hover:bg-indigo-50 text-indigo-950 border-indigo-200 px-4 py-2 text-lg">
                      ${w} 🔊
                    </button>
                    ${idx < c.words.length - 1 ? '<span class="text-amber-600 font-bold">➡️</span>' : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function setMediaSubTab(sub) {
    SoundSystem.playClick();
    activeMediaSubTab = sub;
    renderMainContent();
  }

  function setFlashcardCategory(cat) {
    SoundSystem.playClick();
    activeFlashcardCategory = cat;
    renderMainContent();
  }

  function toggleFlipCard(cardId) {
    SoundSystem.playClick();
    const el = document.getElementById(`fc-card-${cardId}`);
    if (el) {
      el.classList.toggle('flipped');
    }
    if (!state.flippedCards.includes(cardId)) {
      state.flippedCards.push(cardId);
      addStars(1, 'เปิดศึกษาบัตรคำคล้องจอง!');
    }
  }

  // ==========================================
  // VIEW 4: ใบงาน (WORKSHEETS - INTERACTIVE & PRINTABLE)
  // ==========================================
  function renderWorksheetsView() {
    const ws = APP_DATA.worksheets[activeWorksheetIndex] || APP_DATA.worksheets[0];
    const savedScore = state.worksheetScores[ws.id];
    const userAns = currentWsAnswers[ws.id] || {};
    const isSubmitted = !!currentWsSubmitted[ws.id];

    return `
      <div class="space-y-6">
        <!-- Worksheet Selector & Print Controls (Hidden when printing) -->
        <div class="no-print kid-card p-5 border-pink-200 bg-gradient-to-r from-pink-50 via-white to-indigo-50 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <span>📝</span> ชุดใบงานฝึกทักษะคำคล้องจอง (ทำบนเว็บ & สั่งพิมพ์ได้)
              </h2>
              <p class="text-sm text-slate-600">
                เลือกทำแบบฝึกหัดบนหน้าเว็บพร้อมตรวจคำตอบอัตโนมัติ หรือกดปุ่ม <strong>"พิมพ์ใบงาน A4"</strong> เพื่อปริ้นท์ออกมาเขียน
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="App.printCurrentWorksheet(false)" class="kid-btn bg-white hover:bg-slate-100 text-slate-800 border-slate-300 px-4 py-2.5 text-sm">
                🖨️ พิมพ์ใบงานเปล่า (สำหรับเขียน)
              </button>
              <button onclick="App.printCurrentWorksheet(true)" class="kid-btn bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-sm">
                🖨️ พิมพ์ใบงานพร้อมเฉลย
              </button>
            </div>
          </div>

          <!-- Worksheet Tabs -->
          <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 pt-2 border-t border-slate-200">
            ${APP_DATA.worksheets.map((item, idx) => {
              const active = idx === activeWorksheetIndex;
              const record = state.worksheetScores[item.id];
              return `
                <button onclick="App.selectWorksheet(${idx})" class="kid-btn px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                  active
                    ? 'bg-pink-600 text-white border-pink-800'
                    : 'bg-white hover:bg-pink-50 text-slate-700 border-slate-300'
                }">
                  <span>${item.icon}</span>
                  <span>ใบงานที่ ${item.number}</span>
                  ${record ? `<span class="bg-amber-300 text-slate-900 text-xs px-2 py-0.5 rounded-full">${record.score}/${record.total}</span>` : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Interactive & Printable Worksheet Sheet -->
        <div class="kid-card print-sheet p-6 md:p-8 border-slate-300 bg-white space-y-6">
          <!-- Worksheet Header (Looks great on screen & A4 print) -->
          <div class="border-b-2 border-slate-800 pb-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                  กลุ่มสาระการเรียนรู้ภาษาไทย • เรื่อง คำคล้องจอง
                </span>
                <h3 class="text-2xl font-bold text-slate-900 mt-2">${ws.title}</h3>
                <p class="text-sm text-slate-600">${ws.subtitle} (${ws.standard})</p>
              </div>
              <div class="no-print">
                ${savedScore ? `
                  <div class="bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-4 py-2 text-center">
                    <div class="text-xs text-emerald-700 font-bold">คะแนนสูงสุดที่ทำได้</div>
                    <div class="font-kid font-bold text-2xl text-emerald-800">${savedScore.score} / ${savedScore.total}</div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Student Info Line for Print Mode -->
            <div class="mt-4 pt-3 border-t border-dashed border-slate-300 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-700">
              <div><strong>ชื่อ-นามสกุล:</strong> <span class="underline decoration-dotted px-4">${escapeHtml(state.studentName)}</span></div>
              <div><strong>ชั้น:</strong> ....................</div>
              <div><strong>เลขที่:</strong> ........</div>
              <div><strong>คะแนนที่ได้:</strong> ........ / ${ws.questions.length} คะแนน</div>
            </div>
            <div class="mt-2 text-sm bg-slate-100 p-2.5 rounded-xl font-medium text-slate-800">
              📌 <strong>คำชี้แจง:</strong> ${ws.instructions}
            </div>
          </div>

          <!-- Questions List -->
          <div class="space-y-5">
            ${ws.questions.map((q, qIdx) => {
              const chosen = userAns[qIdx];
              const isCorrect = chosen === q.answer;
              const thaiChoices = ['ก', 'ข', 'ค', 'ง'];

              return `
                <div class="p-4 rounded-2xl border-2 ${
                  isSubmitted
                    ? isCorrect
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-rose-300 bg-rose-50/30'
                    : 'border-slate-200 bg-slate-50/50'
                }">
                  <div class="flex items-start justify-between gap-2 mb-3">
                    <div class="font-bold text-slate-900 text-base md:text-lg">
                      ข้อที่ ${q.qNum}. ${q.prompt}
                    </div>
                    <button onclick="SoundSystem.speakThai('${escapeQuotes(q.prompt)}')" class="no-print text-xs bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg shrink-0 font-kid font-bold">
                      🔊 ฟังโจทย์
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    ${q.options.map((opt, oIdx) => {
                      const isSelected = chosen === oIdx;
                      let btnStyle = 'bg-white hover:bg-indigo-50 text-slate-800 border-slate-300';
                      if (isSelected && !isSubmitted) {
                        btnStyle = 'bg-indigo-600 text-white border-indigo-800';
                      } else if (isSubmitted) {
                        if (oIdx === q.answer) {
                          btnStyle = 'bg-emerald-500 text-white border-emerald-700';
                        } else if (isSelected && oIdx !== q.answer) {
                          btnStyle = 'bg-rose-500 text-white border-rose-700';
                        }
                      }

                      const showPrintMark = printWithAnswers && oIdx === q.answer;

                      return `
                        <button
                          onclick="App.selectWorksheetAnswer('${ws.id}', ${qIdx}, ${oIdx})"
                          class="kid-btn justify-start px-4 py-2.5 text-left text-base ${btnStyle}"
                        >
                          <span class="font-bold">${thaiChoices[oIdx]}.</span>
                          <span>${opt}</span>
                          ${showPrintMark ? '<span class="ml-auto font-bold">✓ (เฉลย)</span>' : ''}
                        </button>
                      `;
                    }).join('')}
                  </div>

                  ${(isSubmitted || printWithAnswers) ? `
                    <div class="mt-3 text-xs md:text-sm p-2.5 rounded-xl ${
                      isCorrect || printWithAnswers
                        ? 'bg-emerald-100/80 text-emerald-900'
                        : 'bg-rose-100/80 text-rose-900'
                    }">
                      ${isSubmitted ? (isCorrect ? '✅ <strong>ถูกต้อง!</strong> ' : '❌ <strong>คำตอบที่ถูกคือ ข้อ ' + thaiChoices[q.answer] + '</strong> • ') : '🔑 <strong>เฉลย: ข้อ ' + thaiChoices[q.answer] + '</strong> • '}
                      ${q.explain}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Submit / Reset Worksheet Actions -->
          <div class="no-print pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div class="text-sm text-slate-600">
              ตอบแล้ว <strong>${Object.keys(userAns).length} / ${ws.questions.length}</strong> ข้อ
            </div>
            <div class="flex flex-wrap gap-3">
              <button onclick="App.resetCurrentWorksheet('${ws.id}')" class="kid-btn bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-3 text-sm">
                🔄 ทำชุดนี้ใหม่
              </button>
              <button onclick="App.submitWorksheet('${ws.id}')" class="kid-btn bg-emerald-500 hover:bg-emerald-400 text-white px-7 py-3 text-base">
                ✅ ส่งคำตอบและตรวจคะแนนทันที!
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function selectWorksheet(idx) {
    SoundSystem.playClick();
    activeWorksheetIndex = idx;
    renderMainContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectWorksheetAnswer(wsId, qIdx, oIdx) {
    if (currentWsSubmitted[wsId]) return; // ถ้าส่งแล้วให้กดทำใหม่ก่อน
    SoundSystem.playClick();
    if (!currentWsAnswers[wsId]) currentWsAnswers[wsId] = {};
    currentWsAnswers[wsId][qIdx] = oIdx;
    renderMainContent();
  }

  function submitWorksheet(wsId) {
    const ws = APP_DATA.worksheets.find(w => w.id === wsId);
    if (!ws) return;
    const ans = currentWsAnswers[wsId] || {};
    if (Object.keys(ans).length < ws.questions.length) {
      SoundSystem.playWrong();
      showToast(`กรุณาเลือกคำตอบให้ครบทั้ง ${ws.questions.length} ข้อก่อนส่งนะจ๊ะ!`);
      return;
    }

    let score = 0;
    ws.questions.forEach((q, idx) => {
      if (ans[idx] === q.answer) score++;
    });

    currentWsSubmitted[wsId] = true;
    const prevBest = state.worksheetScores[wsId]?.score || 0;
    state.worksheetScores[wsId] = {
      score,
      total: ws.questions.length,
      timestamp: new Date().toLocaleDateString('th-TH')
    };

    if (score >= 5) {
      SoundSystem.playFanfare();
    } else {
      SoundSystem.playCorrect();
    }

    if (score > prevBest) {
      addStars(score, `ทำ${ws.title} ได้ ${score}/${ws.questions.length} คะแนน!`);
    } else {
      saveState();
      showToast(`ตรวจคำตอบแล้ว! ได้ ${score}/${ws.questions.length} คะแนน`);
    }

    renderMainContent();
  }

  function resetCurrentWorksheet(wsId) {
    SoundSystem.playClick();
    currentWsAnswers[wsId] = {};
    currentWsSubmitted[wsId] = false;
    renderMainContent();
  }

  function printCurrentWorksheet(withAnswers) {
    printWithAnswers = withAnswers;
    renderMainContent();
    setTimeout(() => {
      window.print();
      printWithAnswers = false;
      renderMainContent();
    }, 150);
  }

  // ==========================================
  // VIEW 5: เกมการเรียนรู้ (GAMES)
  // ==========================================
  function renderGamesView() {
    return `
      <div class="space-y-6">
        <!-- Game Selector Header -->
        <div class="kid-card p-5 border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span>🎮</span> ห้องเกมคำคล้องจองหรรษา (3 เกมฝึกทักษะ)
            </h2>
            <p class="text-sm text-slate-600">
              ฝึกความแม่นยำเรื่องคำคล้องจอง 1-3 พยางค์ และบทร้อยกรองผ่านเกมแสนสนุก สะสมดาวและเหรียญรางวัล!
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 w-full md:w-auto">
            <button onclick="App.switchGame('bubble')" class="kid-btn px-3.5 py-2.5 text-xs sm:text-sm ${activeGameId === 'bubble' ? 'bg-emerald-600 text-white border-emerald-800' : 'bg-white text-slate-700 border-slate-300'}">
              🎈 เกมที่ 1: จับคู่ลูกโป่ง
            </button>
            <button onclick="App.switchGame('train')" class="kid-btn px-3.5 py-2.5 text-xs sm:text-sm ${activeGameId === 'train' ? 'bg-amber-500 text-slate-950 border-amber-700' : 'bg-white text-slate-700 border-slate-300'}">
              🚂 เกมที่ 2: ขบวนรถไฟ
            </button>
            <button onclick="App.switchGame('poet')" class="kid-btn px-3.5 py-2.5 text-xs sm:text-sm ${activeGameId === 'poet' ? 'bg-indigo-600 text-white border-indigo-800' : 'bg-white text-slate-700 border-slate-300'}">
              👑 เกมที่ 3: กวีตัวน้อย
            </button>
          </div>
        </div>

        ${activeGameId === 'bubble' ? renderBubbleGame() : ''}
        ${activeGameId === 'train' ? renderTrainGame() : ''}
        ${activeGameId === 'poet' ? renderPoetGame() : ''}
      </div>
    `;
  }

  function switchGame(gameId) {
    SoundSystem.playClick();
    activeGameId = gameId;
    if (gameId === 'bubble' && bubbleState.shuffledRight.length === 0) {
      initBubbleLevel(bubbleState.levelIndex);
    }
    renderMainContent();
  }

  // --- เกมที่ 1: จับคู่ลูกโป่งคำคล้องจอง ---
  function initBubbleLevel(lvlIdx) {
    const sets = APP_DATA.games.bubbleMatchSets;
    const set = sets[lvlIdx] || sets[0];
    bubbleState.levelIndex = lvlIdx;
    bubbleState.selectedLeft = null;
    bubbleState.matchedPairs = [];
    bubbleState.mistakes = 0;

    // สุ่มลำดับฝั่งขวา
    const indices = set.pairs.map((_, idx) => idx);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    bubbleState.shuffledRight = indices;
  }

  function renderBubbleGame() {
    if (bubbleState.shuffledRight.length === 0) {
      initBubbleLevel(bubbleState.levelIndex);
    }
    const sets = APP_DATA.games.bubbleMatchSets;
    const currentSet = sets[bubbleState.levelIndex];
    const allMatched = bubbleState.matchedPairs.length === currentSet.pairs.length;

    return `
      <div class="kid-card p-6 md:p-8 border-emerald-300 space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span class="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">เกมที่ 1 • ฝึกสังเกตคู่คำคล้องจอง</span>
            <h3 class="text-2xl font-bold text-slate-800 mt-1">🎈 ${currentSet.title}</h3>
            <p class="text-sm text-slate-600">คลิกลูกโป่งคำฝั่งซ้าย แล้วคลิกลูกโป่งคำฝั่งขวาที่มีเสียงคล้องจองกัน!</p>
          </div>
          <div class="flex flex-wrap gap-2">
            ${sets.map((s, idx) => `
              <button onclick="App.startBubbleLevel(${idx})" class="kid-btn px-3.5 py-2 text-xs ${bubbleState.levelIndex === idx ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}">
                ด่านที่ ${s.level}
              </button>
            `).join('')}
          </div>
        </div>

        ${allMatched ? `
          <div class="bg-gradient-to-r from-emerald-50 to-amber-50 border-2 border-emerald-300 rounded-3xl p-8 text-center space-y-4 animate-pop">
            <div class="text-6xl">🎉🎈🏆</div>
            <h4 class="text-2xl font-bold text-emerald-900">เก่งมากๆ เลย! จับคู่คำคล้องจองด่านที่ ${currentSet.level} สำเร็จครบทุกคู่!</h4>
            <p class="text-slate-600">จับคู่ผิดเพียง ${bubbleState.mistakes} ครั้ง รับดาวสะสมเพิ่มเรียบร้อยแล้ว!</p>
            <div class="flex justify-center gap-3">
              <button onclick="App.startBubbleLevel(${bubbleState.levelIndex})" class="kid-btn bg-white text-slate-800 border-slate-300 px-5 py-3 text-sm">
                🔄 เล่นด่านนี้อีกครั้ง
              </button>
              ${bubbleState.levelIndex < sets.length - 1 ? `
                <button onclick="App.startBubbleLevel(${bubbleState.levelIndex + 1})" class="kid-btn bg-emerald-600 text-white px-6 py-3 text-base">
                  ไปด่านต่อไปเลย →
                </button>
              ` : `
                <button onclick="App.switchGame('train')" class="kid-btn bg-amber-500 text-slate-950 px-6 py-3 text-base">
                  ไปเล่นเกมขบวนรถไฟต่อ! 🚂
                </button>
              `}
            </div>
          </div>
        ` : `
          <div class="grid grid-cols-2 gap-2.5 sm:gap-6 max-w-3xl mx-auto">
            <!-- Left Column -->
            <div class="space-y-2.5 sm:space-y-3">
              <div class="text-center font-kid font-bold text-indigo-800 text-xs sm:text-sm bg-indigo-50 py-1.5 px-2 rounded-xl">
                1️⃣ คำตั้งต้น (ซ้าย)
              </div>
              ${currentSet.pairs.map((p, idx) => {
                const isMatched = bubbleState.matchedPairs.includes(idx);
                const isSelected = bubbleState.selectedLeft === idx;
                return `
                  <button
                    onclick="App.selectBubbleLeft(${idx})"
                    ${isMatched ? 'disabled' : ''}
                    class="w-full kid-btn py-3 sm:py-4 px-2.5 sm:px-5 text-sm sm:text-xl justify-between ${
                      isMatched
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 opacity-60'
                        : isSelected
                          ? 'bg-indigo-600 text-white border-indigo-900 scale-[1.02]'
                          : 'bg-white hover:bg-indigo-50 text-slate-800 border-indigo-200'
                    }"
                  >
                    <span class="truncate">🎈 ${p.a}</span>
                    <span class="hidden sm:inline text-xs font-normal opacity-80">${isMatched ? '✅ จับคู่แล้ว' : 'คลิกเลือก'}</span>
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Right Column -->
            <div class="space-y-2.5 sm:space-y-3">
              <div class="text-center font-kid font-bold text-pink-800 text-xs sm:text-sm bg-pink-50 py-1.5 px-2 rounded-xl">
                2️⃣ คำคล้องจอง (ขวา)
              </div>
              ${bubbleState.shuffledRight.map(pairIdx => {
                const p = currentSet.pairs[pairIdx];
                const isMatched = bubbleState.matchedPairs.includes(pairIdx);
                return `
                  <button
                    onclick="App.selectBubbleRight(${pairIdx})"
                    ${isMatched ? 'disabled' : ''}
                    class="w-full kid-btn py-3 sm:py-4 px-2.5 sm:px-5 text-sm sm:text-xl justify-between ${
                      isMatched
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 opacity-60'
                        : 'bg-white hover:bg-pink-50 text-slate-800 border-pink-200'
                    }"
                  >
                    <span class="truncate">🎈 ${p.b}</span>
                    <span class="hidden sm:inline text-xs font-normal opacity-80">${isMatched ? `✅ (${p.hint})` : 'คลิกจับคู่'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `}
      </div>
    `;
  }

  function startBubbleLevel(lvlIdx) {
    SoundSystem.playClick();
    initBubbleLevel(lvlIdx);
    renderMainContent();
  }

  function selectBubbleLeft(idx) {
    const currentSet = APP_DATA.games.bubbleMatchSets[bubbleState.levelIndex];
    const cleanWord = currentSet.pairs[idx].a.replace(/[^\u0E00-\u0E7F\s]/g, '').trim();
    SoundSystem.speakThai(cleanWord);
    bubbleState.selectedLeft = idx;
    renderMainContent();
  }

  function selectBubbleRight(pairIdx) {
    if (bubbleState.selectedLeft === null) {
      showToast('กรุณาคลิกเลือกลูกโป่งฝั่งซ้ายก่อนนะจ๊ะ!');
      return;
    }
    const currentSet = APP_DATA.games.bubbleMatchSets[bubbleState.levelIndex];
    const cleanWord = currentSet.pairs[pairIdx].b.replace(/[^\u0E00-\u0E7F\s]/g, '').trim();

    if (bubbleState.selectedLeft === pairIdx) {
      SoundSystem.playCorrect();
      SoundSystem.speakThai(cleanWord);
      bubbleState.matchedPairs.push(pairIdx);
      bubbleState.selectedLeft = null;

      if (bubbleState.matchedPairs.length === currentSet.pairs.length) {
        SoundSystem.playFanfare();
        if (!state.gameRecords.bubble.completedLevels.includes(currentSet.level)) {
          state.gameRecords.bubble.completedLevels.push(currentSet.level);
        }
        addStars(6, `ผ่านเกมจับคู่ลูกโป่งด่านที่ ${currentSet.level}!`);
      }
      renderMainContent();
    } else {
      SoundSystem.playWrong();
      bubbleState.mistakes++;
      showToast('❌ ยังไม่คล้องจองกันจ้ะ ลองฟังเสียงสระและตัวสะกดดูใหม่นะ!');
    }
  }

  // --- เกมที่ 2: ขบวนรถไฟคำคล้องจอง ---
  function renderTrainGame() {
    const stages = APP_DATA.games.trainStages;
    if (trainState.finished) {
      return `
        <div class="kid-card p-8 text-center space-y-5 border-amber-300 animate-pop">
          <div class="text-6xl">🚂🌟🏆</div>
          <h3 class="text-3xl font-bold text-amber-900">ปู๊นๆ! ขบวนรถไฟคำคล้องจองถึงสถานีปลายทางแล้ว!</h3>
          <p class="text-lg text-slate-700">
            น้องทำคะแนนได้ <strong>${trainState.score} / ${stages.length}</strong> ขบวน!
          </p>
          <div class="flex justify-center gap-3">
            <button onclick="App.restartTrainGame()" class="kid-btn bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 text-base">
              🔄 เล่นเกมรถไฟอีกครั้ง
            </button>
            <button onclick="App.switchGame('poet')" class="kid-btn bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 text-base">
              ไปเล่นเกมกวีตัวน้อยต่อ →
            </button>
          </div>
        </div>
      `;
    }

    const st = stages[trainState.stageIndex];
    return `
      <div class="kid-card p-6 md:p-8 border-amber-300 space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <span class="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
              ขบวนที่ ${st.stage} จาก ${stages.length} • คะแนนปัจจุบัน: ${trainState.score}
            </span>
            <h3 class="text-2xl font-bold text-slate-800 mt-1">🚂 ${st.title}</h3>
          </div>
          <button onclick="SoundSystem.speakThai('${st.chain.join(' ')}')" class="kid-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 text-xs">
            🔊 ฟังเสียงขบวนรถไฟ
          </button>
        </div>

        <!-- Train Visual Track -->
        <div class="bg-gradient-to-b from-sky-100 to-amber-50 rounded-3xl p-6 border-2 border-sky-200 overflow-x-auto">
          <div class="flex items-center gap-4 min-w-max pb-4">
            <div class="text-5xl">🚂</div>
            ${st.chain.map((word, idx) => `
              <div class="flex items-center gap-3">
                <button onclick="SoundSystem.speakThai('${word}')" class="train-car font-kid font-bold text-xl text-slate-800 hover:scale-105 transition">
                  <div class="text-[11px] text-amber-700">โบกี้ที่ ${idx + 1}</div>
                  <div>${word}</div>
                </button>
                <span class="text-2xl font-bold text-slate-500">⛓️</span>
              </div>
            `).join('')}

            <!-- Target Missing Car -->
            <div class="train-car border-dashed border-indigo-500 bg-indigo-50/90 font-kid font-bold text-xl text-indigo-800">
              <div class="text-[11px] text-indigo-600">โบกี้ที่ ${st.chain.length + 1} (เลือกเติม)</div>
              <div>${trainState.answered ? trainState.selectedOption : '❓ ........'}</div>
            </div>
          </div>
        </div>

        <div class="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-sm text-indigo-950 font-medium">
          🎯 <strong>คำใบ้:</strong> โบกี้สุดท้ายลงท้ายด้วยพยางค์ว่า <span class="rhyme-target">"${st.lastSyllable}"</span> • ${st.questionHint}
        </div>

        <!-- Options -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${st.options.map(opt => {
            let cls = 'bg-white hover:bg-amber-50 text-slate-800 border-slate-300';
            if (trainState.answered) {
              if (opt === st.correct) cls = 'bg-emerald-500 text-white border-emerald-700';
              else if (opt === trainState.selectedOption) cls = 'bg-rose-500 text-white border-rose-700';
            }
            return `
              <button
                onclick="App.answerTrainStage('${opt}')"
                ${trainState.answered ? 'disabled' : ''}
                class="kid-btn py-4 px-4 text-xl ${cls}"
              >
                🚃 ${opt}
              </button>
            `;
          }).join('')}
        </div>

        ${trainState.answered ? `
          <div class="flex items-center justify-between bg-slate-100 p-4 rounded-2xl">
            <div class="font-kid font-bold text-base ${trainState.selectedOption === st.correct ? 'text-emerald-700' : 'text-rose-700'}">
              ${trainState.selectedOption === st.correct
                ? `🎉 ถูกต้องจ้ะ! "${st.chain[st.chain.length - 1]}" คล้องจองกับ "${st.correct}"`
                : `💡 คำตอบที่ถูกคือ "${st.correct}" จ้ะ เพราะคล้องจองกับพยางค์ว่า "${st.lastSyllable}"`}
            </div>
            <button onclick="App.nextTrainStage()" class="kid-btn bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 text-sm">
              ${trainState.stageIndex < stages.length - 1 ? 'ขบวนต่อไป →' : 'ดูสรุปคะแนน 🏆'}
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  function answerTrainStage(chosenOpt) {
    const stages = APP_DATA.games.trainStages;
    const st = stages[trainState.stageIndex];
    trainState.answered = true;
    trainState.selectedOption = chosenOpt;

    if (chosenOpt === st.correct) {
      SoundSystem.playCorrect();
      SoundSystem.speakThai(chosenOpt);
      trainState.score++;
    } else {
      SoundSystem.playWrong();
    }
    renderMainContent();
  }

  function nextTrainStage() {
    SoundSystem.playClick();
    const stages = APP_DATA.games.trainStages;
    if (trainState.stageIndex < stages.length - 1) {
      trainState.stageIndex++;
      trainState.answered = false;
      trainState.selectedOption = null;
    } else {
      trainState.finished = true;
      SoundSystem.playFanfare();
      if (trainState.score > (state.gameRecords.train.bestScore || 0)) {
        state.gameRecords.train.bestScore = trainState.score;
      }
      addStars(trainState.score * 2, `จบเกมขบวนรถไฟคำคล้องจอง ได้ ${trainState.score}/${stages.length} คะแนน!`);
    }
    renderMainContent();
  }

  function restartTrainGame() {
    SoundSystem.playClick();
    trainState = {
      stageIndex: 0,
      score: 0,
      answered: false,
      selectedOption: null,
      finished: false
    };
    renderMainContent();
  }

  // --- เกมที่ 3: กวีตัวน้อย ต่อกลอนหรรษา ---
  function renderPoetGame() {
    const quizzes = APP_DATA.games.poetQuizzes;
    if (poetState.finished) {
      return `
        <div class="kid-card p-8 text-center space-y-5 border-indigo-300 animate-pop">
          <div class="text-6xl">👑📜✨</div>
          <h3 class="text-3xl font-bold text-indigo-950">ขอปรบมือให้ "กวีตัวน้อยคนเก่ง"!</h3>
          <p class="text-lg text-slate-700">
            แต่งเติมคำคล้องจองในบทร้อยกรองได้ <strong>${poetState.score} / ${quizzes.length}</strong> บท!
          </p>
          <div class="flex justify-center gap-3">
            <button onclick="App.restartPoetGame()" class="kid-btn bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 text-base">
              🔄 เล่นอีกครั้ง
            </button>
            <button onclick="App.navigate('certificate')" class="kid-btn bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 text-base">
              🏆 ไปรับเกียรติบัตรคนเก่ง!
            </button>
          </div>
        </div>
      `;
    }

    const pq = quizzes[poetState.quizIndex];
    return `
      <div class="kid-card p-6 md:p-8 border-indigo-300 space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <span class="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
              บทที่ ${poetState.quizIndex + 1} จาก ${quizzes.length} • คะแนนสะสม: ${poetState.score}
            </span>
            <h3 class="text-2xl font-bold text-slate-800 mt-1">👑 ${pq.title}</h3>
          </div>
          <button onclick="SoundSystem.speakThai('${pq.fullRead}')" class="kid-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 text-xs">
            🔊 ฟังจังหวะกลอน
          </button>
        </div>

        <!-- Poem Board -->
        <div class="bg-gradient-to-br from-indigo-50 via-white to-pink-50 rounded-3xl p-6 md:p-8 border-2 border-indigo-200 max-w-2xl mx-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xl md:text-2xl font-kid text-center">
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">${pq.line1}</div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">${pq.line2}</div>
            <div class="bg-amber-50 p-4 rounded-2xl border-2 border-amber-400 shadow-sm font-bold text-indigo-950">
              ${poetState.answered
                ? pq.line3.replace('..........', `<span class="rhyme-match-b">${poetState.selectedOption}</span>`)
                : pq.line3
              }
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">${pq.line4}</div>
          </div>
          <div class="mt-4 text-center text-sm text-indigo-800 font-medium">
            💡 <strong>คำใบ้สัมผัส:</strong> ${pq.missingHint}
          </div>
        </div>

        <!-- Choices -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          ${pq.options.map(opt => {
            let cls = 'bg-white hover:bg-indigo-50 text-slate-800 border-slate-300';
            if (poetState.answered) {
              if (opt === pq.answer) cls = 'bg-emerald-500 text-white border-emerald-700';
              else if (opt === poetState.selectedOption) cls = 'bg-rose-500 text-white border-rose-700';
            }
            return `
              <button
                onclick="App.answerPoetQuiz('${opt}')"
                ${poetState.answered ? 'disabled' : ''}
                class="kid-btn py-4 px-4 text-xl ${cls}"
              >
                Feather ${opt}
              </button>
            `.replace('Feather', '🪶');
          }).join('')}
        </div>

        ${poetState.answered ? `
          <div class="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-4 rounded-2xl">
            <div class="font-kid font-bold text-base ${poetState.selectedOption === pq.answer ? 'text-emerald-700' : 'text-rose-700'}">
              ${poetState.selectedOption === pq.answer
                ? `🎉 ไพเราะมาก! เติมคำว่า "${pq.answer}" ลงในบทร้อยกรองได้ถูกต้อง!`
                : `💡 คำที่ถูกต้องคือ "${pq.answer}" จ้ะ ลองกดฟังเสียงอ่านทั้งบทดูนะ!`}
            </div>
            <div class="flex gap-2">
              <button onclick="SoundSystem.speakThai('${pq.fullRead}')" class="kid-btn bg-amber-400 text-slate-900 px-4 py-2 text-xs">
                🔊 ฟังกลอนที่สมบูรณ์
              </button>
              <button onclick="App.nextPoetQuiz()" class="kid-btn bg-indigo-600 text-white px-5 py-2 text-sm">
                ${poetState.quizIndex < quizzes.length - 1 ? 'บทต่อไป →' : 'สรุปผลคะแนน 🏆'}
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function answerPoetQuiz(opt) {
    const quizzes = APP_DATA.games.poetQuizzes;
    const pq = quizzes[poetState.quizIndex];
    poetState.answered = true;
    poetState.selectedOption = opt;

    if (opt === pq.answer) {
      SoundSystem.playCorrect();
      SoundSystem.speakThai(pq.fullRead);
      poetState.score++;
    } else {
      SoundSystem.playWrong();
    }
    renderMainContent();
  }

  function nextPoetQuiz() {
    SoundSystem.playClick();
    const quizzes = APP_DATA.games.poetQuizzes;
    if (poetState.quizIndex < quizzes.length - 1) {
      poetState.quizIndex++;
      poetState.answered = false;
      poetState.selectedOption = null;
    } else {
      poetState.finished = true;
      SoundSystem.playFanfare();
      if (poetState.score > (state.gameRecords.poet.bestScore || 0)) {
        state.gameRecords.poet.bestScore = poetState.score;
      }
      addStars(poetState.score * 2, `จบเกมกวีตัวน้อย ได้ ${poetState.score}/${quizzes.length} คะแนน!`);
    }
    renderMainContent();
  }

  function restartPoetGame() {
    SoundSystem.playClick();
    poetState = {
      quizIndex: 0,
      score: 0,
      answered: false,
      selectedOption: null,
      finished: false
    };
    renderMainContent();
  }

  // ==========================================
  // VIEW 6: เกียรติบัตรคนเก่ง (CERTIFICATE)
  // ==========================================
  function renderCertificateView() {
    const avatar = getAvatarObj();
    const todayStr = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div class="space-y-6">
        <div class="no-print kid-card p-5 border-amber-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-slate-800">🏆 เกียรติบัตรคนเก่ง เรื่อง คำคล้องจอง</h2>
            <p class="text-sm text-slate-600">สามารถเปลี่ยนชื่อ-นามสกุลจริงของนักเรียน แล้วกดปุ่มสั่งพิมพ์ (Print / บันทึกเป็น PDF) ได้เลยครับ</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button onclick="App.openProfileModal()" class="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 px-4 py-2.5 text-sm">
              ✏️ แก้ไขชื่อนักเรียน
            </button>
            <button onclick="window.print()" class="kid-btn bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-sm">
              🖨️ พิมพ์เกียรติบัตร (Print / PDF)
            </button>
          </div>
        </div>

        <!-- Certificate Frame -->
        <div class="kid-card print-sheet p-8 md:p-12 bg-gradient-to-br from-amber-50 via-white to-indigo-50 border-8 border-double border-amber-400 text-center space-y-6 max-w-4xl mx-auto shadow-2xl">
          <div class="flex justify-center items-center gap-3 text-4xl">
            <span>🌟</span>
            <span class="text-6xl">${avatar.emoji}</span>
            <span>🌟</span>
          </div>

          <div class="space-y-2">
            <div class="text-sm font-bold tracking-widest uppercase text-indigo-700">
              บทเรียนสำเร็จรูปวิชาภาษาไทย เรื่อง คำคล้องจอง
            </div>
            <h1 class="text-3xl md:text-5xl font-bold text-indigo-950 font-kid">
              เกียรติบัตรเชิดชูเกียรติ
            </h1>
            <p class="text-slate-600 text-base md:text-lg">ขอมอบเกียรติบัตรฉบับนี้เพื่อแสดงว่า</p>
          </div>

          <div class="py-3 px-6 bg-white/90 rounded-2xl border-2 border-amber-300 inline-block min-w-[280px] md:min-w-[420px]">
            <div class="text-2xl md:text-4xl font-kid font-bold text-pink-600">
              ${escapeHtml(state.studentName)}
            </div>
          </div>

          <p class="text-slate-700 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            ได้ตั้งใจเรียนรู้ ทบทวนบทเรียน ทำใบงาน และฝึกทักษะเรื่อง
            <strong class="text-indigo-900">"คำคล้องจอง (1 พยางค์, 2 พยางค์, 3 พยางค์ และบทร้อยกรอง)"</strong>
            ด้วยความมุ่งมั่น ขยันหมั่นเพียร และร่าเริงแจ่มใส
          </p>

          <!-- Stats on Certificate -->
          <div class="grid grid-cols-3 gap-4 max-w-lg mx-auto py-2">
            <div class="bg-white p-3 rounded-2xl border border-amber-300">
              <div class="text-xs text-slate-500">ดาวสะสมทั้งหมด</div>
              <div class="font-kid font-bold text-xl text-amber-600">⭐ ${state.stars} ดาว</div>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-indigo-200">
              <div class="text-xs text-slate-500">บทเรียนที่ผ่าน</div>
              <div class="font-kid font-bold text-xl text-indigo-700">${state.completedLessons.length}/${APP_DATA.lessons.length} บท</div>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-emerald-200">
              <div class="text-xs text-slate-500">เหรียญรางวัล</div>
              <div class="font-kid font-bold text-xl text-emerald-700">🏅 ${state.unlockedBadges.length} เหรียญ</div>
            </div>
          </div>

          <div class="pt-6 flex flex-col sm:flex-row items-center justify-around gap-6 text-sm text-slate-600 border-t border-amber-200">
            <div>
              <div>ให้ไว้ ณ วันที่ ${todayStr}</div>
              <div class="text-xs text-slate-400 mt-0.5">โครงการเรียนรู้ภาษาไทยแสนสนุก เรื่อง คำคล้องจอง</div>
            </div>
            <div class="text-center">
              <div class="font-kid font-bold text-indigo-900">ลงชื่อ ....................................................</div>
              <div class="text-xs text-slate-500 mt-1">(ผู้ปกครอง / คุณครูผู้สอน)</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW 7: มุมผู้ปกครองและคุณครู (PARENTS & TEACHER GUIDE)
  // ==========================================
  function renderParentsView() {
    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="kid-card p-6 border-sky-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase bg-sky-100 text-sky-800 px-3 py-1 rounded-full">
              👨‍👩‍👧 สำหรับผู้ปกครองและคุณครู
            </span>
            <h2 class="text-2xl font-bold text-slate-800 mt-1">
              คู่มือการทบทวนที่บ้าน & รายงานพัฒนาการของนักเรียน
            </h2>
            <p class="text-sm text-slate-600">
              สรุปแนวทางการสอนเรื่องคำคล้องจอง ตารางคะแนนของนักเรียน และเฉลยใบงานครบทั้ง 4 ชุด
            </p>
          </div>
          <button onclick="App.resetAllProgress()" class="kid-btn bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300 px-4 py-2.5 text-xs shrink-0">
            🗑️ รีเซ็ตข้อมูลความก้าวหน้าทั้งหมด
          </button>
        </div>

        <!-- Student Progress Report -->
        <div class="kid-card p-6 space-y-4">
          <h3 class="text-xl font-bold text-slate-800">📊 สรุปผลการเรียนรู้ของ: <span class="text-indigo-700">${escapeHtml(state.studentName)}</span></h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Lessons status -->
            <div class="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
              <div class="font-bold text-indigo-950">1. ความก้าวหน้าบทเรียน (${state.completedLessons.length}/${APP_DATA.lessons.length})</div>
              <ul class="text-sm space-y-1">
                ${APP_DATA.lessons.map(l => {
                  const done = state.completedLessons.includes(l.id);
                  return `<li class="flex items-center justify-between">
                    <span>บทที่ ${l.number}: ${l.title}</span>
                    <span class="font-bold ${done ? 'text-emerald-600' : 'text-slate-400'}">${done ? '✅ เรียนแล้ว' : '⏳ รอเรียน'}</span>
                  </li>`;
                }).join('')}
              </ul>
            </div>

            <!-- Worksheets status -->
            <div class="p-4 rounded-2xl bg-pink-50/60 border border-pink-200 space-y-2">
              <div class="font-bold text-pink-950">2. ผลคะแนนใบงาน 4 ชุด</div>
              <ul class="text-sm space-y-1">
                ${APP_DATA.worksheets.map(w => {
                  const rec = state.worksheetScores[w.id];
                  return `<li class="flex items-center justify-between">
                    <span>ใบงานที่ ${w.number}</span>
                    <span class="font-bold ${rec ? 'text-pink-700' : 'text-slate-400'}">
                      ${rec ? `${rec.score}/${rec.total} คะแนน` : 'ยังไม่ได้ทำ'}
                    </span>
                  </li>`;
                }).join('')}
              </ul>
            </div>

            <!-- Games status -->
            <div class="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div class="font-bold text-emerald-950">3. สถิติเกมฝึกทักษะ</div>
              <ul class="text-sm space-y-1.5">
                <li class="flex items-center justify-between">
                  <span>🎈 เกมจับคู่ลูกโป่ง</span>
                  <span class="font-bold text-emerald-700">ผ่าน ${state.gameRecords.bubble.completedLevels.length}/3 ด่าน</span>
                </li>
                <li class="flex items-center justify-between">
                  <span>🚂 เกมขบวนรถไฟ</span>
                  <span class="font-bold text-emerald-700">สูงสุด ${state.gameRecords.train.bestScore || 0}/5 ขบวน</span>
                </li>
                <li class="flex items-center justify-between">
                  <span>👑 เกมกวีตัวน้อย</span>
                  <span class="font-bold text-emerald-700">สูงสุด ${state.gameRecords.poet.bestScore || 0}/5 บท</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Tips for Parents -->
        <div class="kid-card p-6 space-y-4 border-amber-200">
          <h3 class="text-xl font-bold text-slate-800">💡 3 เทคนิคสำหรับผู้ปกครองและคุณครูช่วยทบทวนเรื่อง "คำคล้องจอง"</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <div class="font-bold text-amber-900 text-base">1. เน้น "เสียงสระ + เสียงตัวสะกด"</div>
              <p class="text-slate-700 leading-relaxed">
                เด็กๆ มักจำสับสนระหว่าง "รูปตัวสะกด" กับ "มาตราตัวสะกด" ให้ชวนเด็กออกเสียงช้าๆ เช่น คำว่า <strong>สุข (ข)</strong> กับ <strong>มุก (ก)</strong> ออกเสียงตัวสะกดแม่กกเหมือนกัน จึงคล้องจองกันครับ
              </p>
            </div>
            <div class="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1.5">
              <div class="font-bold text-sky-900 text-base">2. เล่นเกมต่อคำระหว่างเดินทาง</div>
              <p class="text-slate-700 leading-relaxed">
                ขณะนั่งรถหรือทานข้าว ลองชวนลูกเล่นต่อคำ 2 พยางค์คนละคำ เช่น คุณแม่พูดว่า <strong>"กินข้าว"</strong> ลูกต่อคำที่ขึ้นต้นด้วยเสียง <em>ขาว/าว</em> เช่น <strong>"ขาวจัง → นั่งเล่น → เย็นใจ"</strong> จะช่วยให้เด็กคิดคำได้คล่องขึ้นมากครับ
              </p>
            </div>
            <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <div class="font-bold text-emerald-900 text-base">3. ปรบมือตามจังหวะบทร้อยกรอง</div>
              <p class="text-slate-700 leading-relaxed">
                เวลาอ่านบทร้องเล่น เช่น <em>จันทร์เอ๋ยจันทร์เจ้า</em> หรือ <em>แมวเอ๋ยแมวเหมียว</em> ให้ลูกปรบมือตรงคำที่สัมผัสกัน (คำที่มีสีไฮไลต์เดียวกันในเว็บนี้) เด็กจะจับจังหวะกลอนสี่ได้เป็นธรรมชาติครับ
              </p>
            </div>
          </div>
        </div>

        <!-- Complete Answer Keys for all 4 Worksheets -->
        <div class="kid-card p-6 space-y-4">
          <h3 class="text-xl font-bold text-slate-800">🔑 เฉลยละเอียดใบงานทั้ง 4 ชุด (สำหรับผู้ปกครองตรวจทาน)</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${APP_DATA.worksheets.map(ws => {
              const thaiChoices = ['ก', 'ข', 'ค', 'ง'];
              return `
                <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div class="flex items-center justify-between">
                    <h4 class="font-bold text-indigo-950">${ws.title}</h4>
                    <button onclick="App.navigate('worksheets', ${ws.number - 1})" class="text-xs font-bold text-indigo-600 hover:underline">
                      เปิดใบงานนี้ →
                    </button>
                  </div>
                  <div class="space-y-1.5 text-xs md:text-sm">
                    ${ws.questions.map(q => `
                      <div class="bg-white p-2 rounded-lg border border-slate-200">
                        <span class="font-bold text-slate-800">ข้อ ${q.qNum}:</span>
                        <span class="font-bold text-emerald-700">ตอบ ${thaiChoices[q.answer]}. ${q.options[q.answer]}</span>
                        <span class="text-slate-500"> — ${q.explain}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // PROFILE MODAL & RESET
  // ==========================================
  function openProfileModal() {
    SoundSystem.playClick();
    const modal = document.getElementById('profile-modal');
    if (!modal) return;
    const vs = SoundSystem.getVoiceSettings();
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-indigo-300 shadow-2xl space-y-5 animate-pop max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-indigo-950">🧒 ตั้งค่านักเรียน & เสียงอ่านธรรมชาติ</h3>
          <button onclick="App.closeProfileModal()" class="text-slate-400 hover:text-slate-700 text-xl font-bold">✕</button>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-bold text-slate-700">ชื่อ-นามสกุล หรือชื่อเล่นของน้อง (แสดงบนใบงานและเกียรติบัตร):</label>
          <input
            id="profile-name-input"
            type="text"
            value="${escapeHtml(state.studentName)}"
            placeholder="เช่น ด.ช. รักเรียน เพียรศึกษา"
            class="w-full px-4 py-2.5 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 outline-none font-kid font-bold text-lg"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-bold text-slate-700">เลือกตัวละครคู่ใจ:</label>
          <div class="grid grid-cols-3 gap-2">
            ${APP_DATA.avatars.map(av => `
              <button
                type="button"
                onclick="App.selectAvatar('${av.id}')"
                class="p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition ${
                  state.avatarId === av.id
                    ? 'border-indigo-600 bg-indigo-50 scale-105'
                    : 'border-slate-200 hover:bg-slate-50'
                }"
              >
                <span class="text-2xl">${av.emoji}</span>
                <span class="text-xs font-kid font-bold text-slate-700">${av.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Voice & Speed Settings -->
        <div class="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 space-y-3">
          <div class="font-kid font-bold text-amber-950 text-sm flex items-center justify-between">
            <span>🎙️ ตั้งค่าเสียงครูผู้อ่านภาษาไทย</span>
            <button
              type="button"
              onclick="App.previewVoiceSettings()"
              class="kid-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 text-xs"
            >
              🔊 ทดสอบเสียงอ่าน
            </button>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-600">เลือกเสียงภาษาไทยในอุปกรณ์ (แนะนำเสียง Natural / Premwadee / Google):</label>
            <select id="voice-select-input" class="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-sm font-medium text-slate-800">
              ${vs.voices.length > 0
                ? vs.voices.map(v => `
                    <option value="${escapeHtml(v.voiceURI)}" ${v.voiceURI === vs.selectedVoiceURI ? 'selected' : ''}>
                      ${escapeHtml(v.name)} (${escapeHtml(v.lang)})
                    </option>
                  `).join('')
                : '<option value="">เสียงภาษาไทยเริ่มต้นของระบบ (th-TH)</option>'
              }
            </select>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-600">จังหวะความเร็วในการอ่าน:</label>
            <select id="voice-rate-input" class="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-sm font-medium text-slate-800">
              <option value="0.82" ${Math.abs(vs.rate - 0.82) < 0.04 ? 'selected' : ''}>🐢 ช้าชัดทีละคำ (0.82x - เหมาะสำหรับฝึกสะกดคำ)</option>
              <option value="0.92" ${Math.abs(vs.rate - 0.92) < 0.04 ? 'selected' : ''}>👩‍🏫 จังหวะธรรมชาติ (0.92x - แนะนำ)</option>
              <option value="1.0" ${Math.abs(vs.rate - 1.0) < 0.04 ? 'selected' : ''}>🐇 จังหวะปกติคล่องแคล่ว (1.0x)</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-1">
          <button onclick="App.closeProfileModal()" class="kid-btn bg-slate-200 text-slate-700 px-4 py-2.5 text-sm">
            ยกเลิก
          </button>
          <button onclick="App.saveProfileModal()" class="kid-btn bg-indigo-600 text-white px-6 py-2.5 text-sm">
            💾 บันทึกข้อมูล
          </button>
        </div>
      </div>
    `;
  }

  function previewVoiceSettings() {
    const voiceSel = document.getElementById('voice-select-input');
    const rateSel = document.getElementById('voice-rate-input');
    if (voiceSel || rateSel) {
      SoundSystem.setVoiceSettings({
        voiceURI: voiceSel ? voiceSel.value : undefined,
        rate: rateSel ? parseFloat(rateSel.value) : 0.92
      });
    }
    SoundSystem.speakThai('สวัสดีจ้ะเด็กดี , วันนี้มาฝึกอ่านคำคล้องจอง , รถไฟ , ใบไม้ , ไข่ดาว , สาวสวย กันนะจ๊ะ');
  }

  function selectAvatar(avId) {
    SoundSystem.playClick();
    const input = document.getElementById('profile-name-input');
    if (input) state.studentName = input.value.trim() || state.studentName;
    state.avatarId = avId;
    openProfileModal();
  }

  function saveProfileModal() {
    const input = document.getElementById('profile-name-input');
    if (input && input.value.trim()) {
      state.studentName = input.value.trim();
    }
    const voiceSel = document.getElementById('voice-select-input');
    const rateSel = document.getElementById('voice-rate-input');
    if (voiceSel || rateSel) {
      SoundSystem.setVoiceSettings({
        voiceURI: voiceSel ? voiceSel.value : undefined,
        rate: rateSel ? parseFloat(rateSel.value) : 0.92
      });
    }
    SoundSystem.playCorrect();
    saveState();
    closeProfileModal();
    renderMainContent();
    showToast(`บันทึกการตั้งค่าเรียบร้อยแล้วจ้ะ!`);
  }

  function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
  }

  function resetAllProgress() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    state = getInitialState();
    activeLessonIndex = 0;
    activeWorksheetIndex = 0;
    currentWsAnswers = {};
    currentWsSubmitted = {};
    initBubbleLevel(0);
    trainState = {
      stageIndex: 0,
      score: 0,
      answered: false,
      selectedOption: null,
      finished: false
    };
    poetState = {
      quizIndex: 0,
      score: 0,
      answered: false,
      selectedOption: null,
      finished: false
    };
    SoundSystem.playClick();
    saveState();
    renderMainContent();
    showToast('🔄 ล้างสถิติและเริ่มรอบการเรียนรู้ใหม่เรียบร้อยแล้ว!');
  }

  function toggleSoundBtn() {
    SoundSystem.toggleSound();
    updateHeaderUI();
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeQuotes(str) {
    return String(str || '').replace(/'/g, "\\'").replace(/"/g, '');
  }

  function init() {
    loadState();
    initBubbleLevel(0);
    updateHeaderUI();
    renderMainContent();
  }

  return {
    init,
    navigate,
    selectLesson,
    answerLessonMiniCheck,
    completeCurrentLesson,
    setMediaSubTab,
    setFlashcardCategory,
    toggleFlipCard,
    selectWorksheet,
    selectWorksheetAnswer,
    submitWorksheet,
    resetCurrentWorksheet,
    printCurrentWorksheet,
    switchGame,
    startBubbleLevel,
    selectBubbleLeft,
    selectBubbleRight,
    answerTrainStage,
    nextTrainStage,
    restartTrainGame,
    answerPoetQuiz,
    nextPoetQuiz,
    restartPoetGame,
    openProfileModal,
    previewVoiceSettings,
    selectAvatar,
    saveProfileModal,
    closeProfileModal,
    resetAllProgress,
    toggleSoundBtn
  };
})();

window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
