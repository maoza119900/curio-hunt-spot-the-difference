// Synthesized sound: every effect is a few WebAudio oscillators, so the game ships no audio
// files and makes no network request. Created lazily on the first user gesture (browsers block
// audio before one); muted with M. Silent when audio is unavailable.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
    return ctx;
  }

  function tone(freq, at, dur, type, vol) {
    const ac = ensure();
    if (!ac || muted) return;
    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ac.currentTime + at);
      gain.gain.linearRampToValueAtTime(vol, ac.currentTime + at + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start(ac.currentTime + at);
      osc.stop(ac.currentTime + at + dur + 0.05);
    } catch {
      // Audio is decoration: never let it break the game.
    }
  }

  return {
    unlock() {
      const ac = ensure();
      if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    click() {
      tone(660, 0, 0.06, 'triangle', 0.08);
    },
    /** A satisfying two-note chime when a difference is found. */
    find() {
      tone(523.25, 0, 0.16, 'sine', 0.16);
      tone(783.99, 0.09, 0.28, 'sine', 0.16);
      tone(1046.5, 0.18, 0.22, 'triangle', 0.08);
    },
    /** A low buzz for a wrong click. */
    wrong() {
      tone(160, 0, 0.18, 'sawtooth', 0.07);
      tone(110, 0.05, 0.22, 'sawtooth', 0.06);
    },
    hint() {
      tone(880, 0, 0.12, 'sine', 0.1);
      tone(1174.66, 0.1, 0.18, 'sine', 0.1);
    },
    tick() {
      tone(1200, 0, 0.04, 'square', 0.04);
    },
    win() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.12));
    },
    lose() {
      [392, 329.63, 261.63].forEach((f, i) => tone(f, i * 0.16, 0.34, 'triangle', 0.1));
    },
  };
}
