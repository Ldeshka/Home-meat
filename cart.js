// ===== НАЛАШТУВАННЯ =====
const VIBER_PHONE = '380689187356'; // номер без + і пробілів

// ===== КОШИК =====
let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');

function saveCart() {
  sessionStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
  const list     = document.getElementById('cartItemsList');
  const emptyEl  = document.getElementById('cartEmpty');
  const layoutEl = document.getElementById('cartLayout');
  const countEl  = document.getElementById('cartCount');

  if (cart.length === 0) {
    layoutEl.style.display = 'none';
    emptyEl.style.display  = 'block';
    countEl.style.display  = 'none';
    return;
  }

  layoutEl.style.display = 'grid';
  emptyEl.style.display  = 'none';

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  countEl.textContent   = totalQty % 1 === 0 ? totalQty : totalQty.toFixed(1);
  countEl.style.display = 'flex';

  list.innerHTML = cart.map((item, idx) => {
    const subtotal   = Math.round(item.price * item.qty);
    const qtyDisplay = item.qty % 1 === 0 ? item.qty : item.qty.toFixed(1);
    const step       = item.unit === 'кг' ? 0.5 : 1;
    return `
      <div class="cart-item-row">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price-unit">${item.price} грн / ${item.unit}</div>
        </div>
        <div class="qty-stepper">
          <button class="qty-btn" onclick="changeQty(${idx}, -${step})">
            <i class="fas fa-minus"></i>
          </button>
          <span class="qty-value">${qtyDisplay} ${item.unit}</span>
          <button class="qty-btn" onclick="changeQty(${idx}, ${step})">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="cart-item-subtotal">
          ${subtotal} грн
          <small>${item.price} × ${qtyDisplay}</small>
        </div>
        <button class="remove-btn" onclick="removeItem(${idx})" title="Видалити">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>`;
  }).join('');

  updateSummary();
}

function changeQty(idx, delta) {
  cart[idx].qty = Math.round((cart[idx].qty + delta) * 10) / 10;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function removeItem(idx) {
  cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function updateSummary() {
  const totalWeight = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice  = cart.reduce((s, i) => s + i.price * i.qty, 0);

  document.getElementById('summaryItems').textContent =
    cart.length + ' поз.';
  document.getElementById('summaryWeight').textContent =
    (totalWeight % 1 === 0 ? totalWeight : totalWeight.toFixed(1)) + ' кг / шт';
  document.getElementById('summaryTotal').textContent =
    Math.round(totalPrice) + ' грн';
}

// ===== ФОРМУВАННЯ ПОВІДОМЛЕННЯ ДЛЯ VIBER =====
function buildMessage(name, phone, delivery, comment) {
  const deliveryLabels = {
    pickup: 'Самовивіз',
    nova:   'Нова Пошта',
    ukr:    'Укрпошта',
  };

  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const lines = [
    '🛒 Нове замовлення',
    '',
    `👤 Ім\'я: ${name}`,
    `📞 Телефон: ${phone}`,
    `🚚 Доставка: ${deliveryLabels[delivery] || delivery}`,
  ];

  if (comment) lines.push(`💬 Коментар: ${comment}`);

  lines.push('', '📦 Замовлення:');

  cart.forEach(item => {
    const qtyDisplay = item.qty % 1 === 0 ? item.qty : item.qty.toFixed(1);
    const subtotal   = Math.round(item.price * item.qty);
    lines.push(`• ${item.name} — ${qtyDisplay} ${item.unit} × ${item.price} грн = ${subtotal} грн`);
  });

  lines.push('', `💰 Сума: ${Math.round(totalPrice)} грн`);

  return lines.join('\n');
}

// ===== ВІДПРАВКА ЧЕРЕЗ VIBER =====
function submitOrder() {
  const nameEl     = document.getElementById('fieldName');
  const phoneEl    = document.getElementById('fieldPhone');
  const deliveryEl = document.getElementById('fieldDelivery');
  const commentEl  = document.getElementById('fieldComment');

  nameEl.style.borderColor  = '';
  phoneEl.style.borderColor = '';

  if (!nameEl.value.trim()) {
    nameEl.style.borderColor = '#e74c3c';
    nameEl.focus();
    return;
  }
  if (!phoneEl.value.trim()) {
    phoneEl.style.borderColor = '#e74c3c';
    phoneEl.focus();
    return;
  }

  const message    = buildMessage(
    nameEl.value.trim(),
    phoneEl.value.trim(),
    deliveryEl.value,
    commentEl.value.trim()
  );

  const encodedMsg = encodeURIComponent(message);
  const viberUrl   = `viber://chat?number=%2B${VIBER_PHONE}&draft=${encodedMsg}`;

  // Очищаємо кошик і показуємо екран успіху
  sessionStorage.removeItem('cart');
  cart = [];
  document.getElementById('cartCount').style.display        = 'none';
  document.getElementById('orderFormContent').style.display = 'none';
  document.getElementById('orderSuccess').style.display     = 'block';

  // Відкриваємо Viber з готовим повідомленням
  window.location.href = viberUrl;
}

// ===== ІНІЦІАЛІЗАЦІЯ =====
document.addEventListener('DOMContentLoaded', renderCart);
