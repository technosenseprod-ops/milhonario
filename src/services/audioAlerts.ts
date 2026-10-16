// High-fidelity procedural institutional audio synthesizer using Web Audio API

let audioCtx: AudioContext | null = null;
let isAudioArmed = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setAudioArmed(armed: boolean) {
  isAudioArmed = armed;
  if (armed) {
    const ctx = getAudioContext();
    // Play subtle arming chime
    playTone(880, 0.08, 'sine', 0.1);
  }
}

export function getIsAudioArmed(): boolean {
  return isAudioArmed;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.2, delay = 0) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch (e) {
    console.warn('Audio tone dispatch error', e);
  }
}

export function playAlertSound(type: string) {
  if (!isAudioArmed) return;

  switch (type) {
    case 'BUY':
      // Ascending crisp institutional chime: 587Hz (D5) -> 880Hz (A5)
      playTone(587.33, 0.12, 'triangle', 0.25, 0);
      playTone(880.0, 0.2, 'sine', 0.3, 0.1);
      break;

    case 'SELL':
      // Descending warning tone: 784Hz (G5) -> 440Hz (A4)
      playTone(783.99, 0.14, 'sawtooth', 0.2, 0);
      playTone(440.0, 0.25, 'triangle', 0.25, 0.12);
      break;

    case 'WEAKENING':
    case 'EXIT':
      // Dual tick warn
      playTone(660, 0.08, 'sine', 0.2, 0);
      playTone(550, 0.1, 'sine', 0.15, 0.08);
      break;

    case 'REVERSAL':
      // Rapid tri-tone inflection
      playTone(523.25, 0.06, 'triangle', 0.2, 0);
      playTone(659.25, 0.06, 'triangle', 0.25, 0.07);
      playTone(783.99, 0.15, 'sine', 0.3, 0.14);
      break;

    case 'STOP':
      // Urgent triple pulses
      playTone(330, 0.1, 'sawtooth', 0.35, 0);
      playTone(330, 0.1, 'sawtooth', 0.35, 0.12);
      playTone(330, 0.15, 'sawtooth', 0.35, 0.24);
      break;

    case 'TARGET':
      // Pleasant double target ping
      playTone(1046.5, 0.1, 'sine', 0.25, 0);
      playTone(1318.5, 0.22, 'sine', 0.3, 0.1);
      break;

    case 'DATA_STALE':
      // Low tech digital fault beep
      playTone(220, 0.25, 'square', 0.2, 0);
      playTone(180, 0.35, 'square', 0.25, 0.2);
      break;

    default:
      playTone(750, 0.1, 'sine', 0.15);
      break;
  }
}
