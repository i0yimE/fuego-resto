/* Fuego RESTO — main.js (IIFE, no build step, no external deps) */
(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------- Nav: solidify on scroll + mobile menu ---------- */
  function initNav() {
    var nav = $(".nav");
    if (!nav) return;
    var alwaysSolid = nav.hasAttribute("data-nav-solid");
    var onScroll = function () {
      if (alwaysSolid || window.scrollY > 40) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = $(".nav-toggle");
    var menu = $(".mobile-menu");
    if (!toggle || !menu) return;
    var close = function () {
      toggle.setAttribute("aria-expanded", "false");
      menu.setAttribute("data-open", "false");
      document.body.style.overflow = "";
    };
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.setAttribute("data-open", String(!open));
      document.body.style.overflow = open ? "" : "hidden";
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------- Smooth anchor scrolling with header offset ---------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var offset = 76;
      var top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ---------- Subtle tilt on cards ---------- */
  function initTilt() {
    if (!fineHover) return;
    var MAX = 6;
    $$(".has-tilt").forEach(function (card) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
  }

  /* ---------- Gallery category filter ---------- */
  function initGalleryTabs() {
    var tabs = $$(".gallery-tab");
    var items = $$(".gallery-item");
    if (!tabs.length || !items.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var cat = tab.dataset.cat;
        tabs.forEach(function (t) { t.classList.toggle("is-active", t === tab); });
        items.forEach(function (item) {
          var show = cat === "all" || item.dataset.cat === cat;
          item.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* ---------- Open / closed status from real hours ---------- */
  function initHoursStatus() {
    var hours = data.hours;
    if (!hours) return;
    var badgeEls = $$("[data-hours-status]");
    if (!badgeEls.length) return;

    var now = new Date();
    var day = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var prevDay = (day + 6) % 7;

    var isOpen = false;
    var today = hours[day];
    if (today && mins >= today.open && mins < today.close) isOpen = true;

    var prev = hours[prevDay];
    if (!isOpen && prev && prev.close > 24 * 60) {
      var minsAfterMidnight = mins;
      if (minsAfterMidnight < (prev.close - 24 * 60)) isOpen = true;
    }

    badgeEls.forEach(function (el) {
      el.textContent = isOpen ? "Abierto ahora" : "Cerrado ahora";
      el.classList.toggle("is-open", isOpen);
      el.classList.toggle("is-closed", !isOpen);
    });
  }

  /* ---------- Count-up for rating ---------- */
  function initCountUp() {
    var els = $$("[data-count-to]");
    if (!els.length) return;
    els.forEach(function (el) {
      var target = parseFloat(el.dataset.countTo);
      var decimals = (el.dataset.countTo.split(".")[1] || "").length;
      var done = false;
      var finish = function () { done = true; el.textContent = target.toFixed(decimals); };
      var trigger = function () {
        if (done) return;
        if (reduced || !("IntersectionObserver" in window) || document.hidden) { finish(); return; }
        var start = null;
        var duration = 1100;
        function step(ts) {
          if (done) return;
          if (!start) start = ts;
          var p = Math.min(1, (ts - start) / duration);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(step); else done = true;
        }
        requestAnimationFrame(step);
      };
      if (!("IntersectionObserver" in window)) { trigger(); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { trigger(); io.unobserve(e.target); } });
      }, { threshold: 0.6 });
      io.observe(el);
      // Safety net: never leave the number stuck at 0 if IO/rAF never fires (e.g. backgrounded tab)
      setTimeout(finish, 4000);
    });
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    var el = $("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Splash loader (double safety: CSS 4.5s + JS below) ---------- */
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;
    var MIN_SHOW = 550;
    var shownAt = Date.now();
    var done = false;
    var hide = function () {
      if (done) return;
      done = true;
      var wait = Math.max(0, MIN_SHOW - (Date.now() - shownAt));
      setTimeout(function () { splash.classList.add("is-out"); }, wait);
    };
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide);
    setTimeout(hide, 2500); // extra safety if 'load' is slow/blocked
  }

  /* ---------- Reserva -> WhatsApp con todos los datos ---------- */
  function initReserveForm() {
    var form = $("[data-reserve-form]");
    if (!form) return;
    var dateInput = form.querySelector('input[name="fecha"]');
    if (dateInput) {
      var t = new Date();
      var pad = function (n) { return String(n).length < 2 ? "0" + n : String(n); };
      dateInput.min = t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate());
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      if (!form.reportValidity()) return;

      var nombre = form.nombre.value.trim();
      var telefono = form.telefono.value.trim();
      var fecha = form.fecha.value;
      var hora = form.hora.value;
      var personas = form.personas.value;
      var comentario = form.comentario.value.trim();

      var fechaFmt = fecha;
      var parts = fecha.split("-");
      if (parts.length === 3) fechaFmt = parts[2] + "/" + parts[1] + "/" + parts[0];

      var msg = "Hola! Quiero reservar una mesa en Fuego RESTO.\n";
      msg += "Nombre: " + nombre + "\n";
      msg += "Fecha: " + fechaFmt + "\n";
      msg += "Hora: " + hora + "\n";
      msg += "Personas: " + personas + "\n";
      if (telefono) msg += "Mi WhatsApp: " + telefono + "\n";
      if (comentario) msg += "Comentario: " + comentario + "\n";

      form.classList.add("is-sending");
      var url = "https://wa.me/5493756498460?text=" + encodeURIComponent(msg);
      window.open(url, "_blank", "noopener");
      setTimeout(function () { form.classList.remove("is-sending"); }, 900);
    });
  }

  /* ---------- Chatbot widget — habla con /api/chat (Gemini, server-side) ---------- */
  function initChatbot() {
    if ($(".chat-fab")) return; // idempotente

    var fab = document.createElement("button");
    fab.type = "button";
    fab.className = "chat-fab";
    fab.setAttribute("aria-label", "Abrir chat de Fuego RESTO");
    fab.setAttribute("aria-expanded", "false");
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg><span class="chat-fab-dot" aria-hidden="true"></span>';
    document.body.appendChild(fab);

    var panel = document.createElement("div");
    panel.className = "chat-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat con Fuego RESTO");
    panel.innerHTML =
      '<div class="chat-head"><span>Asistente Fuego RESTO</span><button type="button" class="chat-close" aria-label="Cerrar chat">×</button></div>' +
      '<div class="chat-body" data-chat-body>' +
        '<div class="chat-msg chat-msg-bot">¡Hola! Soy el asistente de Fuego RESTO 🔥 Preguntáme por horarios, la carta, precios o cómo llegar.</div>' +
      "</div>" +
      '<form class="chat-form" data-chat-form>' +
        '<input type="text" data-chat-input maxlength="500" autocomplete="off" required placeholder="Escribí tu consulta...">' +
        '<button type="submit" aria-label="Enviar"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 11.5 21 3l-6.5 18-3.5-7-8-2.5Z"/></svg></button>' +
      "</form>";
    document.body.appendChild(panel);

    var body = panel.querySelector("[data-chat-body]");
    var form = panel.querySelector("[data-chat-form]");
    var input = panel.querySelector("[data-chat-input]");
    var closeBtn = panel.querySelector(".chat-close");
    var history = [];
    var isOpen = false;

    function toggle(force) {
      isOpen = typeof force === "boolean" ? force : !isOpen;
      panel.classList.toggle("is-open", isOpen);
      fab.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) setTimeout(function () { input.focus(); }, 200);
    }
    fab.addEventListener("click", function () { toggle(); });
    closeBtn.addEventListener("click", function () { toggle(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen) toggle(false); });

    function addMsg(text, cls) {
      var div = document.createElement("div");
      div.className = "chat-msg " + cls;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      return div;
    }
    function addTyping() {
      var div = document.createElement("div");
      div.className = "chat-msg-typing";
      div.innerHTML = "<span></span><span></span><span></span>";
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      return div;
    }

    var sending = false;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text || sending) return;
      addMsg(text, "chat-msg-user");
      var historySnapshot = history.slice();
      history.push({ role: "user", text: text });
      input.value = "";
      sending = true;
      var typing = addTyping();

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: historySnapshot })
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
        .then(function (res) {
          typing.remove();
          if (res.ok && res.data && res.data.reply) {
            addMsg(res.data.reply, "chat-msg-bot");
            history.push({ role: "bot", text: res.data.reply });
          } else {
            addMsg("No pude responder justo ahora. Escribinos directo por WhatsApp: 03756 15-49-8460.", "chat-msg-error");
          }
        })
        .catch(function () {
          typing.remove();
          addMsg("No pude conectarme. Escribinos directo por WhatsApp: 03756 15-49-8460.", "chat-msg-error");
        })
        .then(function () { sending = false; });
    });
  }

  function boot() {
    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initGalleryTabs, "initGalleryTabs");
    safe(initHoursStatus, "initHoursStatus");
    safe(initCountUp, "initCountUp");
    safe(initFooterYear, "initFooterYear");
    safe(initReserveForm, "initReserveForm");
    safe(initChatbot, "initChatbot");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
