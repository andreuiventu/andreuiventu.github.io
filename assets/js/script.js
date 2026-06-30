/* =====================================================================
   Andreu & Ventu — interactions
   ===================================================================== */
(function () {
  "use strict";

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- CONFIG -------------------------------------------------------- */
  // Wedding date: 27 August 2026, 19:00 (ceremony)
  const WEDDING = new Date("2026-08-27T19:00:00+02:00");
  const RSVP_EMAIL = "andreu.ventu.casament@example.com"; // ← change to the real address
  const IBAN = "ES00 0000 0000 0000 0000 0000";           // ← change to the real IBAN

  /* =====================================================================
     PRELOADER
     ===================================================================== */
  window.addEventListener("load", () => {
    const pre = $("#preloader");
    if (!pre) return;
    setTimeout(() => pre.classList.add("is-done"), reduceMotion ? 0 : 2000);
  });

  /* =====================================================================
     SVG ICONS (thin-line, per design spec) for timeline
     ===================================================================== */
  const ICONS = {
    church: `<svg viewBox="0 0 48 48" fill="none" stroke="var(--sage)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M24 4v8M20 8h8"/><path d="M24 12 10 22v22h28V22z"/><path d="M19 44V32a5 5 0 0 1 10 0v12"/><path d="M24 18v6M21 21h6"/></svg>`,
    rings: `<svg viewBox="0 0 48 48" fill="none" stroke="var(--sage)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="19" cy="30" r="11"/><circle cx="31" cy="30" r="11"/><path d="M26 9l-3 6h6z"/><path d="M23 15l3-6 3 6"/></svg>`,
    champagne: `<svg viewBox="0 0 48 48" fill="none" stroke="var(--sage)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6l3 16a5 5 0 0 0 10 0l3-16z"/><path d="M24 27v11M18 40h12"/><path d="M14 6h20"/></svg>`,
    dinner: `<svg viewBox="0 0 48 48" fill="none" stroke="var(--sage)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="26" r="13"/><circle cx="24" cy="26" r="6"/><path d="M9 26H4M44 26h-5"/></svg>`,
    disco: `<svg viewBox="0 0 48 48" fill="none" stroke="var(--sage)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="26" r="12"/><path d="M24 14v24M12 26h24M15 17l18 18M33 17 15 35"/><path d="M24 6v6M20 8h8"/></svg>`
  };
  $$(".timeline__icon").forEach(el => {
    const key = el.getAttribute("data-icon");
    if (ICONS[key]) el.innerHTML = ICONS[key];
  });

  /* =====================================================================
     PETALS (olive leaves drifting down)
     ===================================================================== */
  (function petals() {
    if (reduceMotion) return;
    const layer = $("#petals");
    if (!layer) return;
    const COLORS = ["#8B9776", "#6F8067", "#D8CCBC", "#BCC9D9"];
    const COUNT = window.innerWidth < 600 ? 9 : 16;
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement("div");
      p.className = "petal";
      const size = 10 + Math.random() * 14;
      const color = COLORS[(Math.random() * COLORS.length) | 0];
      p.style.left = Math.random() * 100 + "vw";
      p.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
      p.style.setProperty("--spin", (Math.random() * 720 - 360) + "deg");
      const dur = 9 + Math.random() * 11;
      p.style.animation = `fall ${dur}s linear ${Math.random() * dur}s infinite`;
      p.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 2C7 7 7 17 12 22 17 17 17 7 12 2z" fill="${color}" opacity="0.8"/><path d="M12 3v18" stroke="#51604C" stroke-width="0.5" opacity="0.5"/></svg>`;
      layer.appendChild(p);
    }
  })();

  /* =====================================================================
     COUNTDOWN
     ===================================================================== */
  (function countdown() {
    const days = $("#cd-days"), hours = $("#cd-hours"), mins = $("#cd-mins"), secs = $("#cd-secs");
    const caption = $("#countdownCaption");
    if (!days) return;
    const pad = n => String(n).padStart(2, "0");
    function tick() {
      const diff = WEDDING - new Date();
      if (diff <= 0) {
        days.textContent = "00"; hours.textContent = "00"; mins.textContent = "00"; secs.textContent = "00";
        if (caption) caption.textContent = "Avui és el gran dia! 🥂";
        return;
      }
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1e3);
      days.textContent = pad(d); hours.textContent = pad(h); mins.textContent = pad(m); secs.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* =====================================================================
     SCROLL REVEAL
     ===================================================================== */
  (function reveal() {
    const els = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(e => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(e => io.observe(e));
  })();

  /* =====================================================================
     NAV: scroll state, burger, smooth close
     ===================================================================== */
  (function nav() {
    const nav = $("#nav"), burger = $("#navBurger"), links = $("#navLinks"), toTop = $("#toTop");
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 40);
      if (toTop) toTop.classList.toggle("is-visible", y > 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    burger.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
    });
    $$("#navLinks a").forEach(a => a.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger.classList.remove("is-open");
    }));
    if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  })();

  /* =====================================================================
     MAPS + IBAN
     ===================================================================== */
  (function venue() {
    const iban = $("#iban");
    if (iban) iban.textContent = IBAN;
    const copy = $("#copyIban");
    if (copy) copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(IBAN.replace(/\s/g, ""));
        const old = copy.textContent;
        copy.textContent = "Copiat! ✦";
        setTimeout(() => (copy.textContent = old), 1800);
      } catch (e) { copy.textContent = IBAN; }
    });
  })();

  /* =====================================================================
     RSVP — build a mailto with all answers (works on static hosting)
     ===================================================================== */
  (function rsvp() {
    const form = $("#rsvpForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      if (!name) { $("#r-name").focus(); return; }
      const attending = data.get("attending");
      const lines = [
        `Nom: ${name}`,
        `Assistència: ${attending}`,
        `Acompanyants: ${data.get("guests")}`,
        `Menú: ${data.get("menu")}`,
        `Al·lèrgies: ${data.get("allergies") || "Cap"}`,
        `Cançó: ${data.get("song") || "—"}`,
        `Missatge: ${data.get("message") || "—"}`
      ];
      const subject = encodeURIComponent(`Confirmació casament — ${name}`);
      const body = encodeURIComponent(lines.join("\n"));

      // confirmation overlay
      showConfirmation(name, attending);

      // open the mail client
      setTimeout(() => {
        window.location.href = `mailto:${RSVP_EMAIL}?subject=${subject}&body=${body}`;
      }, 1400);
    });

    function showConfirmation(name, attending) {
      const ok = attending && attending.toString().startsWith("Sí");
      const card = $("#rsvpForm");
      const overlay = document.createElement("div");
      overlay.style.cssText = "text-align:center;padding:1rem 0";
      overlay.innerHTML = `
        <svg viewBox="0 0 80 80" width="80" height="80" style="margin:0 auto 1rem;display:block">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#6F8067" stroke-width="1.4"/>
          <path d="M26 41l10 10 18-22" fill="none" stroke="#51604C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            stroke-dasharray="60" stroke-dashoffset="60">
            <animate attributeName="stroke-dashoffset" to="0" dur="0.7s" fill="freeze" begin="0.15s"/>
          </path>
        </svg>
        <h3 style="font-size:1.8rem;font-style:italic;margin-bottom:.4rem">Gràcies, ${escapeHtml(name)}!</h3>
        <p style="color:var(--ink-soft)">${ok ? "Ens fa molta il·lusió que hi siguis. S'està obrint el teu correu per enviar la confirmació." : "Et trobarem a faltar! Gràcies per avisar-nos."}</p>`;
      card.innerHTML = "";
      card.appendChild(overlay);
      if (ok && !reduceMotion) launchConfetti(1200);
    }
  })();

  /* =====================================================================
     GUESTBOOK — localStorage
     ===================================================================== */
  (function guestbook() {
    const form = $("#guestbookForm"), wall = $("#guestbookWall");
    if (!form || !wall) return;
    const KEY = "av_guestbook";
    const seed = [
      { name: "Els amics de sempre", msg: "Ja teníem ganes! Que visqui l'amor 💚" },
      { name: "La família", msg: "Tant de bo sigui un dia tan bonic com vosaltres." }
    ];
    const load = () => {
      try { return JSON.parse(localStorage.getItem(KEY)) || seed; }
      catch (e) { return seed; }
    };
    const save = (arr) => { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {} };

    function render() {
      const notes = load();
      wall.innerHTML = notes.map(n => `
        <li class="guestbook__note">
          <p>“${escapeHtml(n.msg)}”</p>
          <cite>— ${escapeHtml(n.name)}</cite>
        </li>`).join("");
    }
    render();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#g-name").value.trim();
      const msg = $("#g-msg").value.trim();
      if (!name || !msg) return;
      const notes = load();
      notes.unshift({ name, msg });
      save(notes);
      form.reset();
      render();
      if (!reduceMotion) launchConfetti(600);
    });
  })();

  /* =====================================================================
     AMBIENT MUSIC
     ===================================================================== */
  (function music() {
    const btn = $("#musicToggle"), audio = $("#ambientAudio");
    if (!btn || !audio) return;
    audio.volume = 0.4;
    btn.addEventListener("click", async () => {
      if (audio.paused) {
        try { await audio.play(); btn.classList.add("is-playing"); btn.title = "Atura la música"; }
        catch (e) { btn.title = "No s'ha pogut reproduir"; }
      } else {
        audio.pause(); btn.classList.remove("is-playing"); btn.title = "Música ambiental";
      }
    });
  })();

  /* =====================================================================
     CONFETTI (canvas) — used on RSVP, guestbook & easter egg
     ===================================================================== */
  let confettiCanvas, confettiCtx, confettiPieces = [], confettiRAF = null;
  function ensureCanvas() {
    if (confettiCanvas) return;
    confettiCanvas = document.createElement("canvas");
    confettiCanvas.id = "confettiCanvas";
    document.body.appendChild(confettiCanvas);
    confettiCtx = confettiCanvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }
  function resizeCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  function launchConfetti(count = 1000) {
    if (reduceMotion) return;
    ensureCanvas();
    const colors = ["#6F8067", "#8B9776", "#D8CCBC", "#BCC9D9", "#C7C2D4", "#51604C"];
    for (let i = 0; i < count / 8; i++) {
      confettiPieces.push({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * 80,
        r: 4 + Math.random() * 6,
        c: colors[(Math.random() * colors.length) | 0],
        vy: 2 + Math.random() * 3,
        vx: Math.random() * 2 - 1,
        rot: Math.random() * Math.PI,
        vr: Math.random() * 0.2 - 0.1,
        life: 0
      });
    }
    if (!confettiRAF) confettiRAF = requestAnimationFrame(stepConfetti);
  }
  function stepConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces = confettiPieces.filter(p => p.y < confettiCanvas.height + 30 && p.life < 400);
    confettiPieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.c;
      confettiCtx.globalAlpha = Math.max(0, 1 - p.life / 400);
      confettiCtx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      confettiCtx.restore();
    });
    if (confettiPieces.length) { confettiRAF = requestAnimationFrame(stepConfetti); }
    else { cancelAnimationFrame(confettiRAF); confettiRAF = null; confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); }
  }

  // expose for the games module
  window.AVconfetti = launchConfetti;

  // footer easter-egg button
  const egg = $("#confettiBtn");
  if (egg) egg.addEventListener("click", () => launchConfetti(1600));

  // Konami code → confetti storm
  (function konami() {
    const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let i = 0;
    window.addEventListener("keydown", (e) => {
      i = (e.key === seq[i] || e.key.toLowerCase() === seq[i]) ? i + 1 : 0;
      if (i === seq.length) { i = 0; launchConfetti(4000); }
    });
  })();

  /* ---- helpers ------------------------------------------------------- */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }
})();
