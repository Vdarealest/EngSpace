const express = require('express');
const router = express.Router();
const courseCtrl = require('../controllers/courseController');
// console.log("COURSE CTRL:", courseCtrl); // Có thể comment dòng này lại cho gọn Terminal
const { authMiddleware } = require('../middleware/auth');

// --- PUBLIC ROUTES (Ai cũng xem được) ---
router.get('/', courseCtrl.list);
router.get('/slug/:slug', courseCtrl.getBySlug); 
router.get('/:id', courseCtrl.get); // Thêm dòng này để lấy chi tiết theo ID nếu cần

// --- PROTECTED ROUTES (Phải đăng nhập) ---
router.post('/', authMiddleware, courseCtrl.create);
router.put('/:id', authMiddleware, courseCtrl.update);
router.delete('/:id', authMiddleware, courseCtrl.remove);

// 👇👇👇 DÒNG QUAN TRỌNG MỚI THÊM ĐÂY 👇👇👇
// Route này khớp với hàm updateCurriculum trong Controller
router.put('/:courseId/curriculum', authMiddleware, courseCtrl.updateCurriculum);

module.exports = router;