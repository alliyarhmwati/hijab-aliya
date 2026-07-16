/* =========================================================
   AR — data layer
   This is the "shared database" between the user site and the
   admin panel. Both read/write the same localStorage keys, so
   changes made in /admin (add product, update order status...)
   are immediately reflected on the storefront and vice versa.

   NOTE: this is a front-end demo. In a real deployment this file
   would be replaced by real API calls to a backend + database.
   ========================================================= */

const AR_KEYS = {
  PRODUCTS: 'ar_products_v1',
  CART: 'ar_cart_v1',
  ORDERS: 'ar_orders_v1',
  ADMIN_SESSION: 'ar_admin_session_v1',
  USERS: 'ar_users_v1',
  USER_SESSION: 'ar_user_session_v1',
};

// Demo seed products that were removed for never having a real photo.
// Kept here so already-visited browsers can drop them from their cached
// localStorage list too, not just new visitors.
const AR_RETIRED_PRODUCT_IDS = ['p3','p8','p9'];

const AR_SEED_PRODUCTS = [
  { id:'p1', name:'Pashmina Viscose Dusty Rose', category:'Polos', color:'Dusty Rose', hex:'#D8A7B1', price:89000, oldPrice:110000, stock:24, sku:'AR-PV-001', desc:'Pashmina instan berbahan viscose premium yang jatuh lembut dan adem dipakai seharian. Warna dusty rose yang lembut cocok untuk acara formal maupun harian.', featured:true, image:'assets/img/products/dusty-pink.jpg' },
  { id:'p2', name:'Pashmina Viscose Mocha Brown', category:'Polos', color:'Mocha Brown', hex:'#8B6F52', price:89000, oldPrice:null, stock:31, sku:'AR-PV-002', desc:'Warna mocha brown yang hangat dan netral, mudah dipadukan dengan outfit apa pun. Tekstur viscose premium anti panas.', featured:true, image:'assets/img/products/latte.jpg' },
  { id:'p4', name:'Pashmina Viscose Navy Storm', category:'Polos', color:'Navy Storm', hex:'#1F2A44', price:89000, oldPrice:null, stock:18, sku:'AR-PV-004', desc:'Navy storm yang tegas dan profesional, pilihan favorit untuk hijab kerja dan seragam kantor.', featured:true, image:'assets/img/products/navy.jpg' },
  { id:'p5', name:'Pashmina Viscose Maroon Velvet', category:'Polos', color:'Maroon', hex:'#6B2C39', price:92000, oldPrice:105000, stock:9, sku:'AR-PV-005', desc:'Merah maroon pekat yang mewah, cocok untuk acara pernikahan dan momen spesial.', featured:false, image:'assets/img/products/maroon.jpg' },
  { id:'p6', name:'Pashmina Viscose Sand Beige', category:'Polos', color:'Sand Beige', hex:'#C7B892', price:85000, oldPrice:null, stock:40, sku:'AR-PV-006', desc:'Sand beige netral yang lembut di mata, best seller untuk pemakaian sehari-hari.', featured:true, image:'assets/img/products/beigi.jpg' },
  { id:'p7', name:'Pashmina Viscose Onyx Black', category:'Polos', color:'Onyx Black', hex:'#1C1C1C', price:89000, oldPrice:null, stock:52, sku:'AR-PV-007', desc:'Hitam pekat klasik, wajib punya. Material viscose premium dua sisi, ringan dan tidak panas.', featured:true, image:'assets/img/products/hitam.png' },
  { id:'p10', name:'Pashmina Print Ceplok Bali', category:'Motif', color:'Multicolor', hex:'#B08D57', price:98000, oldPrice:115000, stock:12, sku:'AR-PP-010', desc:'Motif ceplok khas Nusantara dengan warna earthy, dicetak di atas viscose premium yang tetap adem.', featured:true, image:'assets/img/products/pashmina-print-ceplok-bali.jpg' },
  { id:'p11', name:'Pashmina Print Garis Senja', category:'Motif', color:'Multicolor', hex:'#A2503A', price:98000, oldPrice:null, stock:20, sku:'AR-PP-011', desc:'Motif garis gradasi warna senja, memberi kesan modern dan effortless.', featured:false, image:'assets/img/products/motif-2.jpg' },
  { id:'p12', name:'Pashmina Viscose Cream Ivory', category:'Polos', color:'Cream Ivory', hex:'#EDE4D3', price:85000, oldPrice:null, stock:27, sku:'AR-PV-012', desc:'Cream ivory yang soft dan mudah dipadukan, cocok jadi basic collection kamu.', featured:false, image:'assets/img/products/biskuit.jpg' },
  { id:'p13', name:'Pashmina Print Kabut Zamrud', category:'Motif', color:'Multicolor', hex:'#4A5D45', price:98000, oldPrice:null, stock:16, sku:'AR-PP-013', desc:'Motif marble hijau zamrud yang artistik, memberi kesan mewah dan effortless untuk gaya sehari-hari maupun acara spesial.', featured:false, image:'assets/img/products/motif-4.jpg' },
  { id:'p14', name:'Pashmina Print Batik Senja', category:'Motif', color:'Multicolor', hex:'#8A5A5A', price:98000, oldPrice:null, stock:14, sku:'AR-PP-014', desc:'Motif abstrak dengan sentuhan warna maroon dan earthy tone, tampil beda dengan corak yang artistik dan elegan.', featured:false, image:'assets/img/products/motif-3.jpg' },
  { id:'p15', name:'Pashmina Viscose Mahogany Brown', category:'Polos', color:'Mahogany', hex:'#6B3A2E', price:92000, oldPrice:null, stock:22, sku:'AR-PV-015', desc:'Coklat mahogany yang hangat dan kaya warna, tampil elegan untuk acara formal maupun harian.', featured:false, image:'assets/img/products/mahogani.jpg' },
  { id:'p16', name:'Pashmina Print Marmer Senja', category:'Motif', color:'Multicolor', hex:'#C99B95', price:98000, oldPrice:null, stock:17, sku:'AR-PP-016', desc:'Motif marmer dusty rose yang lembut dan feminin, cocok untuk tampilan yang elegan dan effortless.', featured:false, image:'assets/img/products/motif-5.jpg' },
];

/* ---------- Low level storage helpers ---------- */
function arGet(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){
    console.error('AR storage read error', key, e);
    return fallback;
  }
}
function arSet(key, value){
  try{
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }catch(e){
    console.error('AR storage write error', key, e);
    return false;
  }
}

/* ---------- Init / seed ---------- */
function arInit(){
  const existingProducts = arGet(AR_KEYS.PRODUCTS, null);
  if(existingProducts === null){
    arSet(AR_KEYS.PRODUCTS, AR_SEED_PRODUCTS);
  } else {
    // Migrate: browsers that already cached an older product list (from
    // before fields like `image` existed) won't automatically pick up
    // new seed fields. Backfill anything missing without touching data
    // an admin may have already customized (price, stock, etc).
    const seedById = {};
    AR_SEED_PRODUCTS.forEach(sp => { seedById[sp.id] = sp; });
    let changed = false;
    let products = existingProducts;
    products.forEach(p => {
      const seed = seedById[p.id];
      // Backfill when the field is missing entirely (very old cache) OR
      // when it's still empty/null but the seed now has a real photo
      // (this is the common case: browser cached the product list back
      // when this product had no photo yet, and the field is just stale).
      if(seed && !p.image && seed.image){
        p.image = seed.image;
        changed = true;
      }
    });
    // Drop retired demo products (never had a real photo) from browsers
    // that already cached them before they were removed from the catalog.
    const beforeCount = products.length;
    products = products.filter(p => !AR_RETIRED_PRODUCT_IDS.includes(p.id));
    if(products.length !== beforeCount) changed = true;
    // Add any brand-new seed products (new ids) that this browser's
    // cached list doesn't have yet, e.g. products added to the catalog
    // after this browser first visited the site.
    const existingIds = new Set(products.map(p => p.id));
    AR_SEED_PRODUCTS.forEach(sp => {
      if(!existingIds.has(sp.id)){
        products.push(sp);
        changed = true;
      }
    });
    if(changed) arSet(AR_KEYS.PRODUCTS, products);
  }
  if(localStorage.getItem(AR_KEYS.CART) === null){
    arSet(AR_KEYS.CART, []);
  }
  if(localStorage.getItem(AR_KEYS.ORDERS) === null){
    arSet(AR_KEYS.ORDERS, []);
  }
  if(localStorage.getItem(AR_KEYS.USERS) === null){
    arSet(AR_KEYS.USERS, []);
  }
}

/* ---------- Products ---------- */
function arGetProducts(){ return arGet(AR_KEYS.PRODUCTS, []); }
function arSaveProducts(list){ return arSet(AR_KEYS.PRODUCTS, list); }
function arGetProduct(id){ return arGetProducts().find(p => p.id === id) || null; }
function arUpsertProduct(product){
  const list = arGetProducts();
  const idx = list.findIndex(p => p.id === product.id);
  if(idx >= 0){ list[idx] = product; } else { list.push(product); }
  arSaveProducts(list);
}
function arDeleteProduct(id){
  arSaveProducts(arGetProducts().filter(p => p.id !== id));
}
function arNextProductId(){
  const list = arGetProducts();
  let max = 0;
  list.forEach(p => { const n = parseInt(String(p.id).replace('p','')) || 0; if(n > max) max = n; });
  return 'p' + (max + 1);
}

/* ---------- Cart ---------- */
function arGetCart(){ return arGet(AR_KEYS.CART, []); }
function arSaveCart(cart){ arSet(AR_KEYS.CART, cart); arUpdateCartBadge(); }
function arAddToCart(productId, qty){
  const cart = arGetCart();
  const existing = cart.find(i => i.productId === productId);
  if(existing){ existing.qty += qty; }
  else{ cart.push({ productId, qty }); }
  arSaveCart(cart);
}
function arUpdateCartQty(productId, qty){
  let cart = arGetCart();
  if(qty <= 0){ cart = cart.filter(i => i.productId !== productId); }
  else{
    const item = cart.find(i => i.productId === productId);
    if(item) item.qty = qty;
  }
  arSaveCart(cart);
}
function arRemoveFromCart(productId){
  arSaveCart(arGetCart().filter(i => i.productId !== productId));
}
function arCartCount(){
  return arGetCart().reduce((sum,i) => sum + i.qty, 0);
}
function arCartDetailed(){
  const products = arGetProducts();
  return arGetCart().map(item => {
    const p = products.find(pr => pr.id === item.productId);
    return p ? { ...item, product: p, lineTotal: p.price * item.qty } : null;
  }).filter(Boolean);
}
function arCartSubtotal(){
  return arCartDetailed().reduce((s,i) => s + i.lineTotal, 0);
}
function arUpdateCartBadge(){
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    const c = arCartCount();
    el.textContent = c;
    el.style.display = c > 0 ? 'flex' : 'none';
  });
}

/* ---------- Orders ---------- */
function arGetOrders(){ return arGet(AR_KEYS.ORDERS, []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); }
function arSaveOrders(list){ arSet(AR_KEYS.ORDERS, list); }
function arGetOrder(id){ return arGetOrders().find(o => o.id === id) || null; }
function arNextOrderId(){
  const n = arGetOrders().length + 1;
  const y = new Date().getFullYear();
  return `AR-${y}-${String(n).padStart(4,'0')}`;
}
function arCreateOrder({ customer, payment, items, subtotal, shippingFee, total }){
  const session = arGetUserSession();
  const order = {
    id: arNextOrderId(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    userId: session ? session.id : null,
    customer,
    payment,
    items,
    subtotal,
    shippingFee,
    total,
  };
  const list = arGetOrders();
  list.push(order);
  arSaveOrders(list);
  // decrement stock
  const products = arGetProducts();
  items.forEach(it => {
    const p = products.find(pr => pr.id === it.productId);
    if(p) p.stock = Math.max(0, p.stock - it.qty);
  });
  arSaveProducts(products);
  return order;
}
function arUpdateOrderStatus(orderId, status){
  const list = arGetOrders();
  const o = list.find(x => x.id === orderId);
  if(o) o.status = status;
  arSaveOrders(list);
}
function arGetOrdersByEmail(email){
  const clean = String(email || '').trim().toLowerCase();
  return arGetOrders().filter(o => o.customer.email.toLowerCase() === clean);
}
/* Orders belonging to the currently logged-in customer: matched by
   userId when available (orders placed after this feature shipped),
   falling back to email match for older/edge-case records. */
function arGetMyOrders(){
  const session = arGetUserSession();
  if(!session) return [];
  return arGetOrders().filter(o => (o.userId && o.userId === session.id) || (o.customer.email && o.customer.email.toLowerCase() === session.email.toLowerCase()));
}

/* ---------- Customer accounts (front-end demo auth) ----------
   NOTE: this is a client-side demo. Passwords are stored in
   localStorage in plain text purely for demo purposes — a real
   deployment must hash passwords and authenticate via a backend. */
function arGetUsers(){ return arGet(AR_KEYS.USERS, []); }
function arSaveUsers(list){ return arSet(AR_KEYS.USERS, list); }
function arFindUserByEmail(email){
  const clean = String(email || '').trim().toLowerCase();
  return arGetUsers().find(u => u.email.toLowerCase() === clean) || null;
}
function arRegisterUser({ name, email, phone, password }){
  const clean = String(email || '').trim().toLowerCase();
  if(arFindUserByEmail(clean)){
    return { ok:false, error:'Email sudah terdaftar. Silakan masuk.' };
  }
  const user = {
    id: 'u' + (Date.now()),
    name: String(name || '').trim(),
    email: clean,
    phone: String(phone || '').trim(),
    password: String(password || ''),
    createdAt: new Date().toISOString(),
  };
  const list = arGetUsers();
  list.push(user);
  arSaveUsers(list);
  return { ok:true, user };
}
function arLoginUser(email, password){
  const user = arFindUserByEmail(email);
  if(!user || user.password !== String(password || '')){
    return { ok:false, error:'Email atau password salah.' };
  }
  arSet(AR_KEYS.USER_SESSION, { id:user.id, name:user.name, email:user.email, loginAt:new Date().toISOString() });
  return { ok:true, user };
}
function arGetUserSession(){ return arGet(AR_KEYS.USER_SESSION, null); }
function arLogoutUser(){ localStorage.removeItem(AR_KEYS.USER_SESSION); }
function arIsUserLoggedIn(){ return !!arGetUserSession(); }
/* Guard used on pages that require a logged-in customer (e.g. checkout).
   Redirects to the login page, remembering where to return to. */
function arRequireUser(redirectTo){
  if(!arIsUserLoggedIn()){
    const back = redirectTo || (location.pathname.split('/').pop() || 'index.html');
    location.href = 'login.html?redirect=' + encodeURIComponent(back);
    return false;
  }
  return true;
}

/* ---------- Formatting ---------- */
function arFormatIDR(n){
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}
function arFormatDate(iso){
  return new Date(iso).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

/* =========================================================
   Order tracking — shared markup used on the order-success
   page, the customer "Pesanan Saya" (My Orders) page, and the
   admin orders list, so everyone works from the same source
   of truth for how a shipment's status is labeled and ordered.
   ========================================================= */
const AR_PAYMENT_LABEL = { qris:'QRIS', transfer:'Transfer Bank', cod:'Bayar di Tempat (COD)' };
const AR_PAYMENT_NOTE = {
  qris: 'Buka aplikasi e-wallet / m-banking, lalu scan kode QRIS yang kami kirimkan lewat WhatsApp untuk menyelesaikan pembayaran.',
  transfer: 'Transfer sejumlah total pembayaran ke rekening BCA 1234567890 a.n. AR Pashmina Studio, lalu konfirmasi via WhatsApp.',
  cod: 'Siapkan uang pas sejumlah total pembayaran. Kurir akan menghubungi kamu sebelum paket tiba.',
};
const AR_STATUS_LABEL = { pending:'Menunggu Pembayaran', paid:'Dibayar', shipped:'Dikirim', completed:'Selesai', cancelled:'Dibatalkan' };

/* For QRIS/Transfer, payment happens before shipping. For COD, payment
   only happens once the courier hands over the package, so "Dibayar"
   naturally comes after "Dikirim" in that flow. The status values
   themselves (pending/paid/shipped/completed) stay the same — only
   the order they're expected to occur in, and their step label, differ. */
function arGetStepConfig(order){
  if(order.payment === 'cod'){
    return {
      order: ['pending', 'shipped', 'paid', 'completed'],
      meta: [
        { key:'pending', label:'Diterima' },
        { key:'shipped', label:'Dikirim' },
        { key:'paid', label:'Dibayar (COD)' },
        { key:'completed', label:'Selesai' },
      ],
    };
  }
  return {
    order: ['pending', 'paid', 'shipped', 'completed'],
    meta: [
      { key:'pending', label:'Diterima' },
      { key:'paid', label:'Dibayar' },
      { key:'shipped', label:'Dikirim' },
      { key:'completed', label:'Selesai' },
    ],
  };
}

function arOrderStepsHtml(order){
  if(order.status === 'cancelled'){
    return `<div class="order-steps cancelled"><div class="step done" style="flex:none;width:100%;"><div class="dot">✕</div><span class="label" style="color:var(--clay);font-weight:700;">Pesanan dibatalkan</span></div></div>`;
  }
  const { order: stepOrder, meta: stepMeta } = arGetStepConfig(order);
  const currentIdx = stepOrder.indexOf(order.status);
  return `<div class="order-steps">
    ${stepMeta.map((s, i) => `
      <div class="step ${i < currentIdx ? 'done' : ''} ${i === currentIdx ? 'current' : ''}">
        <div class="line"></div>
        <div class="dot">${i < currentIdx ? '✓' : (i + 1)}</div>
        <span class="label">${s.label}</span>
      </div>
    `).join('')}
  </div>`;
}

/* Small deterministic decorative "QR code" — purely visual for this demo
   (there is no real payment gateway to actually scan into), generated
   as inline SVG so it needs no network request and works offline too. */
function arFakeQrSvg(seed){
  const size = 21, cell = 8;
  let h = 0;
  String(seed).split('').forEach(c => { h = (h * 31 + c.charCodeAt(0)) >>> 0; });
  function rand(){ h = (h * 1103515245 + 12345) >>> 0; return (h >>> 16) / 65535; }
  let cells = '';
  for(let y = 0; y < size; y++){
    for(let x = 0; x < size; x++){
      const inFinder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      let on;
      if(inFinder){
        const lx = x < 7 ? x : x - (size - 7);
        const ly = y < 7 ? y : y - (size - 7);
        on = (lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4));
      } else {
        on = rand() > 0.55;
      }
      if(on) cells += `<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}" fill="#1F2A37"/>`;
    }
  }
  const total = size * cell;
  return `<svg viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg" style="width:150px;height:150px;background:#fff;border-radius:10px;padding:10px;border:1px solid var(--line);"><rect width="${total}" height="${total}" fill="#fff"/>${cells}</svg>`;
}

/* Payment section shown under order tracking. QRIS/Transfer let the
   customer self-confirm once they've actually paid (simulated, since
   there's no real gateway). COD keeps its original always-static note
   only — no self-confirm button, because payment there is confirmed by
   the seller on delivery, not by the customer online. */
function arPaymentSectionHtml(order){
  if(order.status === 'cancelled') return '';

  if(order.payment === 'cod'){
    return `
    <div class="next-steps-box">
      <strong>Metode Pembayaran: ${AR_PAYMENT_LABEL[order.payment]}</strong><br>
      ${AR_PAYMENT_NOTE[order.payment]}
    </div>`;
  }

  if(order.status !== 'pending'){
    return `
    <div class="next-steps-box">
      <strong>Metode Pembayaran: ${AR_PAYMENT_LABEL[order.payment]}</strong><br>
      Pembayaran sudah dikonfirmasi. Terima kasih! 🎉
    </div>`;
  }

  if(order.payment === 'qris'){
    return `
    <div class="next-steps-box" style="text-align:center;">
      <strong>Metode Pembayaran: QRIS</strong>
      <div style="display:flex;justify-content:center;margin:14px 0;">${arFakeQrSvg(order.id)}</div>
      <p style="margin:0 0 14px;">${AR_PAYMENT_NOTE.qris}</p>
      <button type="button" class="btn btn-primary" data-confirm-payment="${order.id}">✓ Saya Sudah Bayar</button>
    </div>`;
  }

  // transfer
  return `
    <div class="next-steps-box">
      <strong>Metode Pembayaran: Transfer Bank</strong><br>
      ${AR_PAYMENT_NOTE.transfer}
      <div style="margin-top:14px;"><button type="button" class="btn btn-primary" data-confirm-payment="${order.id}">✓ Saya Sudah Transfer</button></div>
    </div>`;
}

function arOrderDetailHtml(order){
  const itemsHtml = order.items.map(i => `
    <div class="success-item-row">
      <span>${i.name} × ${i.qty}</span>
      <strong>${arFormatIDR(i.price * i.qty)}</strong>
    </div>
  `).join('');

  return `
    ${arOrderStepsHtml(order)}
    <div class="success-card">
      <h4>Ringkasan Pesanan</h4>
      ${itemsHtml}
      <div class="summary-row" style="margin-top:12px;"><span>Subtotal</span><span>${arFormatIDR(order.subtotal)}</span></div>
      <div class="summary-row"><span>Ongkos Kirim</span><span>${arFormatIDR(order.shippingFee)}</span></div>
      <div class="summary-row total"><span>Total Bayar</span><span>${arFormatIDR(order.total)}</span></div>
    </div>
    <div class="success-card">
      <h4>Dikirim ke</h4>
      <p style="margin:0;font-size:.88rem;color:#544c40;line-height:1.6;">
        <strong>${order.customer.name}</strong> · ${order.customer.phone}<br>
        ${order.customer.address}, ${order.customer.city} ${order.customer.postal}
      </p>
    </div>
    ${arPaymentSectionHtml(order)}
  `;
}

/* Customer self-confirms payment for QRIS/Transfer orders (simulated —
   there's no real payment gateway behind this demo). Moves a pending
   order straight to "paid" so the tracking steps advance immediately.
   Not used for COD, where only the seller marks payment on delivery. */
function arConfirmCustomerPayment(orderId){
  const order = arGetOrder(orderId);
  if(!order || order.payment === 'cod' || order.status !== 'pending') return false;
  arUpdateOrderStatus(orderId, 'paid');
  return true;
}

function arCopyToClipboard(text, onDone){
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(text).then(onDone).catch(() => arFallbackCopy(text, onDone));
  } else {
    arFallbackCopy(text, onDone);
  }
}
function arFallbackCopy(text, onDone){
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try{ document.execCommand('copy'); onDone(); }catch(e){ arToast('Nomor pesanan: ' + text); }
  document.body.removeChild(ta);
}
/* Auto-assigns a fallback swatch color from the brand palette so admins
   no longer need to manually pick a "Kode Warna" — it's only ever used
   when a product has no real photo yet, or for small color-dot swatches. */
const AR_AUTO_HEX_PALETTE = ['#D8A7B1','#8B6F52','#6B7A4A','#2C3E60','#6B2C39','#C7B892','#1C1C1C','#7B93A6','#B497BD','#B08D57','#A2503A','#EDE4D3'];
function arAutoHex(seed){
  let h = 0;
  String(seed || 'AR').split('').forEach(c => { h = (h * 31 + c.charCodeAt(0)) >>> 0; });
  return AR_AUTO_HEX_PALETTE[h % AR_AUTO_HEX_PALETTE.length];
}
function arPlaceholderImg(hex, label){
  const clean = hex.replace('#','');
  const txt = encodeURIComponent(label || 'AR');
  return `https://placehold.co/600x750/${clean}/FFFFFF?font=playfair-display&text=${txt}`;
}
/* Prefer a real uploaded product photo; fall back to the color
   placeholder when a product has no photo set yet. Image paths are
   stored relative to the site root, so pages inside /admin/ (one
   folder deeper) need a '../' prefix to resolve correctly. */
function arResolveAssetPath(path){
  if(!path) return path;
  if(/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return location.pathname.includes('/admin/') ? '../' + path.replace(/^\.?\//,'') : path;
}
function arProductImg(p){
  const raw = (p && p.image) ? p.image : arPlaceholderImg(p.hex, p.color);
  return arResolveAssetPath(raw);
}

/* Run init immediately on every page load */
arInit();
