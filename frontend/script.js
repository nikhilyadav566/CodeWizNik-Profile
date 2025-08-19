// Modal
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const openModal = () => { modal.classList.add("active"); overlay.classList.add("overlayActive"); };
const closeModal = () => { modal.classList.remove("active"); overlay.classList.remove("overlayActive"); };

// Copy Profile
const copyProfileLink = () => {
  navigator.clipboard.writeText("https://codewiznik-profile.onrender.com/")
    .then(() => alert("✅ Profile link copied!"))
    .catch(err => console.error(err));
};

// Typing Effect
const typingElement = document.getElementById("typing");
const phrases = ["MERN Dev 🚀","YouTuber 🎥","CodeWizNik ✨"];
let i = 0, j = 0, isDeleting = false, currentText = "";
const typeLoop = () => {
  const fullPhrase = phrases[i];
  currentText = isDeleting ? fullPhrase.substring(0, j--) : fullPhrase.substring(0, j++);
  typingElement.textContent = currentText;

  if(!isDeleting && j === fullPhrase.length + 1){ isDeleting = true; setTimeout(typeLoop, 1500); return; }
  if(isDeleting && j === 0){ isDeleting = false; i=(i+1)%phrases.length; }
  setTimeout(typeLoop, isDeleting?50:150);
};
document.addEventListener("DOMContentLoaded", typeLoop);

// Contact Form
// Contact Form
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

// ✅ Auto-detect API base URL
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://codewiznik-profile-backend.onrender.com"; // 🔗 Replace with your Render backend URL

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    name: contactForm.name.value,
    email: contactForm.email.value,
    message: contactForm.message.value
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    if (data.success) {
      formMessage.textContent = data.message;
      contactForm.reset();
    } else {
      formMessage.textContent = "❌ Something went wrong!";
    }
  } catch (err) {
    console.error(err);
    formMessage.textContent = "❌ Server error!";
  }
});
