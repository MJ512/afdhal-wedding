(function () {
  const progress = document.getElementById("progress");
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const scrollButtons = document.querySelectorAll("[data-scroll-target]");
  const musicButton = document.getElementById("music-btn");
  const introAudio = document.getElementById("introAudio");
  const unlockIntro = document.getElementById("mobile-unlock");
  const unlockSlider = document.getElementById("unlock-slider");
  const unlockHandle = document.getElementById("unlock-handle");
  const unlockParticles = document.getElementById("unlock-particles");
  const countdownSection = document.getElementById("countdown");
  let lastCountdownPoppers = 0;

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

  let audioFadeFrame = 0;
  let audioStarted = false;

  function updateMusicButton() {
    if (!musicButton || !introAudio) return;
    musicButton.classList.toggle("is-playing", !introAudio.paused && !introAudio.ended);
  }

  function fadeAudioVolume(targetVolume, duration = 1400) {
    if (!introAudio) return;
    window.cancelAnimationFrame(audioFadeFrame);

    const startVolume = introAudio.volume;
    const startTime = performance.now();

    function fade(now) {
      const elapsed = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      introAudio.volume = startVolume + (targetVolume - startVolume) * eased;

      if (elapsed < 1) {
        audioFadeFrame = window.requestAnimationFrame(fade);
      } else {
        audioFadeFrame = 0;
      }
    }

    audioFadeFrame = window.requestAnimationFrame(fade);
  }

  function startIntroAudio() {
    if (!introAudio || audioStarted) return;

    audioStarted = true;
    introAudio.loop = true;
    introAudio.volume = 0;
    introAudio.currentTime = 0;
    if (introAudio.readyState < 2) introAudio.load();

    const playPromise = introAudio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          fadeAudioVolume(0.72);
          updateMusicButton();
        })
        .catch(() => {
          audioStarted = false;
          updateMusicButton();
        });
      return;
    }

    fadeAudioVolume(0.72);
    updateMusicButton();
  }

  function stopIntroAudio() {
    if (!introAudio) return;
    window.cancelAnimationFrame(audioFadeFrame);
    audioFadeFrame = 0;
    introAudio.pause();
    introAudio.volume = 0;
    audioStarted = false;
    updateMusicButton();
  }

  function createUnlockParticles() {
    if (!unlockParticles || unlockParticles.children.length) return;

    const particleCount = window.innerWidth < 520 ? 30 : 46;
    for (let i = 0; i < particleCount; i += 1) {
      const particle = document.createElement("span");
      const size = 1.2 + Math.random() * 3.4;
      const burstX = (Math.random() - 0.5) * (window.innerWidth < 520 ? 16 : 28);
      const burstY = -8 - Math.random() * (window.innerWidth < 520 ? 24 : 34);

      particle.className = "unlock-particle";
      particle.style.setProperty("--px", `${8 + Math.random() * 84}%`);
      particle.style.setProperty("--py", `${8 + Math.random() * 84}%`);
      particle.style.setProperty("--ps", `${size}px`);
      particle.style.setProperty("--po", String(0.22 + Math.random() * 0.58));
      particle.style.setProperty("--pd", `${(Math.random() - 0.5) * 4.2}rem`);
      particle.style.setProperty("--bdx", `${burstX}rem`);
      particle.style.setProperty("--bdy", `${burstY}rem`);
      unlockParticles.appendChild(particle);
    }
  }

  function createEnterConfetti() {
    const layer = document.createElement("div");
    const count = window.innerWidth < 540 ? 28 : 42;
    const colors = ["#f5e9c4", "#e4c97a", "#fffdf7", "#c9a84c", "#88a98f"];

    layer.className = "enter-confetti";
    layer.setAttribute("aria-hidden", "true");

    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const distance = (window.innerWidth < 540 ? 110 : 180) + Math.random() * (window.innerWidth < 540 ? 120 : 220);
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - Math.random() * 90;

      piece.style.setProperty("--cw", `${3 + Math.random() * 4}px`);
      piece.style.setProperty("--ch", `${8 + Math.random() * 15}px`);
      piece.style.setProperty("--cc", colors[Math.floor(Math.random() * colors.length)]);
      piece.style.setProperty("--cr", `${Math.random() * 180}deg`);
      piece.style.setProperty("--tx", `${tx}px`);
      piece.style.setProperty("--ty", `${ty}px`);
      piece.style.animationDelay = `${Math.random() * 0.12}s`;
      layer.appendChild(piece);
    }

    document.body.appendChild(layer);
    window.setTimeout(() => layer.remove(), 1700);
  }

  function isCountdownNearViewport() {
    if (!countdownSection) return false;
    const rect = countdownSection.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.08;
  }

  function playCountdownPoppers(options = {}) {
    if (!countdownSection || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const now = performance.now();
    if (!options.force && now - lastCountdownPoppers < 6500) return;
    if (!options.force && !isCountdownNearViewport()) return;
    lastCountdownPoppers = now;

    const oldLayer = countdownSection.querySelector(".countdown-poppers");
    oldLayer && oldLayer.remove();

    const layer = document.createElement("div");
    const isCompact = window.innerWidth < 540;
    const count = isCompact ? 34 : window.innerWidth < 980 ? 46 : 58;
    const colors = [
      "rgba(245, 233, 196, 0.92)",
      "rgba(228, 201, 122, 0.86)",
      "rgba(201, 168, 76, 0.78)",
      "rgba(255, 253, 247, 0.76)"
    ];

    layer.className = "countdown-poppers";
    layer.setAttribute("aria-hidden", "true");

    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      const typeRoll = Math.random();
      const isSpark = typeRoll > 0.58;
      const isTrail = typeRoll <= 0.16;
      const isBurst = typeRoll > 0.88;
      const side = i % 2 === 0 ? -1 : 1;
      const originX = side < 0 ? 16 + Math.random() * 18 : 66 + Math.random() * 18;
      const originY = 64 + Math.random() * 16;
      const driftX = side * ((isCompact ? 34 : 58) + Math.random() * (isCompact ? 58 : 92));
      const driftY = -(isCompact ? 60 : 90) - Math.random() * (isCompact ? 108 : 150);
      const size = isBurst ? 9 + Math.random() * 15 : isSpark ? 2 + Math.random() * 3 : 3 + Math.random() * 5;

      piece.className = "countdown-popper";
      if (isSpark) piece.classList.add("is-spark");
      if (isTrail) piece.classList.add("is-trail");
      if (isBurst) piece.classList.add("is-burst");

      piece.style.setProperty("--px", `${originX}%`);
      piece.style.setProperty("--py", `${originY}%`);
      piece.style.setProperty("--pw", `${isTrail ? 28 + Math.random() * 38 : size}px`);
      piece.style.setProperty("--ph", `${isTrail ? 1 : isSpark || isBurst ? size : size * (1.7 + Math.random())}px`);
      piece.style.setProperty("--pr", isSpark || isBurst ? "50%" : "999px");
      piece.style.setProperty("--pc", colors[Math.floor(Math.random() * colors.length)]);
      piece.style.setProperty("--dx", `${driftX}px`);
      piece.style.setProperty("--dy", `${driftY}px`);
      piece.style.setProperty("--rot", `${Math.random() * 180}deg`);
      piece.style.setProperty("--spin", `${side * (120 + Math.random() * 220)}deg`);
      piece.style.setProperty("--scale", String(0.52 + Math.random() * 0.7));
      piece.style.setProperty("--po", String(0.34 + Math.random() * 0.54));
      piece.style.setProperty("--dur", `${3.1 + Math.random() * 1.45}s`);
      piece.style.setProperty("--delay", `${Math.random() * 0.46}s`);
      layer.appendChild(piece);
    }

    countdownSection.appendChild(layer);
    requestAnimationFrame(() => layer.classList.add("is-playing"));
    window.setTimeout(() => layer.remove(), 5200);
  }

  function initCountdownReveal() {
    if (!countdownSection) return;

    const sparkleCount = window.innerWidth < 540 ? 10 : 16;
    for (let i = 0; i < sparkleCount; i += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "countdown-sparkle";
      sparkle.setAttribute("aria-hidden", "true");
      sparkle.style.setProperty("--sx", `${8 + Math.random() * 84}%`);
      sparkle.style.setProperty("--sy", `${14 + Math.random() * 72}%`);
      sparkle.style.setProperty("--ss", `${2 + Math.random() * 3}px`);
      sparkle.style.setProperty("--sd", `${Math.random() * 1.2}s`);
      countdownSection.appendChild(sparkle);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        countdownSection.classList.add("in-view");
        playCountdownPoppers({ force: true });
        countdownSection.querySelectorAll(".count-num").forEach((num, index) => {
          window.setTimeout(() => {
            num.classList.remove("changed");
            void num.offsetWidth;
            num.classList.add("changed");
          }, index * 120);
        });
        observer.disconnect();
      },
      { threshold: 0.28, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(countdownSection);
  }

  function initCinematicUnlock() {
    if (!unlockIntro || !unlockSlider || !unlockHandle) return;

    createUnlockParticles();
    document.body.classList.add("unlock-active");
    unlockIntro.classList.add("is-active");

    let frame = 0;
    let dragging = false;
    let unlocked = false;
    let startX = 0;
    let startValue = 0;
    let maxX = 1;
    let currentX = 0;
    let targetX = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;

    function measure() {
      const sliderStyles = window.getComputedStyle(unlockSlider);
      const sidePadding = parseFloat(sliderStyles.paddingLeft) + parseFloat(sliderStyles.paddingRight);
      maxX = Math.max(1, unlockSlider.clientWidth - unlockHandle.offsetWidth - sidePadding);
    }

    function setProgress(value) {
      const progressValue = Math.max(0, Math.min(1, value / maxX));
      unlockIntro.style.setProperty("--unlock-x", `${value}px`);
      unlockIntro.style.setProperty("--unlock-progress", progressValue.toFixed(4));
    }

    function tick() {
      if (dragging) {
        currentX = targetX;
      } else {
        currentX += (targetX - currentX) * 0.22;
      }

      if (Math.abs(targetX - currentX) < 0.12) currentX = targetX;
      setProgress(currentX);

      if (dragging || Math.abs(targetX - currentX) > 0.12) {
        frame = window.requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    }

    function startTicking() {
      if (!frame) frame = window.requestAnimationFrame(tick);
    }

    function completeUnlock() {
      if (unlocked) return;
      unlocked = true;
      targetX = maxX;
      currentX = maxX;
      setProgress(maxX);
      startIntroAudio();
      unlockSlider.classList.remove("is-dragging");
      unlockIntro.classList.add("is-unlocked");

      window.setTimeout(() => {
        unlockIntro.classList.add("is-leaving");
        document.body.classList.remove("unlock-active");
        document.body.classList.add("unlock-revealed");
        createEnterConfetti();
        window.setTimeout(() => playCountdownPoppers(), 900);
      }, 360);

      window.setTimeout(() => {
        unlockIntro.remove();
      }, 1500);
    }

    function beginDrag(event) {
      if (unlocked) return;
      if (event.button !== undefined && event.button !== 0) return;
      const clientX = event.clientX;
      if (typeof clientX !== "number") return;
      if (event.cancelable) event.preventDefault();

      measure();
      dragging = true;
      startX = clientX;
      startValue = targetX;
      lastX = clientX;
      lastTime = performance.now();
      velocity = 0;
      unlockSlider.classList.add("is-dragging");
      if (event.pointerId !== undefined && unlockSlider.setPointerCapture) {
        unlockSlider.setPointerCapture(event.pointerId);
      }
      startTicking();
    }

    function moveDrag(event) {
      if (!dragging || unlocked) return;
      if (event.cancelable) event.preventDefault();

      const clientX = event.clientX;
      if (typeof clientX !== "number") return;
      const now = performance.now();
      const delta = clientX - startX;
      const raw = startValue + delta;
      targetX = raw < 0 ? raw * 0.22 : raw > maxX ? maxX + (raw - maxX) * 0.16 : raw;
      velocity = (clientX - lastX) / Math.max(1, now - lastTime);
      lastX = clientX;
      lastTime = now;
    }

    function endDrag(event) {
      if (!dragging || unlocked) return;
      dragging = false;
      unlockSlider.classList.remove("is-dragging");

      try {
        if (event.pointerId !== undefined && unlockSlider.releasePointerCapture) {
          unlockSlider.releasePointerCapture(event.pointerId);
        }
      } catch (error) {
        // Pointer capture can be absent if the browser cancelled the gesture.
      }

      const projected = targetX + velocity * 180;
      if (projected >= maxX * 0.9 && targetX > maxX * 0.68) {
        completeUnlock();
        return;
      }

      targetX = 0;
      startTicking();
    }

    measure();
    setProgress(0);
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", () => window.setTimeout(measure, 250), { passive: true });

    unlockSlider.addEventListener("pointerdown", beginDrag);
    window.addEventListener("pointermove", moveDrag, { passive: false });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    unlockSlider.addEventListener("lostpointercapture", endDrag);
  }

  if (introAudio) {
    introAudio.addEventListener("play", updateMusicButton);
    introAudio.addEventListener("pause", updateMusicButton);
    introAudio.addEventListener("ended", updateMusicButton);
  }

  if (musicButton) {
    musicButton.addEventListener("click", () => {
      if (!introAudio) return;
      if (!introAudio.paused && !introAudio.ended) {
        stopIntroAudio();
        return;
      }

      audioStarted = false;
      startIntroAudio();
    });
  }

  initCinematicUnlock();
  initCountdownReveal();
})();
