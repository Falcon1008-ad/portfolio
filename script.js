// ===== Theme Toggle =====
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('.section, .timeline-item, .project-card, .skill-group');
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));

// ===== Smooth nav active state (optional subtle touch) =====
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== Contact form (Web3Forms) =====
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const toast = document.getElementById('toast');

function showToast(title, message, isError = false) {
  toast.querySelector('.toast-title').textContent = title;
  toast.querySelector('.toast-msg').textContent = message;
  if (isError) {
    toast.style.borderColor = '#ef4444';
    toast.querySelector('.toast-icon').style.color = '#ef4444';
  } else {
    toast.style.borderColor = '';
    toast.querySelector('.toast-icon').style.color = '';
  }
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

function clearFormError() {
  const existing = contactForm.querySelector('.form-error');
  if (existing) existing.remove();
}

function showFormError(msg) {
  clearFormError();
  const div = document.createElement('div');
  div.className = 'form-error';
  div.textContent = msg;
  contactForm.appendChild(div);
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormError();

    // Basic validation
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    // Combine First + Last name into the hidden `name` field (for email subject)
    const firstName = contactForm.querySelector('#first-name')?.value.trim() || '';
    const lastName = contactForm.querySelector('#last-name')?.value.trim() || '';
    const combined = contactForm.querySelector('#combined-name');
    if (combined) combined.value = `${firstName} ${lastName}`.trim();

    const formData = new FormData(contactForm);
    const accessKey = formData.get('access_key');

    // Guard: prevent submission if key isn't set
    if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
      showFormError('Contact form not yet configured. Please email directly for now.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.querySelector('.btn-text').textContent = 'Sending...';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      const result = await response.json();

      if (result.success) {
        contactForm.reset();
        showToast('Thank You for reaching out!', "I'll get back to you shortly.");
      } else {
        showFormError(result.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      showFormError('Network error. Please check your connection and try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.querySelector('.btn-text').textContent = 'Submit';
    }
  });
}
