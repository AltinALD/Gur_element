const WA_NUMBER = "38971643726";
const CART_KEY = "maya_cart_v1";

const products = [
  {
    id: 1,
    name: "Бордо фустан со чипка",
    color: "Бордо / вино",
    price: 1599,
    badge: "Ново",
    image: "images/dress-1.png",
    description: "Елегантен долг фустан со цветна чипка и детаљ на колкот. Идеален за вечерни излегувања.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 2,
    name: "Светлосин фустан со набори",
    color: "Светлосина",
    price: 1499,
    badge: null,
    image: "images/dress-2.png",
    description: "Модерен фустан со висок врат и вертикални набори. Чист силует за свечени пригоди.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 3,
    name: "Кафеав фустан со точки",
    color: "Кафеава со бели точки",
    price: 1399,
    badge: null,
    image: "images/dress-3.png",
    description: "Ретро макси фустан со точки, квадратен изрез и полна здолниште. Класичен Maya стил.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 4,
    name: "Цветен макси фустан",
    color: "Цветен принт",
    price: 1699,
    badge: "Популарен",
    image: "images/dress-4.png",
    description: "Долг халтер фустан со цветен дезен. Лесен крој со прорез — за лето и прослави.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 5,
    name: "Жолт фустан со точки",
    color: "Жолта со бели точки",
    price: 1299,
    badge: null,
    image: "images/dress-5.png",
    description: "Винтиџ летна естетика — жолт фустан со точки, полна здолниште и светол изглед.",
    sizes: ["S", "M", "L", "XL"]
  }
];

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

let activeProduct = null;
let selectedSize = "M";

function formatPrice(n) {
  return new Intl.NumberFormat("mk-MK").format(n) + " МКД";
}

function waLink(text) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartUI();
}

function cartCount(items = getCart()) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

function cartTotal(items = getCart()) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function showToast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("is-on");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("is-on"), 2200);
}

function renderProducts() {
  const grid = $("#productGrid");
  if (!grid) return;

  grid.innerHTML = products.map((p, i) => `
    <article class="product-card" data-id="${p.id}" style="transition-delay:${i * 80}ms">
      <div class="product-media">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="product-color">${p.color}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(p.price)}</span>
          <span class="product-view">Детали →</span>
        </div>
      </div>
    </article>
  `).join("");

  $$(".product-card", grid).forEach((card) => {
    card.addEventListener("click", () => openProduct(Number(card.dataset.id)));
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  $$(".product-card", grid).forEach((c) => io.observe(c));
}

function openProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  activeProduct = p;
  selectedSize = p.sizes.includes("M") ? "M" : p.sizes[0];

  $("#modalImage").src = p.image;
  $("#modalImage").alt = p.name;
  $("#modalTitle").textContent = p.name;
  $("#modalDesc").textContent = p.description;
  $("#modalPrice").textContent = formatPrice(p.price);

  const sizeRow = $("#sizeRow");
  sizeRow.innerHTML = p.sizes.map((s) =>
    `<button type="button" class="size-btn${s === selectedSize ? " is-active" : ""}" data-size="${s}">${s}</button>`
  ).join("");

  $$(".size-btn", sizeRow).forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedSize = btn.dataset.size;
      $$(".size-btn", sizeRow).forEach((b) => b.classList.toggle("is-active", b === btn));
      updateModalWa();
    });
  });

  updateModalWa();
  const modal = $("#productModal");
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function updateModalWa() {
  if (!activeProduct) return;
  const text = `Здраво! Сакам да го нарачам:\n• ${activeProduct.name}\n• Големина: ${selectedSize}\n• Цена: ${formatPrice(activeProduct.price)}`;
  $("#waOrderBtn").href = waLink(text);
}

function closeModal() {
  $("#productModal").hidden = true;
  document.body.classList.remove("modal-open");
  activeProduct = null;
}

function addToCart() {
  if (!activeProduct) return;
  const items = getCart();
  const key = `${activeProduct.id}-${selectedSize}`;
  const existing = items.find((i) => i.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    items.push({
      key,
      id: activeProduct.id,
      name: activeProduct.name,
      size: selectedSize,
      price: activeProduct.price,
      image: activeProduct.image,
      qty: 1
    });
  }
  saveCart(items);
  showToast("Додадено во кошничка");
}

function updateCartUI() {
  const items = getCart();
  const count = cartCount(items);
  const countEl = $("#cartCount");
  if (countEl) {
    countEl.textContent = String(count);
    countEl.classList.toggle("is-on", count > 0);
  }

  const container = $("#cartItems");
  const footer = $("#cartFooter");
  if (!container || !footer) return;

  if (!items.length) {
    container.innerHTML = '<p class="cart-empty">Кошничката е празна.</p>';
    footer.style.display = "none";
    return;
  }

  footer.style.display = "block";
  container.innerHTML = items.map((item) => `
    <div class="cart-item" data-key="${item.key}">
      <img src="${item.image}" alt="">
      <div>
        <h4>${item.name}</h4>
        <p>Големина ${item.size} · ${item.qty}× ${formatPrice(item.price)}</p>
      </div>
      <button type="button" class="cart-item-remove" data-remove="${item.key}" aria-label="Отстрани">&times;</button>
    </div>
  `).join("");

  $("#cartTotal").textContent = formatPrice(cartTotal(items));

  const lines = items.map((i) => `• ${i.name} (${i.size}) × ${i.qty} — ${formatPrice(i.price * i.qty)}`);
  const msg = `Здраво! Сакам да нарачам од Maya Online:\n\n${lines.join("\n")}\n\nВкупно: ${formatPrice(cartTotal(items))}`;
  $("#checkoutWa").href = waLink(msg);

  $$("[data-remove]", container).forEach((btn) => {
    btn.addEventListener("click", () => {
      saveCart(getCart().filter((i) => i.key !== btn.dataset.remove));
    });
  });
}

function openCart() {
  $("#cartDrawer").hidden = false;
  document.body.classList.add("modal-open");
  updateCartUI();
}

function closeCart() {
  $("#cartDrawer").hidden = true;
  if ($("#productModal").hidden) document.body.classList.remove("modal-open");
}

function initHeader() {
  const header = $("#header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $("#menuToggle");
  const mobileNav = $("#mobileNav");
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    mobileNav.hidden = open;
  });

  $$("a", mobileNav).forEach((a) => {
    a.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      mobileNav.hidden = true;
    });
  });
}

function init() {
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  renderProducts();
  updateCartUI();
  initHeader();

  $("#cartBtn")?.addEventListener("click", openCart);
  $("#addToCartBtn")?.addEventListener("click", addToCart);

  $$("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  $$("[data-close-cart]").forEach((el) => el.addEventListener("click", closeCart));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeCart();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
