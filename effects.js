// Cute Kawaii Sound Effects (Web Audio API) & Sparkle Burst Effects
window.ClassroomFX = (() => {
  let soundEnabled = localStorage.getItem("benjawan_sound_enabled") !== "false";
  let audioCtx = null;

  function getCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(freq, duration = 0.09, type = "sine", volume = 0.12, delay = 0) {
    if (!soundEnabled) return;
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function playPop() {
    playTone(580, 0.07, "sine", 0.1, 0);
    playTone(820, 0.08, "triangle", 0.08, 0.03);
  }

  function playChime() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => playTone(n, 0.14, "triangle", 0.09, i * 0.055));
  }

  function playSparkle() {
    playTone(880, 0.08, "sine", 0.08, 0);
    playTone(1174.66, 0.1, "sine", 0.08, 0.05);
    playTone(1396.91, 0.14, "triangle", 0.09, 0.1);
  }

  let cachedVoices = [];
  if ("speechSynthesis" in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      cachedVoices = window.speechSynthesis.getVoices();
    });
  }

  function pickCuteFemaleThaiVoice() {
    const voices = cachedVoices.length ? cachedVoices : (window.speechSynthesis.getVoices() || []);
    const thVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().includes("th"));
    if (!thVoices.length) return null;

    const preferredPatterns = [/premwadee/i, /google/i, /kanya/i, /narisa/i, /female/i, /natural/i];
    for (const pat of preferredPatterns) {
      const match = thVoices.find((v) => pat.test(v.name) && !/niwat|pattara|male/i.test(v.name));
      if (match) return match;
    }
    return thVoices.find((v) => !/niwat|pattara|male/i.test(v.name)) || thVoices[0];
  }

  function speakGreeting(text) {
    if (!soundEnabled || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "th-TH";
      utter.rate = 1.05;
      utter.pitch = 1.24;
      const thVoice = pickCuteFemaleThaiVoice();
      if (thVoice) utter.voice = thVoice;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore speech errors
    }
  }

  function spawnSparkles(x, y, count = 10) {
    const symbols = ["✦", "★", "💖", "✨", "🌸", "⭐"];
    const colors = ["#ff7aa2", "#38bdf8", "#fbbf24", "#34d399", "#a78bfa"];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "fx-particle";
      el.textContent = symbols[i % symbols.length];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.color = colors[i % colors.length];
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 36 + Math.random() * 48;
      el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      el.style.setProperty("--dy", `${Math.sin(angle) * dist - 18}px`);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 750);
    }
  }

  function isSoundEnabled() {
    return soundEnabled;
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem("benjawan_sound_enabled", String(soundEnabled));
    if (soundEnabled) playChime();
    return soundEnabled;
  }

  return {
    playPop,
    playChime,
    playSparkle,
    speakGreeting,
    spawnSparkles,
    isSoundEnabled,
    toggleSound
  };
})();
