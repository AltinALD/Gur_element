const products = [
  {
    id: 1,
    name: 'Midnight Lace Garter Set',
    color: 'Black',
    price: 89,
    image: 'images/p1.png',
    imageAlt: 'images/p1.1.png',
    badge: 'Bestseller',
    description: 'An intricate black lace bra with sheer mesh panels, paired with a high-waisted garter belt featuring gold-toned hardware. Includes matching lace thong and adjustable thigh straps for a complete seductive look.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 2,
    name: 'Passion Red Floral Set',
    color: 'Red',
    price: 95,
    image: 'images/p2.png',
    imageAlt: 'images/p2.2.png',
    badge: 'New',
    description: 'A stunning five-piece red lace collection featuring an underwire bra, high-waisted garter belt, thong, fingerless lace gloves, and satin thigh garters with gold ring hardware. Pure passion in every detail.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 3,
    name: 'Ivory Feather Collection',
    color: 'White',
    price: 110,
    image: 'images/p3.png',
    imageAlt: null,
    badge: null,
    description: 'Ethereal white lace lingerie with high-waisted panty, integrated garter straps with gold hardware, and triple-banded thigh straps. Paired with a luxurious white feather boa for an unforgettable entrance.',
    sizes: ['S', 'M', 'L']
  },
  {
    id: 4,
    name: 'Crimson Embroidered Set',
    color: 'Red',
    price: 99,
    image: 'images/p4.png',
    imageAlt: null,
    badge: 'Popular',
    description: 'Vibrant cherry-red mesh lingerie adorned with intricate floral embroidery. Features an underwire bra, high-waisted bottoms with decorative thigh straps, and matching elbow-length lace gloves.',
    sizes: ['S', 'M', 'L', 'XL']
  }
];

let cart = JSON.parse(localStorage.getItem('gk-cart')) || [];
let activeSwiper = null;
const cardSwipers = [];

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

class ProductSwiper {
  constructor(container, images, options = {}) {
    this.container = container;
    this.images = images;
    this.current = 0;
    this.interval = options.interval || 3500;
    this.timer = null;
    this.progressTimer = null;
    this.progress = 0;
    this.paused = false;

    this.track = $('.swiper-track', container);
    this.progressBar = $('.swiper-progress-bar', container);
    this.counter = $('.swiper-counter', container);
    this.dotsContainer = $('.swiper-dots', container);
    this.thumbs = $$('.gallery-thumb');

    this.buildSlides();
    this.buildDots();
    this.bindEvents();
    this.goTo(0);
    this.start();
  }

  buildSlides() {
    this.track.innerHTML = this.images.map((src, i) => `
      <div class="swiper-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
        <img src="${src}" alt="Product view ${i + 1}">
      </div>
    `).join('');
    this.slides = $$('.swiper-slide', this.track);
  }

  buildDots() {
    if (this.images.length <= 1) {
      this.dotsContainer.style.display = 'none';
      return;
    }
    this.dotsContainer.innerHTML = this.images.map((_, i) => `
      <button class="swiper-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>
    `).join('');
    this.dots = $$('.swiper-dot', this.dotsContainer);
  }

  bindEvents() {
    $('.swiper-prev', this.container)?.addEventListener('click', () => {
      this.prev();
      this.restart();
    });
    $('.swiper-next', this.container)?.addEventListener('click', () => {
      this.next();
      this.restart();
    });

    this.container.addEventListener('mouseenter', () => this.pause());
    this.container.addEventListener('mouseleave', () => this.resume());

    this.dotsContainer.addEventListener('click', (e) => {
      const dot = e.target.closest('.swiper-dot');
      if (dot) {
        this.goTo(parseInt(dot.dataset.index));
        this.restart();
      }
    });

    this.thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => {
        this.goTo(i);
        this.restart();
      });
    });
  }

  goTo(index) {
    this.current = index;
    this.slides.forEach((s, i) => s.classList.toggle('active', i === index));
    this.dots?.forEach((d, i) => d.classList.toggle('active', i === index));
    this.thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
    if (this.counter) {
      this.counter.textContent = `${index + 1} / ${this.images.length}`;
    }
    this.progress = 0;
    this.updateProgress();
  }

  next() {
    this.goTo((this.current + 1) % this.images.length);
  }

  prev() {
    this.goTo((this.current - 1 + this.images.length) % this.images.length);
  }

  start() {
    if (this.images.length <= 1) return;
    this.stop();
    this.timer = setInterval(() => this.next(), this.interval);
    this.progressTimer = setInterval(() => {
      if (!this.paused) {
        this.progress += 100 / (this.interval / 50);
        this.updateProgress();
      }
    }, 50);
  }

  stop() {
    clearInterval(this.timer);
    clearInterval(this.progressTimer);
    this.timer = null;
    this.progressTimer = null;
  }

  restart() {
    this.stop();
    this.progress = 0;
    this.updateProgress();
    this.start();
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  updateProgress() {
    if (this.progressBar) {
      this.progressBar.style.width = `${Math.min(this.progress, 100)}%`;
      if (this.progress >= 100) this.progress = 0;
    }
  }

  destroy() {
    this.stop();
  }
}

class CardSwiper {
  constructor(card, images) {
    this.card = card;
    this.images = images;
    this.current = 0;
    this.timer = null;
    this.wrap = $('.product-image-wrap', card);

    this.build();
    this.start();
  }

  build() {
    const existing = this.wrap.querySelectorAll('img, .card-swiper');
    existing.forEach(el => el.remove());

    const swiper = document.createElement('div');
    swiper.className = 'card-swiper';
    swiper.innerHTML = `
      ${this.images.map((src, i) => `
        <div class="card-swiper-slide ${i === 0 ? 'active' : ''}">
          <img src="${src}" alt="" loading="lazy">
        </div>
      `).join('')}
      <div class="card-swiper-dots">
        ${this.images.map((_, i) => `<span class="card-swiper-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
      </div>
    `;
    this.wrap.insertBefore(swiper, this.wrap.firstChild);
    this.slides = $$('.card-swiper-slide', swiper);
    this.dots = $$('.card-swiper-dot', swiper);

    this.card.addEventListener('mouseenter', () => this.stop());
    this.card.addEventListener('mouseleave', () => this.start());
  }

  goTo(index) {
    this.current = index;
    this.slides.forEach((s, i) => s.classList.toggle('active', i === index));
    this.dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  next() {
    this.goTo((this.current + 1) % this.images.length);
  }

  start() {
    if (this.images.length <= 1) return;
    this.stop();
    this.timer = setInterval(() => this.next(), 3000);
  }

  stop() {
    clearInterval(this.timer);
  }

  destroy() {
    this.stop();
  }
}

function saveCart() {
  localStorage.setItem('gk-cart', JSON.stringify(cart));
}

function formatPrice(amount) {
  return '€' + amount.toFixed(2);
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const el = $('#cartCount');
  el.textContent = count;
  el.classList.toggle('visible', count > 0);
}

function getProductImages(product) {
  const images = [product.image];
  if (product.imageAlt) images.push(product.imageAlt);
  return images;
}

function renderProducts() {
  cardSwipers.forEach(s => s.destroy());
  cardSwipers.length = 0;

  const grid = $('#productGrid');
  grid.innerHTML = products.map(p => {
    const images = getProductImages(p);
    const hasAlt = images.length > 1;

    return `
      <article class="product-card reveal" data-id="${p.id}">
        <div class="product-image-wrap">
          ${hasAlt ? '' : `<img class="primary" src="${p.image}" alt="${p.name}" loading="lazy">`}
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
          <div class="product-card-overlay">
            <span class="view-btn">View Details</span>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-color">${p.color}</p>
          <div class="product-footer">
            <span class="product-price">${formatPrice(p.price)}</span>
            <button class="quick-add" data-id="${p.id}">Quick Add</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  $$('.product-card').forEach(card => {
    const id = parseInt(card.dataset.id);
    const product = products.find(p => p.id === id);
    const images = getProductImages(product);
    if (images.length > 1) {
      cardSwipers.push(new CardSwiper(card, images));
    }
  });

  grid.addEventListener('click', (e) => {
    const quickAdd = e.target.closest('.quick-add');
    if (quickAdd) {
      e.stopPropagation();
      openModal(parseInt(quickAdd.dataset.id));
      return;
    }
    const card = e.target.closest('.product-card');
    if (card) openModal(parseInt(card.dataset.id));
  });

  initReveal();
}

function openModal(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  if (activeSwiper) {
    activeSwiper.destroy();
    activeSwiper = null;
  }

  const images = getProductImages(product);
  const hasMultiple = images.length > 1;

  $('#modalBody').innerHTML = `
    <div class="modal-product">
      <div class="modal-gallery">
        <div class="product-swiper" id="productSwiper">
          <div class="swiper-track"></div>
          ${hasMultiple ? `
            <button class="swiper-nav swiper-prev" aria-label="Previous">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button class="swiper-nav swiper-next" aria-label="Next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <div class="swiper-counter">1 / ${images.length}</div>
            <div class="swiper-dots"></div>
            <div class="swiper-progress"><div class="swiper-progress-bar"></div></div>
          ` : ''}
        </div>
        ${hasMultiple ? `
          <div class="gallery-thumbs">
            ${images.map((img, i) => `
              <img class="gallery-thumb ${i === 0 ? 'active' : ''}" src="${img}" alt="View ${i + 1}" data-index="${i}">
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="modal-details">
        <h2>${product.name}</h2>
        <p class="product-color">${product.color}</p>
        <p class="modal-price">${formatPrice(product.price)}</p>
        <p class="modal-desc">${product.description}</p>
        <div class="size-selector">
          <label>Select Size</label>
          <div class="size-options" id="sizeOptions">
            ${product.sizes.map((s, i) => `
              <button class="size-option ${i === 1 ? 'selected' : ''}" data-size="${s}">${s}</button>
            `).join('')}
          </div>
        </div>
        <button class="btn btn-primary btn-full" id="addToCartBtn" data-id="${product.id}">Add to Bag</button>
      </div>
    </div>
  `;

  activeSwiper = new ProductSwiper($('#productSwiper'), images);

  $$('.size-option').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.size-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  $('#addToCartBtn').addEventListener('click', () => {
    const size = $('.size-option.selected')?.dataset.size || product.sizes[0];
    addToCart(product.id, size);
    closeModal();
    openCart();
  });

  $('#productModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (activeSwiper) {
    activeSwiper.destroy();
    activeSwiper = null;
  }
  $('#productModal').classList.remove('open');
  document.body.style.overflow = '';
}

function addToCart(productId, size) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId && item.size === size);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      qty: 1
    });
  }

  saveCart();
  updateCartCount();
  renderCart();
  showToast(`${product.name} added to bag`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  renderCart();
}

function updateQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    removeFromCart(index);
  } else {
    saveCart();
    updateCartCount();
    renderCart();
  }
}

function renderCart() {
  const container = $('#cartItems');
  const footer = $('#cartFooter');

  if (cart.length === 0) {
    container.innerHTML = '<p class="cart-empty">Your bag is empty</p>';
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  $('#cartTotal').textContent = formatPrice(total);

  container.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">Size: ${item.size}</p>
        <p class="cart-item-price">${formatPrice(item.price * item.qty)}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" data-index="${i}" data-delta="-1">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-index="${i}" data-delta="1">+</button>
        </div>
        <button class="cart-item-remove" data-index="${i}">Remove</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      updateQty(parseInt(btn.dataset.index), parseInt(btn.dataset.delta));
    });
  });

  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.index)));
  });
}

function openCart() {
  $('#cartDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('#cartDrawer').classList.remove('open');
  document.body.style.overflow = '';
}

function initPreloader() {
  const preloader = $('#preloader');
  const progress = $('#preloaderProgress');
  const site = $('#site');
  let done = false;
  let value = 0;

  document.body.classList.add('loading');

  const tick = setInterval(() => {
    if (value < 88) {
      value += Math.random() * 12;
      progress.style.width = Math.min(value, 88) + '%';
    }
  }, 120);

  function finish() {
    if (done) return;
    done = true;
    clearInterval(tick);
    progress.style.width = '100%';

    setTimeout(() => {
      preloader.classList.add('hidden');
      site.classList.add('visible');
      document.body.classList.remove('loading');
    }, 350);
  }

  window.addEventListener('load', finish);
  setTimeout(finish, 3000);
}

function initHeader() {
  const header = $('#header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function initMobileNav() {
  const toggle = $('#menuToggle');
  const nav = $('#nav');

  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

function initEvents() {
  $('#cartBtn').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#cartBackdrop').addEventListener('click', closeCart);
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalBackdrop').addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeCart();
    }
    if ($('#productModal').classList.contains('open') && activeSwiper) {
      if (e.key === 'ArrowLeft') { activeSwiper.prev(); activeSwiper.restart(); }
      if (e.key === 'ArrowRight') { activeSwiper.next(); activeSwiper.restart(); }
    }
  });

  $('#checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const items = cart.map(i => `${i.name} (${i.size}) x${i.qty}`).join('\n');
    const subject = encodeURIComponent('Order — Lingerie By GK');
    const body = encodeURIComponent(
      `Hi, I'd like to place an order:\n\n${items}\n\nTotal: ${formatPrice(total)}\n\nName:\nAddress:\nPhone:`
    );
    window.open(`mailto:orders@lingeriebygk.com?subject=${subject}&body=${body}`, '_blank');
    showToast('Opening email to complete your order');
  });

  $('#contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const message = form.message.value;
    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.open(`mailto:orders@lingeriebygk.com?subject=${subject}&body=${body}`, '_blank');
    form.reset();
    showToast('Message sent! We\'ll get back to you soon.');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  renderProducts();
  renderCart();
  updateCartCount();
  initHeader();
  initMobileNav();
  initEvents();
  initReveal();
});
