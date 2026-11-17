/* ================================================================
   KIU Student Portal — script.js
   Covers: DOM, ES6+, Async JS, Fetch API, Web Storage
   ================================================================ */

// ── 1. DOM ELEMENT SELECTION ─────────────────────────────────────
const form             = document.querySelector('.form-container');
const messageBox       = document.getElementById('form-message');
const countElement     = document.getElementById('student-count');
const dateElement      = document.getElementById('date-display');
const weatherEl        = document.getElementById('weather-status');
const programSelect    = document.getElementById('program');
const programPreview   = document.getElementById('program-preview');
const registrationList = document.getElementById('recent-registrations');
const darkToggle       = document.getElementById('dark-mode-toggle');
const backToTopBtn     = document.getElementById('back-to-top');
const motivationEl     = document.getElementById('motivation');
const charCountEl      = document.getElementById('char-count');
const countdownEl      = document.getElementById('semester-countdown');

// ── 2. WEB STORAGE ───────────────────────────────────────────────

// localStorage — data persists across browser sessions
const STORAGE_KEY = 'kiu-registrations';

const loadRegistrations = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const saveRegistrations = (list) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

// sessionStorage — cleared automatically when tab closes
const SESSION_KEY = 'kiu-session';

const getSession = () =>
  JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');

const updateSession = (data) =>
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...getSession(), ...data }));

// ── 3. TOAST NOTIFICATIONS ────────────────────────────────────────
const toastContainer = document.getElementById('toast-container');

const showToast = (text, type = 'info') => {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = text;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3500);
};

// ── 4. STATUS MESSAGE ─────────────────────────────────────────────
const showMessage = (text, type = 'info') => {
  messageBox.textContent = text;
  messageBox.className = `status-message ${type}`;
};

// ── 5. DARK MODE ──────────────────────────────────────────────────
const applyDarkMode = (isDark) => {
  document.body.classList.toggle('dark-mode', isDark);
  if (darkToggle) darkToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('kiu-dark-mode', isDark);
};

// ── 6. SEMESTER COUNTDOWN ─────────────────────────────────────────
const updateCountdown = () => {
  if (!countdownEl) return;
  const nextSemester = new Date('2026-09-15');
  const today        = new Date();
  const diff         = Math.ceil((nextSemester - today) / (1000 * 60 * 60 * 24));
  countdownEl.textContent = diff > 0 ? `${diff}` : 'Started!';
};

// ── 7. ACTIVE NAV ON SCROLL ───────────────────────────────────────
const updateActiveNav = () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');
  let current = '';

  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
};

// ── 8. BACK TO TOP + SCROLL HANDLER ──────────────────────────────
const handleScroll = () => {
  if (backToTopBtn) {
    backToTopBtn.classList.toggle('visible', window.scrollY > 400);
  }
  updateActiveNav();
};

// ── 9. COURSE FILTER ──────────────────────────────────────────────
const initCourseFilter = () => {
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const courseCards = document.querySelectorAll('.course-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      courseCards.forEach((card) => {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
      });
    });
  });
};

// ── 10. CHARACTER COUNTER ──────────────────────────────────────────
const initCharCounter = () => {
  if (!motivationEl || !charCountEl) return;
  motivationEl.addEventListener('input', () => {
    const count = motivationEl.value.length;
    charCountEl.textContent = count;
    charCountEl.style.color = count >= 450 ? '#ff6b6b' : '#888';
  });
};

// ── 11. REAL-TIME FORM VALIDATION ─────────────────────────────────
const validateField = (input) => {
  const value      = input.value.trim();
  const notEmpty   = value.length > 0;
  const validEmail = input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValid    = notEmpty && validEmail;
  input.classList.toggle('valid',   isValid);
  input.classList.toggle('invalid', !isValid && notEmpty);
};

const initValidation = () => {
  ['firstname', 'lastname', 'email'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => validateField(el));
    el.addEventListener('blur',  () => validateField(el));
  });
};

// ── 12. SCROLL ANIMATIONS (IntersectionObserver) ──────────────────
const initScrollAnimations = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        target.classList.add('visible');
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
};

// ── 13. PROGRAM DESCRIPTIONS ──────────────────────────────────────
const programDescriptions = {
  'computer-science': 'Computer Science at KIU focuses on coding, software design, and innovative problem-solving.',
  business:   'Business Administration connects students with leadership, finance, and entrepreneurship.',
  medicine:   'Medicine prepares students for healthcare with strong clinical and scientific foundations.',
  design:     'Design develops creative thinking, visual communication, and UX skills.',
  law:        'Law covers legal systems, human rights, and public and private law.',
  psychology: 'Psychology explores human behaviour, mental processes, and research methods.',
};

const programDetails = {
  'computer-science': { duration: '4 years', levels: 'Bachelor / Master / PhD', careers: 'Software Engineer, Data Scientist, ML Engineer, etc', tuition: '₾2,250 / yr' },
  business:           { duration: '4 years', levels: 'Bachelor / Master / PhD', careers: 'Manager, Entrepreneur, Analyst', tuition: '₾2,250 / yr' },
  medicine:           { duration: '6 years', levels: 'Bachelor / Master / PhD', careers: 'Pre-Med/Undergrad (3-4 yrs) → Pre-Clinical Studies (Yrs 1-2) → Clinical Rotations (Yrs 3-4) → Residency (3-7 yrs) → Fellowship (1-3 yrs, optional)', tuition: '₾2,250 / yr' },
  design:             { duration: '3 years', levels: 'Bachelor / Master', careers: 'UX Designer, Art Director, Illustrator', tuition: '₾2,250 / yr' },
  law:                { duration: '4 years', levels: 'Bachelor / Master', careers: 'Lawyer, Judge, Legal Advisor', tuition: '₾2,250 / yr' },
  psychology:         { duration: '4 years', levels: 'Bachelor / Master / PhD', careers: 'Psychologist, Counselor, Researcher', tuition: '₾2,250 / yr' },
};

// ── 14. DYNAMIC CONTENT & STYLE MANIPULATION ─────────────────────
const setProgramPreview = (value) => {
  const description = programDescriptions[value] || 'Choose a program to see how KIU supports your future.';

  programPreview.textContent = description;

  programPreview.style.background   = value ? '#eef6ff' : 'transparent';
  programPreview.style.padding      = value ? '0.5rem'  : '0';
  programPreview.style.borderRadius = value ? '6px'     : '0';

  if (value) {
    const { viewedPrograms = [] } = getSession();
    if (!viewedPrograms.includes(value)) {
      updateSession({ viewedPrograms: [...viewedPrograms, value] });
    }
  }
};

// ── 15. PROGRAM COMPARISON TOOL ───────────────────────────────────
const initComparison = () => {
  const selectA = document.getElementById('compare-a');
  const selectB = document.getElementById('compare-b');
  const result  = document.getElementById('compare-result');
  if (!selectA || !selectB || !result) return;

  const render = () => {
    const a = selectA.value;
    const b = selectB.value;
    if (!a || !b)  { result.innerHTML = ''; return; }
    if (a === b)   { result.innerHTML = '<p class="compare-hint">Select two different programs to compare.</p>'; return; }

    const da     = programDetails[a];
    const db     = programDetails[b];
    const labelA = a.replace(/-/g, ' ');
    const labelB = b.replace(/-/g, ' ');

    result.innerHTML = `
      <table class="compare-table">
        <thead>
          <tr><th>Feature</th><th>${labelA}</th><th>${labelB}</th></tr>
        </thead>
        <tbody>
          <tr><td>Duration</td><td>${da.duration}</td><td>${db.duration}</td></tr>
          <tr><td>Degree Levels</td><td>${da.levels}</td><td>${db.levels}</td></tr>
          <tr><td>Career Paths</td><td>${da.careers}</td><td>${db.careers}</td></tr>
          <tr><td>Tuition</td><td>${da.tuition}</td><td>${db.tuition}</td></tr>
          <tr><td>About</td><td>${programDescriptions[a]}</td><td>${programDescriptions[b]}</td></tr>
        </tbody>
      </table>`;
  };

  selectA.addEventListener('change', render);
  selectB.addEventListener('change', render);
};

// ── 16. STATS + RECENT APPLICANTS LIST ───────────────────────────
const updateRegistrationStats = () => {
  const registrations = loadRegistrations();

  countElement.textContent = registrations.length;
  dateElement.textContent  = new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(new Date());

  if (!registrationList) return;
  registrationList.innerHTML = '';

  const recent = registrations.slice(-3).reverse();

  if (recent.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No applicants yet.';
    registrationList.appendChild(li);
    return;
  }

  recent.forEach(({ firstName, program }) => {
    const li = document.createElement('li');
    li.textContent = `${firstName} — ${program.replace(/-/g, ' ')}`;
    registrationList.appendChild(li);
  });
};

// ── 17. DRAFT SAVE / RESTORE (sessionStorage) ─────────────────────
const DRAFT_KEY = 'kiu-form-draft';

const saveDraft = () => {
  if (!form) return;
  const data = {};
  ['firstname','lastname','email','program','motivation'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) data[id] = el.value;
  });
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
};

const restoreDraft = () => {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  const draft = JSON.parse(raw);
  let restored = false;
  ['firstname','lastname','email','program','motivation'].forEach((id) => {
    const el = document.getElementById(id);
    if (el && draft[id]) { el.value = draft[id]; restored = true; }
  });
  if (restored) showToast('Draft restored from your previous session.', 'info');
};

const clearDraft = () => sessionStorage.removeItem(DRAFT_KEY);

const initDraftSave = () => {
  if (!form) return;
  ['firstname','lastname','email','program','motivation'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', saveDraft);
  });
};

// ── 18. EMAIL AUTOCOMPLETE ────────────────────────────────────────
const initEmailAutocomplete = () => {
  const emailInput = document.getElementById('email');
  if (!emailInput) return;

  const datalist = document.createElement('datalist');
  datalist.id = 'email-suggestions';
  emailInput.setAttribute('list', 'email-suggestions');
  emailInput.parentElement.appendChild(datalist);

  const refresh = () => {
    const emails = [...new Set(loadRegistrations().map((r) => r.email))];
    datalist.innerHTML = emails.map((e) => `<option value="${e}">`).join('');
  };

  emailInput.addEventListener('focus', refresh);
};

// ── 19. ASYNC/AWAIT — weather (Fetch API + JSON) ──────────────────
async function initWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=42.25&longitude=42.70&current_weather=true&timezone=auto`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error');

    const data = await response.json();                         // JSON processing
    const { temperature, windspeed } = data.current_weather;   // destructuring

    weatherEl.innerHTML = `🌤 ${temperature}°C · ${windspeed} km/h`; // template literal
  } catch {
    weatherEl.textContent = 'Weather unavailable';
  }
}

// ── 20. CALLBACK PATTERN — weather note ───────────────────────────
const fetchWeatherCallback = (city, callback) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=42.25&longitude=42.70&current_weather=true&timezone=auto`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => callback(null, { city, ...data.current_weather })) // spread
    .catch((err)  => callback(err, null));
};

// ── 22. DOMContentLoaded — wire everything up ─────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Restore dark mode from localStorage
  applyDarkMode(localStorage.getItem('kiu-dark-mode') === 'true');

  // Init stats, preview, countdown
  updateRegistrationStats();
  setProgramPreview(programSelect?.value || '');
  updateCountdown();

  // Record session start time (sessionStorage)
  if (!getSession().startTime) {
    updateSession({ startTime: new Date().toISOString() });
  }

  // Async/Await: live weather
  initWeather();

  // Callback pattern: weather note below stat card
  fetchWeatherCallback('Kutaisi', (err, weather) => {
    if (!err && weather) {
      const note = document.createElement('small');
      note.textContent = `Live data for ${weather.city}`;
      weatherEl.parentElement.appendChild(note);
    }
  });

  // Scroll animations via IntersectionObserver
  initScrollAnimations();

  // Course category filter
  initCourseFilter();

  // Motivation character counter
  initCharCounter();

  // Real-time input validation
  initValidation();

  // Program comparison tool
  initComparison();

  // Draft save / restore
  initDraftSave();
  restoreDraft();

  // Email autocomplete from prior registrations
  initEmailAutocomplete();

  // Scroll: back-to-top visibility + active nav highlight
  window.addEventListener('scroll', handleScroll);

  // Dark mode toggle button
  darkToggle?.addEventListener('click', () => {
    applyDarkMode(!document.body.classList.contains('dark-mode'));
  });

  // Back to top button
  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Nav click — active class
  document.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', () => {
      document.querySelectorAll('nav a').forEach((a) => a.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Program select change
  programSelect?.addEventListener('change', ({ target: { value } }) => {
    setProgramPreview(value);
  });

  // ── Form Submit ───────────────────────────────────────────────
  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData          = new FormData(form);
    const selectedInterests = formData.getAll('interests');
    const data              = Object.fromEntries(formData.entries());

    // REST destructuring — required fields out, rest in `rest`
    const { firstname, lastname, email, program, study_level, ...rest } = data;
    const { motivation = '' } = rest;

    if (!firstname || !lastname || !email || !program || !study_level) {
      showMessage('Please complete all required fields.', 'error');
      return;
    }

    const duplicate = loadRegistrations().find(
      (r) => r.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (duplicate) {
      showMessage(`This email is already registered under ${duplicate.firstName} ${duplicate.lastName}.`, 'error');
      showToast('Email already in use. Please use a different one.', 'error');
      return;
    }

    const submission = {
      firstName:   firstname.trim(),
      lastName:    lastname.trim(),
      email:       email.trim(),
      program,
      studyLevel:  study_level,
      interests:   selectedInterests,
      motivation:  motivation.trim(),
      submittedAt: new Date().toISOString(),
    };

    // SPREAD — append new submission to existing array
    const registrations = [...loadRegistrations(), submission];
    saveRegistrations(registrations);
    updateRegistrationStats();
    clearDraft();

    // Destructuring with rename
    const { firstName, lastName: familyName, program: chosenProgram } = submission;
    showMessage(
      `Thanks, ${firstName} ${familyName}! Your ${chosenProgram.replace(/-/g, ' ')} registration has been saved.`,
      'success'
    );
    showToast(`Welcome, ${firstName}! Your application is submitted.`, 'success');

    form.reset();
    setProgramPreview('');
    if (charCountEl) charCountEl.textContent = '0';

    // Clear validation styles after reset
    ['firstname', 'lastname', 'email'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('valid', 'invalid');
    });
  });

});
