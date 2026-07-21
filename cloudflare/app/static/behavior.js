(() => {
  const events = [];
  let lastMove = null;
  let lastKeyTs = null;
  let lastScroll = null;
  let deviceSent = false;
  const pageEnterTs = performance.now();
  const flushIntervalMs = 2000;

  function now() {
    return performance.now();
  }

  function record(type, payload) {
    events.push({
      type,
      ts: Date.now(),
      payload,
    });
  }

  window.addEventListener("mousemove", (e) => {
    const ts = now();
    if (lastMove) {
      const dt = Math.max(ts - lastMove.ts, 1);
      const dx = e.clientX - lastMove.x;
      const dy = e.clientY - lastMove.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = dist / dt;
      record("mouse_move", { speed });
    }
    lastMove = { x: e.clientX, y: e.clientY, ts };
  });

  window.addEventListener("click", () => {
    record("click", {});
  });

  window.addEventListener("keydown", () => {
    const ts = now();
    if (lastKeyTs !== null) {
      const interval = Math.max(ts - lastKeyTs, 0);
      record("key", { interval });
    } else {
      record("key", { interval: 0 });
    }
    lastKeyTs = ts;
  });

  window.addEventListener("scroll", () => {
    const ts = now();
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    if (lastScroll) {
      const dt = Math.max(ts - lastScroll.ts, 1);
      const dy = Math.abs(y - lastScroll.y);
      const speed = dy / dt;
      record("scroll", { speed });
    }
    lastScroll = { y, ts };
  });

  function hashText(text) {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 33) ^ text.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  function sendDeviceSignature() {
    if (deviceSent) return;
    deviceSent = true;
    const payload = {
      w: screen.width,
      h: screen.height,
      tz: new Date().getTimezoneOffset(),
      lang: navigator.language || "",
      hw: navigator.hardwareConcurrency || 0,
      mem: navigator.deviceMemory || 0,
      platform: navigator.platform || "",
    };
    record("device", payload);
  }

  async function verifyContentSignature() {
    const text = document.body ? document.body.innerText || "" : "";
    const sample = text.replace(/\s+/g, " ").trim().slice(0, 2000);
    const sig = hashText(sample);
    await fetch("/api/content-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname, sig }),
      keepalive: true,
    });
  }

  record("nav", { path: location.pathname, dwell_ms: 0, ref: document.referrer || "" });

  function recordDwell() {
    const dwell = Math.max(now() - pageEnterTs, 0);
    record("nav", { path: location.pathname, dwell_ms: Math.round(dwell) });
  }

  async function flush() {
    if (events.length === 0) {
      return;
    }
    const batch = events.splice(0, events.length);
    const webdriver = navigator.webdriver === true;
    await fetch("/api/behavior", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WebDriver": webdriver ? "1" : "0",
      },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    });
  }

  window.addEventListener("load", () => {
    sendDeviceSignature();
    setTimeout(verifyContentSignature, 500);
  });
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      recordDwell();
    }
  });
  setInterval(flush, flushIntervalMs);
  window.addEventListener("beforeunload", () => {
    recordDwell();
    flush();
  });
})();
