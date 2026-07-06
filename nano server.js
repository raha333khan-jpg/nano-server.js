const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path'); // ← পাথ লাইব্রেরি যোগ করলাম

const app = express();
const PORT = 5001;

// মিডলওয়্যার
app.use(cors());
app.use(bodyParser.json());

// ====================================================
// ১. স্ট্যাটিক ফাইল সার্ভ করা (HTML, CSS, JS)
// ====================================================
// 'public' ফোল্ডারের ভিতরে রাখা সব ফাইল ব্রাউজারে দেখাবে
app.use(express.static(path.join(__dirname, 'public')));

// ====================================================
// ২. API এন্ডপয়েন্ট (আগের মতোই)
// ====================================================
let users = [
  {
    id: '1',
    name: 'Admin',
    phone: '01700000000',
    password: 'admin123',
    isAdmin: true,
    balance: 0,
    status: 'active',
    createdAt: new Date()
  }
];

let payments = [
  { id: '1', userId: '1', userName: 'Admin', amount: 500, method: 'bKash', status: 'success', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', userId: '1', userName: 'Admin', amount: 1000, method: 'Nagad', status: 'pending', createdAt: new Date(), updatedAt: new Date() }
];

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: 'ইউজারনাম ও পাসওয়ার্ড দিন!' });
  const user = users.find(u => u.name === username || u.phone === username);
  if (!user) return res.status(401).json({ success: false, message: 'ইউজার নেই!' });
  if (password !== 'admin123') return res.status(401).json({ success: false, message: 'ভুল পাসওয়ার্ড!' });
  const token = jwt.sign({ id: user.id, name: user.name }, 'secret_key', { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, name: user.name, phone: user.phone, isAdmin: user.isAdmin } });
});

app.get('/api/admin/stats', (req, res) => {
  const totalUsers = users.filter(u => !u.isAdmin).length;
  const totalAmount = payments.reduce((s, p) => s + (p.status === 'success' ? p.amount : 0), 0);
  res.json({ success: true, data: { totalUsers, totalAmount, pending: payments.filter(p => p.status === 'pending').length, success: payments.filter(p => p.status === 'success').length } });
});

app.get('/api/admin/users', (req, res) => {
  res.json({ success: true, data: users.filter(u => !u.isAdmin) });
});

app.get('/api/admin/payments', (req, res) => {
  res.json({ success: true, data: payments });
});

app.put('/api/admin/payments/:id/status', (req, res) => {
  const { status } = req.body;
  const payment = payments.find(p => p.id === req.params.id);
  if (!payment) return res.status(404).json({ success: false });
  payment.status = status;
  payment.updatedAt = new Date();
  if (status === 'success') {
    const user = users.find(u => u.id === payment.userId);
    if (user) user.balance += payment.amount;
  }
  res.json({ success: true, data: payment });
});

// ====================================================
// ৩. কোনো রাউটে না গেলে HTML পেজ দেখানো
// ====================================================
// ব্রাউজারে http://localhost:5001 দিলে এই HTML ফাইল লোড হবে
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_panel.html'));
});

// ====================================================
// ৪. সার্ভার চালু করা
// ====================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌐 Open this link in your browser: http://localhost:${PORT}`);
  console.log(`👤 Username: admin, Password: admin123`);
});