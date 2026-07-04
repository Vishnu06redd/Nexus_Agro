/* ============================================================
   ADMIN AUTH GUARD
   Runs on every /admin/*.html page. Reads the same session that
   the public site's login page writes to localStorage
   ('nexus_token' / 'nexus_user'). If there's no session, or the
   logged-in user isn't role 'admin', bounce back to the public
   site's login page.
   ============================================================ */
(function () {
  var token = localStorage.getItem('nexus_token');
  var userRaw = localStorage.getItem('nexus_user');
  var user = null;
  try { user = userRaw ? JSON.parse(userRaw) : null; } catch (e) { user = null; }

  if (!token || !user || user.role !== 'admin') {
    window.location.href = '../index.html';
  }
})();

function adminLogout() {
  localStorage.removeItem('nexus_token');
  localStorage.removeItem('nexus_user');
  window.location.href = '../index.html';
}
