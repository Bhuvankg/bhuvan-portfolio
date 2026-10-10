/**
 * PUTHARI RESTAURANT — Production Web Server & Demo API
 * Location: BM Road, Kampalapura, Karnataka 571107
 * Plus Code: 85P2+2W Kampalapura, Karnataka
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Import menu data from shared js module
let PUTHARI_MENU = [];
try {
  const menuModule = require('./js/menu-data.js');
  PUTHARI_MENU = menuModule.PUTHARI_MENU || [];
} catch (e) {
  console.log('Notice: Loading menu directly from JSON cache');
}

// In-memory demo stores (can be hooked to MySQL / MongoDB in production)
const demoOrders = [];
const demoInquiries = [];

const RESTAURANT_INFO = {
  name: "Puthari Restaurant",
  category: "Family Restaurant",
  tagline: "Great Taste. Warm Hospitality. Memorable Moments.",
  address: "BM Road, Kampalapura, Karnataka 571107, India",
  plusCode: "85P2+2W Kampalapura, Karnataka",
  googleRating: 3.9,
  reviewsCount: 64,
  priceRange: "₹200 - ₹400 per person",
  diningOptions: ["Dine-in", "Drive-through", "No-contact delivery"],
  popularFood: ["Biriyani", "Egg Chilli", "Chicken Specials", "Ghee Rice"],
  businessHours: "Daily 11:00 AM – 2:00 AM (Verify opening hours before publishing)",
  closingTime: "2:00 AM"
};

// Try using Express if available, otherwise use native Node http server
let appServer;

try {
  const express = require('express');
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // REST API Routes
  app.get('/api/info', (req, res) => {
    res.json({ success: true, data: RESTAURANT_INFO });
  });

  app.get('/api/menu', (req, res) => {
    let items = [...PUTHARI_MENU];
    const { category, isVeg, q } = req.query;

    if (category && category !== 'all') {
      items = items.filter(i => i.category === category);
    }
    if (isVeg !== undefined) {
      const boolVeg = isVeg === 'true';
      items = items.filter(i => i.isVeg === boolVeg);
    }
    if (q) {
      const term = q.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(term) || i.description.toLowerCase().includes(term));
    }

    res.json({
      success: true,
      count: items.length,
      sampleNote: "Sample menu items and editable placeholder prices.",
      data: items
    });
  });

  app.post('/api/orders', (req, res) => {
    const { customerName, customerPhone, items, grandTotal, orderType, notes, locationDetail } = req.body;
    
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Missing required order parameters." });
    }

    const newOrder = {
      orderId: req.body.orderId || ('PUTHARI-' + Math.floor(100000 + Math.random() * 900000)),
      createdAt: new Date().toISOString(),
      customerName,
      customerPhone,
      orderType: orderType || 'dinein',
      locationDetail: locationDetail || 'Not specified',
      notes: notes || '',
      items,
      grandTotal: grandTotal || 0,
      status: 'received_demo'
    };

    demoOrders.unshift(newOrder);
    if (demoOrders.length > 50) demoOrders.pop();

    console.log(`[ORDER RECEIVED] ${newOrder.orderId} for ${newOrder.customerName} - Total: ₹${newOrder.grandTotal}`);

    res.status(201).json({
      success: true,
      message: "Order received in demonstration mode.",
      order: newOrder
    });
  });

  app.get('/api/orders', (req, res) => {
    res.json({ success: true, count: demoOrders.length, orders: demoOrders });
  });

  app.post('/api/contact', (req, res) => {
    const inquiry = {
      id: 'INQ-' + Date.now(),
      createdAt: new Date().toISOString(),
      ...req.body
    };
    demoInquiries.unshift(inquiry);
    console.log(`[INQUIRY/RESERVATION] From ${inquiry.name} (${inquiry.phone}) for ${inquiry.guests || 'N/A'}`);
    res.status(201).json({ success: true, message: "Inquiry received.", data: inquiry });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
  });

  // Serve static files
  app.use(express.static(path.join(__dirname)));

  // Fallback for direct HTML files
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  appServer = app.listen(PORT, HOST, () => {
    console.log(`
=============================================================
  🍛 PUTHARI RESTAURANT — WEB SERVER ACTIVE (Express)
=============================================================
  • Local Address:    http://localhost:${PORT}
  • Address:          BM Road, Kampalapura, Karnataka 571107
  • Plus Code:        85P2+2W Kampalapura, Karnataka
  • Google Rating:    3.9/5 (64 reviews)
  • Ready to serve!
=============================================================
    `);
  });

} catch (err) {
  // Fallback Native Node HTTP Server if express is not installed yet
  console.log('Express not yet installed. Running with native Node.js HTTP server...');

  const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
  };

  const server = http.createServer((req, res) => {
    // API routes in native mode
    if (req.url === '/api/info') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, data: RESTAURANT_INFO }));
    }

    if (req.url.startsWith('/api/menu')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, count: PUTHARI_MENU.length, data: PUTHARI_MENU }));
    }

    if (req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', mode: 'native-http' }));
    }

    // Static file serving
    let safeUrl = req.url.split('?')[0];
    if (safeUrl === '/') safeUrl = '/index.html';

    const filePath = path.join(__dirname, safeUrl);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found - Puthari Restaurant');
        } else {
          res.writeHead(500);
          res.end('Server Error: ' + error.code);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  appServer = server.listen(PORT, HOST, () => {
    console.log(`
=============================================================
  🍛 PUTHARI RESTAURANT — WEB SERVER ACTIVE (Native HTTP)
=============================================================
  • Local Address:    http://localhost:${PORT}
  • Address:          BM Road, Kampalapura, Karnataka 571107
  • Plus Code:        85P2+2W Kampalapura, Karnataka
=============================================================
    `);
  });
}

module.exports = appServer;
