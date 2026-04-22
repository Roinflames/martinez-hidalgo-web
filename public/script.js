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
  const input = document.getElementById("chat-input");
  const send = document.getElementById("send-msg");
  const messages = document.getElementById("chat-messages");

  const toggleChat = () => widget.classList.toggle("open");
  
  const addMessage = (text, type = "bot", { pending = false } = {}) => {
    const msg = document.createElement("div");
    const typeClass =
      type === "user" ? "chat-msg--user" : type === "system" ? "chat-msg--system" : "chat-msg--bot";
    msg.classList.add("chat-msg", typeClass);
    if (pending) msg.classList.add("chat-msg--pending");
    msg.textContent = text;
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

    return [
      "Análisis de información jurídica:",
      "",
      "Tipo de materia detectada:",
      analysis.matter,
      "",
      "Normativa relacionada:",
      analysis.norms.map((n) => `- ${n}`).join("\n"),
      "",
      "Elementos relevantes:",
      analysis.concepts.map((c) => `- ${c}`).join("\n"),
      "",
      "Contexto general:",
      analysis.context,
      "",
      disclaimer,
    ].join("\n");
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
};

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initReveal();
  initStats();
  initChatbot();
});
