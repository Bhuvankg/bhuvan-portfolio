/**
 * PUTHARI RESTAURANT — Shopping Cart & Online Ordering Engine
 * Features:
 * - LocalStorage persistence across all pages
 * - Quantity manipulation (+ / - / remove)
 * - Subtotal, packaging fee, and grand total calculations
 * - Multi-order mode (Dine-in / Takeaway / Delivery)
 * - Demo mode compliance & WhatsApp order text builder
 * - Backend /api/orders integration fallback
 */

class PuthariCart {
  constructor() {
    this.storageKey = 'puthari_cart_items_v1';
    this.orderTypeKey = 'puthari_order_type_v1';
    this.items = this.loadCart();
    this.orderType = localStorage.getItem(this.orderTypeKey) || 'dinein'; // 'dinein' | 'takeaway' | 'delivery'
    this.packagingFee = 30; // ₹30 for takeaway & delivery

    this.init();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not load cart from localStorage:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      localStorage.setItem(this.orderTypeKey, this.orderType);
    } catch (e) {
      console.warn('Could not save cart to localStorage:', e);
    }
    this.updateUI();
  }

  addItem(dish, quantity = 1) {
    const existing = this.items.find(item => item.id === dish.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        isVeg: dish.isVeg,
        quantity: quantity
      });
    }
    this.saveCart();
    this.showToast(`Added ${dish.name} to cart`);
  }

  updateQuantity(id, delta) {
    const item = this.items.find(item => item.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(id);
    } else {
      this.saveCart();
    }
  }

  removeItem(id) {
    const item = this.items.find(i => i.id === id);
    const name = item ? item.name : 'Item';
    this.items = this.items.filter(item => item.id !== id);
    this.saveCart();
    this.showToast(`Removed ${name} from cart`);
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  setOrderType(type) {
    this.orderType = type;
    this.saveCart();
  }

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getFee() {
    if (this.orderType === 'dinein' || this.items.length === 0) {
      return 0;
    }
    return this.packagingFee;
  }

  getGrandTotal() {
    return this.getSubtotal() + this.getFee();
  }

  getItemQuantity(id) {
    const item = this.items.find(i => i.id === id);
    return item ? item.quantity : 0;
  }

  init() {
    this.setupEventListeners();
    this.updateUI();
  }

  setupEventListeners() {
    // Open cart drawer triggers
    document.querySelectorAll('[data-action="open-cart"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openCartDrawer();
      });
    });

    // Close cart drawer triggers
    document.querySelectorAll('[data-action="close-cart"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeCartDrawer();
      });
    });

    // Overlay click to close
    const overlay = document.getElementById('cartDrawerOverlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.closeCartDrawer());
    }

    // Checkout modal open trigger
    const checkoutBtn = document.getElementById('btnProceedCheckout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.items.length === 0) {
          this.showToast('Your cart is empty. Add dishes to proceed!');
          return;
        }
        this.closeCartDrawer();
        this.openCheckoutModal();
      });
    }

    // Checkout modal close trigger
    const closeCheckoutBtn = document.getElementById('btnCloseCheckout');
    if (closeCheckoutBtn) {
      closeCheckoutBtn.addEventListener('click', () => {
        this.closeCheckoutModal();
      });
    }

    // Order type buttons inside drawer
    document.querySelectorAll('.order-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        this.setOrderType(type);
      });
    });

    // Checkout Form Submission
    const checkoutForm = document.getElementById('orderCheckoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleOrderSubmission(checkoutForm);
      });
    }
  }

  openCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      modal.classList.add('open');
      this.populateCheckoutSummary();
      document.body.style.overflow = 'hidden';
    }
  }

  closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  updateUI() {
    const count = this.getTotalCount();
    const subtotal = this.getSubtotal();
    const fee = this.getFee();
    const total = this.getGrandTotal();

    // Update all badge counts
    document.querySelectorAll('.cart-badge-count').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });

    // Update drawer item list
    const container = document.getElementById('cartItemsContainer');
    const emptyState = document.getElementById('cartEmptyState');
    const footer = document.getElementById('cartDrawerFooter');

    if (container) {
      if (this.items.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        if (footer) footer.style.display = 'none';
      } else {
        if (emptyState) emptyState.style.display = 'none';
        if (footer) footer.style.display = 'flex';

        container.innerHTML = this.items.map(item => `
          <div class="cart-item-card" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80'">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}</div>
            </div>
            <div class="cart-item-actions">
              <button class="cart-qty-btn" onclick="window.puthariCart.updateQuantity('${item.id}', -1)">-</button>
              <span class="cart-qty-text">${item.quantity}</span>
              <button class="cart-qty-btn" onclick="window.puthariCart.updateQuantity('${item.id}', 1)">+</button>
              <button class="cart-item-remove-btn" title="Remove" onclick="window.puthariCart.removeItem('${item.id}')">✕</button>
            </div>
          </div>
        `).join('');
      }
    }

    // Update order type buttons active state
    document.querySelectorAll('.order-type-btn').forEach(btn => {
      const type = btn.getAttribute('data-type');
      if (type === this.orderType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update prices in drawer footer
    const subtotalEl = document.getElementById('cartSubtotalAmount');
    const feeEl = document.getElementById('cartFeeAmount');
    const totalEl = document.getElementById('cartGrandTotalAmount');
    const feeRowEl = document.getElementById('cartFeeRow');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (feeEl) feeEl.textContent = `₹${fee}`;
    if (totalEl) totalEl.textContent = `₹${total}`;
    if (feeRowEl) {
      feeRowEl.style.display = (this.orderType === 'dinein' || count === 0) ? 'none' : 'flex';
    }

    // Refresh menu cards on page if menu renderer exists
    if (typeof window.refreshCardButtons === 'function') {
      window.refreshCardButtons();
    }
  }

  populateCheckoutSummary() {
    const listEl = document.getElementById('checkoutItemsReview');
    const totalEl = document.getElementById('checkoutTotalDisplay');
    const typeNotice = document.getElementById('checkoutOrderTypeNotice');

    if (listEl) {
      listEl.innerHTML = this.items.map(item => `
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <span>${item.name} <strong>× ${item.quantity}</strong></span>
          <span style="color:var(--color-gold-light)">₹${item.price * item.quantity}</span>
        </div>
      `).join('');
    }

    if (totalEl) {
      totalEl.textContent = `₹${this.getGrandTotal()}`;
    }

    if (typeNotice) {
      const typeLabels = {
        'dinein': 'Dine-In (At Kampalapura restaurant)',
        'takeaway': 'Takeaway / Drive-Through Pickup',
        'delivery': 'No-Contact Local Delivery'
      };
      typeNotice.textContent = typeLabels[this.orderType] || this.orderType;
    }
  }

  async handleOrderSubmission(form) {
    const formData = new FormData(form);
    const customerName = formData.get('customerName');
    const customerPhone = formData.get('customerPhone');
    const notes = formData.get('orderNotes') || 'None';
    const locationDetail = formData.get('locationDetail') || (this.orderType === 'dinein' ? 'Table at Restaurant' : 'Kampalapura');

    if (!customerName || !customerPhone) {
      this.showToast('Please provide your name and phone number');
      return;
    }

    const orderPayload = {
      orderId: 'PUTHARI-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString(),
      customerName,
      customerPhone,
      orderType: this.orderType,
      locationDetail,
      notes,
      items: this.items,
      subtotal: this.getSubtotal(),
      fee: this.getFee(),
      grandTotal: this.getGrandTotal(),
      isDemo: true
    };

    // Try posting to local Node.js backend if reachable
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      }).catch(() => {});
    } catch (e) {}

    // Show Order Confirmation Card
    this.showConfirmationView(orderPayload);
  }

  showConfirmationView(order) {
    const modalBody = document.querySelector('.checkout-modal-body');
    if (!modalBody) return;

    // Create WhatsApp text message
    let waText = `*New Order Request — PUTHARI RESTAURANT*\n`;
    waText += `*Order ID:* ${order.orderId}\n`;
    waText += `*Customer:* ${order.customerName} (${order.customerPhone})\n`;
    waText += `*Dining Option:* ${order.orderType.toUpperCase()} (${order.locationDetail})\n`;
    waText += `\n*Items:*\n`;
    order.items.forEach(i => {
      waText += `• ${i.name} × ${i.quantity} = ₹${i.price * i.quantity}\n`;
    });
    if (order.fee > 0) {
      waText += `• Packaging/Delivery: ₹${order.fee}\n`;
    }
    waText += `\n*Total Amount:* ₹${order.grandTotal}\n`;
    if (order.notes && order.notes !== 'None') {
      waText += `*Special Notes:* ${order.notes}\n`;
    }
    waText += `\n_(Placed via Puthari Restaurant Website)_`;

    const encodedWa = encodeURIComponent(waText);
    const waUrl = `https://wa.me/?text=${encodedWa}`;

    modalBody.innerHTML = `
      <div style="text-align:center; padding: 10px 0;">
        <div style="font-size:3rem; color:var(--color-gold); margin-bottom:12px;">✓</div>
        <h3 style="font-family:var(--font-serif); font-size:1.6rem; color:#FFFFFF; margin-bottom:6px;">Order Request Created</h3>
        <p style="font-size:0.85rem; color:var(--color-gold-light); margin-bottom:16px;">Order Reference: <strong>${order.orderId}</strong></p>
        
        <div class="demo-mode-pill" style="margin-bottom:20px; text-align:left;">
          <strong>Demo Notice:</strong> Online order processing is currently in presentation mode. No payment was deducted. To share this order directly with the restaurant team or save your copy, use the WhatsApp button below.
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; text-align:left; font-size:0.88rem; margin-bottom:24px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:var(--color-text-muted)">Customer:</span>
            <span style="color:#FFF; font-weight:600;">${order.customerName}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:var(--color-text-muted)">Order Type:</span>
            <span style="color:var(--color-gold); font-weight:600; text-transform:capitalize;">${order.orderType}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:var(--color-text-muted)">Total Bill:</span>
            <span style="color:var(--color-gold-light); font-weight:700; font-size:1.1rem;">₹${order.grandTotal}</span>
          </div>
          <div style="font-size:0.8rem; color:var(--color-text-muted); margin-top:8px;">
            Items: ${order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="background:#25D366; color:#FFFFFF; border:none;">
            <span>💬 Send Order to Restaurant WhatsApp</span>
          </a>
          <button type="button" class="btn btn-secondary" onclick="window.puthariCart.finishOrderDemo()">
            Close & Clear Cart
          </button>
        </div>
      </div>
    `;
  }

  finishOrderDemo() {
    this.clearCart();
    this.closeCheckoutModal();
    // Reload checkout modal HTML for future uses
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }

  showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.puthariCart = new PuthariCart();
});
