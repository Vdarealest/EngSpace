const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/authController');
// Lưu ý: Kiểm tra lại tên middleware, thường là 'protect' hoặc 'authMiddleware' tùy file bạn đặt
// Nếu file middleware/auth.js export là { protect } thì sửa dòng dưới thành: const { protect } = ...
const { authMiddleware } = require('../middleware/auth'); 

router.post('/register',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  authCtrl.register
);

router.post('/login', authCtrl.login);

// --- SỬA DÒNG NÀY ---
router.post('/google', authCtrl.googleLogin); 
// --------------------

// Các route cần bảo vệ (cần token)
// Hãy chắc chắn tên middleware đúng với file middleware/auth.js của bạn (thường là authMiddleware hoặc protect)
router.get('/me', authMiddleware, authCtrl.getMe);
router.put('/me', authMiddleware, authCtrl.updateMe);
router.post('/plan', authMiddleware, authCtrl.updatePlan);

module.exports = router;