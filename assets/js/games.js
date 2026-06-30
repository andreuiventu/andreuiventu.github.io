/* =====================================================================
   Minijocs — Paraulògic (CASAMENT) + Endevina la paraula (CUGULADA)
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const confetti = (n) => window.AVconfetti && window.AVconfetti(n);

  /* ===================== TABS ===================== */
  $$(".games__tab").forEach(tab => {
    tab.addEventListener("click", () => {
      $$(".games__tab").forEach(t => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const g = tab.dataset.game;
      $("#panel-paraulogic").hidden = g !== "paraulogic";
      $("#panel-wordle").hidden = g !== "wordle";
    });
  });

  /* =====================================================================
     PARAULÒGIC
     ===================================================================== */
  (function paraulogic() {
    const DATA = window.PARAULOGIC;
    if (!DATA) return;
    const CENTER = DATA.center.toLowerCase();
    const VALID = new Set(DATA.words);
    const PANGRAMS = new Set(DATA.pangrams);
    const KEY = "av_paraulogic_v1";

    const RANKS = [
      [0, "Principiant"], [3, "Convidat/da"], [8, "Ben plantat/da"],
      [15, "De la família"], [25, "Padrí / Padrina"], [40, "Mestre/a de cerimònies"],
      [60, "Geni del casament ✦"]
    ];

    let hiveLetters = DATA.outer.map(l => l.toLowerCase());
    let current = "";
    let found = load();

    const elDisplay = $("#plDisplay"), elMsg = $("#plMsg"), elHive = $("#plHive");
    const elWords = $("#plWords"), elFound = $("#plFound"), elPoints = $("#plPoints");
    const elPangrams = $("#plPangrams"), elRank = $("#plRank"), elBar = $("#plBar");

    function load() { try { return new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch (e) { return new Set(); } }
    function save() { try { localStorage.setItem(KEY, JSON.stringify([...found])); } catch (e) {} }

    function wordPoints(w) { return (w.length <= 3 ? 1 : w.length - 2) + (PANGRAMS.has(w) ? 7 : 0); }
    function totalPoints() { let p = 0; found.forEach(w => p += wordPoints(w)); return p; }

    function renderDisplay() {
      if (!current) { elDisplay.innerHTML = '<span class="pl__caret"></span>'; return; }
      elDisplay.innerHTML = [...current].map(c =>
        c === CENTER ? `<span class="pl__center">${c}</span>` : c
      ).join("") + '<span class="pl__caret"></span>';
    }

    function buildHive() {
      elHive.innerHTML = "";
      // center
      elHive.appendChild(makeCell(DATA.center, true, 50, 50));
      // 6 around (left/top as % of the container)
      const r = 31;
      hiveLetters.forEach((l, i) => {
        const ang = (-90 + i * 60) * Math.PI / 180;
        elHive.appendChild(makeCell(l.toUpperCase(), false, 50 + Math.cos(ang) * r, 50 + Math.sin(ang) * r));
      });
    }
    function makeCell(letter, isCenter, x, y) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pl__cell" + (isCenter ? " pl__cell--center" : "");
      b.textContent = letter;
      b.style.setProperty("--x", x + "%");
      b.style.setProperty("--y", y + "%");
      b.addEventListener("click", () => { addLetter(letter.toLowerCase()); pop(b); });
      return b;
    }
    function pop(cell) { if (reduceMotion) return; cell.classList.add("is-press"); setTimeout(() => cell.classList.remove("is-press"), 300); }

    function addLetter(l) { current += l; renderDisplay(); }
    function del() { current = current.slice(0, -1); renderDisplay(); }
    function shuffle() {
      for (let i = hiveLetters.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[hiveLetters[i], hiveLetters[j]] = [hiveLetters[j], hiveLetters[i]]; }
      buildHive();
    }

    function msg(text, kind) {
      elMsg.textContent = text;
      elMsg.className = "pl__msg" + (kind ? " is-" + kind : "");
    }

    function submit() {
      const w = current.toLowerCase();
      current = ""; renderDisplay();
      if (w.length < 3) return msg("Massa curta (mínim 3 lletres)", "bad");
      if (!w.includes(CENTER)) return msg(`Falta la lletra central «${CENTER.toUpperCase()}»`, "bad");
      const allowed = new Set([CENTER, ...hiveLetters]);
      if (![...w].every(c => allowed.has(c))) return msg("Hi ha lletres que no són al rusc", "bad");
      if (found.has(w)) return msg("Ja l'havies trobada!", "bad");
      if (!VALID.has(w)) return msg("No surt al diccionari", "bad");
      // success!
      found.add(w); save();
      const pang = PANGRAMS.has(w);
      msg(pang ? `PANAGRAMA! +${wordPoints(w)} punts ✦` : `Molt bé! +${wordPoints(w)} punts`, "good");
      if (pang && !reduceMotion) confetti(700);
      render();
    }

    function rankFor(n) { let r = RANKS[0]; for (const x of RANKS) if (n >= x[0]) r = x; return r; }

    function render() {
      const n = found.size;
      const words = [...found].sort((a, b) => b.length - a.length || a.localeCompare(b));
      elWords.innerHTML = words.map(w =>
        `<li class="${PANGRAMS.has(w) ? "is-pangram" : ""}">${w.toUpperCase()}</li>`).join("");
      elFound.textContent = n;
      elPoints.textContent = totalPoints();
      elPangrams.textContent = words.filter(w => PANGRAMS.has(w)).length;
      const [, name] = rankFor(n);
      elRank.textContent = name;
      // progress to next rank
      let next = RANKS.find(r => r[0] > n);
      const prev = rankFor(n)[0];
      const pct = next ? Math.min(100, ((n - prev) / (next[0] - prev)) * 100) : 100;
      elBar.style.width = pct + "%";
    }

    function giveUp() {
      const sorted = [...VALID].sort((a, b) => b.length - a.length);
      const longest = sorted.slice(0, 3).map(w => w.toUpperCase()).join(", ");
      msg(`Hi havia ${DATA.total} paraules i ${DATA.pangrams.length} panagrames. Les més llargues: ${longest}`, "good");
    }

    // keyboard support
    document.addEventListener("keydown", (e) => {
      const jocs = document.getElementById("jocs");
      if ((jocs && jocs.hidden) || $("#panel-paraulogic").hidden) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const allowed = new Set([CENTER, ...hiveLetters]);
      const k = e.key.toLowerCase();
      if (k === "enter") { e.preventDefault(); submit(); }
      else if (k === "backspace") { e.preventDefault(); del(); }
      else if (allowed.has(k)) { addLetter(k); }
    });

    $("#plDelete").addEventListener("click", del);
    $("#plShuffle").addEventListener("click", shuffle);
    $("#plEnter").addEventListener("click", submit);
    $("#plGiveup").addEventListener("click", giveUp);

    buildHive(); renderDisplay(); render();
  })();

  /* =====================================================================
     ENDEVINA LA PARAULA (Wordle) — CUGULADA
     ===================================================================== */
  (function wordle() {
    const ANSWER = "cugulada";
    const LEN = ANSWER.length, ROWS = 6;
    const board = $("#wdBoard"), msgEl = $("#wdMsg"), kb = $("#wdKeyboard"), resetBtn = $("#wdReset");
    if (!board) return;

    let row = 0, col = 0, grid = [], over = false;
    const keyState = {}; // letter -> best state

    function buildBoard() {
      board.innerHTML = ""; grid = [];
      for (let r = 0; r < ROWS; r++) {
        const tr = document.createElement("div"); tr.className = "wd__row";
        const cells = [];
        for (let c = 0; c < LEN; c++) {
          const t = document.createElement("div"); t.className = "wd__tile";
          tr.appendChild(t); cells.push(t);
        }
        board.appendChild(tr); grid.push(cells);
      }
    }

    const KEYS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    function buildKeyboard() {
      kb.innerHTML = "";
      KEYS.forEach((rowStr, i) => {
        const kr = document.createElement("div"); kr.className = "wd__krow";
        if (i === 2) kr.appendChild(makeKey("Envia", "enter", true));
        [...rowStr].forEach(ch => kr.appendChild(makeKey(ch.toUpperCase(), ch)));
        if (i === 2) kr.appendChild(makeKey("⌫", "back", true));
        kb.appendChild(kr);
      });
    }
    function makeKey(label, val, wide) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "wd__key" + (wide ? " wd__key--wide" : "");
      b.textContent = label; b.dataset.key = val;
      b.addEventListener("click", () => handle(val));
      return b;
    }

    function setMsg(t) { msgEl.textContent = t; }

    function handle(k) {
      if (over) return;
      if (k === "enter") return submit();
      if (k === "back") { if (col > 0) { col--; grid[row][col].textContent = ""; grid[row][col].classList.remove("is-filled"); } return; }
      if (/^[a-z]$/.test(k) && col < LEN) {
        grid[row][col].textContent = k.toUpperCase();
        grid[row][col].classList.add("is-filled");
        col++;
      }
    }

    function submit() {
      if (col < LEN) { setMsg("Falten lletres!"); shake(); return; }
      const guess = grid[row].map(t => t.textContent.toLowerCase()).join("");
      // colour using standard two-pass (handles duplicates)
      const res = Array(LEN).fill("absent");
      const counts = {};
      for (const ch of ANSWER) counts[ch] = (counts[ch] || 0) + 1;
      for (let i = 0; i < LEN; i++) if (guess[i] === ANSWER[i]) { res[i] = "correct"; counts[guess[i]]--; }
      for (let i = 0; i < LEN; i++) if (res[i] !== "correct" && counts[guess[i]] > 0) { res[i] = "present"; counts[guess[i]]--; }

      grid[row].forEach((t, i) => {
        setTimeout(() => {
          if (!reduceMotion) t.classList.add("flip");
          setTimeout(() => { t.classList.add(res[i]); }, reduceMotion ? 0 : 275);
          updateKey(guess[i], res[i]);
        }, reduceMotion ? 0 : i * 180);
      });

      const win = guess === ANSWER;
      setTimeout(() => {
        if (win) { over = true; setMsg("Exacte! És on ens casem 🥂"); if (!reduceMotion) confetti(1600); resetBtn.hidden = false; }
        else if (row === ROWS - 1) { over = true; setMsg(`Era «${ANSWER.toUpperCase()}». Torna-ho a provar!`); resetBtn.hidden = false; }
        else { row++; col = 0; }
      }, reduceMotion ? 0 : LEN * 180 + 350);
    }

    function updateKey(ch, state) {
      const rank = { absent: 0, present: 1, correct: 2 };
      if (!keyState[ch] || rank[state] > rank[keyState[ch]]) keyState[ch] = state;
      const btn = kb.querySelector(`[data-key="${ch}"]`);
      if (btn) { btn.classList.remove("correct", "present", "absent"); btn.classList.add(keyState[ch]); }
    }

    function shake() {
      if (reduceMotion) return;
      grid[row].forEach(t => { t.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }],
        { duration: 220 }); });
    }

    function reset() {
      row = 0; col = 0; over = false; for (const k in keyState) delete keyState[k];
      resetBtn.hidden = true; setMsg(" ");
      buildBoard(); buildKeyboard();
    }

    document.addEventListener("keydown", (e) => {
      const jocs = document.getElementById("jocs");
      if ((jocs && jocs.hidden) || $("#panel-wordle").hidden) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Enter") handle("enter");
      else if (e.key === "Backspace") handle("back");
      else if (/^[a-zA-Z]$/.test(e.key)) handle(e.key.toLowerCase());
    });
    resetBtn.addEventListener("click", reset);

    buildBoard(); buildKeyboard();
  })();
})();
