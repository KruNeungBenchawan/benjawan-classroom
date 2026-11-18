// ระบบเสียงอ่านภาษาไทย (รองรับทั้งมือถือ iOS / Android / LINE Browser และคอมพิวเตอร์)
// ผสาน Cloud Thai Neural TTS (/api/tts) + Web Speech API + เสียงดนตรีอะคูสติก
const SoundSystem = (() => {
  let audioCtx = null;
  let soundEnabled = true;
  let speechRate = 0.92;
  let speechPitch = 1.0;
  let availableThaiVoices = [];
  let selectedVoiceURI = 'cloud-th'; // ค่าเริ่มต้นใช้เสียง Cloud ภาษาไทยเพื่อให้มือถือทุกรุ่นมีเสียงแน่นอน
  let activeQueueId = 0;
  let sharedAudio = null;
  let mobileUnlocked = false;

  function getCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function getSharedAudio() {
    if (!sharedAudio && typeof Audio !== 'undefined') {
      sharedAudio = new Audio();
      sharedAudio.preload = 'auto';
      sharedAudio.setAttribute('playsinline', 'true');
      sharedAudio.setAttribute('webkit-playsinline', 'true');
    }
    return sharedAudio;
  }

  // ปลดล็อกระบบเสียงบนมือถือ iOS (Safari) และ Android ทันทีที่แตะหน้าจอครั้งแรก
  function unlockMobileAudio() {
    if (mobileUnlocked) return;
    try {
      // สำหรับ iOS 17+ ให้เล่นเสียงออกลำโพงได้แม้เปิดปุ่ม Silent ข้างเครื่อง
      if (navigator.audioSession && navigator.audioSession.type !== 'playback') {
        navigator.audioSession.type = 'playback';
      }
    } catch (e) {}

    try {
      const ctx = getCtx();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        // เล่นคลื่นเงียบ 1 เฟรมเพื่อปลดล็อก Web Audio บน iPhone/iPad
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        if (source.start) source.start(0);
      }
    } catch (e) {}

    mobileUnlocked = true;
  }

  if (typeof window !== 'undefined') {
    ['touchstart', 'touchend', 'click', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlockMobileAudio, { passive: true, once: false });
    });
  }

  // =========================================================
  // 1. ค้นหาเสียงภาษาไทยในเครื่อง (สำหรับโหมดออฟไลน์หรือผู้ที่ต้องการเลือกเสียงในเครื่อง)
  // =========================================================
  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    try {
      const allVoices = window.speechSynthesis.getVoices() || [];
      const thai = allVoices.filter(
        v =>
          (v.lang && v.lang.toLowerCase().includes('th')) ||
          (v.name && /thai|ไทย|premwadee|niwat|kanya|narisa|pattara/i.test(v.name))
      );
      thai.sort((a, b) => scoreVoiceQuality(b) - scoreVoiceQuality(a));
      availableThaiVoices = thai;
    } catch (e) {}
  }

  function scoreVoiceQuality(voice) {
    const name = (voice.name || '').toLowerCase();
    let score = 0;
    if (name.includes('natural') || name.includes('online') || name.includes('neural')) score += 100;
    if (name.includes('premwadee')) score += 80;
    if (name.includes('niwat')) score += 70;
    if (name.includes('google')) score += 65;
    if (name.includes('kanya') || name.includes('narisa') || name.includes('siri')) score += 60;
    if (voice.localService === false) score += 20;
    return score;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  // =========================================================
  // 2. ทำความสะอาดข้อความภาษาไทยก่อนอ่าน
  // =========================================================
  function cleanTextForThaiSpeech(rawText) {
    if (!rawText) return '';
    let text = String(rawText);

    // ลบ HTML tags
    text = text.replace(/<[^>]+>/g, ' ');

    // ลบ Emoji และสัญลักษณ์พิเศษทั้งหมด
    text = text.replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{1FA00}-\u{1FAFF}\u{2B50}\u{2728}\u{2705}\u{274C}\u{FE0F}\u{200D}]/gu,
      ' '
    );

    // แปลงจุดไข่ปลาในโจทย์
    text = text.replace(/\.{3,}/g, ' เว้นว่าง ');

    // แปลงเครื่องหมายเชื่อมคำคล้องจองให้เป็นการเว้นวรรคธรรมชาติ
    text = text.replace(/[→↔🔗•|]/g, ' , ');
    text = text.replace(/\s+-\s+/g, ' , ');

    // ลบวงเล็บสัญลักษณ์สระย่อ เช่น (-า)
    text = text.replace(/\([^)]*[-/][^)]*\)/g, ' ');

    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }

  // แบ่งข้อความยาวไม่เกิน 160 ตัวอักษรสำหรับ Cloud TTS
  function splitForCloudTts(cleanedText) {
    if (!cleanedText) return [];
    const rawParts = cleanedText
      .split(/\s*,\s*/)
      .map(s => s.trim())
      .filter(Boolean);

    const chunks = [];
    let current = '';

    for (const part of rawParts) {
      if (!current) {
        current = part;
      } else if ((current + ' ' + part).length <= 140) {
        // คั่นด้วยช่องว่างเพื่อให้เสียงอ่านเว้นจังหวะธรรมชาติในไฟล์เสียงเดียว (ไม่ติดขัดบนมือถือ)
        current += '   ' + part;
      } else {
        chunks.push(current);
        current = part;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  // =========================================================
  // 3. อ่านออกเสียงภาษาไทย (รองรับทั้งมือถือและคอมพิวเตอร์ 100%)
  // =========================================================
  function speakThai(rawText, onStart, onEnd) {
    unlockMobileAudio();
    playSoftTap();

    const myQueueId = ++activeQueueId;

    // หยุดเสียงที่กำลังเล่นอยู่เดิม
    const audioEl = getSharedAudio();
    if (audioEl) {
      try {
        audioEl.pause();
      } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    const cleaned = cleanTextForThaiSpeech(rawText);
    if (!cleaned) {
      if (onEnd) onEnd();
      return;
    }

    const isHttpOnline =
      typeof window !== 'undefined' &&
      (window.location.protocol === 'http:' || window.location.protocol === 'https:');

    // ถ้าเปิดผ่านเว็บออนไลน์และเลือกใช้เสียง Cloud (ค่าเริ่มต้น) ให้เล่นผ่าน HTML5 Audio (/api/tts)
    // ซึ่งใช้ได้กับมือถือทุกรุ่น (iPhone, iPad, Android, LINE Browser) โดยไม่ต้องพึ่งพาแอป TTS ในเครื่อง
    if (isHttpOnline && selectedVoiceURI === 'cloud-th') {
      speakViaCloudAudio(cleaned, myQueueId, onStart, onEnd);
      return;
    }

    // กรณีเปิดไฟล์ออฟไลน์ (file://) หรือเลือกเสียงในเครื่อง
    speakViaBrowserSynthesis(cleaned, myQueueId, onStart, onEnd);
  }

  function speakViaCloudAudio(cleanedText, myQueueId, onStart, onEnd) {
    const chunks = splitForCloudTts(cleanedText);
    const audioEl = getSharedAudio();
    if (!audioEl || chunks.length === 0) {
      speakViaBrowserSynthesis(cleanedText, myQueueId, onStart, onEnd);
      return;
    }

    if (onStart) onStart();
    let idx = 0;

    function playNext() {
      if (myQueueId !== activeQueueId) return;
      if (idx >= chunks.length) {
        if (onEnd) onEnd();
        return;
      }

      const textChunk = chunks[idx++];
      const speedParam = speechRate <= 0.85 ? '0.24' : '1';
      const src = `/api/tts?q=${encodeURIComponent(textChunk)}&speed=${speedParam}`;

      audioEl.src = src;
      audioEl.playbackRate = speechRate;

      audioEl.onended = () => {
        if (myQueueId !== activeQueueId) return;
        if (idx < chunks.length) {
          playNext();
        } else if (onEnd) {
          onEnd();
        }
      };

      audioEl.onerror = () => {
        if (myQueueId !== activeQueueId) return;
        // หากเชื่อมต่อ /api/tts ไม่ได้ ให้สลับไปใช้ Web Speech API ของเครื่องทันที
        speakViaBrowserSynthesis(cleanedText, myQueueId, null, onEnd);
      };

      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (myQueueId !== activeQueueId) return;
          speakViaBrowserSynthesis(cleanedText, myQueueId, null, onEnd);
        });
      }
    }

    // เรียก playNext() ทันทีในจังหวะที่ผู้ใช้กดปุ่ม (ห้ามใช้ setTimeout เพื่อไม่ให้มือถือบล็อกเสียง)
    playNext();
  }

  // Fallback สำหรับ Web Speech API (เรียกแบบ Synchronous ทันทีที่คลิก เพื่อให้ทำงานบน iOS/Android ได้)
  function speakViaBrowserSynthesis(cleanedText, myQueueId, onStart, onEnd) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      if (onStart) onStart();
      // แทนที่เครื่องหมายจุลภาคด้วยช่องว่างเพื่อให้เป็นประโยคเดียวที่เรียก speak() ได้ทันทีใน user gesture
      const phrase = cleanedText.replace(/\s*,\s*/g, '   ').trim();
      const utter = new SpeechSynthesisUtterance(phrase);
      utter.lang = 'th-TH';
      utter.rate = speechRate;
      utter.pitch = speechPitch;
      utter.volume = 1.0;

      if (selectedVoiceURI && selectedVoiceURI !== 'cloud-th') {
        const matched = availableThaiVoices.find(v => v.voiceURI === selectedVoiceURI);
        if (matched) utter.voice = matched;
      } else if (availableThaiVoices.length > 0) {
        utter.voice = availableThaiVoices[0];
      }

      utter.onend = () => {
        if (myQueueId === activeQueueId && onEnd) onEnd();
      };
      utter.onerror = () => {
        if (myQueueId === activeQueueId && onEnd) onEnd();
      };

      // เรียกแบบ Synchronous ทันทีโดยไม่ผ่าน setTimeout
      window.speechSynthesis.speak(utter);
    } catch (e) {
      if (onEnd) onEnd();
    }
  }

  // =========================================================
  // 4. ระบบเสียงเอฟเฟกต์ดนตรีอะคูสติก (Marimba / Celesta)
  // =========================================================
  function playAcousticNote(freq, duration = 0.35, delay = 0, volume = 0.22, timbre = 'marimba') {
    if (!soundEnabled) return;
    unlockMobileAudio();
    const ctx = getCtx();
    if (!ctx) return;

    const start = ctx.currentTime + delay;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, start);
    masterGain.gain.linearRampToValueAtTime(volume, start + 0.012);
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.35, start + duration * 0.35);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    masterGain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, start);
    osc1.connect(masterGain);

    const osc2 = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    if (timbre === 'marimba') {
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 4, start);
      overtoneGain.gain.setValueAtTime(0.25, start);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, start + duration * 0.25);
    } else if (timbre === 'celesta') {
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, start);
      overtoneGain.gain.setValueAtTime(0.3, start);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, start + duration * 0.6);
    } else {
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.5, start);
      overtoneGain.gain.setValueAtTime(0.18, start);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, start + duration * 0.4);
    }

    osc2.connect(overtoneGain);
    overtoneGain.connect(masterGain);

    osc1.start(start);
    osc2.start(start);
    osc1.stop(start + duration + 0.02);
    osc2.stop(start + duration + 0.02);
  }

  function playSoftTap() {
    playAcousticNote(660, 0.09, 0, 0.12, 'marimba');
  }

  function playClick() {
    playAcousticNote(587.33, 0.11, 0, 0.14, 'marimba');
  }

  function playCorrect() {
    playAcousticNote(523.25, 0.32, 0.00, 0.20, 'celesta');
    playAcousticNote(659.25, 0.35, 0.09, 0.20, 'celesta');
    playAcousticNote(783.99, 0.40, 0.18, 0.22, 'celesta');
    playAcousticNote(1046.50, 0.55, 0.27, 0.24, 'celesta');
  }

  function playWrong() {
    playAcousticNote(329.63, 0.22, 0.00, 0.18, 'marimba');
    playAcousticNote(261.63, 0.38, 0.15, 0.20, 'marimba');
  }

  function playFanfare() {
    const melody = [
      { f: 523.25, d: 0.22, t: 0.00 },
      { f: 659.25, d: 0.22, t: 0.11 },
      { f: 783.99, d: 0.22, t: 0.22 },
      { f: 1046.50, d: 0.55, t: 0.34 },
      { f: 783.99, d: 0.20, t: 0.48 },
      { f: 1046.50, d: 0.70, t: 0.62 }
    ];
    melody.forEach(n => {
      playAcousticNote(n.f, n.d, n.t, 0.22, 'celesta');
    });
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) playCorrect();
    return soundEnabled;
  }

  function isSoundEnabled() {
    return soundEnabled;
  }

  function getVoiceSettings() {
    if (availableThaiVoices.length === 0) loadVoices();
    const cloudOption = {
      voiceURI: 'cloud-th',
      name: '🌟 เสียงครูไทยธรรมชาติ (Cloud Neural - รองรับมือถือทุกรุ่น)',
      lang: 'th-TH'
    };
    return {
      voices: [cloudOption, ...availableThaiVoices],
      selectedVoiceURI: selectedVoiceURI || 'cloud-th',
      rate: speechRate,
      pitch: speechPitch
    };
  }

  function setVoiceSettings({ voiceURI, rate, pitch }) {
    if (voiceURI !== undefined) selectedVoiceURI = voiceURI;
    if (typeof rate === 'number') speechRate = rate;
    if (typeof pitch === 'number') speechPitch = pitch;
  }

  return {
    playClick,
    playCorrect,
    playWrong,
    playFanfare,
    speakThai,
    toggleSound,
    isSoundEnabled,
    getVoiceSettings,
    setVoiceSettings
  };
})();
