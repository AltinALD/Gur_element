const IG_URL = "https://www.instagram.com/gur_element/";
const CART_KEY = "gur_element_bag_v1";

const CAT_LABEL = {
  rings: "Ring · Unaza",
  earrings: "Earrings · Vathë",
  necklaces: "Necklace · Varëse",
  brooches: "Brooch · Spilla"
};

const products = [
  {
    id: "heart",
    name: "The Heart",
    category: "necklaces",
    material: "Oxidized silver · garnet",
    price: 260,
    badge: "Signature",
    image: "images/heart.png",
    description: "An anatomical heart cast in silver, hung on a chain with two garnet drops. A one-of-a-kind studio piece."
  },
  {
    id: "swans",
    name: "The Swans",
    category: "earrings",
    material: "Mother of pearl · freshwater pearl · silver",
    price: 175,
    badge: null,
    image: "images/swans.png",
    description: "A pair of swans cut from dark mother of pearl, hung from fine silver chain with freshwater pearls and baroque drops."
  },
  {
    id: "poppy",
    name: "The Poppy",
    category: "necklaces",
    material: "Enamel · silver",
    price: 220,
    badge: "Studio",
    image: "images/poppy.png",
    description: "A poppy in enamel beside a cast silver seed pod. The same form can be worn at the throat on silk, or as this necklace."
  },
  {
    id: "stitch",
    name: "The Stitch",
    category: "brooches",
    material: "Silver · cotton thread",
    price: 150,
    badge: null,
    image: "images/stitch.png",
    description: "A small silver shirt, laced closed with red thread, with a heart set into the metal. Worn as a brooch."
  },
  {
    id: "eye",
    name: "The Eye",
    category: "rings",
    material: "Pearl · ruby · sterling silver",
    price: 95,
    badge: "New",
    image: "images/pearl-rings.png",
    description: "A pearl held in a silver cup, centered with a ruby. Made to your size. Each stone sits a little differently.",
    sizes: ["52", "54", "56", "58", "60"]
  },
  {
    id: "sea",
    name: "The Sea",
    category: "earrings",
    material: "Larimar · brushed silver",
    price: 130,
    badge: null,
    image: "images/larimar.png",
    description: "A raw larimar drop under a brushed silver bar. The blue varies with the stone. Pairs are made to order."
  },
  {
    id: "spiral",
    name: "The Spiral",
    category: "earrings",
    material: "Shell · coral · pearl · tourmaline · silver",
    price: 190,
    badge: null,
    image: "images/spiral.png",
    description: "A shell spiral with a small cast heart, hung with coral, a pearl bar and a dark tourmaline. Made as a pair."
  },
  {
    id: "stones",
    name: "Stone Study",
    category: "rings",
    material: "Turquoise · labradorite · silver",
    price: 85,
    badge: null,
    image: "images/stone-rings.png",
    description: "A family of silver rings set with turquoise and labradorite. Tell the studio your size — the stone changes with each ring.",
    sizes: ["52", "54", "56", "58", "60"]
  }
];

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

let activeProduct = null;
let selectedSize = null;
let loaderTimer = null;

function formatPrice(n) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(n);
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

function cartTotal(items = getCart()) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function showToast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("is-on");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("is-on"), 2600);
}

function enquiryText(items = getCart()) {
  const lines = items.map((i) => {
    const size = i.size ? ` · size ${i.size}` : "";
    return `• ${i.name}${size} — ${formatPrice(i.price)}`;
  });
  return `Hello Gur Element,\nI would like to enquire about:\n\n${lines.join("\n")}\n\nTotal: ${formatPrice(cartTotal(items))}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function renderProducts() {
  const grid = $("#productGrid");
  if (!grid) return;

  const counts = { all: products.length };
  products.forEach((p) => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });
  $$(".filter").forEach((btn) => {
    const key = btn.dataset.filter;
    const n = counts[key] || 0;
    const label = btn.dataset.label || btn.textContent.trim();
    btn.dataset.label = label;
    btn.textContent = `${label} ${n}`;
  });

  const lead = $("#collectionLead");
  if (lead) {
    lead.textContent = `${products.length} pieces in silver and stone. Studio prices in euro — each work is made by hand.`;
  }

  grid.innerHTML = products.map((p) => `
    <article class="product-card" data-id="${p.id}" data-cat="${p.category}" tabindex="0" role="button" aria-label="${p.name}, ${formatPrice(p.price)}">
      <div class="product-media">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
      </div>
      <div class="product-info">
        <p class="product-cat">${CAT_LABEL[p.category]}</p>
        <h3>${p.name}</h3>
        <p class="product-material">${p.material}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(p.price)}</span>
          <span class="product-view">View</span>
        </div>
      </div>
    </article>
  `).join("");

  $$(".product-card", grid).forEach((card) => {
    const open = () => openProduct(card.dataset.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  revealCards();
}

function revealCards() {
  const cards = $$(".product-card");
  if (!("IntersectionObserver" in window)) {
    cards.forEach((c) => c.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  cards.forEach((c) => {
    if (!c.hidden) io.observe(c);
  });
}

function applyFilter(key) {
  let shown = 0;
  $$(".product-card").forEach((card) => {
    const match = key === "all" || card.dataset.cat === key;
    card.hidden = !match;
    if (match) {
      shown += 1;
      card.classList.add("is-in");
    }
  });
  const empty = $("#gridEmpty");
  if (empty) empty.hidden = shown > 0;
  $$(".filter").forEach((btn) => {
    const on = btn.dataset.filter === key;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-selected", String(on));
  });
}

function openProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  activeProduct = p;
  selectedSize = p.sizes ? p.sizes[2] || p.sizes[0] : null;

  const img = $("#modalImage");
  img.src = p.image;
  img.alt = p.name;
  $("#modalCat").textContent = CAT_LABEL[p.category];
  $("#modalTitle").textContent = p.name;
  $("#modalDesc").textContent = p.description;
  $("#modalPrice").textContent = formatPrice(p.price);

  const block = $("#sizeBlock");
  const sizeRow = $("#sizeRow");
  if (p.sizes) {
    block.hidden = false;
    sizeRow.innerHTML = p.sizes.map((s) =>
      `<button type="button" class="size-btn${s === selectedSize ? " is-active" : ""}" data-size="${s}">${s}</button>`
    ).join("");
    $$(".size-btn", sizeRow).forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedSize = btn.dataset.size;
        $$(".size-btn", sizeRow).forEach((b) => b.classList.toggle("is-active", b === btn));
      });
    });
  } else {
    block.hidden = true;
    sizeRow.innerHTML = "";
  }

  $("#igPieceBtn").href = IG_URL;

  const modal = $("#productModal");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  $(".modal-close", modal)?.focus();
}

function closeModal() {
  const modal = $("#productModal");
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  activeProduct = null;
  if ($("#cartDrawer").hidden) document.body.classList.remove("modal-open");
}

function addToCart() {
  if (!activeProduct) return;
  const items = getCart();
  const key = activeProduct.sizes ? `${activeProduct.id}-${selectedSize}` : activeProduct.id;
  if (items.some((i) => i.key === key)) {
    showToast("This piece is already in your bag");
    return;
  }
  items.push({
    key,
    id: activeProduct.id,
    name: activeProduct.name,
    size: selectedSize,
    price: activeProduct.price,
    image: activeProduct.image,
    qty: 1
  });
  saveCart(items);
  showToast("Added to your bag");
}

function updateCartUI() {
  const items = getCart();
  const countEl = $("#cartCount");
  if (countEl) {
    countEl.textContent = String(items.length);
    countEl.classList.toggle("is-on", items.length > 0);
  }

  const container = $("#cartItems");
  const footer = $("#cartFooter");
  if (!container || !footer) return;

  if (!items.length) {
    container.innerHTML = '<p class="cart-empty">Your bag is empty.</p>';
    footer.hidden = true;
    return;
  }

  footer.hidden = false;
  container.innerHTML = items.map((item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="">
      <div>
        <h4>${item.name}</h4>
        <p>${item.size ? `Size ${item.size} · ` : ""}${formatPrice(item.price)}</p>
      </div>
      <button type="button" class="cart-item-remove" data-remove="${item.key}" aria-label="Remove ${item.name}">&times;</button>
    </div>
  `).join("");

  $("#cartTotal").textContent = formatPrice(cartTotal(items));

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
  const drawer = $("#cartDrawer");
  if (!drawer || drawer.hidden) return;
  drawer.hidden = true;
  if ($("#productModal").hidden) document.body.classList.remove("modal-open");
}

async function enquireFromBag() {
  const items = getCart();
  if (!items.length) return;
  const copied = await copyText(enquiryText(items));
  showToast(copied ? "Enquiry copied — opening Instagram" : "Opening Instagram");
  window.open(IG_URL, "_blank", "noopener");
}

function initHeader() {
  const header = $("#header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $("#menuToggle");
  const mobileNav = $("#mobileNav");

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.hidden = !open;
    header.classList.toggle("is-menu-open", open);
    const overlay = open || !$("#productModal").hidden || !$("#cartDrawer").hidden;
    document.body.classList.toggle("modal-open", overlay);
  };

  toggle?.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  $$("a", mobileNav).forEach((a) => {
    a.addEventListener("click", () => setMenu(false));
  });
}

function finishLoader() {
  const loader = $("#loader");
  if (!loader || loader.classList.contains("is-leave")) return;
  clearTimeout(loaderTimer);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    loader.hidden = true;
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    return;
  }
  loader.classList.add("is-leave");
  document.body.classList.add("is-ready");
  setTimeout(() => {
    loader.hidden = true;
    document.body.classList.remove("is-loading");
  }, 900);
}

function initLoader() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    finishLoader();
    return;
  }
  loaderTimer = setTimeout(finishLoader, 2300);
  $("#loader")?.addEventListener("click", finishLoader);
}

function init() {
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  initLoader();
  renderProducts();
  updateCartUI();
  initHeader();

  $$(".filter").forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
  });

  $("#cartBtn")?.addEventListener("click", () => {
    const toggle = $("#menuToggle");
    if (toggle && toggle.getAttribute("aria-expanded") === "true") toggle.click();
    openCart();
  });
  $("#addToCartBtn")?.addEventListener("click", addToCart);
  $("#checkoutIg")?.addEventListener("click", enquireFromBag);

  $("#igPieceBtn")?.addEventListener("click", async () => {
    if (!activeProduct) return;
    const size = selectedSize ? ` in size ${selectedSize}` : "";
    const note = `Hello Gur Element, I would like to ask about ${activeProduct.name}${size}.`;
    const copied = await copyText(note);
    showToast(copied ? "Note copied — paste it on Instagram" : "Opening Instagram");
  });

  $$("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  $$("[data-close-cart]").forEach((el) => el.addEventListener("click", closeCart));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const toggle = $("#menuToggle");
      if (toggle && toggle.getAttribute("aria-expanded") === "true") {
        toggle.click();
      }
      closeModal();
      closeCart();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
