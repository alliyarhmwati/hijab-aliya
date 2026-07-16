/* Shared behaviors for every /admin page */

function arRequireAdmin(){
  const session = arGet(AR_KEYS.ADMIN_SESSION, null);
  if(!session){
    location.href = 'login.html';
  }
}

function arRenderAdminSidebar(active){
  const items = [
    { key:'dashboard', href:'dashboard.html', label:'Dashboard', icon:'▦' },
    { key:'products', href:'products.html', label:'Produk', icon:'🧣' },
    { key:'orders', href:'orders.html', label:'Pesanan', icon:'🧾' },
  ];
  const nav = document.getElementById('admin-nav');
  if(!nav) return;
  nav.innerHTML = items.map(it => `<a href="${it.href}" class="${it.key === active ? 'active' : ''}">${it.icon} ${it.label}</a>`).join('');

  const logoutBtn = document.getElementById('admin-logout');
  if(logoutBtn){
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem(AR_KEYS.ADMIN_SESSION);
      location.href = 'login.html';
    });
  }

  const toggle = document.getElementById('admin-toggle');
  const side = document.querySelector('.admin-side');
  if(toggle && side){
    toggle.addEventListener('click', () => side.classList.toggle('open'));
  }
}
