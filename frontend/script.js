// ===== Theme (persist) =====
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const applyTheme = (mode) => {
  if (mode === "light") document.documentElement.classList.add("light");
  else document.documentElement.classList.remove("light");
  themeIcon.className = document.documentElement.classList.contains("light")
    ? "fa-solid fa-moon"  // show moon to indicate you can go dark
    : "fa-solid fa-sun";   // show sun to indicate you can go light
};

const saved = localStorage.getItem("cw-theme") || "dark";
applyTheme(saved);

themeToggle.addEventListener("click", () => {
  const now = document.documentElement.classList.contains("light") ? "dark" : "light";
  localStorage.setItem("cw-theme", now);
  applyTheme(now);
});

// ===== Sticky header style on scroll =====
const header = document.getElementById("siteHeader");
const onScroll = () => {
  if (window.scrollY > 6) header.classList.add("scrolled");
  else header.classList.remove("scrolled");
};
onScroll();
window.addEventListener("scroll", onScroll);

// ===== Mobile menu =====
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const menuOverlay = document.getElementById("menuOverlay");

function openMenu(){
  navMenu.classList.add("open");
  menuOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
  hamburger.setAttribute("aria-expanded","true");
  hamburger.innerHTML = '<i class="fa-solid fa-xmark"></i>';
}
function closeMenu(){
  navMenu.classList.remove("open");
  menuOverlay.classList.remove("active");
  document.body.style.overflow = "";
  hamburger.setAttribute("aria-expanded","false");
  hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
}
hamburger.addEventListener("click", () => {
  navMenu.classList.contains("open") ? closeMenu() : openMenu();
});
menuOverlay.addEventListener("click", closeMenu);
window.addEventListener("resize", () => { if (window.innerWidth > 900) closeMenu(); });
document.addEventListener("keydown", (e)=>{ if (e.key === "Escape" && navMenu.classList.contains("open")) closeMenu(); });
// Close on nav link click (mobile)
navMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { if (window.innerWidth <= 900) closeMenu(); }));

// ===== Smooth scroll offset fix (anchors won't hide under header) =====
document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener("click", (e)=>{
    const id = link.getAttribute("href");
    if(id.length > 1){
      e.preventDefault();
      const el = document.querySelector(id);
      if(!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 84; // header height approx
      window.scrollTo({top:y, behavior:"smooth"});
    }
  });
});

// ===== Reveal on Scroll (IntersectionObserver) =====
const revealEls = document.querySelectorAll(".reveal-up");
const io = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    }
  });
}, {threshold:0.12});
revealEls.forEach(el=>io.observe(el));

// ===== Contact form demo (front-end only) =====
// ===== Contact form real API integration =====
const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://codewiznik-profile.onrender.com"; // ✅ Render backend URL

const contactForm = document.getElementById("contactForm");
const formMsg = document.getElementById("formMessage");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const { name, email, message } = Object.fromEntries(new FormData(contactForm).entries());

  if (!name.trim() || !email.trim() || !message.trim()) {
    formMsg.textContent = "⚠ All fields are required before sending!";
    formMsg.style.color = "#f59e0b";
    return;
  }

  // Show loading
  formMsg.textContent = "⏳ Sending your message, please wait...";
  formMsg.style.color = "#3b82f6";

  try {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });

    const result = await response.json();

    if (result.success) {
      formMsg.innerHTML = "🎉 <span class='success-glow'>Your message has been delivered successfully!</span>";
      formMsg.style.color = "#22c55e";
      contactForm.reset();
    } else {
      formMsg.innerHTML = `❌ <span style='color:#ef4444;'>${result.message}</span>`;
    }
  } catch (error) {
    formMsg.innerHTML = "❌ <span style='color:#ef4444;'>Oops! Something went wrong. Please try again!</span>";
  }
});
