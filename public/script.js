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
  
  const addMessage = (text, type = 'bot') => {
    const msg = document.createElement("div");
    msg.style.padding = "16px";
    msg.style.background = type === 'bot' ? "var(--bg-subtle)" : "var(--text)";
    msg.style.color = type === 'bot' ? "var(--text)" : "var(--bg)";
    msg.style.borderLeft = type === 'bot' ? "4px solid var(--accent)" : "none";
    msg.style.alignSelf = type === 'user' ? "flex-end" : "flex-start";
    msg.style.maxWidth = "80%";
    msg.innerText = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  };

  const handleSend = async () => {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = "";
    
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      addMessage(data.response);
    } catch (e) {
      addMessage("Error de conexión con el asistente técnico.");
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
