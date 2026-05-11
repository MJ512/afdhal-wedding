(function () {
  const loader = document.getElementById("loader");
  const progress = document.getElementById("progress");
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const scrollButtons = document.querySelectorAll("[data-scroll-target]");
  const musicButton = document.getElementById("music-btn");

  window.addEventListener("load", () => {
    window.setTimeout(() => loader && loader.classList.add("hidden"), 700);
  });

  function closeNav() {
    document.body.classList.remove("nav-open");
    nav.classList.remove("menu-open");
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  function updateScrollState() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const percent = height > 0 ? (scrollTop / height) * 100 : 0;

    if (progress) progress.style.width = `${percent}%`;
    if (nav) nav.classList.toggle("scrolled", scrollTop > 42);
  }

  window.addEventListener("scroll", updateScrollState, { passive: true });
  updateScrollState();

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    document.body.classList.toggle("nav-open", isOpen);
    nav.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  scrollButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.scrollTarget);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  let audioCtx = null;
  let nodes = [];

  function stopAmbientMusic() {
    nodes.forEach((node) => {
      try {
        if (typeof node.stop === "function") node.stop();
        node.disconnect();
      } catch (error) {
        // Nodes may already be disconnected after context close.
      }
    });
    nodes = [];
    if (audioCtx) audioCtx.close();
    audioCtx = null;
    musicButton.classList.remove("is-playing");
  }

  function startAmbientMusic() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [261.63, 329.63, 392.0, 523.25];

    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.025, audioCtx.currentTime + 1.6);
      lfo.frequency.value = 0.08 + index * 0.025;
      lfoGain.gain.value = 0.01;

      osc.connect(gain);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      gain.connect(audioCtx.destination);
      osc.start();
      lfo.start();
      nodes.push(osc, gain, lfo, lfoGain);
    });

    musicButton.classList.add("is-playing");
  }

  musicButton.addEventListener("click", () => {
    if (audioCtx) {
      stopAmbientMusic();
      return;
    }
    startAmbientMusic();
  });
})();
