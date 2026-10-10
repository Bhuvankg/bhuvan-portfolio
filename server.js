/**
 * NOSH RESTO CAFE — Production Web Server & Demo API
 * Location: Panchavalli, Gonikoppa, Thalassery–Mysore Road, Panchavalli, Karnataka 571105
 * Phone: +91 98953 86886
 * Plus Code: 74PP+CM, Panchavalli, Karnataka
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Import menu data from shared js module
let NOSH_MENU = [];
try {
  const menuModule = require('./js/menu-data.js');
  NOSH_MENU = menuModule.NOSH_MENU || [];
} catch (e) {
  console.log('Notice: Loading menu directly from JSON cache');
}

// In-memory demo stores
const demoOrders = [];
const demoInquiries = [];

const RESTAURANT_INFO = {
  name: "Nosh Resto Cafe",
  category: "Restaurant and café",
  tagline: "Good Food. Great Vibes. Unforgettable Moments.",
  address: "Panchavalli, Gonikoppa, Thalassery–Mysore Road, Panchavalli, Karnataka 571105, India",
  phone: "+91 98953 86886",
  plusCode: "74PP+CM, Panchavalli, Karnataka",
  googleRating: 4.7,
  reviewsCount: 34,
  priceRange: "₹200–₹400 per person",
  services: ["Dine-in", "Kerbside pickup", "No-contact delivery"],
  closingTime: "2:00 AM (Verify complete operating hours before publishing)",
  feedbackThemes: [
    "Delicious and freshly prepared food",
    "Good food variety",
    "Fast service",
    "Positive dining experiences",
    "Late-night food options may vary in late hours"
  ]
};

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
    let items = [...NOSH_MENU];
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
      sampleNote: "Sample menu dishes and placeholder prices for demonstration. Official restaurant menu may vary.",
      data: items
    });
  });

  app.post('/api/orders', (req, res) => {
    const { customerName, customerPhone, items, grandTotal, orderType, notes, address } = req.body;
    
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Missing required order parameters." });
    }

    const newOrder = {
      orderId: req.body.orderId || ('NOSH-' + Math.floor(100000 + Math.random() * 900000)),
      createdAt: new Date().toISOString(),
      customerName,
      customerPhone,
      orderType: orderType || 'dinein',
      address: address || 'N/A',
      notes: notes || '',
      items,
      grandTotal: grandTotal || 0,
      status: 'demo_received'
    };

    demoOrders.unshift(newOrder);
    if (demoOrders.length > 50) demoOrders.pop();

    console.log(`[ORDER RECEIVED] ${newOrder.orderId} for ${newOrder.customerName} - Total: ₹${newOrder.grandTotal} (${newOrder.orderType})`);

    res.status(201).json({
      success: true,
      message: "Order recorded in demonstration mode. For actual orders, contact +91 98953 86886 or use WhatsApp.",
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
    console.log(`[INQUIRY RECEIVED] From ${inquiry.name} (${inquiry.phone}) for ${inquiry.serviceType || 'General'}`);
    res.status(201).json({ success: true, message: "Inquiry received in demo mode.", data: inquiry });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', restaurant: 'Nosh Resto Cafe', uptime: process.uptime(), timestamp: new Date() });
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
  ☕ NOSH RESTO CAFE — WEB SERVER ACTIVE (Express)
=============================================================
  • Local Address:    http://localhost:${PORT}
  • Address:          Panchavalli, Gonikoppa, Thalassery–Mysore Road
  • Phone:            +91 98953 86886
  • Plus Code:        74PP+CM, Panchavalli, Karnataka
  • Google Rating:    4.7 / 5.0 (34 reviews)
  • Ready to serve!
=============================================================
    `);
  });

} catch (err) {
  // Fallback Native Node HTTP Server if express is not installed
  console.log('Express not loaded. Running with native Node.js HTTP server...');

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
    if (req.url === '/api/info') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, data: RESTAURANT_INFO }));
    }

    if (req.url.startsWith('/api/menu')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, count: NOSH_MENU.length, data: NOSH_MENU }));
    }

    if (req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', mode: 'native-http' }));
    }

    let safeUrl = req.url.split('?')[0];
    if (safeUrl === '/') safeUrl = '/index.html';

    const filePath = path.join(__dirname, safeUrl);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found - Nosh Resto Cafe');
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
  ☕ NOSH RESTO CAFE — WEB SERVER ACTIVE (Native HTTP)
=============================================================
  • Local Address:    http://localhost:${PORT}
  • Address:          Panchavalli, Gonikoppa, Thalassery–Mysore Road
  • Phone:            +91 98953 86886
  • Plus Code:        74PP+CM, Panchavalli, Karnataka
=============================================================
    `);
  });
}

module.exports = appServer;
