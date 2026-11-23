/* ═══════════════════════════════════════════════════════════
   Ridwan Rattan — Animations & Interactions
   ═══════════════════════════════════════════════════════════ */

/* ── 1. Page transition overlay ────────────────────────────── */
(function initPageTransition() {
  const overlay = document.createElement("div");
  overlay.id = "page-transition";
  document.body.prepend(overlay);

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto") ||
      link.target === "_blank"
    ) return;

    e.preventDefault();
    overlay.classList.add("leaving");

    setTimeout(() => {
      window.location.href = href;
    }, 480);
  });

  window.addEventListener("pageshow", () => {
    overlay.classList.remove("leaving");
  });
})();

/* ── 2. Toast notification (replaces alert) ────────────────── */
function showToast(message, icon = "✓", duration = 3200) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ── 3. Sticky navbar shadow on scroll ─────────────────────── */
(function initStickyNav() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const handler = () => {
    header.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", handler, { passive: true });
  handler();
})();

/* ── 4. Scroll-reveal with Intersection Observer ───────────── */
(function initScrollReveal() {
  const selectors = [
    ".hero-copy",
    ".hero-image",
    ".trust-row div",
    ".intro-section > div",
    ".feature-card",
    ".product-card",
    ".quote-intro",
    ".quote-card",
    ".faq-list details",
    ".story-banner-inner > *",
    ".page-heading > *",
  ];

  selectors.forEach((sel, si) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (si === 1) {
        el.classList.add("reveal-right");
      } else if (si === 0) {
        el.classList.add("reveal-left");
      } else {
        el.classList.add("reveal");
      }

      const delayClass = ["delay-1", "delay-2", "delay-3", "delay-4", "delay-5"][i] || "delay-5";
      el.classList.add(delayClass);
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el) => {
    io.observe(el);
  });
})();

/* ── 5. Parallax hero image (subtle) ───────────────────────── */
(function initParallax() {
  const heroImg = document.querySelector(".hero-image");
  if (!heroImg) return;

  window.addEventListener("scroll", () => {
    const y = window.scrollY * 0.18;
    heroImg.style.transform = `translateY(${y}px)`;
  }, { passive: true });
})();

/* ── 6. Nav-quote badge pulse when cart changes ─────────────── */
function pulseCartBadge() {
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.classList.remove("pulse");
    void el.offsetWidth;
    el.classList.add("pulse");
  });
}

const products = {
  chair: { name: "Rattan Lounge Chair", price: 185 },
  basket: { name: "Market Basket", price: 38 },
  lamp: { name: "Woven Pendant Lamp", price: 72 },
  table: { name: "Round Side Table", price: 125 }
};

const shippingRates = {
  asia: { price: 95, days: "10–18 business days" },
  europe: { price: 180, days: "18–30 business days" },
  "north-america": { price: 210, days: "20–35 business days" },
  other: { price: 240, days: "Please ask us for an estimate" }
};

const demoUsdToIdrRate = 16000;

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("ridwanRattanCart")) || {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem("ridwanRattanCart", JSON.stringify(cart));
}

function formatMoney(amount) {
  const currencySelect = document.getElementById("currency");
  const currency = currencySelect ? currencySelect.value : "USD";
  const converted = currency === "IDR" ? amount * demoUsdToIdrRate : amount;

  return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2
  }).format(converted);
}

function updateCartCount() {
  const cart = getCart();
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  document.querySelectorAll("[data-cart-count]").forEach(element => {
    element.textContent = `(${count})`;
  });
}

function renderQuote() {
  const cartContainer = document.getElementById("cart-items");
  if (!cartContainer) return;

  const cart = getCart();
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  const destinationSelect = document.getElementById("destination");
  const destination = destinationSelect ? destinationSelect.value : "asia";

  if (!entries.length) {
    cartContainer.innerHTML =
      '<p class="empty-cart">Your quote is empty. Add a product to get started.</p>';

    document.getElementById("subtotal").textContent = formatMoney(0);
    document.getElementById("shipping").textContent = formatMoney(0);
    document.getElementById("total").textContent = formatMoney(0);
    document.getElementById("delivery-note").textContent =
      "Add products to see an indicative delivery timeframe.";

    return;
  }

  let subtotal = 0;

  cartContainer.innerHTML = entries.map(([id, quantity]) => {
    const product = products[id];
    if (!product) return "";

    subtotal += product.price * quantity;

    return `
      <div class="cart-item">
        <span class="cart-item-name">${product.name}</span>
        <span class="cart-item-price">${formatMoney(product.price * quantity)}</span>
        <span class="quantity">
          <button
            type="button"
            aria-label="Remove one ${product.name}"
            data-action="minus"
            data-id="${id}"
          >−</button>
          <strong>${quantity}</strong>
          <button
            type="button"
            aria-label="Add one ${product.name}"
            data-action="plus"
            data-id="${id}"
          >+</button>
        </span>
      </div>
    `;
  }).join("");

  const shipping = shippingRates[destination].price;

  document.getElementById("subtotal").textContent = formatMoney(subtotal);
  document.getElementById("shipping").textContent = formatMoney(shipping);
  document.getElementById("total").textContent = formatMoney(subtotal + shipping);
  document.getElementById("delivery-note").textContent =
    `Indicative delivery timeframe: ${shippingRates[destination].days}. Production time, customs clearance, and carrier schedules may affect delivery.`;
}

document.querySelectorAll(".add-to-quote").forEach(button => {
  button.addEventListener("click", () => {
    const cart = getCart();
    const id = button.dataset.product;

    cart[id] = (cart[id] || 0) + 1;
    saveCart(cart);
    updateCartCount();
    pulseCartBadge();

    button.textContent = "Added! ✓";
    button.classList.add("added");
    button.disabled = true;

    showToast(`<strong>${products[id]?.name}</strong> added to your quote`, "🛒");

    window.setTimeout(() => {
      button.textContent = "Add to quote";
      button.classList.remove("added");
      button.disabled = false;
    }, 1200);
  });
});

const cartItems = document.getElementById("cart-items");

if (cartItems) {
  cartItems.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const cart = getCart();
    const id = button.dataset.id;

    cart[id] = (cart[id] || 0) + (button.dataset.action === "plus" ? 1 : -1);

    if (cart[id] <= 0) {
      delete cart[id];
    }

    saveCart(cart);
    updateCartCount();
    renderQuote();
  });
}

document.getElementById("destination")?.addEventListener("change", renderQuote);
document.getElementById("currency")?.addEventListener("change", renderQuote);

document.getElementById("copy-quote")?.addEventListener("click", async () => {
  const cart = getCart();
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);

  if (!entries.length) {
    alert("Please add at least one product to your quote.");
    return;
  }

  const destinationSelect = document.getElementById("destination");
  const destination = destinationSelect.value;
  const shipping = shippingRates[destination].price;
  const subtotal = entries.reduce((sum, [id, quantity]) => {
    return sum + products[id].price * quantity;
  }, 0);

  const productLines = entries.map(([id, quantity]) => {
    return `- ${products[id].name} x ${quantity}`;
  }).join("\n");

  const message = [
    "Ridwan Rattan — Order Estimate",
    productLines,
    `Product subtotal: ${formatMoney(subtotal)}`,
    `Estimated shipping: ${formatMoney(shipping)}`,
    `Estimated total: ${formatMoney(subtotal + shipping)}`,
    `Destination: ${destinationSelect.options[destinationSelect.selectedIndex].text}`,
    `Indicative delivery: ${shippingRates[destination].days}`,
    "Please confirm the final price, shipping, and delivery schedule."
  ].join("\n");

  try {
    await navigator.clipboard.writeText(message);
    showToast("Quote copied! Paste it into an email or WhatsApp.", "📋", 4000);
  } catch {
    window.prompt("Copy your quote details:", message);
  }
});

updateCartCount();
renderQuote();

/* ── 7. Smooth image fade-in on load ────────────────────────── */
document.querySelectorAll("img").forEach(img => {
  if (img.complete) {
    img.classList.add("loaded");
  } else {
    img.addEventListener("load", () => img.classList.add("loaded"));
    img.addEventListener("error", () => img.classList.add("loaded"));
  }
});

/* ── 8. Animate grand total when value changes ──────────────── */
(function initTotalAnimation() {
  const totalEl = document.getElementById("total");
  if (!totalEl) return;

  const observer = new MutationObserver(() => {
    totalEl.classList.remove("updated");
    void totalEl.offsetWidth;
    totalEl.classList.add("updated");
  });

  observer.observe(totalEl, { childList: true, subtree: true });
})();

/* ── 9. Product Materials Modal (Penjelasan Bahan) ──────────── */
(function initMaterialModal() {
  const materialButtons = document.querySelectorAll(".material-btn");
  if (!materialButtons.length) return;

  const productMaterials = {
    chair: {
      title: "Rattan Lounge Chair",
      subtitle: "Materials & Craftsmanship",
      specs: [
        { label: "Main Frame", value: "Grade-A Indonesian Manau Rattan (28–32mm solid pole)" },
        { label: "Weaving", value: "Hand-split natural Kubu & Peel rattan core" },
        { label: "Finish", value: "Eco-friendly water-based matte clear lacquer (anti-fungal treated)" },
        { label: "Dimensions", value: "W 68cm × D 74cm × H 78cm (Seat height: 42cm)" },
        { label: "Care", value: "Indoor or covered patio only. Wipe with a dry or slightly damp cloth." }
      ]
    },
    basket: {
      title: "Market Basket",
      subtitle: "Materials & Craftsmanship",
      specs: [
        { label: "Body Material", value: "100% Natural Indonesian Pitrit (rattan core) & Lesio weave" },
        { label: "Handles", value: "Double-wrapped flexible rattan cane for heavy-duty grip" },
        { label: "Finish", value: "Unbleached natural sun-dried tone, steamed for durability" },
        { label: "Dimensions", value: "Diameter 40cm × Height 35cm (45cm including handles)" },
        { label: "Care", value: "Keep in a dry ventilated area. Avoid prolonged soaking in water." }
      ]
    },
    lamp: {
      title: "Woven Pendant Lamp",
      subtitle: "Materials & Craftsmanship",
      specs: [
        { label: "Shade Material", value: "Fine handwoven Jawit rattan strips on a powder-coated iron wire frame" },
        { label: "Fitting", value: "Standard E27 brass/black lamp holder (CE/UL compliant upon request)" },
        { label: "Finish", value: "Natural warm honey stain with protective clear sealer" },
        { label: "Dimensions", value: "Diameter 50cm × Height 45cm (1.5m adjustable fabric cord)" },
        { label: "Care", value: "Dust regularly with a soft brush. Recommended for LED bulbs max 40W." }
      ]
    },
    table: {
      title: "Round Side Table",
      subtitle: "Materials & Craftsmanship",
      specs: [
        { label: "Frame & Legs", value: "Bent solid Tohiti & Manau rattan poles with rattan binding" },
        { label: "Tabletop", value: "Kiln-dried solid teak wood veneer or tightly woven rattan mat" },
        { label: "Finish", value: "Natural satin polyurethane coating for spill resistance" },
        { label: "Dimensions", value: "Diameter 50cm × Height 52cm" },
        { label: "Care", value: "Use coasters for hot/cold drinks. Clean with a soft dry cloth." }
      ]
    }
  };

  const backdrop = document.createElement("div");
  backdrop.className = "material-modal-backdrop";
  backdrop.innerHTML = `
    <div class="material-modal" role="dialog" aria-modal="true" aria-labelledby="mat-modal-title">
      <div class="material-modal-header">
        <div>
          <p class="eyebrow" id="mat-modal-sub">Materials &amp; Craftsmanship</p>
          <h3 id="mat-modal-title">Product Name</h3>
        </div>
        <button type="button" class="material-modal-close" aria-label="Close modal">✕</button>
      </div>
      <div class="material-modal-body" id="mat-modal-body"></div>
      <div class="material-modal-footer">
        <button type="button" class="button material-modal-done">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const titleEl = backdrop.querySelector("#mat-modal-title");
  const subEl = backdrop.querySelector("#mat-modal-sub");
  const bodyEl = backdrop.querySelector("#mat-modal-body");

  function openModal(productId) {
    const data = productMaterials[productId];
    if (!data) return;

    titleEl.textContent = data.title;
    subEl.textContent = data.subtitle;
    bodyEl.innerHTML = data.specs.map(item => `
      <div class="material-spec-row">
        <strong>${item.label}</strong>
        <span>${item.value}</span>
      </div>
    `).join("");

    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  materialButtons.forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.dataset.material));
  });

  backdrop.querySelector(".material-modal-close").addEventListener("click", closeModal);
  backdrop.querySelector(".material-modal-done").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && backdrop.classList.contains("open")) closeModal();
  });
})();