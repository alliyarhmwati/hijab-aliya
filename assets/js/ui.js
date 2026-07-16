/* Shared UI behaviors used across every storefront page */

function arToast(message){
  let el = document.getElementById('ar-toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'ar-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__arToastTimer);
  window.__arToastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* =========================================================
   Account / login — shared across every storefront page.
   Clicking the account icon offers a choice: continue as a
   customer (register/login) or go to the admin panel. Customers
   must be logged in before they can proceed to checkout; without
   an account they can still browse and add items to the cart.
   ========================================================= */
function arAdminRootPath(){
  // admin pages live one level deeper (/admin/...), everything else is at root
  return location.pathname.includes('/admin/') ? 'login.html' : 'admin/login.html';
}

function arBuildAuthChoiceModal(){
  if(document.getElementById('ar-auth-modal')) return;
  const wrap = document.createElement('div');
  wrap.className = 'modal-overlay';
  wrap.id = 'ar-auth-modal';
  wrap.innerHTML = `
    <div class="modal" style="max-width:400px;">
      <div class="modal-head">
        <h3>Masuk ke AR Pashmina</h3>
        <button class="modal-close" id="ar-auth-modal-close">✕</button>
      </div>
      <p style="color:#8a8073;font-size:.9rem;margin-bottom:18px;">Pilih jenis akun untuk melanjutkan.</p>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <a class="btn btn-primary btn-block" id="ar-choice-user">🧕 Masuk / Daftar sebagai Pengguna</a>
        <a class="btn btn-outline btn-block" id="ar-choice-admin">🛠️ Masuk sebagai Admin</a>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  const close = () => wrap.classList.remove('open');
  document.getElementById('ar-auth-modal-close').addEventListener('click', close);
  wrap.addEventListener('click', (e) => { if(e.target === wrap) close(); });

  document.getElementById('ar-choice-user').addEventListener('click', () => {
    const here = location.pathname.split('/').pop() || 'index.html';
    location.href = (location.pathname.includes('/admin/') ? '../login.html' : 'login.html') + '?redirect=' + encodeURIComponent(here);
  });
  document.getElementById('ar-choice-admin').addEventListener('click', () => {
    location.href = arAdminRootPath();
  });
}

function arOpenAuthChoice(){
  arBuildAuthChoiceModal();
  document.getElementById('ar-auth-modal').classList.add('open');
}

function arBuildAccountMenuModal(){
  if(document.getElementById('ar-account-modal')) return;
  const wrap = document.createElement('div');
  wrap.className = 'modal-overlay';
  wrap.id = 'ar-account-modal';
  wrap.innerHTML = `
    <div class="modal" style="max-width:380px;">
      <div class="modal-head">
        <h3>Akun Saya</h3>
        <button class="modal-close" id="ar-account-modal-close">✕</button>
      </div>
      <p id="ar-account-modal-name" style="color:#8a8073;font-size:.9rem;margin-bottom:18px;"></p>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <a class="btn btn-primary btn-block" href="orders.html">🧾 Pesanan Saya</a>
        <a class="btn btn-outline btn-block" id="ar-account-logout">🚪 Keluar</a>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  const close = () => wrap.classList.remove('open');
  document.getElementById('ar-account-modal-close').addEventListener('click', close);
  wrap.addEventListener('click', (e) => { if(e.target === wrap) close(); });
  document.getElementById('ar-account-logout').addEventListener('click', () => {
    const session = arGetUserSession();
    arLogoutUser();
    arUpdateAccountUI();
    close();
    arToast(session ? `Sampai jumpa, ${session.name}!` : 'Kamu sudah keluar.');
  });
}

function arOpenAccountMenu(){
  const session = arGetUserSession();
  if(!session) return;
  arBuildAccountMenuModal();
  document.getElementById('ar-account-modal-name').textContent = `Masuk sebagai ${session.name} (${session.email})`;
  document.getElementById('ar-account-modal').classList.add('open');
}

function arUpdateAccountUI(){
  const btn = document.querySelector('[data-account-btn]');
  if(!btn) return;
  const session = arGetUserSession();

  let nameTag = document.getElementById('ar-account-name');
  if(session){
    if(!nameTag){
      nameTag = document.createElement('a');
      nameTag.id = 'ar-account-name';
      nameTag.href = '#';
      nameTag.className = 'account-name';
      btn.insertAdjacentElement('beforebegin', nameTag);
    }
    nameTag.textContent = 'Halo, ' + session.name.split(' ')[0];
    nameTag.style.display = 'inline-flex';
    nameTag.onclick = (e) => { e.preventDefault(); arOpenAccountMenu(); };

    btn.setAttribute('aria-label', 'Akun: ' + session.name);
    btn.innerHTML = '🙋';
    btn.title = 'Akun Saya (' + session.name + ')';
    btn.onclick = (e) => { e.preventDefault(); arOpenAccountMenu(); };
  } else {
    if(nameTag) nameTag.style.display = 'none';
    btn.setAttribute('aria-label', 'Masuk');
    btn.innerHTML = '👤';
    btn.title = 'Masuk';
    btn.onclick = (e) => { e.preventDefault(); arOpenAuthChoice(); };
  }
}


document.addEventListener('DOMContentLoaded', () => {
  arUpdateCartBadge();
  arUpdateAccountUI();

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('mobile-open');
      links.style.cssText = open
        ? 'display:flex;flex-direction:column;gap:16px;position:absolute;top:100%;left:0;right:0;background:#F7F1E8;padding:20px 24px;border-bottom:1px solid rgba(43,38,32,.12);'
        : '';
    });
  }

  // keep cart badge + account state synced across tabs
  window.addEventListener('storage', (e) => {
    if(e.key === AR_KEYS.CART) arUpdateCartBadge();
    if(e.key === AR_KEYS.USER_SESSION) arUpdateAccountUI();
  });
});
