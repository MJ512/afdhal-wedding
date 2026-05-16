(function () {
  const revealEls = document.querySelectorAll(".reveal");
  const parallaxEls = document.querySelectorAll("[data-parallax]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.16 }
  );

  revealEls.forEach((el) => observer.observe(el));

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY || window.pageYOffset;
    parallaxEls.forEach((el) => {
      const speed = Number(el.dataset.parallax || 0);
      el.style.transform = `translate3d(-50%, ${scrollY * speed}px, 0)`;
    });
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateParallax);
    },
    { passive: true }
  );
})();
