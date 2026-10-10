/**
 * NOSH RESTO CAFE — Menu Interactivity & Rendering Engine
 * Filters: Category pills, Veg / Non-Veg toggles, Real-time search, Sort options
 * Features: Dish Quick View Modal, dynamic cart sync
 */

document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menuGridContainer');
  if (!menuContainer) return; // If page doesn't have the main interactive menu grid

  let currentCategory = 'all';
  let currentDiet = 'all'; // 'all' | 'veg' | 'nonveg'
  let currentSearch = '';
  let currentSort = 'default'; // 'default' | 'price-asc' | 'price-desc' | 'rating'

  // Render Category Counts on Buttons
  function updateCategoryPillCounts() {
    if (typeof getAllMenuItems !== 'function') return;
    const allDishes = getAllMenuItems();

    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      const cat = btn.getAttribute('data-cat');
      let count = 0;
      if (cat === 'all') {
        count = allDishes.length;
      } else {
        count = allDishes.filter(d => d.category === cat).length;
      }

      let countBadge = btn.querySelector('.cat-count');
      if (!countBadge) {
        countBadge = document.createElement('span');
        countBadge.className = 'cat-count';
        btn.appendChild(countBadge);
      }
      countBadge.textContent = count;
    });
  }

  // Render Dishes
  function renderMenu() {
    if (typeof getAllMenuItems !== 'function') return;
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
    if (currentSort === 'price-asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    }

    // Update active count summary label
    const resultsCountEl = document.getElementById('menuResultsCount');
    if (resultsCountEl) {
      resultsCountEl.textContent = `Showing ${items.length} ${items.length === 1 ? 'dish' : 'dishes'}`;
    }

    // Empty state
    if (items.length === 0) {
      menuContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(212,175,96,0.3);">
          <div style="font-size: 2.8rem; margin-bottom: 14px;">🍽️</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #FFF; margin-bottom: 8px;">No matching dishes found</h3>
          <p style="color: var(--color-cream-muted); font-size: 0.9rem; max-width: 440px; margin: 0 auto 20px;">Try clearing your search keyword or switching between Vegetarian and Non-Vegetarian options.</p>
          <button class="btn btn-outline-gold btn-sm" id="btnResetMenuFilters">Reset All Filters</button>
        </div>
      `;

      const resetBtn = document.getElementById('btnResetMenuFilters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          currentCategory = 'all';
          currentDiet = 'all';
          currentSearch = '';
          currentSort = 'default';

          const searchInput = document.getElementById('menuSearchInput');
          if (searchInput) searchInput.value = '';

          const sortSelect = document.getElementById('menuSortSelect');
          if (sortSelect) sortSelect.value = 'default';

          document.querySelectorAll('.cat-filter-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-cat') === 'all');
          });

          document.querySelectorAll('.diet-pill-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-diet') === 'all');
          });

          renderMenu();
        });
      }
      return;
    }

    // Render cards
    menuContainer.innerHTML = items.map(dish => {
      const inCart = window.noshCart ? window.noshCart.items.find(i => i.id === dish.id) : null;
      const dietClass = dish.isVeg ? 'veg' : 'nonveg';
      const dietLabel = dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian';

      return `
        <div class="food-card" data-id="${dish.id}">
          <div class="food-card-thumb-wrap">
            <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'">
            <div class="food-card-top-badges">
              <span class="diet-badge ${dietClass}" title="${dietLabel}"></span>
              ${dish.badge ? `<span class="food-card-badge">${dish.badge}</span>` : ''}
            </div>
            <span class="food-card-prep">⏱️ ${dish.prepTime}</span>
          </div>

          <div class="food-card-body">
            <div class="food-card-title-row">
              <h4 class="food-card-title">${dish.name}</h4>
              <span class="food-card-rating">★ ${dish.rating}</span>
            </div>

            <p class="food-card-desc">${dish.description}</p>

            <div class="food-card-footer">
              <div class="food-price-box">
                <span class="food-price-curr">Price</span>
                <span class="food-price-val">₹${dish.price}</span>
              </div>

              <div class="food-card-actions">
                <button type="button" class="btn-card-quick" onclick="openDishQuickView('${dish.id}')" title="Quick View">
                  👁️
                </button>
                <div class="food-card-action-wrap">
                  ${inCart ? `
                    <div class="qty-stepper">
                      <button type="button" class="qty-step-btn" onclick="noshCart.updateQuantity('${dish.id}', -1)" aria-label="Decrease quantity">−</button>
                      <span class="qty-count-val">${inCart.quantity}</span>
                      <button type="button" class="qty-step-btn" onclick="noshCart.updateQuantity('${dish.id}', 1)" aria-label="Increase quantity">+</button>
                    </div>
                  ` : `
                    <button type="button" class="btn-add-cart" onclick="noshCart.addFromCard('${dish.id}')">
                      <span>+ Add</span>
                    </button>
                  `}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Bind Category Buttons
  const catButtons = document.querySelectorAll('.cat-filter-btn');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat') || 'all';
      renderMenu();
    });
  });

  // Bind Diet Filter Buttons
  const dietButtons = document.querySelectorAll('.diet-pill-btn');
  dietButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dietButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDiet = btn.getAttribute('data-diet') || 'all';
      renderMenu();
    });
  });

  // Bind Live Search Input
  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderMenu();
    });
  }

  // Bind Sort Dropdown
  const sortSelect = document.getElementById('menuSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderMenu();
    });
  }

  // Quick View Modal
  window.openDishQuickView = function(dishId) {
    if (typeof getAllMenuItems !== 'function') return;
    const dish = getAllMenuItems().find(d => d.id === dishId);
    if (!dish) return;

    const modal = document.getElementById('dishQuickViewModal');
    if (!modal) return;

    const imgEl = document.getElementById('quickViewImage');
    const titleEl = document.getElementById('quickViewTitle');
    const badgeEl = document.getElementById('quickViewBadge');
    const descEl = document.getElementById('quickViewDesc');
    const priceEl = document.getElementById('quickViewPrice');
    const portionEl = document.getElementById('quickViewPortion');
    const prepEl = document.getElementById('quickViewPrep');
    const ratingEl = document.getElementById('quickViewRating');
    const addBtn = document.getElementById('quickViewAddBtn');

    if (imgEl) imgEl.src = dish.image;
    if (titleEl) titleEl.textContent = dish.name;
    if (badgeEl) badgeEl.textContent = dish.badge || (dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian');
    if (descEl) descEl.textContent = dish.description;
    if (priceEl) priceEl.textContent = `₹${dish.price}`;
    if (portionEl) portionEl.textContent = dish.portion || 'Standard Portion';
    if (prepEl) prepEl.textContent = dish.prepTime || '15 min';
    if (ratingEl) ratingEl.textContent = `★ ${dish.rating} (${dish.reviewsCount} reviews)`;

    if (addBtn) {
      addBtn.onclick = () => {
        if (window.noshCart) {
          window.noshCart.addItem(dish, 1);
        }
        modal.classList.remove('open');
      };
    }

    modal.classList.add('open');
  };

  // Initial load
  updateCategoryPillCounts();
  renderMenu();
});
