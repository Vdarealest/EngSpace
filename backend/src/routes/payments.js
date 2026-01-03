const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// --- CÁC ROUTE MỚI CHO VIETQR (Thêm 2 dòng này) ---
router.post('/create', authMiddleware, paymentController.createPaymentUrl);
router.post('/confirm', authMiddleware, paymentController.confirmPayment);
// --------------------------------------------------

// Các route cũ (Giữ lại nếu muốn dùng song song, hoặc có thể bỏ nếu chuyển hẳn sang QR)
router.post('/course', authMiddleware, paymentController.purchaseCourse); 
router.post('/plan', authMiddleware, paymentController.purchasePlan);

// Route lấy lịch sử
router.get('/me', authMiddleware, paymentController.getMyPayments);

// Route tạo link thanh toán VNPay
router.post('/create_vnpay', authMiddleware, paymentController.createVNPayUrl);

// Route xử lý kết quả (Frontend gọi về để xác thực)
router.get('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;