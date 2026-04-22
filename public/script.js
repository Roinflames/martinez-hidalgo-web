/**
 * M&H - Swiss Modernism Interactivity
 */

const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrollToId = (id) => {
  const el = document.querySelector(id);
  if (!el) return;
  const offset = 72; // Navbar height
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
};

const initNavbar = () => {
  const navLinks = document.getElementById("nav-links");
  navLinks?.addEventListener("click", (e) => {
    const target = e.target.closest("a[href^='#']");
    if (!target) return;
    e.preventDefault();
    scrollToId(target.getAttribute("href"));
  });
};

const initReveal = () => {
  const items = document.querySelectorAll(".reveal, .reveal-up, .fade-in");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  items.forEach(item => observer.observe(item));
};

const initStats = () => {
  const stats = document.querySelectorAll(".stat-num");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || "";
        let count = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        
        const update = () => {
          count += step;
          if (count < target) {
            el.innerText = Math.floor(count) + suffix;
            requestAnimationFrame(update);
          } else {
            el.innerText = target + suffix;
          }
        };
        update();
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  stats.forEach(stat => observer.observe(stat));
};

const initChatbot = () => {
  const widget = document.getElementById("chatbot-widget");
  const toggle = document.getElementById("chat-toggle");
  const close = document.getElementById("close-chat");
  const panel = document.getElementById("chat-panel");
  const input = document.getElementById("chat-input");
  const send = document.getElementById("send-msg");
  const messages = document.getElementById("chat-messages");

  const toggleChat = () => widget.classList.toggle("open");

  // Normalize inline-styled markup into class-based styling (we only edit CSS/JS)
  const normalizeChatMarkup = () => {
    if (!panel) return;
    const headerEl = panel.firstElementChild;
    const inputBarEl = input?.parentElement || null;

    headerEl?.classList.add("chat-header");
    inputBarEl?.classList.add("chat-inputbar");
    messages?.classList.add("chat-body");

    // Remove inline styles so CSS can control the look (safe: scoped to chat widget)
    headerEl?.removeAttribute("style");
    inputBarEl?.removeAttribute("style");
    messages?.removeAttribute("style");
    input?.removeAttribute("style");
    send?.removeAttribute("style");
    close?.removeAttribute("style");

    // Header layout (title + subtitle + close)
    if (headerEl && !headerEl.dataset.enhanced) {
      headerEl.dataset.enhanced = "1";
      headerEl.textContent = "";

      const titles = document.createElement("div");
      titles.className = "chat-header__titles";

      const title = document.createElement("div");
      title.className = "chat-header__title";
      title.textContent = "Analizador académico";

      const sub = document.createElement("div");
      sub.className = "chat-header__sub";
      sub.textContent = "Información jurídica • sin asesoría";

      titles.appendChild(title);
      titles.appendChild(sub);
      headerEl.appendChild(titles);

      if (close) {
        close.classList.add("chat-close");
        close.textContent = "×";
        headerEl.appendChild(close);
      }
    }

    // Make the launcher look like the reference (pill button)
    if (toggle && !toggle.dataset.enhanced) {
      toggle.dataset.enhanced = "1";
      toggle.innerHTML =
        '<span class="chat-launch__icon" aria-hidden="true">⌁</span><span class="chat-launch__label">Analizador</span>';
      toggle.setAttribute("aria-label", "Abrir analizador académico");
    }

    if (input && !input.dataset.enhanced) {
      input.dataset.enhanced = "1";
      input.placeholder = "Consulta académica… (ej: SII, IVA, contrato, demanda)";
    }

    if (send && !send.dataset.enhanced) {
      send.dataset.enhanced = "1";
      send.classList.add("chat-send");
      send.innerHTML = '<span aria-hidden="true">➔</span>';
      send.setAttribute("aria-label", "Enviar consulta");
    }

    // Style the initial welcome message if present
    const first = messages?.firstElementChild;
    if (first && !first.classList.contains("chat-msg")) {
      first.classList.add("chat-msg", "chat-msg--bot");
      first.removeAttribute("style");
      first.textContent =
        "Herramienta académica de apoyo: describe un caso en términos generales y el sistema mostrará un análisis informativo (sin recomendaciones).";
    }
  };

  const ensureIntroBlocks = () => {
    if (!messages || messages.dataset.intro === "1") return;
    messages.dataset.intro = "1";

    const banner = document.createElement("div");
    banner.className = "chat-banner";
    banner.innerHTML =
      "<strong>Importante:</strong> respuestas informativas, sin recomendaciones, predicciones ni asesoría profesional.";

    const prompts = document.createElement("div");
    prompts.className = "chat-prompts";
    const promptItems = [
      "SII + IVA",
      "Impuesto a la Renta",
      "Deuda y mora",
      "Contrato e incumplimiento",
      "Demanda (concepto)",
    ];
    for (const label of promptItems) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chat-prompt";
      b.textContent = label;
      b.addEventListener("click", () => {
        if (!input || input.disabled) return;
        input.value = label;
        input.focus();
      });
      prompts.appendChild(b);
    }

    const wrap = document.createElement("div");
    wrap.className = "chat-intro";
    wrap.appendChild(banner);
    wrap.appendChild(prompts);

    addMessage(wrap, "system");
  };

  const addMessage = (content, type = "bot", { pending = false } = {}) => {
    const msg = document.createElement("div");
    const typeClass =
      type === "user" ? "chat-msg--user" : type === "system" ? "chat-msg--system" : "chat-msg--bot";
    msg.classList.add("chat-msg", typeClass);
    if (pending) msg.classList.add("chat-msg--pending");
    if (typeof content === "string") {
      msg.textContent = content;
    } else if (content instanceof Node) {
      msg.appendChild(content);
    } else {
      msg.textContent = String(content ?? "");
    }
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
  };

  const setBusy = (isBusy) => {
    if (input) input.disabled = isBusy;
    if (send) send.disabled = isBusy;
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

  const normalize = (value) =>
    (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const extractConcepts = (text) => {
    const lower = normalize(text);
    const candidates = [
      { re: /\bdeuda(s)?\b/g, label: "Deuda" },
      { re: /\bmora\b/g, label: "Mora" },
      { re: /\bcobranza\b/g, label: "Cobranza" },
      { re: /\bcontrato(s)?\b/g, label: "Contrato" },
      { re: /\bobligacion(es)?\b/g, label: "Obligación" },
      { re: /\bresponsabilidad\b/g, label: "Responsabilidad" },
      { re: /\bdemanda(s)?\b/g, label: "Demanda" },
      { re: /\bjuicio(s)?\b/g, label: "Juicio" },
      { re: /\bnotificacion\b/g, label: "Notificación" },
      { re: /\bprueba\b/g, label: "Prueba" },
      { re: /\btributari[oa]\b/g, label: "Tributario" },
      { re: /\bsii\b/g, label: "SII" },
      { re: /\bimpuesto(s)?\b/g, label: "Impuesto" },
      { re: /\brenta\b/g, label: "Renta" },
      { re: /\biva\b/g, label: "IVA" },
    ];

    const concepts = new Set();
    for (const { re, label } of candidates) {
      if (re.test(lower)) concepts.add(label);
    }
    return Array.from(concepts);
  };

  const analyzeJurInfo = (userText) => {
    const lower = normalize(userText);

    const topics = [
      {
        id: "tributario",
        score: () =>
          (/\btributari[oa]\b/.test(lower) ? 3 : 0) +
          (/\bsii\b/.test(lower) ? 3 : 0) +
          (/\bimpuesto(s)?\b/.test(lower) ? 2 : 0) +
          (/\brenta\b/.test(lower) ? 1 : 0) +
          (/\biva\b/.test(lower) ? 1 : 0),
        matter: "Tributario",
        norms: [
          "Código Tributario (marco general)",
          "DL 824 (Impuesto a la Renta) — referencia general",
          "DL 825 (IVA) — referencia general",
        ],
        context:
          "La materia tributaria suele abordar obligaciones fiscales, determinación de tributos y procedimientos administrativos. En términos académicos, se analiza la relación entre hechos gravados, deberes formales y reglas de fiscalización.",
      },
      {
        id: "cobranza_civil",
        score: () =>
          (/\bdeuda(s)?\b/.test(lower) ? 3 : 0) +
          (/\bcobranza\b/.test(lower) ? 3 : 0) +
          (/\bmora\b/.test(lower) ? 2 : 0) +
          (/\bobligacion(es)?\b/.test(lower) ? 2 : 0),
        matter: "Cobranza / Derecho civil (obligaciones)",
        norms: [
          "Código Civil (obligaciones y contratos) — referencia general",
          "Código de Procedimiento Civil — referencia general",
        ],
        context:
          "En obligaciones civiles se estudian fuentes de las obligaciones, exigibilidad, incumplimiento y sus efectos. En cobranza, el análisis académico suele distinguir entre aspectos sustantivos (existencia de la obligación) y procesales (formas de tramitación).",
      },
      {
        id: "contratos",
        score: () =>
          (/\bcontrato(s)?\b/.test(lower) ? 4 : 0) +
          (/\bclausula(s)?\b/.test(lower) ? 2 : 0) +
          (/\bincumplimient(o|os)\b/.test(lower) ? 2 : 0),
        matter: "Derecho civil (contratos)",
        norms: ["Código Civil (contratos) — referencia general"],
        context:
          "En contratos, el enfoque académico suele revisar formación del consentimiento, interpretación de cláusulas, prestaciones, incumplimiento y remedios previstos en normas generales, siempre considerando el contexto del acto o convención.",
      },
      {
        id: "procesal_civil",
        score: () =>
          (/\bdemanda(s)?\b/.test(lower) ? 4 : 0) +
          (/\bjuicio(s)?\b/.test(lower) ? 2 : 0) +
          (/\bnotificacion\b/.test(lower) ? 2 : 0) +
          (/\bprueba\b/.test(lower) ? 1 : 0),
        matter: "Procesal civil",
        norms: ["Código de Procedimiento Civil — referencia general"],
        context:
          "En procesal civil se examinan etapas del procedimiento, notificaciones, oportunidades probatorias y resoluciones. A nivel académico, el foco está en garantías del debido proceso y reglas de tramitación.",
      },
    ];

    let best = null;
    let bestScore = 0;
    for (const t of topics) {
      const s = t.score();
      if (s > bestScore) {
        bestScore = s;
        best = t;
      }
    }

    const concepts = extractConcepts(userText);
    if (!best || bestScore === 0) {
      return {
        matter: "General / indeterminada",
        norms: [
          "Constitución Política (marco general) — referencia general",
          "Códigos y leyes sectoriales (según materia) — referencia general",
        ],
        concepts: concepts.length ? concepts : ["(sin conceptos claramente detectables)"],
        context:
          "No se detectan suficientes palabras clave para asociar la consulta a una materia específica. En términos académicos, el análisis suele comenzar delimitando hechos, conceptos y la rama del derecho aplicable para luego ubicar normativa pertinente.",
      };
    }

    return {
      matter: best.matter,
      norms: best.norms,
      concepts: concepts.length ? concepts : ["(sin conceptos claramente detectables)"],
      context: best.context,
    };
  };

  const renderAcademicAnalysis = (analysis) => {
    const disclaimer = "Este sistema entrega información con fines académicos y no constituye asesoría legal.";

    const card = document.createElement("div");
    card.className = "chat-analysis";

    const title = document.createElement("div");
    title.className = "chat-analysis__title";
    title.textContent = "Análisis de información jurídica";
    card.appendChild(title);

    const addSection = (label, bodyNode) => {
      const section = document.createElement("div");
      section.className = "chat-analysis__section";
      const h = document.createElement("div");
      h.className = "chat-analysis__label";
      h.textContent = label;
      section.appendChild(h);
      section.appendChild(bodyNode);
      card.appendChild(section);
    };

    const matter = document.createElement("div");
    matter.className = "chat-analysis__value";
    matter.textContent = analysis.matter;
    addSection("Tipo de materia detectada", matter);

    const norms = document.createElement("ul");
    norms.className = "chat-analysis__list";
    for (const n of analysis.norms) {
      const li = document.createElement("li");
      li.textContent = n;
      norms.appendChild(li);
    }
    addSection("Normativa relacionada", norms);

    const concepts = document.createElement("ul");
    concepts.className = "chat-analysis__list";
    for (const c of analysis.concepts) {
      const li = document.createElement("li");
      li.textContent = c;
      concepts.appendChild(li);
    }
    addSection("Elementos relevantes", concepts);

    const context = document.createElement("div");
    context.className = "chat-analysis__context";
    context.textContent = analysis.context;
    addSection("Contexto general", context);

    const foot = document.createElement("div");
    foot.className = "chat-analysis__disclaimer";
    foot.textContent = disclaimer;
    card.appendChild(foot);

    return card;
  };

  const handleSend = async () => {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    setBusy(true);

    try {
      const steps = [
        "Analizando tipo de materia jurídica…",
        "Identificando normativa relacionada…",
        "Relacionando conceptos jurídicos…",
      ];

      for (const step of steps) {
        const el = addMessage(step, "system", { pending: true });
        await sleep(randInt(800, 1200));
        el.classList.remove("chat-msg--pending");
      }

      const analysis = analyzeJurInfo(text);
      addMessage(renderAcademicAnalysis(analysis), "bot");
    } finally {
      setBusy(false);
      input?.focus();
    }
  };

  toggle?.addEventListener("click", toggleChat);
  close?.addEventListener("click", toggleChat);
  send?.addEventListener("click", handleSend);
  input?.addEventListener("keypress", (e) => e.key === "Enter" && handleSend());

  normalizeChatMarkup();
  ensureIntroBlocks();
};

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initReveal();
  initStats();
  initChatbot();
});
