/* ============================================================
   SOZLAMALAR — shu yerga o‘zingizning ma’lumotlaringizni qo‘ying
   ============================================================ */
const API_KEY  = "BOT_TOKENINGIZNI_SHU_YERGA_QOYING"; // @BotFather bergan token, masalan: 123456:ABC-DEF...
const ADMIN_ID = "ADMIN_ID_NI_SHU_YERGA_QOYING";      // Adminning Telegram ID raqami, masalan: 123456789

/* ============================================================
   KARUSEL
   ============================================================ */
(function () {
  const track = document.getElementById("track");
  const dotsBox = document.getElementById("dots");
  const carousel = document.getElementById("carousel");
  const total = track.children.length;
  let index = 0, timer = null;

  for (let i = 0; i < total; i++) {
    const b = document.createElement("button");
    b.setAttribute("aria-label", (i + 1) + "-kurs");
    b.addEventListener("click", () => { go(i); restart(); });
    dotsBox.appendChild(b);
  }

  function go(i) {
    index = (i + total) % total;
    track.style.transform = "translateX(" + (-index * 100) + "%)";
    [...dotsBox.children].forEach((d, k) => d.classList.toggle("active", k === index));
  }
  function start() { timer = setInterval(() => go(index + 1), 4000); }
  function stop() { clearInterval(timer); }
  function restart() { stop(); start(); }

  document.getElementById("prev").addEventListener("click", () => { go(index - 1); restart(); });
  document.getElementById("next").addEventListener("click", () => { go(index + 1); restart(); });
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);

  // Telefonda surib almashtirish (swipe)
  let startX = null;
  carousel.addEventListener("touchstart", e => { startX = e.touches[0].clientX; stop(); }, { passive: true });
  carousel.addEventListener("touchend", e => {
    if (startX !== null) {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
    }
    startX = null; start();
  });

  go(0); start();
})();

/* ============================================================
   RO‘YXATDAN O‘TISH VA TELEGRAMGA YUBORISH
   ============================================================ */
(function () {
  const form = document.getElementById("regForm");
  const nameEl = document.getElementById("name");
  const ageEl = document.getElementById("age");
  const phoneEl = document.getElementById("phone");
  const btn = document.getElementById("submitBtn");
  const status = document.getElementById("status");

  // Telefon raqamni +998 XX XXX XX XX ko‘rinishiga keltirish
  phoneEl.addEventListener("input", () => {
    let d = phoneEl.value.replace(/\D/g, "");
    if (d.startsWith("998")) d = d.slice(3);
    d = d.slice(0, 9);
    let out = "+998";
    if (d.length > 0) out += " " + d.slice(0, 2);
    if (d.length > 2) out += " " + d.slice(2, 5);
    if (d.length > 5) out += " " + d.slice(5, 7);
    if (d.length > 7) out += " " + d.slice(7, 9);
    phoneEl.value = d.length ? out : "";
  });

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function show(msg, type) { status.textContent = msg; status.className = "status " + (type || ""); }
  function mark(el, bad) { el.classList.toggle("invalid", bad); }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameEl.value.trim();
    const age = parseInt(ageEl.value, 10);
    const phone = phoneEl.value.trim();
    const phoneDigits = phone.replace(/\D/g, "");

    const badName = name.length < 2;
    const badAge = isNaN(age) || age < 5 || age > 80;
    const badPhone = phoneDigits.length !== 12;
    mark(nameEl, badName); mark(ageEl, badAge); mark(phoneEl, badPhone);

    if (badName || badAge || badPhone) {
      show("Iltimos, barcha maydonlarni to‘g‘ri to‘ldiring.", "err");
      return;
    }

    const now = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
    const text =
      "🆕 <b>Yangi ro‘yxatdan o‘tish</b>\n\n" +
      "👤 <b>Ism:</b> " + escapeHtml(name) + "\n" +
      "🎂 <b>Yosh:</b> " + age + "\n" +
      "📞 <b>Telefon:</b> " + escapeHtml(phone) + "\n" +
      "🕒 <b>Vaqt:</b> " + now;

    btn.disabled = true;
    btn.textContent = "Yuborilmoqda...";
    show("");

    try {
      const res = await fetch("https://api.telegram.org/bot" + API_KEY + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: ADMIN_ID, text: text, parse_mode: "HTML" })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.description || "Telegram xatosi");

      form.reset();
      show("Rahmat! Arizangiz qabul qilindi. Tez orada siz bilan bog‘lanamiz.", "ok");
    } catch (err) {
      console.error(err);
      show("Yuborib bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring.", "err");
    } finally {
      btn.disabled = false;
      btn.textContent = "Yuborish";
    }
  });
})();
