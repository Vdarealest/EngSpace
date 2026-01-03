require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
// const open = require('open').default; // Có thể bỏ dòng này nếu deploy production

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const quizRoutes = require('./routes/quizzes');
const paymentRoutes = require('./routes/payments'); // <--- Đã import
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const Course = require('./models/Course');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/engspace');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));



// --- ĐĂNG KÝ ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/quizzes', quizRoutes);
console.log("--> Đang nạp route thanh toán...");
app.use('/api/payments', paymentRoutes); // <--- THÊM DÒNG NÀY ĐỂ HẾT LỖI 404

app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

app.get("/courses/:slug", async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
  res.json(course);
});

app.get('/', (req, res) => res.send({ ok: true, message: 'EngSpace API' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});