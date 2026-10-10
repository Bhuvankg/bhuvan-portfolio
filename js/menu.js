/**
 * PUTHARI RESTAURANT — Menu Interactivity & Rendering Engine
 * Filters: Category, Veg / Non-Veg, Search query, Price sorting
 */

document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menuGridContainer');
  if (!menuContainer) return; // If on a page without the main menu grid

  let currentCategory = 'all';
  let currentDiet = 'all'; // 'all' | 'veg' | 'nonveg'
  let currentSearch = '';
  let currentSort = 'default';

  // Render function
  function renderMenu() {
    let items = getAllMenuItems();

    // 1. Filter by category
    if (currentCategory !== 'all') {
      items = items.filter(item => item.category === currentCategory);
    }

    // 2. Filter by dietary preference
    if (currentDiet === 'veg') {
      items = items.filter(item => item.isVeg === true);
    } else if (currentDiet === 'nonveg') {
      items = items.filter(item => item.isVeg === false);
    }

    // 3. Filter by search query
    if (currentSearch.trim() !== '') {
      const q = currentSearch.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q)
      );
    }

    // 4. Sort
    if (currentSort === 'price-low') {
      items.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
      items.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    }

    // Empty state
    if (items.length === 0) {
      menuContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(212,175,55,0.3);">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🍲</div>
          <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: #FFF; margin-bottom: 8px;">No matching dishes found</h3>
          <p style="color: var(--color-text-muted); font-size: 0.9rem; max-width: 400px; margin: 0 auto 20px;">Try adjusting your filter or searching for another favourite like Biriyani, Egg Chilli, or Ghee Rice.</p>
          <button class="btn btn-outline-gold btn-sm" id="btnResetMenuFilters">Reset All Filters</button>
        </div>
      `;

      const resetBtn = document.getElementById('btnResetMenuFilters');
      if (resetBtn) {
        resetBtn.addEventListener('click', resetAllFilters);
      }
      return;
    }

    // Render cards
    menuContainer.innerHTML = items.map(dish => {
      const currentQty = window.puthariCart ? window.puthariCart.getItemQuantity(dish.id) : 0;
      const spiceIcons = '🌶️'.repeat(dish.spiceLevel || 0);

      // Badge style
      let badgeClass = 'badge-popular';
      if (dish.badge === 'Bestseller') badgeClass = 'badge-bestseller';
      if (dish.badge === "Chef's Special") badgeClass = 'badge-chef';
      if (dish.badge === 'Vegetarian') badgeClass = 'badge-veg-label';

      return `
        <article class="menu-card" data-id="${dish.id}">
          <div class="menu-card-image-wrap">
            <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'">
            ${dish.badge ? `<span class="menu-badge ${badgeClass}">${dish.badge}</span>` : ''}
            <div class="diet-indicator ${dish.isVeg ? 'veg' : 'non-veg'}" title="${dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}"></div>
          </div>
          <div class="menu-card-body">
            <div class="menu-card-header">
              <h3 class="menu-dish-title">${dish.name}</h3>
            </div>
            <div class="menu-spice-rating">
              <span>${dish.categoryName}</span>
              <span>•</span>
              <span title="Rating">${dish.rating} ★ (${dish.reviewsCount})</span>
              ${dish.spiceLevel > 0 ? `<span>•</span> <span class="spice-icons" title="Spice level: ${dish.spiceLevel}">${spiceIcons}</span>` : ''}
            </div>
            <p class="menu-dish-desc">${dish.description}</p>
            <div class="menu-dish-footer">
              <div class="menu-price-wrap">
                <span class="menu-price">₹${dish.price}</span>
                <span class="menu-price-note">Sample Price</span>
              </div>
              <div class="card-cart-action" id="action-wrap-${dish.id}">
                ${renderCardButtonHtml(dish.id, currentQty)}
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderCardButtonHtml(dishId, qty) {
    if (qty > 0) {
      return `
        <div class="card-qty-controller">
          <button class="qty-btn" onclick="handleCardQtyChange('${dishId}', -1)">-</button>
          <span class="qty-val">${qty}</span>
          <button class="qty-btn" onclick="handleCardQtyChange('${dishId}', 1)">+</button>
        </div>
      `;
    } else {
      return `
        <button class="btn-add-cart" onclick="handleCardAdd('${dishId}')">
          <span>+</span> Add
        </button>
      `;
    }
  }

  // Global button handlers for cards
  window.handleCardAdd = function(dishId) {
    const dish = getMenuItemById(dishId);
    if (dish && window.puthariCart) {
      window.puthariCart.addItem(dish, 1);
      updateSingleCardButton(dishId);
    }
  };

  window.handleCardQtyChange = function(dishId, delta) {
    if (window.puthariCart) {
      window.puthariCart.updateQuantity(dishId, delta);
      updateSingleCardButton(dishId);
    }
  };

  function updateSingleCardButton(dishId) {
    const wrap = document.getElementById(`action-wrap-${dishId}`);
    if (wrap && window.puthariCart) {
      const qty = window.puthariCart.getItemQuantity(dishId);
      wrap.innerHTML = renderCardButtonHtml(dishId, qty);
    }
  }

  window.refreshCardButtons = function() {
    document.querySelectorAll('.menu-card').forEach(card => {
      const id = card.getAttribute('data-id');
      if (id) {
        updateSingleCardButton(id);
      }
    });
  };

  function resetAllFilters() {
    currentCategory = 'all';
    currentDiet = 'all';
    currentSearch = '';
    currentSort = 'default';

    document.querySelectorAll('.cat-filter-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cat') === 'all');
    });

    document.querySelectorAll('.diet-pill').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-diet') === 'all');
    });

    const searchInput = document.getElementById('menuSearchInput');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('menuSortSelect');
    if (sortSelect) sortSelect.value = 'default';

    renderMenu();
  }

  // Category buttons
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat');
      renderMenu();
    });
  });

  // Dietary filter buttons
  document.querySelectorAll('.diet-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diet-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDiet = btn.getAttribute('data-diet');
      renderMenu();
    });
  });

  // Live search input
  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderMenu();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById('menuSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderMenu();
    });
  }

  // Initial render
  renderMenu();
});
