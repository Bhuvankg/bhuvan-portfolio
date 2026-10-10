# PUTHARI RESTAURANT — Official Website & Online Ordering

> **Premium, Modern, Responsive Website for Puthari Restaurant, Kampalapura, Karnataka**

---

## 📌 Restaurant Overview & Verified Business Profile

- **Restaurant Name:** PUTHARI RESTAURANT
- **Category:** Family Restaurant
- **Address:** BM Road, Kampalapura, Karnataka 571107, India
- **Google Maps Plus Code:** `85P2+2W Kampalapura, Karnataka`
- **Google Rating:** **3.9 / 5.0** based on **64 reviews** *(Provided business information; subject to update)*
- **Price Range:** ₹200–₹400 per person
- **Dining Options:** Dine-in, Drive-through, and No-contact delivery
- **Popular Food Highlights:** Biriyani, Egg Chilli, Chicken Specials, and Karnataka Highway Classics
- **Operating Hours:** Daily 11:00 AM – 2:00 AM *(Closing listed at 2:00 AM; verify opening hours before publishing)*

---

## 🎨 Design System & Brand Identity

- **Color Palette:**
  - **Charcoal / Dark Surface:** `#0A0E0C`, `#121915`, `#18221D`
  - **Warm Cream Accents:** `#FAF7F0`, `#F5EFEB`, `#E8DEC8`
  - **Deep Forest Green:** `#0D2619`, `#17422C`, `#245F40`
  - **Royal Gold Highlights & CTAs:** `#D4AF37`, `#F5E29E`, `#A67D1E`
- **Typography:**
  - Headings: `Cinzel` & `Playfair Display` (Classic Indian heritage & luxury dining feel)
  - Body & UI: `Plus Jakarta Sans` (Clean, legible, modern mobile readability)
- **Visuals & Assets:**
  - Custom SVG Royal Crest Logo (`assets/images/logo.svg`)
  - Matching Favicon (`assets/images/favicon.svg`)
  - Curated high-resolution food photography (Claypot Dum Biriyani, Wok Egg Chilli, Chicken 65, Nati Curry, Paneer Butter Masala)
  - Clear, honest illustrative photography and sample price notices as requested

---

## 🗂️ Project Structure

```text
puthari-restaurant/
├── index.html                   # Homepage (Hero, Specialties, About teaser, Reviews teaser, Location, Plus Code)
├── menu.html                    # Dedicated Food Menu with Search, Category tabs, Dietary toggle & Sorting
├── about.html                   # About Us narrative, 4 Pillars of Hospitality, Roadside location & FAQ
├── gallery.html                 # Photo Gallery with Category filters and Lightbox viewer
├── reviews.html                 # Customer Reviews breakdown (3.9★), Theme highlights & Balanced feedback
├── contact.html                 # "Visit Puthari Restaurant" with Google Maps embed, Plus Code & Booking form
├── css/
│   ├── style.css                # Core design system, luxury variables, cart drawer, modals, animations
│   └── responsive.css           # Breakpoints (desktop, tablet, mobile, small screens)
├── js/
│   ├── menu-data.js             # Menu database (25+ items, categories, prices, spice levels, veg/non-veg tags)
│   ├── menu.js                  # Dynamic menu rendering, instant search, filters, quantity controllers
│   ├── cart.js                  # Shopping cart engine (localStorage, calculations, checkout modal & WhatsApp order builder)
│   ├── gallery.js               # Photo gallery category switcher and animations
│   └── main.js                  # Sticky header, mobile nav drawer, Plus Code copy, lightbox, reservation form
├── assets/
│   └── images/
│       ├── logo.svg             # Luxury vector logo
│       └── favicon.svg          # Matching favicon
├── server.js                    # Node.js Express server + native HTTP fallback with REST API
├── package.json                 # Project dependencies & scripts
├── .env.example                 # Environment variables template
├── .gitignore                   # Ignored files (node_modules, logs, .env)
└── README.md                    # Documentation, setup guide, deployment & testing checklist
```

---

## ⚡ Getting Started (Local Setup)

### Option A: Run with Node.js & Express (Recommended)

1. **Clone or open the project folder:**
   ```bash
   cd c:\antigravity
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```text
   http://localhost:3000
   ```

### Option B: Run as Pure Static Website (No Node.js needed!)

This website is completely self-contained with Vanilla HTML5, CSS3, and ES6 JavaScript. You can simply double-click `index.html` or serve it via any static server:
- Python: `python -m http.server 8000`
- VS Code Live Server extension
- Directly open `index.html` in Chrome, Safari, Edge, or Firefox!

---

## 🛒 Features & Ordering Experience

1. **Persistent Cart Drawer across all pages:**
   - Saved automatically in `localStorage`.
   - Add/remove items, adjust quantities with instant updates on cards and inside the drawer.
   - Calculates Subtotal, Packaging/Delivery fee (₹30 for takeaway/delivery, ₹0 for dine-in), and Grand Total.
2. **Multi-Mode Ordering:**
   - **Dine-In:** Specify table number.
   - **Takeaway:** Quick drive-through pickup with vehicle number.
   - **Delivery:** No-contact local delivery in Kampalapura.
3. **Safe Demo Mode & Instant WhatsApp Order Generator:**
   - In accordance with business rules, orders do not claim to charge cards without an active payment gateway.
   - Instead, the checkout generates a digital order slip with an instant **"Send Order to Restaurant WhatsApp"** button (`https://wa.me/?text=...`) pre-formatted with item details, customer name, phone, and total!
4. **Live Menu Filtering:**
   - Category tabs: All, Biriyani, Starters, Chicken Specials, Egg Dishes, Vegetarian Dishes, Rice & Noodles, Beverages.
   - Dietary toggle: All / Pure Veg / Non-Veg.
   - Instant search bar by dish name or ingredient.
   - Price & rating sorting.
5. **Verified Location & Google Plus Code:**
   - One-click copy for Plus Code: `85P2+2W Kampalapura, Karnataka`.
   - Responsive embedded Google Map.
   - Direct button to launch Google Maps driving navigation.
6. **Customer Reviews & Balanced Feedback:**
   - Displays provided 3.9/5 rating across 64 reviews.
   - Transparently acknowledges positive themes (fresh biriyani, crispy egg chilli, spacious highway parking) alongside customer feedback on peak-hour service speed.

---

## 🔌 REST API Endpoints (`server.js`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/info` | Returns verified restaurant metadata, address, Plus Code, and timings |
| `GET` | `/api/menu` | Returns menu items with query filters (`?category=...&isVeg=...&q=...`) |
| `POST` | `/api/orders` | Records incoming order requests (in demo mode) |
| `GET` | `/api/orders` | Returns recent demo orders for restaurant kitchen display |
| `POST` | `/api/contact` | Receives table reservations and guest inquiries |
| `GET` | `/api/health` | Health check endpoint |

---

## 🗄️ Optional Database Setup (MySQL Integration)

If you wish to store menu items and orders in a persistent MySQL database instead of the default fast in-memory/JSON store, run the following SQL schema:

```sql
CREATE DATABASE IF NOT EXISTS puthari_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE puthari_db;

-- Restaurant Menu Table
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  category VARCHAR(64) NOT NULL,
  category_name VARCHAR(64) NOT NULL,
  is_veg BOOLEAN NOT NULL DEFAULT FALSE,
  price DECIMAL(8,2) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.5,
  reviews_count INT DEFAULT 20,
  spice_level INT DEFAULT 1,
  badge VARCHAR(64),
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer Orders Table
CREATE TABLE IF NOT EXISTS orders (
  order_id VARCHAR(32) PRIMARY KEY,
  customer_name VARCHAR(128) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  order_type ENUM('dinein', 'takeaway', 'delivery') NOT NULL,
  location_detail VARCHAR(255),
  notes TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0,
  grand_total DECIMAL(10,2) NOT NULL,
  status VARCHAR(32) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(32) NOT NULL,
  item_id VARCHAR(32) NOT NULL,
  item_name VARCHAR(128) NOT NULL,
  unit_price DECIMAL(8,2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Table Reservations & Inquiries
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guest_name VARCHAR(128) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  guests_count VARCHAR(32),
  reservation_date DATE,
  reservation_time VARCHAR(64),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

To connect MySQL:
1. Copy `.env.example` to `.env`.
2. Install `mysql2`: `npm install mysql2`.
3. Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env`.

---

## 🚀 Deployment Instructions

### 1. Static Hosting (Vercel, Netlify, GitHub Pages)
Since all HTML/CSS/JS files are fully functional as client-side modules:
- **Netlify / Vercel:** Simply drag and drop the folder or push to GitHub and import the repository. No build step is required (leave build command blank and publish directory as `/`).
- **GitHub Pages:**
  1. Push code to a GitHub repository:
     ```bash
     git init
     git add .
     git commit -m "Initial release of Puthari Restaurant website"
     git branch -M main
     git remote add origin https://github.com/your-username/puthari-restaurant.git
     git push -u origin main
     ```
  2. Go to **Repository Settings** > **Pages** > Select branch `main` and root `/` > Click **Save**.

### 2. Node.js Hosting (Render, Railway, DigitalOcean, AWS EC2)
- Set Environment Variable: `PORT=3000`
- Start Command: `npm start`
- Ready to serve traffic on your custom domain (e.g., `putharirestaurant.com`).

---

## 📋 Comprehensive Testing Checklist

- [x] **Responsive Mobile & Tablet Layout:** Tested on screen widths from 360px (mobile) to 1440px (desktop). Hamburger navigation drawer opens and closes smoothly.
- [x] **Brand Styling & Palette:** Dark charcoal, deep forest green, warm cream, and royal gold accents applied consistently across all 6 pages.
- [x] **Hero Section Accuracy:** Displays "Great Taste. Warm Hospitality. Memorable Moments.", Google Rating 3.9/5 from 64 reviews labeled as provided business information, BM Road location, and closing at 2:00 AM.
- [x] **Menu Filtering & Search:** Category filters (Biriyani, Starters, Chicken Specials, Egg Dishes, Veg, Rice/Noodles, Beverages), Pure Veg / Non-Veg toggles, and live text search work instantly.
- [x] **Online Ordering & Cart Drawer:** Items can be added, quantities incremented/decremented, items removed. Calculations for subtotal, packaging, and grand total operate correctly.
- [x] **Demo Mode Compliance:** Clear demo notices on cart, modal, and receipts. Generates pre-filled WhatsApp order summary link.
- [x] **Photo Gallery & Lightbox:** Click-to-zoom works with captions and Escape key close. Illustrative photo disclaimer displayed.
- [x] **Reviews & Balanced Feedback:** Verified breakdown of 3.9★ based on 64 reviews with honest mention of peak rush times and link to Google Maps.
- [x] **Location, Hours & Plus Code:** `85P2+2W Kampalapura, Karnataka` copy button works with toast confirmation. Embedded Google Maps loads properly.
- [x] **SEO & Accessibility:** ARIA labels, semantic tags, Open Graph meta tags, and Schema.org Restaurant JSON-LD structured data included.
- [x] **No Broken Links & No Console Errors:** All navigation links, asset paths, and fallback images verified.
