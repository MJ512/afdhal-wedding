(function () {
  const target = new Date("2026-07-19T11:30:00+05:30").getTime();
  const ids = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs")
  };
  const previous = {};

  function format(value) {
    return String(value).padStart(2, "0");
  }

  function setValue(key, value) {
    const el = ids[key];
    if (!el || previous[key] === value) return;
    el.textContent = value;
    el.classList.remove("changed");
    void el.offsetWidth;
    el.classList.add("changed");
    previous[key] = value;
  }

  function updateCountdown() {
    const diff = Math.max(target - Date.now(), 0);
    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;

    setValue("days", format(Math.floor(diff / day)));
    setValue("hours", format(Math.floor((diff % day) / hour)));
    setValue("mins", format(Math.floor((diff % hour) / minute)));
    setValue("secs", format(Math.floor((diff % minute) / 1000)));
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
})();
