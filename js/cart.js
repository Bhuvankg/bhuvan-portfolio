/**
 * NOSH RESTO CAFE — Shopping Cart & Online Ordering Engine
 * Location: Panchavalli, Gonikoppa, Thalassery–Mysore Road, Karnataka
 * Verified Contact: +91 98953 86886
 * 
 * Features:
 * - LocalStorage persistence across all pages
 * - Quantity manipulation (+ / - / remove)
 * - Subtotal, taxes & packaging calculations
 * - Multi-order type selection: Dine-in | Kerbside pickup | No-contact delivery
 * - Form validation (Name, 10-digit Indian Mobile, Delivery Address)
 * - Demo Mode checkout flow with realistic receipt modal & timer
 * - WhatsApp Order Builder with interactive Order Review modal
 */

class NoshCart {
  constructor() {
    this.storageKey = 'nosh_cart_items_v2';
    this.orderTypeKey = 'nosh_order_type_v2';
    this.restaurantPhone = '919895386886'; // +91 98953 86886 for WhatsApp
    this.restaurantDisplayPhone = '+91 98953 86886';
    
    this.items = this.loadCart();
    this.orderType = localStorage.getItem(this.orderTypeKey) || 'dinein'; // 'dinein' | 'kerbside' | 'delivery'
    
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

  getPackagingDeliveryFee() {
    if (this.items.length === 0) return 0;
    if (this.orderType === 'dinein') return 0;
    if (this.orderType === 'kerbside') return 15; // Minimal eco-packaging
    if (this.orderType === 'delivery') return 40; // No-contact delivery fee
    return 0;
  }

  getGrandTotal() {
    if (this.items.length === 0) return 0;
    return this.getSubtotal() + this.getPackagingDeliveryFee();
  }

  init() {
    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    // Drawer open / close
    const openBtns = document.querySelectorAll('.js-open-cart');
    const closeBtns = document.querySelectorAll('.js-close-cart');
    const overlay = document.getElementById('cartDrawerOverlay');

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeDrawer();
      });
    });

    if (overlay) {
      overlay.addEventListener('click', () => this.closeDrawer());
    }

    // Order Type Tabs inside drawer
    const orderTypeTabs = document.querySelectorAll('.order-type-tab-btn');
    orderTypeTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const type = tab.getAttribute('data-type');
        orderTypeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.setOrderType(type);
      });
    });

    // Checkout modal trigger
    const btnProceedCheckout = document.getElementById('btnProceedCheckout');
    if (btnProceedCheckout) {
      btnProceedCheckout.addEventListener('click', () => {
        if (this.items.length === 0) {
          this.showToast('Your cart is empty. Please add items first!');
          return;
        }
        this.closeDrawer();
        this.openCheckoutModal();
      });
    }

    // WhatsApp Direct Order Trigger
    const btnOrderWhatsApp = document.getElementById('btnOrderWhatsApp');
    if (btnOrderWhatsApp) {
      btnOrderWhatsApp.addEventListener('click', () => {
        if (this.items.length === 0) {
          this.showToast('Your cart is empty. Add dishes to place an order!');
          return;
        }
        this.openWhatsAppReviewModal();
      });
    }

    // Modal Close buttons
    const modalCloses = document.querySelectorAll('.js-close-modal');
    modalCloses.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
      });
    });

    // Order Form Submission
    const checkoutForm = document.getElementById('checkoutOrderForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));
    }

    // Order type change in checkout modal
    const modalOrderTypeSelect = document.getElementById('modalOrderType');
    if (modalOrderTypeSelect) {
      modalOrderTypeSelect.addEventListener('change', (e) => {
        this.setOrderType(e.target.value);
        this.syncDeliveryAddressVisibility(e.target.value);
      });
    }

    // WhatsApp Confirm Send
    const btnSendWhatsAppFinal = document.getElementById('btnSendWhatsAppFinal');
    if (btnSendWhatsAppFinal) {
      btnSendWhatsAppFinal.addEventListener('click', () => this.sendToWhatsApp());
    }
  }

  openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  updateUI() {
    const count = this.getTotalCount();
    const subtotal = this.getSubtotal();
    const fee = this.getPackagingDeliveryFee();
    const grandTotal = this.getGrandTotal();

    // Update Badges
    document.querySelectorAll('.cart-badge-count').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });

    // Mobile bottom badge
    document.querySelectorAll('.mobile-bottom-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });

    // Floating cart button
    const floatCartBtn = document.getElementById('floatingCartBtn');
    if (floatCartBtn) {
      floatCartBtn.style.display = count > 0 ? 'flex' : 'none';
    }

    // Update Drawer Order Type Tabs
    document.querySelectorAll('.order-type-tab-btn').forEach(tab => {
      if (tab.getAttribute('data-type') === this.orderType) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Render Drawer Items
    const itemsContainer = document.getElementById('cartDrawerItems');
    if (itemsContainer) {
      if (this.items.length === 0) {
        itemsContainer.innerHTML = `
          <div class="cart-empty-state">
            <div class="cart-empty-icon">☕</div>
            <h4>Your cart is empty</h4>
            <p>Explore Nosh Resto Cafe's flavorful menu and add your favorite dishes.</p>
            <a href="menu.html" class="btn btn-primary btn-sm" onclick="noshCart.closeDrawer()">Explore Menu</a>
          </div>
        `;
      } else {
        itemsContainer.innerHTML = this.items.map(item => `
          <div class="cart-item-row" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price-each">₹${item.price} each</div>
              <div class="cart-item-stepper-wrap">
                <div class="qty-stepper">
                  <button type="button" class="qty-step-btn" onclick="noshCart.updateQuantity('${item.id}', -1)" aria-label="Decrease quantity">−</button>
                  <span class="qty-count-val">${item.quantity}</span>
                  <button type="button" class="qty-step-btn" onclick="noshCart.updateQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
                </div>
              </div>
            </div>
            <div class="cart-item-total-col">
              <div class="cart-item-line-total">₹${item.price * item.quantity}</div>
              <button type="button" class="btn-remove-cart-item" onclick="noshCart.removeItem('${item.id}')" title="Remove Item">✕</button>
            </div>
          </div>
        `).join('');
      }
    }

    // Update Bill Breakdown
    const subtotalEl = document.getElementById('cartSubtotalValue');
    const feeLabelEl = document.getElementById('cartFeeLabel');
    const feeValueEl = document.getElementById('cartFeeValue');
    const grandTotalEl = document.getElementById('cartGrandTotalValue');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;

    if (feeLabelEl && feeValueEl) {
      if (this.orderType === 'dinein') {
        feeLabelEl.textContent = 'Dine-in Service';
        feeValueEl.textContent = 'Free';
      } else if (this.orderType === 'kerbside') {
        feeLabelEl.textContent = 'Kerbside Packaging';
        feeValueEl.textContent = '₹15';
      } else {
        feeLabelEl.textContent = 'No-Contact Delivery Fee';
        feeValueEl.textContent = '₹40';
      }
    }

    // Enable/disable buttons based on cart
    const proceedBtn = document.getElementById('btnProceedCheckout');
    const waBtn = document.getElementById('btnOrderWhatsApp');
    if (proceedBtn) proceedBtn.disabled = this.items.length === 0;
    if (waBtn) waBtn.disabled = this.items.length === 0;

    // Sync menu card steppers if present on page
    this.syncMenuCardControls();
  }

  syncMenuCardControls() {
    document.querySelectorAll('.food-card').forEach(card => {
      const id = card.getAttribute('data-id');
      const actionWrap = card.querySelector('.food-card-action-wrap');
      if (!actionWrap || !id) return;

      const inCart = this.items.find(i => i.id === id);
      if (inCart) {
        actionWrap.innerHTML = `
          <div class="qty-stepper">
            <button type="button" class="qty-step-btn" onclick="noshCart.updateQuantity('${id}', -1)" aria-label="Decrease quantity">−</button>
            <span class="qty-count-val">${inCart.quantity}</span>
            <button type="button" class="qty-step-btn" onclick="noshCart.updateQuantity('${id}', 1)" aria-label="Increase quantity">+</button>
          </div>
        `;
      } else {
        actionWrap.innerHTML = `
          <button type="button" class="btn-add-cart" onclick="noshCart.addFromCard('${id}')">
            <span>+ Add</span>
          </button>
        `;
      }
    });
  }

  addFromCard(id) {
    if (typeof getAllMenuItems === 'function') {
      const allDishes = getAllMenuItems();
      const dish = allDishes.find(d => d.id === id);
      if (dish) {
        this.addItem(dish, 1);
      }
    }
  }

  openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    // Sync select dropdown
    const select = document.getElementById('modalOrderType');
    if (select) {
      select.value = this.orderType;
      this.syncDeliveryAddressVisibility(this.orderType);
    }

    // Sync summary in modal
    const summaryList = document.getElementById('modalOrderSummaryList');
    if (summaryList) {
      summaryList.innerHTML = this.items.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.86rem; color:var(--color-cream-muted);">
          <span>${item.quantity}x ${item.name}</span>
          <span style="color:var(--color-gold-light); font-weight:600;">₹${item.price * item.quantity}</span>
        </div>
      `).join('');
    }

    const modalTotal = document.getElementById('modalGrandTotal');
    if (modalTotal) modalTotal.textContent = `₹${this.getGrandTotal()}`;

    modal.classList.add('open');
  }

  syncDeliveryAddressVisibility(type) {
    const addrGroup = document.getElementById('deliveryAddressGroup');
    const addrInput = document.getElementById('customerAddress');
    if (!addrGroup) return;

    if (type === 'delivery') {
      addrGroup.style.display = 'block';
      if (addrInput) addrInput.required = true;
    } else {
      addrGroup.style.display = 'none';
      if (addrInput) addrInput.required = false;
    }
  }

  handleCheckoutSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const orderTypeSelect = document.getElementById('modalOrderType');
    const addressInput = document.getElementById('customerAddress');
    const notesInput = document.getElementById('customerNotes');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const orderType = orderTypeSelect ? orderTypeSelect.value : this.orderType;
    const address = addressInput ? addressInput.value.trim() : '';
    const notes = notesInput ? notesInput.value.trim() : '';

    // Validation
    if (name.length < 2) {
      this.showToast('Please enter your full name (minimum 2 characters).');
      if (nameInput) nameInput.focus();
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (!phoneRegex.test(cleanPhone)) {
      this.showToast('Please enter a valid 10-digit Indian mobile number.');
      if (phoneInput) phoneInput.focus();
      return;
    }

    if (orderType === 'delivery' && address.length < 10) {
      this.showToast('Please enter a complete delivery address with landmark.');
      if (addressInput) addressInput.focus();
      return;
    }

    // Build Demo Order Object
    const orderId = 'NOSH-' + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      orderId,
      customerName: name,
      customerPhone: cleanPhone,
      orderType,
      address: orderType === 'delivery' ? address : 'N/A',
      notes,
      items: [...this.items],
      subtotal: this.getSubtotal(),
      fee: this.getPackagingDeliveryFee(),
      grandTotal: this.getGrandTotal(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedTime: orderType === 'dinein' ? '15-20 min' : (orderType === 'kerbside' ? '20-25 min' : '30-40 min')
    };

    // Attempt to post to local backend demo server if running
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    }).catch(err => console.log('Demo mode: backend offline or demo API responded:', err));

    // Close checkout modal & show confirmation screen
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) checkoutModal.classList.remove('open');

    this.showConfirmationModal(orderData);
  }

  showConfirmationModal(order) {
    const modal = document.getElementById('orderConfirmationModal');
    if (!modal) return;

    // Fill confirmation data
    const idEl = document.getElementById('confirmOrderId');
    const nameEl = document.getElementById('confirmCustomerName');
    const typeEl = document.getElementById('confirmOrderType');
    const timeEl = document.getElementById('confirmEstimatedTime');
    const totalEl = document.getElementById('confirmGrandTotal');
    const itemsEl = document.getElementById('confirmItemsList');

    if (idEl) idEl.textContent = '#' + order.orderId;
    if (nameEl) nameEl.textContent = order.customerName;
    if (typeEl) {
      const typeLabels = {
        'dinein': 'Dine-In Experience',
        'kerbside': 'Kerbside Roadside Pickup',
        'delivery': 'No-Contact Delivery'
      };
      typeEl.textContent = typeLabels[order.orderType] || order.orderType;
    }
    if (timeEl) timeEl.textContent = order.estimatedTime;
    if (totalEl) totalEl.textContent = `₹${order.grandTotal}`;

    if (itemsEl) {
      itemsEl.innerHTML = order.items.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.86rem; color:var(--color-cream-muted);">
          <span>${item.quantity}x ${item.name}</span>
          <span style="color:var(--color-gold-light);">₹${item.price * item.quantity}</span>
        </div>
      `).join('');
    }

    // Set WhatsApp link button on confirmation modal
    const waConfirmBtn = document.getElementById('btnConfirmOrderWhatsApp');
    if (waConfirmBtn) {
      waConfirmBtn.onclick = () => {
        this.openWhatsAppWithText(this.buildWhatsAppMessage(order));
      };
    }

    modal.classList.add('open');

    // Clear cart once order is confirmed
    this.clearCart();
  }

  openWhatsAppReviewModal() {
    const modal = document.getElementById('whatsAppReviewModal');
    if (!modal) {
      // Direct fallback
      this.sendToWhatsApp();
      return;
    }

    this.closeDrawer();

    // Populate review preview
    const previewBox = document.getElementById('whatsAppMessagePreview');
    const sampleCustomer = {
      customerName: (document.getElementById('customerName')?.value.trim()) || 'Valued Customer',
      customerPhone: (document.getElementById('customerPhone')?.value.trim()) || 'Not provided',
      orderType: this.orderType,
      address: (document.getElementById('customerAddress')?.value.trim()) || 'Panchavalli Area',
      notes: (document.getElementById('customerNotes')?.value.trim()) || 'None'
    };

    const text = this.buildWhatsAppMessage(sampleCustomer);
    if (previewBox) {
      previewBox.textContent = text;
    }

    modal.classList.add('open');
  }

  buildWhatsAppMessage(customer) {
    const typeLabels = {
      'dinein': 'Dine-in at Nosh Resto Cafe',
      'kerbside': 'Kerbside Roadside Pickup',
      'delivery': 'No-contact Delivery'
    };

    let msg = `*🍽️ ORDER FOR NOSH RESTO CAFE*\n`;
    msg += `------------------------------\n`;
    msg += `*Order Type:* ${typeLabels[customer.orderType || this.orderType] || this.orderType}\n`;
    if (customer.orderId) msg += `*Order Ref:* #${customer.orderId}\n`;
    if (customer.customerName) msg += `*Customer:* ${customer.customerName}\n`;
    if (customer.customerPhone && customer.customerPhone !== 'Not provided') msg += `*Phone:* +91 ${customer.customerPhone}\n`;
    if (customer.orderType === 'delivery' && customer.address) {
      msg += `*Delivery Address:* ${customer.address}\n`;
    }
    if (customer.notes && customer.notes !== 'None') {
      msg += `*Special Instructions:* ${customer.notes}\n`;
    }
    msg += `------------------------------\n`;
    msg += `*ITEMS ORDERED:*\n`;

    const itemsToFormat = customer.items || this.items;
    itemsToFormat.forEach(item => {
      msg += `• ${item.quantity}x ${item.name} — ₹${item.price * item.quantity}\n`;
    });

    msg += `------------------------------\n`;
    msg += `*Subtotal:* ₹${customer.subtotal || this.getSubtotal()}\n`;
    const fee = customer.fee !== undefined ? customer.fee : this.getPackagingDeliveryFee();
    if (fee > 0) {
      msg += `*Packaging / Delivery:* ₹${fee}\n`;
    }
    msg += `*Estimated Grand Total:* ₹${customer.grandTotal || this.getGrandTotal()}\n\n`;
    msg += `_Note: Sample menu demo. Kindly confirm availability and preparation time with Nosh Resto Cafe._`;

    return msg;
  }

  sendToWhatsApp() {
    const customer = {
      customerName: (document.getElementById('customerName')?.value.trim()) || 'Customer',
      customerPhone: (document.getElementById('customerPhone')?.value.trim()) || '',
      orderType: this.orderType,
      address: (document.getElementById('customerAddress')?.value.trim()) || '',
      notes: (document.getElementById('customerNotes')?.value.trim()) || ''
    };

    const text = this.buildWhatsAppMessage(customer);
    this.openWhatsAppWithText(text);

    // Close review modal
    const reviewModal = document.getElementById('whatsAppReviewModal');
    if (reviewModal) reviewModal.classList.remove('open');
  }

  openWhatsAppWithText(text) {
    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/${this.restaurantPhone}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
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
    toast.className = 'toast-message';
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

// Global Cart Instance
let noshCart;
document.addEventListener('DOMContentLoaded', () => {
  noshCart = new NoshCart();
  window.noshCart = noshCart;
});
