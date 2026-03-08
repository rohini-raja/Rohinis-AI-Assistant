
const audioCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

let ctx: AudioContext | null = null;
function getCtx() {
  if (!ctx) ctx = audioCtx();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch {}
}

export function playCompleteSound() {
  const c = getCtx();
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, "sine", 0.12), i * 80);
  });
}

export function playCreateSound() {
  playTone(880, 0.15, "sine", 0.1);
  setTimeout(() => playTone(1100, 0.2, "sine", 0.1), 100);
}

export function playCloneSound() {
  const c = getCtx();
  [200, 400, 300, 500].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.08, "square", 0.06), i * 40);
  });
}

export function playDeleteSound() {
  [600, 400, 200].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, "sawtooth", 0.08), i * 80);
  });
}

export function playAchievementSound() {
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.4, "sine", 0.15), i * 120);
  });
}

export function playRecurringSound() {
  [440, 550, 660, 550, 440].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.12, "triangle", 0.1), i * 60);
  });
}

export function playClickSound() {
  playTone(1000, 0.05, "sine", 0.05);
}
