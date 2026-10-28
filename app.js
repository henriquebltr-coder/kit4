const scents = [
  ['Crimson 540', 'Baccarat Rouge 540', 'BEST SELLER'],
  ['Ventura', 'Creed Aventus', ''],
  ['Visionaire', 'Louis Vuitton Imagination', ''],
  ['Deep Bleu', 'Bleu de Chanel', ''],
  ['Shadow Wood', 'Tom Ford Oud Wood', ''],
  ['Nomad Oud', 'Louis Vuitton Ombre Nomade', ''],
  ['Gold District', 'Paco Rabanne One Million', ''],
  ['Velvet Street', 'Bond No.9 Lafayette Street', ''],
  ['Ascend', 'YSL Y Eau de Parfum', 'NEW SCENT'],
  ['Horizon', 'Louis Vuitton Pacific Chill', 'NEW SCENT'],
  ['Noir Amber', 'Christian Clive Blonde Amber', 'NEW SCENT']
];
const slides = ['Crimson01.png?v=1768426979','Crimson02.png?v=1771527646','Crimson03.png?v=1771527646','Crimson04.2.png?v=1768426978','Crimson05.png?v=1768426978','Crimson06.2.png?v=1768426978'];
const prices = [0, 27, 54, 81];
// Shopify variant IDs for the 1-, 2- and 3-jar bundle products.
const bundleVariants = {
  1: '68029482860768',
  2: '68029485842656',
  3: '68029490659552'
};
// Keep campaign attribution through the cart-to-checkout navigation.
const attributionStorageKey = 'penrose-attribution-v1';
const attributionPattern = /^(utm_[a-z0-9_]+|src|sck|xcod|subid|subid2|fbclid|gclid|gbraid|wbraid|ttclid|twclid|msclkid|campaign_id|adset_id|ad_id)$/i;
function readSavedAttribution() {
  try {
    const saved = JSON.parse(localStorage.getItem(attributionStorageKey) || 'null');
    if (saved && saved.expiresAt > Date.now() && saved.params && typeof saved.params === 'object') return saved.params;
  } catch (_) {}
  return {};
}
function saveAttributionFromUrl() {
  const params = readSavedAttribution();
  let changed = false;
  new URLSearchParams(window.location.search).forEach((value, key) => {
    if (attributionPattern.test(key) && value) {
      params[key] = value;
      changed = true;
    }
  });
  if (!changed) return;
  try {
    localStorage.setItem(attributionStorageKey, JSON.stringify({ params, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 }));
  } catch (_) {}
}
saveAttributionFromUrl();
const remote = file => `https://penroseskin.com/cdn/shop/files/${file}`;
let slide = 2, selected = 1, choice = [0, 1, 2], pickerIndex = 0;
const hero = document.querySelector('#hero'), count = document.querySelector('#count');
const deliveryDate = document.querySelector('#deliveryDate');
function updateDeliveryDate() {
  deliveryDate.textContent = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  }).format(new Date());
}
function scheduleDeliveryDateUpdate() {
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0);
  setTimeout(() => {
    updateDeliveryDate();
    scheduleDeliveryDateUpdate();
  }, nextMidnight.getTime() - Date.now());
}
updateDeliveryDate();
scheduleDeliveryDateUpdate();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateDeliveryDate();
});
function setSlide(n) {
  slide = (n + slides.length) % slides.length;
  hero.src = remote(slides[slide]);
  count.textContent = `${slide + 1} / ${slides.length}`;
  document.querySelectorAll('.thumb').forEach((el, i) => el.classList.toggle('active', i === slide));
}
document.querySelector('#thumbs').innerHTML = slides.map((file, i) => `<button class="thumb ${i === slide ? 'active' : ''}" aria-label="View image ${i + 1}"><img src="${remote(file)}&width=140"></button>`).join('');
document.querySelectorAll('.thumb').forEach((el, i) => el.onclick = () => setSlide(i));
document.querySelector('.prev').onclick = () => setSlide(slide - 1);
document.querySelector('.next').onclick = () => setSlide(slide + 1);
function render() {
  const list = document.querySelector('#bundleList');
  list.innerHTML = [1, 2, 3].map(n => {
    const chosen = selected === n;
    const badge = n === 2 ? '<b class="bundle-badge popular">♨ MOST POPULAR</b>' : n === 3 ? '<b class="bundle-badge value">♛ BEST VALUE</b>' : '';
    const rows = chosen ? Array.from({ length: n }, (_, i) => `<div class="jar-row"><span class="jar-num">JAR<br><b>${i + 1}</b></span><span class="jar-image"><img src="assets/bundle-image-clean.png" alt="Bundle product image"></span><button class="scent-choice" data-jar="${i}"><span class="scent-title"><b>${scents[choice[i]][0]}</b>${scents[choice[i]][2] ? `<em class="scent-tag">${scents[choice[i]][2]}</em>` : ''}</span><small>Smells like<br><b>${scents[choice[i]][1]}</b></small></button><span class="chevron">⌄</span></div>`).join('') : '';
    return `<div class="bundle-wrap ${chosen ? 'chosen' : ''}">${badge}<div class="bundle-head" data-tier="${n}"><span class="radio ${chosen ? 'checked' : ''}"></span><span class="bundle-copy"><b>${n === 1 ? 'Buy 1' : n === 2 ? 'Buy 2, Get 1 Free Gift' : 'Buy 3, Get 3 Free Gifts'}</b><small>${n === 1 ? 'No free gifts included' : `Includes ${n === 2 ? 1 : 3} FREE Gift${n === 2 ? '' : 's'}`}</small></span></div>${chosen ? `<div class="bundle-details">${rows}</div>` : ''}</div>`;
  }).join('');
  list.querySelectorAll('.bundle-head').forEach(el => el.onclick = () => { selected = +el.dataset.tier; render(); });
  list.querySelectorAll('.scent-choice').forEach(el => el.onclick = () => openPicker(+el.dataset.jar));
  const gifts = document.querySelector('#giftbox');
  const giftData = [['$11.27', 'Store Credit', 'assets/gifts/credit.png'], ['$19.00', 'Mystery Gift', 'assets/gifts/mystery.png'], ['$4.90', 'FREE Shipping', 'assets/gifts/shipping.png']];
  const unlockedCount = selected === 3 ? 3 : selected === 2 ? 1 : 0;
  gifts.innerHTML = `<span class="gift-tab">♧ &nbsp; GIFTS UNLOCKED</span><div class="gift-list">${giftData.map(([value, label, img], i) => { const unlocked = i < unlockedCount; return `<div class="gift ${unlocked ? 'unlocked' : 'locked'}"><span>${unlocked ? `<img src="${img}" alt="${label}">` : '<b class="gift-lock">🔒</b>'}</span><b>${unlocked ? value : 'Locked'}<small>${unlocked ? label : ''}</small></b></div>${i < 2 ? '<i>＋</i>' : ''}`; }).join('')}</div><p>${selected === 3 ? 'All 3 gifts unlocked. Added to your cart free.' : selected === 2 ? 'Add 1 more jar to unlock the last 2 gifts.' : 'Add 2 jars to reveal your first gift.'}</p>`;
  const price = prices[selected], was = selected * 49, saving = was - price;
  document.querySelector('#subtotal').textContent = `$${price.toFixed(2)}`;
  document.querySelector('#was').textContent = `$${was.toFixed(2)}`;
  document.querySelector('#saving').textContent = `$${saving.toFixed(2)}`;
  const shipping = selected === 3 ? 0 : 4.90;
  document.querySelector('#shippingDisplay').textContent = shipping ? `Shipping: $${shipping.toFixed(2)}` : 'FREE SHIPPING UNLOCKED';
  document.querySelector('#shippingDisplay').classList.toggle('free', shipping === 0);
  document.querySelector('.delivery small').textContent = shipping ? `SHIPPING: $${shipping.toFixed(2)}` : 'FREE SHIPPING UNLOCKED ON THIS ORDER';
  document.querySelector('#add').innerHTML = `ADD TO CART<small>♧ &nbsp;30-Day Money-Back Guarantee</small>`;
  document.querySelector('.sticky-product small').textContent = `$${price.toFixed(2)}`;
  document.querySelector('#stickyAdd').textContent = 'ADD TO CART';
}
function openPicker(index) {
  pickerIndex = index;
  document.querySelector('#picker')?.remove();
  const modal = document.createElement('div');
  modal.id = 'picker';
  modal.innerHTML = `<div class="pickpanel"><div class="pickhead"><h3>Choose your scent</h3><button class="pickclose" aria-label="Close">×</button></div><div class="picklist">${scents.map((s, i) => `<button class="pickitem ${choice[pickerIndex] === i ? 'selected' : ''}" data-i="${i}"><img src="assets/bundle-image-clean.png" alt=""><span class="picktext"><b>${s[0]}${s[2] ? `<em class="scent-tag">${s[2]}</em>` : ''}</b><small>Smells like <strong>${s[1]}</strong></small></span><i>${choice[pickerIndex] === i ? '✓' : ''}</i></button>`).join('')}</div><div class="pickfooter"><button class="pickdone">DONE</button></div></div>`;
  document.body.append(modal);
  modal.onclick = event => {
    if (event.target === modal || event.target.closest('.pickclose')) { modal.remove(); render(); return; }
    const item = event.target.closest('.pickitem');
    if (item) { choice[pickerIndex] = +item.dataset.i; openPicker(pickerIndex); return; }
    if (event.target.closest('.pickdone')) { modal.remove(); render(); }
  };
}
function checkoutUrl() {
  const properties = {};
  for (let i = 0; i < selected; i++) properties[`Jar ${i + 1} scent`] = scents[choice[i]][0];
  if (selected === 2) properties['Bundle gift'] = '1 free gift';
  if (selected === 3) properties['Bundle gifts'] = '3 free gifts';
  const bytes = new TextEncoder().encode(JSON.stringify(properties));
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  const encodedProperties = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  const query = new URLSearchParams({ properties: encodedProperties, skip_shop_pay: 'true' });
  const checkout = new URL(`https://31amj0-yw.myshopify.com/cart/${bundleVariants[selected]}:1`);
  query.forEach((value, key) => checkout.searchParams.set(key, value));
  Object.entries(readSavedAttribution()).forEach(([key, value]) => {
    if (attributionPattern.test(key) && value) checkout.searchParams.set(key, value);
  });
  return checkout.toString();
}
function closeCartDrawer() {
  const drawer = document.querySelector('#cartDrawer');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
}
function openCartDrawer() {
  const drawer = document.querySelector('#cartDrawer');
  const original = selected * 49;
  const price = prices[selected];
  const giftCount = selected === 3 ? 2 : selected === 2 ? 1 : 0;
  const giftsValue = selected === 3 ? 30.27 : selected === 2 ? 11.27 : 0;
  const shipping = selected === 3 ? 0 : 4.90;
  const total = price + shipping;
  const scentNames = choice.slice(0, selected).map(index => scents[index][0]);
  const productTitle = scentNames[0] || 'Body Butter Bundle';
  const progress = selected === 1 ? 34 : selected === 2 ? 67 : 100;
  const giftRows = [
    giftCount >= 2 ? `<div class="cart-line cart-gift"><img src="assets/gifts/mystery.png" alt=""><div class="cart-line-copy"><span class="gift-tag">✿ GIFT</span><b>Mystery Gift</b><small>Free Mystery Gift applied</small></div><span class="cart-line-price"><s>$19.00</s><b>FREE</b></span></div>` : '',
    giftCount >= 1 ? `<div class="cart-line cart-gift"><img src="assets/gifts/credit.png" alt=""><div class="cart-line-copy"><span class="gift-tag">✿ GIFT</span><b>$15 Store Credit</b><small>Free Gift Card applied</small></div><span class="cart-line-price"><s>$11.27</s><b>FREE</b></span></div>` : ''
  ].join('');
  drawer.innerHTML = `<section class="cart-panel" role="dialog" aria-modal="true" aria-label="Your cart"><header class="cart-head"><h2>♧ &nbsp; Your cart <span>${selected + giftCount}</span></h2><button class="cart-close" aria-label="Close cart">×</button></header><div class="cart-promise">● &nbsp; Checkout now to keep your order</div><div class="shipping-progress ${shipping === 0 ? 'unlocked' : ''}"><b>${shipping === 0 ? '✓ &nbsp; FREE SHIPPING UNLOCKED' : `SHIPPING IS $${shipping.toFixed(2)}`}</b><div><i style="width:${progress}%"></i></div></div><div class="cart-lines">${giftRows}<div class="cart-line cart-product"><img src="assets/bundle-image-clean.png" alt=""><div class="cart-line-copy"><b>${productTitle}</b><small>${selected > 1 ? `${selected} jars · ` : ''}${scentNames.join(' · ')}</small><span class="cart-quantity"><button aria-label="Decrease quantity" disabled>−</button><b>1</b><button aria-label="Increase quantity" disabled>＋</button></span></div><button class="cart-remove" aria-label="Remove item">×</button><span class="cart-line-price"><s>$${(selected * 49).toFixed(2)}</s><b>$${price.toFixed(2)}</b></span></div></div><div class="cart-summary"><h3>Order summary</h3><div><span>Original price</span><b>$${(original + giftsValue).toFixed(2)}</b></div><div class="discount"><span>Discount</span><b>−$${(original - price).toFixed(2)}</b></div>${giftCount ? `<div class="discount"><span>♧ &nbsp;Free gifts (${giftCount})</span><b>−$${giftsValue.toFixed(2)}</b></div>` : ''}<div><span>Shipping</span><b class="${shipping === 0 ? 'green' : ''}">${shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</b></div><div class="cart-final"><span>Final price</span><b>$${total.toFixed(2)}</b></div><div class="cart-total"><span>Total <small>(${selected + giftCount} items)</small></span><b>$${total.toFixed(2)}</b></div></div><div class="cart-checkout-wrap"><button class="cart-checkout">♙ &nbsp; CHECKOUT SECURELY<small>♧ &nbsp;30-Day Money-Back Guarantee</small></button><div class="payment-marks">VISA　●●　MC　 AMEX　 DISCOVER　 Pay　 G Pay</div></div></section>`;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
  drawer.onclick = event => {
    if (event.target === drawer || event.target.closest('.cart-close')) closeCartDrawer();
    if (event.target.closest('.cart-checkout')) window.location.assign(checkoutUrl());
  };
}
function addToCart() {
  openCartDrawer();
}
document.querySelector('#add').onclick = addToCart;
document.querySelector('#stickyAdd').onclick = addToCart;
document.querySelector('#addFinal').onclick = () => { selected = 3; choice = [0, 1, 2]; render(); openCartDrawer(); };
document.querySelector('#openCart').onclick = openCartDrawer;
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCartDrawer(); });
document.querySelectorAll('.inert').forEach(button => button.onclick = event => event.preventDefault());
render();
setSlide(slide);



