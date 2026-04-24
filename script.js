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

// Stricter format validation — catches typos browsers miss
function isValidEmailFormat(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  const lower = email.toLowerCase();
  const typoDomains = ['gmial.com', 'gamil.com', 'gmai.com', 'gnail.com', 'yaho.com', 'hotnail.com', 'outlok.com'];
  const domain = lower.split('@')[1];
  if (typoDomains.includes(domain)) return false;
  if (email.includes('..')) return false;
  return true;
}

// AbstractAPI key — restrict allowed domains in AbstractAPI dashboard to prevent abuse
const ABSTRACT_API_KEY = '5f1b218d56dd4c76b88ac132c8e6f168';

// Fallback: MX record lookup via Google DNS-over-HTTPS
async function domainHasMx(domain) {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
      { headers: { 'Accept': 'application/dns-json' } }
    );
    if (!response.ok) return true;
    const data = await response.json();
    return Array.isArray(data.Answer) && data.Answer.some(r => r.type === 15);
  } catch {
    return true;
  }
}

// AbstractAPI Email Verification — checks format + MX + SMTP + disposable detection
// Returns: { ok: boolean, reason: string }
async function verifyEmailWithAbstract(email) {
  try {
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${encodeURIComponent(email)}`;
    const response = await fetch(url);
    if (!response.ok) return { ok: true, reason: 'abstract_api_unavailable' }; // fail open
    const data = await response.json();

    // Reject clearly undeliverable addresses
    if (data.deliverability === 'UNDELIVERABLE') {
      return { ok: false, reason: 'undeliverable' };
    }
    // Reject disposable / temp-mail services
    if (data.is_disposable_email?.value === true) {
      return { ok: false, reason: 'disposable' };
    }
    // Reject if MX records are missing
    if (data.is_mx_found?.value === false) {
      return { ok: false, reason: 'no_mx' };
    }
    // Reject if format is invalid (shouldn't happen since we format-check first)
    if (data.is_valid_format?.value === false) {
      return { ok: false, reason: 'bad_format' };
    }
    // DELIVERABLE, RISKY, or UNKNOWN — allow through
    // (Gmail/Outlook use catch-all responses, so RISKY is common for real addresses)
    return { ok: true, reason: data.deliverability || 'ok' };
  } catch {
    return { ok: true, reason: 'abstract_api_error' }; // fail open on network errors
  }
}

// Cache verifications so we don't re-check the same email twice
const emailCache = new Map();
async function isEmailDeliverable(email) {
  const key = email.toLowerCase();
  if (emailCache.has(key)) return emailCache.get(key);

  // Primary: AbstractAPI
  const abstract = await verifyEmailWithAbstract(email);
  if (!abstract.ok) {
    emailCache.set(key, { ok: false, reason: abstract.reason });
    return { ok: false, reason: abstract.reason };
  }

  // Fallback: If AbstractAPI was unavailable, verify via MX lookup
  if (abstract.reason === 'abstract_api_unavailable' || abstract.reason === 'abstract_api_error') {
    const domain = email.split('@')[1]?.toLowerCase();
    const mxOk = domain ? await domainHasMx(domain) : false;
    const result = { ok: mxOk, reason: mxOk ? 'mx_ok' : 'no_mx' };
    emailCache.set(key, result);
    return result;
  }

  const result = { ok: true, reason: abstract.reason };
  emailCache.set(key, result);
  return result;
}

function emailErrorMessage(reason) {
  switch (reason) {
    case 'disposable':
      return "Please use a permanent email address (not a temporary / disposable one).";
    case 'no_mx':
    case 'undeliverable':
      return "This email address doesn't appear to exist. Please double-check and try again.";
    case 'bad_format':
      return "The email format looks invalid. Please enter a correct email.";
    default:
      return "This email address doesn't appear to be valid. Please enter a correct one.";
  }
}

function markFieldInvalid(field) {
  if (!field) return;
  field.classList.add('field-invalid');
  field.focus();
  field.addEventListener('input', () => field.classList.remove('field-invalid'), { once: true });
}

function setFieldChecking(field, checking) {
  if (!field) return;
  field.classList.toggle('field-checking', checking);
}

if (contactForm) {
  const emailField = contactForm.querySelector('#email');

  // Live validation on blur — check format + full verification
  emailField?.addEventListener('blur', async () => {
    const val = emailField.value.trim();
    if (!val) return;
    if (!isValidEmailFormat(val)) {
      markFieldInvalid(emailField);
      return;
    }
    setFieldChecking(emailField, true);
    const result = await isEmailDeliverable(val);
    setFieldChecking(emailField, false);
    if (!result.ok) markFieldInvalid(emailField);
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormError();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const emailValue = emailField?.value.trim() || '';

    // Format check
    if (!isValidEmailFormat(emailValue)) {
      markFieldInvalid(emailField);
      showToast(
        'Invalid email address',
        'Please enter a correct email so I can get back to you.',
        true
      );
      showFormError('The email address you entered looks invalid. Please double-check and try again.');
      return;
    }

    // Full email verification via AbstractAPI (with MX fallback)
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.querySelector('.btn-text').textContent = 'Verifying...';

    const verification = await isEmailDeliverable(emailValue);

    if (!verification.ok) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.querySelector('.btn-text').textContent = 'Send';
      markFieldInvalid(emailField);
      const msg = emailErrorMessage(verification.reason);
      showToast('Invalid email address', msg, true);
      showFormError(msg);
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
      submitBtn.querySelector('.btn-text').textContent = 'Send';
    }
  });
}
