/**
 * PUTHARI RESTAURANT — Menu Database
 * Kampalapura, Karnataka
 * 
 * Note: Sample menu items and editable placeholder prices
 * until the restaurant's verified official menu card is supplied.
 */

const PUTHARI_MENU = [
  // ================= BIRIYANI =================
  {
    id: 'bir-01',
    name: 'Puthari Special Chicken Biriyani',
    category: 'biriyani',
    categoryName: 'Biriyani',
    isVeg: false,
    price: 240,
    rating: 4.8,
    reviewsCount: 38,
    spiceLevel: 2,
    badge: 'Bestseller',
    description: 'Fragrant seeraga samba rice cooked with tender marinated chicken, caramelized onions, mint, and secret Karnataka highway spices. Served with raita and brinjal gravy.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1-2'
  },
  {
    id: 'bir-02',
    name: 'Egg Biriyani',
    category: 'biriyani',
    categoryName: 'Biriyani',
    isVeg: false,
    price: 180,
    rating: 4.6,
    reviewsCount: 24,
    spiceLevel: 2,
    badge: 'Popular',
    description: 'Golden shallow-fried boiled eggs steeped in aromatic spiced dum rice infused with saffron, coriander, and browned shallots. Accompanied by chilled onion pachadi.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1'
  },
  {
    id: 'bir-03',
    name: 'Puthari Highway Mutton Biriyani',
    category: 'biriyani',
    categoryName: 'Biriyani',
    isVeg: false,
    price: 340,
    rating: 4.9,
    reviewsCount: 42,
    spiceLevel: 3,
    badge: "Chef's Special",
    description: 'Succulent cuts of fresh country mutton slow-cooked on dum with stone-ground spices, ghee, and seasoned basmati rice. Deeply flavourful and aromatic.',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1-2'
  },
  {
    id: 'bir-04',
    name: 'Chicken 65 Biriyani',
    category: 'biriyani',
    categoryName: 'Biriyani',
    isVeg: false,
    price: 260,
    rating: 4.7,
    reviewsCount: 29,
    spiceLevel: 3,
    badge: 'Trending',
    description: 'Crispy, spicy chicken 65 bites layered over aromatic dum biriyani rice. Garnished with curry leaves, slit green chilies, and fried cashews.',
    image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1-2'
  },
  {
    id: 'bir-05',
    name: 'Royal Veg Dum Biriyani',
    category: 'biriyani',
    categoryName: 'Biriyani',
    isVeg: true,
    price: 190,
    rating: 4.5,
    reviewsCount: 19,
    spiceLevel: 1,
    badge: 'Vegetarian',
    description: 'Garden-fresh florets of cauliflower, green peas, carrots, and soft paneer cubes layered with premium basmati rice and rose water aromatics.',
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1'
  },

  // ================= STARTERS =================
  {
    id: 'str-01',
    name: 'Puthari Signature Egg Chilli',
    category: 'starters',
    categoryName: 'Starters',
    isVeg: false,
    price: 160,
    rating: 4.9,
    reviewsCount: 52,
    spiceLevel: 3,
    badge: 'Crowd Favourite',
    description: 'Our standout house specialty! Boiled egg wedges batter-crisped and tossed in a sizzling wok with garlic, sliced green chilies, bell peppers, and dark soy glaze.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    portion: 'Plate / 8 Pcs'
  },
  {
    id: 'str-02',
    name: 'Chicken 65 (Bone/Boneless)',
    category: 'starters',
    categoryName: 'Starters',
    isVeg: false,
    price: 210,
    rating: 4.7,
    reviewsCount: 34,
    spiceLevel: 3,
    badge: 'Popular',
    description: 'Deep-red fiery South Indian style fried chicken marinated in ginger-garlic paste, crushed black pepper, and yogurt, tempered with crispy curry leaves.',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },
  {
    id: 'str-03',
    name: 'Chilli Chicken Dry',
    category: 'starters',
    categoryName: 'Starters',
    isVeg: false,
    price: 220,
    rating: 4.6,
    reviewsCount: 27,
    spiceLevel: 2,
    badge: 'Indo-Chinese',
    description: 'Juicy chicken chunks tossed in spicy Chinese sauces with crunchy onions, capsicum, and spring greens. Perfect highway starter.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },
  {
    id: 'str-04',
    name: 'Crispy Gobi Manchurian',
    category: 'starters',
    categoryName: 'Starters',
    isVeg: true,
    price: 140,
    rating: 4.5,
    reviewsCount: 31,
    spiceLevel: 2,
    badge: 'Veg Favourite',
    description: 'Golden-fried cauliflower florets wok-tossed with ginger, garlic, coriander, and tangy sweet-chilli seasoning.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },
  {
    id: 'str-05',
    name: 'Paneer Pepper Dry',
    category: 'starters',
    categoryName: 'Starters',
    isVeg: true,
    price: 190,
    rating: 4.7,
    reviewsCount: 18,
    spiceLevel: 2,
    badge: 'Vegetarian',
    description: 'Fresh malai paneer cubes tossed with freshly crushed Malnad black pepper, curry leaves, and sautéed shallots.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },
  {
    id: 'str-06',
    name: 'Chicken Pepper Fry',
    category: 'starters',
    categoryName: 'Starters',
    isVeg: false,
    price: 230,
    rating: 4.8,
    reviewsCount: 33,
    spiceLevel: 3,
    badge: 'Karnataka Special',
    description: 'Tender chicken braised with toasted black peppercorns, roasted coriander seeds, and local spices in pure ghee.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },

  // ================= CHICKEN SPECIALS =================
  {
    id: 'chk-01',
    name: 'Karnataka Nati-Style Chicken Curry',
    category: 'chicken',
    categoryName: 'Chicken Specials',
    isVeg: false,
    price: 230,
    rating: 4.9,
    reviewsCount: 45,
    spiceLevel: 3,
    badge: 'Traditional',
    description: 'Country-style chicken simmered in a robust rustic gravy made from freshly ground coconut, poppy seeds, and roasted regional spices.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },
  {
    id: 'chk-02',
    name: 'Rich Butter Chicken',
    category: 'chicken',
    categoryName: 'Chicken Specials',
    isVeg: false,
    price: 240,
    rating: 4.8,
    reviewsCount: 36,
    spiceLevel: 1,
    badge: 'Mild & Creamy',
    description: 'Smoky tandoori chicken tikka pieces simmered in a velvety tomato-cashew satin gravy with generous butter and kasuri methi.',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },
  {
    id: 'chk-03',
    name: 'Kadai Chicken Masala',
    category: 'chicken',
    categoryName: 'Chicken Specials',
    isVeg: false,
    price: 220,
    rating: 4.6,
    reviewsCount: 22,
    spiceLevel: 2,
    badge: 'Flavourful',
    description: 'Succulent chicken pieces cooked in an iron wok with coarsely crushed coriander, dried red chillies, and chunky capsicum.',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },
  {
    id: 'chk-04',
    name: 'Mangalore Style Chicken Sukka',
    category: 'chicken',
    categoryName: 'Chicken Specials',
    isVeg: false,
    price: 240,
    rating: 4.8,
    reviewsCount: 28,
    spiceLevel: 3,
    badge: 'Coastal Flavours',
    description: 'Semi-dry chicken preparation with deeply roasted grated coconut, Byadgi chillies, and tangy tamarind essence.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },

  // ================= EGG DISHES =================
  {
    id: 'egg-01',
    name: 'Puthari Egg Masala Gravy',
    category: 'egg',
    categoryName: 'Egg Dishes',
    isVeg: false,
    price: 150,
    rating: 4.7,
    reviewsCount: 23,
    spiceLevel: 2,
    badge: 'Popular',
    description: 'Hard-boiled eggs simmered in a rich, spiced onion-tomato gravy with aromatic cinnamon and fresh coriander leaves.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1-2'
  },
  {
    id: 'egg-02',
    name: 'Egg Bhurji (Special Scramble)',
    category: 'egg',
    categoryName: 'Egg Dishes',
    isVeg: false,
    price: 110,
    rating: 4.5,
    reviewsCount: 15,
    spiceLevel: 2,
    badge: 'Quick Bite',
    description: 'Three farm eggs scrambled over high flame with chopped green chillies, diced onions, tomatoes, and ground cumin.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1'
  },
  {
    id: 'egg-03',
    name: 'Highway Masala Omelette',
    category: 'egg',
    categoryName: 'Egg Dishes',
    isVeg: false,
    price: 80,
    rating: 4.6,
    reviewsCount: 19,
    spiceLevel: 1,
    badge: 'All-Day Hit',
    description: 'Fluffy two-egg omelette stuffed with fiery chopped shallots, green chillies, and fresh coriander. Served hot.',
    image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80',
    portion: 'Single'
  },
  {
    id: 'egg-04',
    name: 'Egg Pepper Roast',
    category: 'egg',
    categoryName: 'Egg Dishes',
    isVeg: false,
    price: 140,
    rating: 4.7,
    reviewsCount: 17,
    spiceLevel: 3,
    badge: 'Spicy',
    description: 'Crisp-coated boiled eggs roasted dry with caramelized onions, curry leaves, and a generous coating of freshly cracked black pepper.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1-2'
  },

  // ================= VEGETARIAN DISHES =================
  {
    id: 'veg-01',
    name: 'Paneer Butter Masala',
    category: 'veg',
    categoryName: 'Vegetarian Dishes',
    isVeg: true,
    price: 190,
    rating: 4.8,
    reviewsCount: 30,
    spiceLevel: 1,
    badge: 'Family Favourite',
    description: 'Pillow-soft cottage cheese cubes submerged in a creamy, velvety makhani gravy flavoured with dried fenugreek leaves and butter.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },
  {
    id: 'veg-02',
    name: 'Yellow Dal Tadka (Ghee Fry)',
    category: 'veg',
    categoryName: 'Vegetarian Dishes',
    isVeg: true,
    price: 140,
    rating: 4.6,
    reviewsCount: 22,
    spiceLevel: 1,
    badge: 'Comfort Food',
    description: 'Golden yellow toor dal tempered with sizzling desi ghee, cumin seeds, garlic slivers, and whole Kashmiri red chilies.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },
  {
    id: 'veg-03',
    name: 'Kadai Mushroom Masala',
    category: 'veg',
    categoryName: 'Vegetarian Dishes',
    isVeg: true,
    price: 180,
    rating: 4.5,
    reviewsCount: 14,
    spiceLevel: 2,
    badge: 'Chef Choice',
    description: 'Plump button mushrooms and crisp bell peppers braised in a spicy onion-tomato gravy infused with freshly pounded kadai spices.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },
  {
    id: 'veg-04',
    name: 'Mixed Vegetable Kolhapuri',
    category: 'veg',
    categoryName: 'Vegetarian Dishes',
    isVeg: true,
    price: 170,
    rating: 4.6,
    reviewsCount: 16,
    spiceLevel: 3,
    badge: 'Spicy Delight',
    description: 'Assorted seasonal vegetables stewed in a bold, spicy, fiery Kolhapuri red masala gravy with roasted sesame and coconut.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 2'
  },

  // ================= RICE & NOODLES =================
  {
    id: 'rcn-01',
    name: 'Aromatic Ghee Rice',
    category: 'rice',
    categoryName: 'Rice & Noodles',
    isVeg: true,
    price: 130,
    rating: 4.8,
    reviewsCount: 39,
    spiceLevel: 1,
    badge: 'Pairing Hit',
    description: 'Fine fragrant rice sautéed in pure country ghee, infused with whole cardamoms, cloves, cinnamon, fried onions, and roasted cashews.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1-2'
  },
  {
    id: 'rcn-02',
    name: 'Chicken Hakka Noodles',
    category: 'rice',
    categoryName: 'Rice & Noodles',
    isVeg: false,
    price: 180,
    rating: 4.6,
    reviewsCount: 25,
    spiceLevel: 2,
    badge: 'Indo-Chinese',
    description: 'Wok-tossed noodles tossed over roaring flame with shredded chicken, crunchy carrots, cabbage, and savoury seasoning.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1-2'
  },
  {
    id: 'rcn-03',
    name: 'Chicken Fried Rice',
    category: 'rice',
    categoryName: 'Rice & Noodles',
    isVeg: false,
    price: 180,
    rating: 4.7,
    reviewsCount: 31,
    spiceLevel: 1,
    badge: 'Popular',
    description: 'Fluffy long-grain rice stir-fried with juicy seasoned chicken cubes, scrambled egg, chopped spring onions, and light soya sauce.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1-2'
  },
  {
    id: 'rcn-04',
    name: 'Veg Hakka Noodles',
    category: 'rice',
    categoryName: 'Rice & Noodles',
    isVeg: true,
    price: 140,
    rating: 4.5,
    reviewsCount: 18,
    spiceLevel: 1,
    badge: 'Vegetarian',
    description: 'Classic wok-charred wheat noodles tossed with shredded capsicum, cabbage, spring onion, and mild soy-garlic drizzle.',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1-2'
  },
  {
    id: 'rcn-05',
    name: 'South Indian Curd Rice (Daddojanam)',
    category: 'rice',
    categoryName: 'Rice & Noodles',
    isVeg: true,
    price: 90,
    rating: 4.8,
    reviewsCount: 26,
    spiceLevel: 1,
    badge: 'Soothing Finish',
    description: 'Cool, creamy curd rice tempered with mustard seeds, curry leaves, ginger bits, green chillies, and pomegranate pearls.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    portion: 'Serves 1'
  },

  // ================= BEVERAGES =================
  {
    id: 'bev-01',
    name: 'Fresh Mint Lime Soda (Sweet / Salt)',
    category: 'beverages',
    categoryName: 'Beverages',
    isVeg: true,
    price: 60,
    rating: 4.8,
    reviewsCount: 22,
    spiceLevel: 0,
    badge: 'Refreshing',
    description: 'Freshly squeezed sun-ripened lemons with crushed garden mint leaves, soda fizz, and your choice of sweet, salted, or mixed taste.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    portion: '300 ml'
  },
  {
    id: 'bev-02',
    name: 'Traditional Spiced Buttermilk (Neer Majjige)',
    category: 'beverages',
    categoryName: 'Beverages',
    isVeg: true,
    price: 45,
    rating: 4.9,
    reviewsCount: 30,
    spiceLevel: 1,
    badge: 'Digestive Special',
    description: 'Chilled country churned buttermilk seasoned with crushed ginger, green chillies, coriander leaves, and roasted cumin powder.',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    portion: '300 ml'
  },
  {
    id: 'bev-03',
    name: 'Karnataka Filter Coffee (Hot)',
    category: 'beverages',
    categoryName: 'Beverages',
    isVeg: true,
    price: 40,
    rating: 4.9,
    reviewsCount: 35,
    spiceLevel: 0,
    badge: 'Highway Heritage',
    description: 'Authentic South Indian chicory blend coffee brewed in traditional brass decoction and frothed with hot creamy milk in dabarah-tumbler.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    portion: '150 ml'
  },
  {
    id: 'bev-04',
    name: 'Kulhad Masala Chai',
    category: 'beverages',
    categoryName: 'Beverages',
    isVeg: true,
    price: 35,
    rating: 4.7,
    reviewsCount: 24,
    spiceLevel: 1,
    badge: 'Hot Beverage',
    description: 'Strong roadside highway tea simmered with crushed ginger, cardamom pods, and spices, poured steaming hot.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    portion: '150 ml'
  }
];

// Helper functions for menu retrieval
function getAllMenuItems() {
  return PUTHARI_MENU;
}

function getMenuItemById(id) {
  return PUTHARI_MENU.find(item => item.id === id);
}

function getMenuItemsByCategory(category) {
  if (!category || category === 'all') return PUTHARI_MENU;
  return PUTHARI_MENU.filter(item => item.category === category);
}

function getFeaturedItems() {
  return PUTHARI_MENU.filter(item => ['bir-01', 'str-01', 'chk-01', 'str-02', 'bir-03', 'rcn-01'].includes(item.id));
}

// Format INR Price
function formatPrice(amount) {
  return `₹${amount.toFixed(0)}`;
}

// Export for Node or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PUTHARI_MENU,
    getAllMenuItems,
    getMenuItemById,
    getMenuItemsByCategory,
    getFeaturedItems,
    formatPrice
  };
}
