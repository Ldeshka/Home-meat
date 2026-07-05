// ===== КОШИК =====
let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');

function saveCart() {
  sessionStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const el = document.getElementById('cartCount');
  if (!el) return;
  el.textContent = total % 1 === 0 ? total : total.toFixed(1);
  el.style.display = cart.length > 0 ? 'flex' : 'none';
}

function addToCart(btn) {
  const item  = btn.closest('.product-item');
  const id    = item.dataset.id;
  const name  = item.dataset.name;
  const price = parseFloat(item.dataset.price);
  const unit  = item.dataset.unit || 'кг';
  const step  = unit === 'кг' ? 0.5 : 1;

  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty = Math.round((existing.qty + step) * 10) / 10;
  } else {
    cart.push({ id, name, price, unit, qty: step });
  }

  saveCart();
  updateCartCount();
  showToast(`«${name}» додано до кошика`);

  btn.classList.add('added');
  btn.innerHTML = '<i class="fas fa-check"></i> Додано';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = '<i class="fas fa-plus"></i> В кошик';
  }, 1500);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastText').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== ЗАВАНТАЖЕННЯ КАТАЛОГУ З JSON =====
async function loadProducts() {
  try {
    const res  = await fetch('products.json');
    const data = await res.json();
    renderCatalog(data.groups);
  } catch (e) {
    document.getElementById('assortmentSection').innerHTML =
      '<p style="text-align:center;color:#e74c3c;padding:40px 0">Помилка завантаження товарів</p>';
    console.error('Не вдалося завантажити products.json', e);
  }
}

function renderCatalog(groups) {
  const section = document.getElementById('assortmentSection');
  if (!section) return;

  section.innerHTML = groups.map(group => `
    <div class="product-group">
      <h3 class="product-group-title">
        <i class="${group.icon}"></i>${group.title}
      </h3>
      <div class="product-list">
        ${group.products.map(p => `
          <div class="product-item"
               data-id="${p.id}"
               data-name="${p.name}"
               data-price="${p.price}"
               data-unit="${p.unit}">
            <div class="product-item-image">
              <img src="${p.image}" alt="${p.name}" loading="lazy">
            </div>
            <div class="product-item-info">
              <span class="product-name">${p.name}</span>
              <div class="product-item-right">
                <span class="product-price">${p.price} грн / ${p.unit}</span>
                <button class="add-to-cart-btn" onclick="addToCart(this)">
                  <i class="fas fa-plus"></i> В кошик
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ===== ІНІЦІАЛІЗАЦІЯ =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  loadProducts();
});
