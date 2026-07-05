  /* ============================================================
     CONFIG — replace these two values for your setup
     ============================================================ */
  // The OAuth "Web application" client ID from
  // https://console.cloud.google.com/apis/credentials
  // (must match GOOGLE_CLIENT_ID in the backend's .env)
  const GOOGLE_CLIENT_ID = '806717739244-u8rubfeg2b1ac2qmk4au42vmqk6s7fi2.apps.googleusercontent.com';

  // Base URL of the nexus-backend API
  const API_BASE_URL = 'https://nexus-agro-backend.onrender.com/api';

  /* ============================================================
     SEO CONTROLLER — dynamic title / meta / canonical / OG / Twitter
     / breadcrumb + FAQ + product schema per client-side route.
     Site is delivered as a single file today, so this keeps every
     "page" fully described for crawlers and AI answer engines even
     though navigation never triggers a full reload. Combine with
     the SPA-fallback rewrite rule in _redirects / vercel.json so
     https://www.nexusagro.com/products etc. resolve on direct hit.
     ============================================================ */
  const SITE_URL = 'https://www.nexusagro.com';
  const ROUTES = { home: '/', products: '/products', network: '/global-network', contact: '/contact', login: '/login' };
  const PAGE_SEO = {
    home: {
      title: 'Nexus Agro | Premium Agricultural Export Company from India',
      description: 'Nexus Agro exports premium green chillies, fresh vegetables, fruits, and spices from India to global markets with international quality standards and reliable logistics.',
      breadcrumb: [{ name: 'Home', item: '/' }]
    },
    products: {
      title: 'Agricultural Export Products | Green Chilli, Vegetables, Fruits & Spices — Nexus Agro',
      description: 'Explore Nexus Agro\'s export catalog: premium green chillies, fresh vegetables, fruits, spices, pulses and grains, sourced directly from Indian farms for global B2B buyers.',
      breadcrumb: [{ name: 'Home', item: '/' }, { name: 'Products', item: '/products' }],
      faqSelector: null,
      products: true
    },
    network: {
      title: 'Global Export Markets | UAE, Qatar, Saudi Arabia, Europe & More — Nexus Agro',
      description: 'Nexus Agro delivers Indian agricultural exports to 25+ countries including the UAE, Qatar, Saudi Arabia, Oman, Kuwait, Bahrain, Singapore, Malaysia and Europe.',
      breadcrumb: [{ name: 'Home', item: '/' }, { name: 'Global Network', item: '/global-network' }]
    },
    contact: {
      title: 'Contact Nexus Agro | Request an Export Quote',
      description: 'Get in touch with Nexus Agro for green chilli, vegetable, fruit and spice export quotes, MOQs and logistics support for your import business.',
      breadcrumb: [{ name: 'Home', item: '/' }, { name: 'Contact', item: '/contact' }]
    },
    login: {
      title: 'Buyer Login | Nexus Agro',
      description: 'Sign in to your Nexus Agro buyer account to manage export orders and quotes.',
      breadcrumb: [{ name: 'Home', item: '/' }, { name: 'Login', item: '/login' }],
      noindex: true
    }
  };

  function setMeta(id, attr, value) { const el = document.getElementById(id); if (el) el.setAttribute(attr, value); }

  function upsertJSONLD(id, data) {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; document.head.appendChild(el); }
    el.textContent = JSON.stringify(data);
  }
  function removeJSONLD(id) { const el = document.getElementById(id); if (el) el.remove(); }

  function updateSEO(page) {
    const seo = PAGE_SEO[page] || PAGE_SEO.home;
    const path = ROUTES[page] || '/';
    const url = SITE_URL + path;

    document.title = seo.title;
    setMeta('metaDescription', 'content', seo.description);
    setMeta('canonicalLink', 'href', url);
    setMeta('ogTitle', 'content', seo.title);
    setMeta('ogDescription', 'content', seo.description);
    setMeta('ogUrl', 'content', url);
    setMeta('twTitle', 'content', seo.title);
    setMeta('twDescription', 'content', seo.description);

    const robotsEl = document.querySelector('meta[name="robots"]');
    if (robotsEl) robotsEl.setAttribute('content', seo.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // BreadcrumbList schema
    upsertJSONLD('breadcrumb-schema', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: seo.breadcrumb.map((b, i) => ({
        '@type': 'ListItem', position: i + 1, name: b.name, item: SITE_URL + b.item
      }))
    });

    // Product schema — products page only
    if (seo.products) {
      const items = Array.from(document.querySelectorAll('#page-products .product-page-card')).map((card, i) => ({
        '@type': 'Product',
        position: i + 1,
        name: card.querySelector('.product-page-title')?.textContent.trim(),
        description: card.querySelector('.product-page-sub')?.textContent.trim(),
        image: card.querySelector('img')?.src,
        brand: { '@type': 'Brand', name: 'Nexus Agro' },
        category: 'Agricultural Export Products'
      }));
      upsertJSONLD('product-schema', {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, item: it }))
      });
    } else {
      removeJSONLD('product-schema');
    }
  }

  /* ============================================================
     PAGE NAVIGATION — clean pushState URLs + full SEO refresh
     ============================================================ */
  function pageFromPath(path) {
    const found = Object.entries(ROUTES).find(([, v]) => v === path);
    return found ? found[0] : 'home';
  }
  function showPage(page, _skipPush) {
    document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-hidden', 'true'); });
    const el = document.getElementById('page-' + page);
    if (!el) return;
    el.classList.add('active');
    el.removeAttribute('aria-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(checkReveal, 150);
    closeMobileMenu();
    updateSEO(page);
    if (!_skipPush && ROUTES[page] && location.pathname !== ROUTES[page]) {
      history.pushState({ page }, '', ROUTES[page]);
    }
  }
  window.addEventListener('popstate', (e) => {
    showPage((e.state && e.state.page) || pageFromPath(location.pathname), true);
  });
  (function initRouteFromURL() {
    const initial = pageFromPath(location.pathname);
    showPage(initial, true);
    history.replaceState({ page: initial }, '', ROUTES[initial]);
  })();
  function scrollToSection(id) {
    closeMobileMenu();
    setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100);
  }
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 60); checkReveal(); });
  function checkReveal() {
    document.querySelectorAll('.page.active .reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 60) el.classList.add('visible');
    });
  }
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.products-filter').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  checkReveal();
  window.addEventListener('load', checkReveal);

  /* ============================================================
     AUTH STATE — session lives in localStorage as 'nexus_token' / 'nexus_user'
     ============================================================ */
  function getSession() {
    const token = localStorage.getItem('nexus_token');
    const userRaw = localStorage.getItem('nexus_user');
    if (!token || !userRaw) return null;
    try { return { token, user: JSON.parse(userRaw) }; } catch { return null; }
  }
  function setSession(token, user) {
    localStorage.setItem('nexus_token', token);
    localStorage.setItem('nexus_user', JSON.stringify(user));
    renderNav();
  }
  function redirectAfterLogin(user) {
    if (user.role === 'admin') {
      window.location.href = 'admin/dashboard.html';
    } else {
      showPage('home');
    }
  }
  function clearSession() {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    renderNav();
  }
  function logout() {
    clearSession();
    showPage('home');
  }

  function renderNav() {
    const session = getSession();
    const navRight = document.getElementById('navRight');
    if (session) {
      const initial = (session.user.name || session.user.email || '?').trim().charAt(0).toUpperCase();
      const dashboardBtn = session.user.role === 'admin'
        ? `<button class="btn-login" onclick="window.location.href='admin/dashboard.html'">Dashboard</button>`
        : '';
      navRight.innerHTML = `
        ${langSwitcherHTML()}
        <div class="nav-user">
          <div class="nav-user-avatar">${initial}</div>
          <span>${escapeHtml(session.user.name || session.user.email)}</span>
        </div>
        ${dashboardBtn}
        <button class="btn-login" onclick="logout()">Logout</button>
        <button class="btn-contact" onclick="showPage('contact')">Contact Us</button>
      `;
    } else {
      navRight.innerHTML = `
        ${langSwitcherHTML()}
        <button class="btn-login" onclick="showPage('login')">Login</button>
        <button class="btn-contact" onclick="showPage('contact')">Contact Us</button>
      `;
    }
    updateLangLabel();
  }

  function langSwitcherHTML() {
    return `
      <div class="lang-switcher">
        <button class="nav-lang" onclick="toggleLangMenu(event)">🌐 <span class="currentLangLabel">EN</span> ▾</button>
        <div class="lang-menu" id="langMenu">
          <div class="lang-option" onclick="setLanguage('en','EN')"><span class="flag">🇬🇧</span> English</div>
          <div class="lang-option" onclick="setLanguage('ar','AR')"><span class="flag">🇦🇪</span> Arabic <span class="native">العربية</span></div>
          <div class="lang-option" onclick="setLanguage('ms','MS')"><span class="flag">🇲🇾</span> Malay <span class="native">Bahasa Melayu</span></div>
          <div class="lang-option" onclick="setLanguage('zh-CN','中文')"><span class="flag">🇸🇬</span> Chinese <span class="native">中文</span></div>
        </div>
      </div>
    `;
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ---- Mobile hamburger menu ----
  function toggleMobileMenu() {
    const nav = document.getElementById('mainNav');
    const btn = document.getElementById('navHamburger');
    const isOpen = nav.classList.toggle('mobile-open');
    if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  function closeMobileMenu() {
    const nav = document.getElementById('mainNav');
    const btn = document.getElementById('navHamburger');
    if (nav) nav.classList.remove('mobile-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  window.addEventListener('resize', () => { if (window.innerWidth > 768) closeMobileMenu(); });

  // ---- Language switcher (backed by Google Website Translator) ----
  const LANG_LABELS = { en: 'EN', ar: 'AR', ms: 'MS', 'zh-CN': '中文' };

  function toggleLangMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.toggle('open');
  }
  document.addEventListener('click', () => {
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.remove('open');
  });

  function updateLangLabel() {
    const saved = localStorage.getItem('nexus_lang') || 'en';
    document.querySelectorAll('.currentLangLabel').forEach(el => el.textContent = LANG_LABELS[saved] || 'EN');
  }

  function setLanguage(code, label) {
    localStorage.setItem('nexus_lang', code);
    document.querySelectorAll('.currentLangLabel').forEach(el => el.textContent = label);
    applyGoogleTranslate(code);
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.remove('open');
  }

  function applyGoogleTranslate(code, attempt) {
    attempt = attempt || 0;
    const combo = document.querySelector('.goog-te-combo');
    if (!combo) {
      if (attempt < 20) setTimeout(() => applyGoogleTranslate(code, attempt + 1), 300);
      return;
    }
    if (code === 'en') {
      // Reset to original by clearing the translate cookie and reloading the combo state
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + location.hostname + ';';
      combo.value = 'en';
      combo.dispatchEvent(new Event('change'));
    } else {
      combo.value = code;
      combo.dispatchEvent(new Event('change'));
    }
  }

  function googleTranslateElementInit() {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,ar,ms,zh-CN',
      autoDisplay: false
    }, 'google_translate_element');
    const saved = localStorage.getItem('nexus_lang');
    if (saved && saved !== 'en') {
      setTimeout(() => applyGoogleTranslate(saved), 1000);
    }
  }

  // Safety net: Google's translate script sometimes re-injects inline styles / a
  // top banner iframe that pushes the whole page down. Keep stripping those out.
  function suppressGoogleTranslateChrome() {
    document.documentElement.style.top = '0px';
    document.body.style.top = '0px';
    document.querySelectorAll('.goog-te-banner-frame, .goog-te-balloon-frame, #goog-gt-tt').forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.height = '0';
    });
  }
  setInterval(suppressGoogleTranslateChrome, 400);
  new MutationObserver(suppressGoogleTranslateChrome).observe(document.documentElement, {
    attributes: true, attributeFilter: ['style', 'class'], subtree: false
  });

  function switchAuthView(view) {
    document.getElementById('loginView').style.display  = view === 'login'  ? '' : 'none';
    document.getElementById('signupView').style.display = view === 'signup' ? '' : 'none';
    hideMsg('loginMsg'); hideMsg('signupMsg');
  }

  function showMsg(id, text, type) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'auth-msg show ' + type;
  }
  function hideMsg(id) {
    const el = document.getElementById(id);
    el.className = 'auth-msg';
  }

  /* ============================================================
     EMAIL / PASSWORD LOGIN + SIGNUP
     ============================================================ */
  async function handleEmailLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) {
      showMsg('loginMsg', 'Please enter both email and password.', 'error');
      return;
    }
    const btn = document.getElementById('loginSubmitBtn');
    btn.disabled = true; btn.textContent = 'Logging in…';
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        showMsg('loginMsg', data.message || 'Login failed.', 'error');
        return;
      }
      setSession(data.token, data.user);
      redirectAfterLogin(data.user);
    } catch (err) {
      showMsg('loginMsg', 'Could not reach the server. Is the API running?', 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Login';
    }
  }

  async function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const company = document.getElementById('signupCompany').value.trim();
    const password = document.getElementById('signupPassword').value;
    if (!name || !email || !password) {
      showMsg('signupMsg', 'Name, email and password are required.', 'error');
      return;
    }
    if (password.length < 8) {
      showMsg('signupMsg', 'Password must be at least 8 characters.', 'error');
      return;
    }
    const btn = document.getElementById('signupSubmitBtn');
    btn.disabled = true; btn.textContent = 'Creating account…';
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, company }),
      });
      const data = await res.json();
      if (!data.success) {
        showMsg('signupMsg', data.message || 'Sign up failed.', 'error');
        return;
      }
      showMsg('signupMsg', data.message || 'Account created! Please check your email to verify, then log in.', 'success');
      setTimeout(() => switchAuthView('login'), 1800);
    } catch (err) {
      showMsg('signupMsg', 'Could not reach the server. Is the API running?', 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Create Account';
    }
  }

  function forgotPassword() {
    const email = document.getElementById('loginEmail').value.trim();
    if (!email) {
      showMsg('loginMsg', 'Enter your email above first, then click "Forgot Password?".', 'error');
      return;
    }
    fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then(() => {
      showMsg('loginMsg', 'If that email exists, a reset link has been sent.', 'success');
    }).catch(() => {
      showMsg('loginMsg', 'Could not reach the server.', 'error');
    });
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  async function handleContactSubmit() {
    const name = document.getElementById('contactName').value.trim();
    const emailVal = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !emailVal || !message) {
      showMsg('contactMsg', 'Please fill in your name, email, and message.', 'error');
      return;
    }

    const btn = document.getElementById('contactSubmitBtn');
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: emailVal, phone, message }),
      });
      const data = await res.json();
      if (!data.success) {
        showMsg('contactMsg', data.message || 'Could not send your message. Please try again.', 'error');
        return;
      }
      showMsg('contactMsg', data.message || 'Thanks! Your message has been sent.', 'success');
      document.getElementById('contactName').value = '';
      document.getElementById('contactEmail').value = '';
      document.getElementById('contactPhone').value = '';
      document.getElementById('contactMessage').value = '';
    } catch (err) {
      showMsg('contactMsg', 'Could not reach the server. Is the API running?', 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Send Message →';
    }
  }

  /* ============================================================
     GOOGLE SIGN-IN
     ============================================================ */
  async function handleGoogleCredentialResponse(response) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!data.success) {
        showMsg('loginMsg', data.message || 'Google sign-in failed.', 'error');
        return;
      }
      setSession(data.token, data.user);
      redirectAfterLogin(data.user);
    } catch (err) {
      showMsg('loginMsg', 'Could not reach the server. Is the API running?', 'error');
    }
  }

  function initGoogleSignIn() {
    if (!window.google || !google.accounts || !google.accounts.id) return;
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
    });
    const opts = { theme: 'outline', size: 'large', width: 360, text: 'continue_with' };
    google.accounts.id.renderButton(document.getElementById('googleBtnContainer'), opts);
    google.accounts.id.renderButton(document.getElementById('googleBtnContainerSignup'), opts);
  }
  window.addEventListener('load', () => {
    // Google's script loads async; poll briefly until it's ready.
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (window.google && google.accounts && google.accounts.id) {
        clearInterval(t);
        initGoogleSignIn();
      } else if (tries > 40) {
        clearInterval(t);
      }
    }, 100);
  });

  // Render nav on initial load in case a session already exists
  renderNav();
  updateLangLabel();

  const GA4_ID = 'G-XXXXXXXXXX';       // TODO: replace with real GA4 Measurement ID
  const CLARITY_ID = 'XXXXXXXXXX';     // TODO: replace with real Microsoft Clarity project ID

  function loadAnalytics() {
    // GA4
    const s1 = document.createElement('script');
    s1.async = true; s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(s1);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA4_ID, { anonymize_ip: true });

    // Microsoft Clarity
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r); t.async=1; t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }

  function acceptCookies() {
    localStorage.setItem('nexus_cookie_consent', 'accepted');
    document.getElementById('cookieConsent').style.display = 'none';
    loadAnalytics();
  }
  function declineCookies() {
    localStorage.setItem('nexus_cookie_consent', 'declined');
    document.getElementById('cookieConsent').style.display = 'none';
  }
  (function initConsent() {
    const consent = localStorage.getItem('nexus_cookie_consent');
    if (consent === 'accepted') { loadAnalytics(); }
    else if (consent !== 'declined') { document.getElementById('cookieConsent').style.display = 'block'; }
  })();

