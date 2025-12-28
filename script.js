// ========== GLOBAL FEATURES ==========

// Highlight active nav link
document.querySelectorAll("nav a").forEach(link => {
  if (link.href === window.location.href) {
    link.style.textDecoration = "underline";
  }
});

// Smooth scroll for internal links
document.querySelectorAll("a[href^='#']").forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
  });
});

// ========== HOME PAGE ==========

// Hero welcome effect
if (document.querySelector(".hero h2")) {
  const heroTitle = document.querySelector(".hero h2");
  heroTitle.style.opacity = 0;
  setTimeout(() => {
    heroTitle.style.transition = "opacity 2s";
    heroTitle.style.opacity = 1;
  }, 500);
}

// ========== ABOUT PAGE ==========

// Animate values list
if (document.querySelector(".about ul")) {
  const values = document.querySelectorAll(".about ul li");
  values.forEach((item, index) => {
    item.style.opacity = 0;
    setTimeout(() => {
      item.style.transition = "opacity 1s";
      item.style.opacity = 1;
    }, index * 500);
  });
}

// ========== HISTORY PAGE ==========

// Timeline hover effect
if (document.querySelector(".history ul")) {
  document.querySelectorAll(".history ul li").forEach(item => {
    item.addEventListener("mouseover", () => {
      item.style.background = "#e6f0ff";
      item.style.transition = "background 0.3s";
    });
    item.addEventListener("mouseout", () => {
      item.style.background = "transparent";
    });
  });
}

// ========== EVENTS PAGE ==========

// Highlight upcoming events
if (document.querySelector(".events ul")) {
  const today = new Date();
  document.querySelectorAll(".events ul li").forEach(event => {
    const text = event.textContent;
    const dateMatch = text.match(/([A-Za-z]+ \d{1,2}, \d{4})/);
    if (dateMatch) {
      const eventDate = new Date(dateMatch[0]);
      if (eventDate > today) {
        event.style.color = "#004080";
        event.style.fontWeight = "bold";
      }
    }
  });
}

// ========== GALLERY PAGE ==========

// Click to enlarge images
if (document.querySelector(".gallery-grid")) {
  document.querySelectorAll(".gallery-grid img").forEach(img => {
    img.addEventListener("click", () => {
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.background = "rgba(0,0,0,0.8)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = 1000;

      const bigImg = document.createElement("img");
      bigImg.src = img.src;
      bigImg.style.maxWidth = "90%";
      bigImg.style.maxHeight = "90%";
      bigImg.style.border = "5px solid white";
      bigImg.style.borderRadius = "8px";

      overlay.appendChild(bigImg);
      document.body.appendChild(overlay);

      overlay.addEventListener("click", () => overlay.remove());
    });
  });
}

// ========== CONTACT PAGE ==========

// Form validation
if (document.querySelector(".contact form")) {
  document.querySelector(".contact form").addEventListener("submit", function(e) {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      alert("Please fill in all fields before sending.");
      e.preventDefault();
    } else {
      alert("Thank you, " + name + "! Your message has been sent.");
    }
  });
}
const toggleCheckbox = document.getElementById('dark-mode-toggle');

// Load preference
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  toggleCheckbox.checked = true;
}

// Toggle logic
toggleCheckbox.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', toggleCheckbox.checked);
  localStorage.setItem('theme', toggleCheckbox.checked ? 'dark' : 'light');
});