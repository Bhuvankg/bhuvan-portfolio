# NOSH RESTO CAFE — Official Brand Website & Web Application

A complete, visually stunning, fully responsive restaurant and café web application created for **NOSH RESTO CAFE**, located in **Panchavalli, Karnataka, India**.

Designed with a modern café aesthetic, deep espresso and dark charcoal backdrop, warm cream typography, and terracotta, caramel, and muted gold accents.

---

## 📍 1. Verified Business Information

| Detail | Information |
| :--- | :--- |
| **Restaurant Name** | **Nosh Resto Cafe** |
| **Category** | Restaurant and café |
| **Address** | Panchavalli, Gonikoppa, Thalassery–Mysore Road, Panchavalli, Karnataka 571105, India |
| **Phone Number** | **+91 98953 86886** |
| **Google Maps Plus Code** | **74PP+CM, Panchavalli, Karnataka** |
| **Google Rating** | **4.7 / 5.0** (based on 34 verified reviews) |
| **Price Range** | **₹200 – ₹400** per person |
| **Available Services** | Dine-in, Kerbside pickup, No-contact delivery |
| **Listed Closing Time** | **2:00 AM** *(Verify complete operating hours before publishing)* |

### Verified Customer Feedback Themes:
- Delicious and freshly prepared food.
- Good food variety across categories.
- Fast and attentive service.
- Positive overall dining experiences.
- *Late-Night Advisory:* Customer feedback indicates that food selections late at night may vary depending on daily prep.

---

## 🎨 2. Premium Brand Identity & Design System

- **Background Palette:** Deep Espresso & Charcoal (`#0e0d0c`, `#161412`, `#1e1b18`, `#221e1a`).
- **Typography:**
  - Headings: Serif elegance (`Playfair Display`, Georgia).
  - Body & UI: Clean, legible sans-serif (`Plus Jakarta Sans`).
  - Text Colors: Warm Cream (`#f5efe6`), Ivory (`#fffdfa`), and subtle sand tones (`#d8cdbe`).
- **Accent Colors:**
  - Terracotta: `#d96b43` / `#e8825c` / `#b85028`
  - Caramel: `#c68b59` / `#dc9f6e`
  - Muted Gold: `#c5a059` / `#dfbd73`
- **Logo:** Bespoke SVG crest emblem featuring modern café aroma & cloche motif with letterspaced serif wordmark (`assets/images/logo.svg`).
- **Icons & Badges:** Standard Indian green dot veg / red non-veg indicators, live pulsing status pill for business hours, star ratings, and verified badges.

---

## 🍲 3. Interactive Food Menu

Organized into 8 distinct categories as requested:
1. **Popular Favourites** (Nosh Special Chicken Dum Biriyani, Dragon Chicken, Paneer Butter Masala, Malabar Parotta Combo, Cold Coffee Blend)
2. **Starters** (Pepper Chicken Dry, Chicken Lollipop, Chilli Gobi, Mushroom Pepper Fry, Chicken 65)
3. **Chicken Specials** (Nosh Highway Chicken Roast, Butter Chicken, Kadai Chicken, Chettinad Masala)
4. **Biriyani and Rice** (Thalassery Chicken Biriyani, Malabar Ghee Rice, Egg Dum Biriyani, Royal Veg Biriyani, Jeera Rice)
5. **Indian Main Course** (Dal Makhani, Kadai Paneer, Egg Masala, Malabar Parotta, Garlic Naan)
6. **Vegetarian Dishes** (Tandoori Paneer Tikka, Mushroom Masala, Veg Fried Rice with Manchurian, Aloo Gobi)
7. **Snacks** (Grilled Chicken Club Sandwich, Paneer Tikka Sandwich, Peri-Peri Fries, Chicken Cheese Burger)
8. **Beverages and Desserts** (Nosh Special Cold Coffee with Ice Cream, Fresh Mint Lime Mojito, Traditional Filter Coffee, Gulab Jamun, Hot Chocolate Brownie)

### Interactive Features:
- Real-time live search by dish name, description, and keywords.
- Dietary toggles: All, Vegetarian (`🟢`), Non-Vegetarian (`🔴`).
- Sort by: Recommended, Price Low to High, Price High to Low, Top Rated.
- Dish Quick View Modal: Inspect preparation time, portion sizes, spice levels, and descriptions.
- Quantity Stepper: Increment and decrement dishes directly from the card.
- *Sample Menu Notice:* Prominently displays clear notice that sample dishes and placeholder prices are used until the official menu card is supplied.

---

## 🛒 4. Online Ordering & Checkout Experience

- **Persistent Shopping Cart Drawer:** Accessible via header, floating button, or mobile bottom bar.
- **Order Type Selector:**
  - **Dine-in:** Service fee ₹0.
  - **Kerbside Pickup:** Minimal eco-packaging fee (₹15).
  - **No-Contact Delivery:** Flat delivery fee (₹40) with dynamic required address field.
- **Client Validation:** Full name (min. 2 characters), 10-digit Indian mobile number validation (`/^[6-9]\d{9}$/`), and landmark address for delivery.
- **Demo Checkout Flow:**
  - Transparent demo mode disclaimer informing customers that orders are simulated.
  - Generates unique Order ID (`#NOSH-XXXXXX`).
  - Displays preparation timer estimate and itemized receipt breakdown.
- **WhatsApp Order Builder:**
  - Formats order items, quantities, subtotal, customer details, and special instructions into a clean message.
  - Interactive "Review WhatsApp Message" preview modal before launching WhatsApp to verified phone number **+91 98953 86886**.

---

## 📸 5. Food & Ambience Photo Gallery

- Filterable tabs: All Photos, Food & Biriyani, Café Ambience, Beverages & Coffee, Starters & Snacks.
- High-resolution, warm food photography.
- Interactive Lightbox modal with keyboard `Esc` closing and caption viewer.

---

## 📱 6. Responsive Mobile Experience

- Dedicated sticky mobile navigation bar at the bottom with quick access to **Home**, **Menu**, **Call (+91 98953 86886)**, **WhatsApp**, and **Cart**.
- Touch-friendly hamburger drawer navigation.
- Smooth horizontal category filter pills.
- One-click copy for Google Maps Plus Code (`74PP+CM, Panchavalli, Karnataka`).

---

## 🚀 7. Running the Application Locally

### Prerequisites
- Node.js (v18+)

### Installation & Launch
```bash
# Navigate to directory
cd c:\antigravity

# Install dependencies (Express is already included)
npm install

# Start the server
npm start
```

Open your browser at:
```
http://localhost:3000
```

---

## 📂 8. Project Structure

```
├── assets/
│   └── images/
│       ├── logo.svg              # Custom Nosh Resto Cafe vector brandmark
│       └── favicon.svg           # High-resolution favicon
├── css/
│   ├── style.css                 # Core design system, espresso palette & animations
│   └── responsive.css            # Tablet and mobile viewport optimizations
├── js/
│   ├── menu-data.js              # Sample menu dataset (8 categories, 30+ dishes)
│   ├── cart.js                   # Cart engine, validation, WhatsApp builder & demo checkout
│   ├── menu.js                   # Menu filtering, live search, sort & quick view modal
│   ├── gallery.js                # Gallery filter tabs & lightbox viewer
│   └── main.js                   # Sticky header, hours status pill & clipboard helper
├── index.html                    # Main flagship landing experience
├── menu.html                     # Dedicated interactive menu page
├── about.html                    # Dedicated brand story & location page
├── gallery.html                  # Dedicated photo gallery page
├── reviews.html                  # Dedicated Google reviews & rating page
├── contact.html                  # Dedicated contact, plus code & inquiry page
├── server.js                     # Express API and static server (native HTTP fallback)
└── package.json                  # Project metadata and start scripts
```

---

© 2026 Nosh Resto Cafe. Panchavalli, Gonikoppa, Thalassery–Mysore Road, Karnataka 571105.
